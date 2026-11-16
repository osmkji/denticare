<?php

namespace App\Http\Controllers;

use App\Http\Middleware\CheckFreemiumLimit;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * Répertoire des dossiers patients du cabinet.
     * Recherche instantanée (nom, prénom, téléphone, CIN) et filtre reliquats impayés.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $unpaidOnly = $request->boolean('unpaid_only');

        $query = Patient::query()
            ->search($search)
            ->withCount(['appointments', 'clinicalActs', 'payments']);

        if ($unpaidOnly) {
            $query->withUnpaidBalance();
        }

        $patients = $query->orderBy('last_name')->orderBy('first_name')->paginate(15)->withQueryString();

        $patientCount = Patient::count();
        $unpaidPatientsCount = Patient::withUnpaidBalance()->count();
        $cabinet = $request->user()->cabinet;
        $isFreePlan = $cabinet->isFree();
        $freemiumLimit = CheckFreemiumLimit::FREE_PATIENTS_LIMIT;
        $hasReachedLimit = $isFreePlan && $patientCount >= $freemiumLimit;

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters' => [
                'search' => $search,
                'unpaid_only' => $unpaidOnly,
            ],
            'quota' => [
                'count' => $patientCount,
                'limit' => $freemiumLimit,
                'is_free' => $isFreePlan,
                'has_reached_limit' => $hasReachedLimit,
                'unpaid_count' => $unpaidPatientsCount,
            ],
        ]);
    }

    /**
     * Enregistrement d'un nouveau patient.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $cabinet = $user->cabinet;

        if ($cabinet && $cabinet->isFree() && $cabinet->patients()->count() >= CheckFreemiumLimit::FREE_PATIENTS_LIMIT) {
            $payload = [
                'upgrade_required' => true,
                'title' => 'Passer à DentiCare Pro',
                'message' => 'La limite de 50 patients du plan Gratuit a été atteinte. Débloquez les dossiers patients illimités en passant à DentiCare Pro.',
                'current_count' => $cabinet->patients()->count(),
                'limit' => CheckFreemiumLimit::FREE_PATIENTS_LIMIT,
                'current_plan' => 'free',
                'recommended_plan' => 'pro',
            ];

            if ($request->wantsJson()) {
                return response()->json($payload, 403);
            }

            return back()->with('upgrade_required', $payload)->withErrors([
                'freemium_limit' => $payload['message'],
            ]);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:30',
            'cin' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'insurance_type' => 'nullable|in:none,cnss,cnops,private',
            'insurance_number' => 'nullable|string|max:50',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['insurance_type'] = $validated['insurance_type'] ?? 'none';

        $patient = Patient::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'patient' => $patient,
            ], 201);
        }

        return redirect()->route('patients.show', $patient->id)
            ->with('success', "Dossier patient de {$patient->full_name} créé avec succès.");
    }

    /**
     * Fiche administrative et médicale détaillée du patient.
     */
    public function show(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $patient->load([
            'appointments.dentist',
            'clinicalActs.dentist',
            'dentalActs.dentist',
            'documents',
            'payments.recordedBy',
        ]);

        return Inertia::render('Patients/Show', [
            'patient' => $patient,
        ]);
    }

    /**
     * Mise à jour des informations administratives.
     */
    public function update(Request $request, Patient $patient): RedirectResponse
    {
        Gate::authorize('update', $patient);

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:30',
            'cin' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'insurance_type' => 'nullable|in:none,cnss,cnops,private',
            'insurance_number' => 'nullable|string|max:50',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $patient->update($validated);

        return back()->with('success', 'Fiche administrative du patient mise à jour.');
    }

    /**
     * Suppression définitive d'un dossier patient (Dentiste uniquement).
     */
    public function destroy(Patient $patient): RedirectResponse
    {
        Gate::authorize('delete', $patient);

        $name = $patient->full_name;
        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', "Le dossier de {$name} a été supprimé.");
    }

    /**
     * Importation CSV / Excel basique de patients (colonnes first_name, last_name, phone).
     * Respecte rigoureusement le quota des 50 patients du plan DentiCare Free.
     */
    public function import(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:5120',
        ]);

        $cabinet = $request->user()->cabinet;
        $file = $request->file('file');
        $path = $file->getRealPath();

        // Lecture et extraction des lignes CSV
        $rows = [];
        if (($handle = fopen($path, 'r')) !== false) {
            $header = null;
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                // Gestion séparateur point-virgule si présent
                if (count($data) === 1 && str_contains($data[0], ';')) {
                    $data = str_getcsv($data[0], ';');
                }

                if (! $header) {
                    // Nettoyage des BOM et minuscules
                    $header = array_map(fn ($col) => strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $col))), $data);
                    continue;
                }

                if (count($data) >= 2 && ! empty($data[0])) {
                    $row = [];
                    foreach ($header as $index => $colName) {
                        $row[$colName] = $data[$index] ?? null;
                    }
                    $rows[] = $row;
                }
            }
            fclose($handle);
        }

        if (empty($rows)) {
            return back()->withErrors(['file' => 'Le fichier CSV est vide ou le format des colonnes est invalide.']);
        }

        // Vérification stricte du quota Freemium (50 patients)
        $currentCount = Patient::count();
        $importCount = count($rows);

        if ($cabinet->isFree()) {
            $maxLimit = CheckFreemiumLimit::FREE_PATIENTS_LIMIT;

            if ($currentCount >= $maxLimit || ($currentCount + $importCount) > $maxLimit) {
                $payload = [
                    'upgrade_required' => true,
                    'title' => 'Passer à DentiCare Pro',
                    'message' => "L'importation de {$importCount} patients dépasserait la limite de {$maxLimit} dossiers de votre plan Gratuit ({$currentCount}/{$maxLimit} patients déjà créés). Veuillez passer à DentiCare Pro pour débloquer les dossiers patients illimités.",
                    'current_count' => $currentCount,
                    'limit' => $maxLimit,
                    'current_plan' => 'free',
                    'recommended_plan' => 'pro',
                ];

                if ($request->wantsJson()) {
                    return response()->json($payload, 403);
                }

                return back()->with('upgrade_required', $payload)
                    ->withErrors(['file' => $payload['message']]);
            }
        }

        // Importation des patients
        $imported = 0;
        foreach ($rows as $row) {
            $firstName = $row['first_name'] ?? ($row['prenom'] ?? ($row['prénom'] ?? ''));
            $lastName = $row['last_name'] ?? ($row['nom'] ?? '');
            $phone = $row['phone'] ?? ($row['telephone'] ?? ($row['téléphone'] ?? null));
            $cin = $row['cin'] ?? null;

            if (! empty($firstName) && ! empty($lastName)) {
                Patient::create([
                    'cabinet_id' => $cabinet->id,
                    'first_name' => trim($firstName),
                    'last_name' => trim($lastName),
                    'phone' => $phone ? trim($phone) : null,
                    'cin' => $cin ? trim($cin) : null,
                    'insurance_type' => 'none',
                ]);
                $imported++;
            }
        }

        return back()->with('success', "{$imported} patient(s) importé(s) avec succès dans votre répertoire.");
    }
}
