<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * Agenda et gestion de la salle d'attente.
     * Supporte les vues Semaine (par défaut), Jour et Liste.
     */
    public function index(Request $request): Response
    {
        $viewMode = $request->input('view_mode', 'week'); // 'week' (défaut), 'day', 'list'
        $date = $request->input('date', Carbon::today()->toDateString());
        $targetDate = Carbon::parse($date);

        if ($viewMode === 'day') {
            $startDate = $targetDate->copy()->startOfDay();
            $endDate = $targetDate->copy()->endOfDay();
        } else {
            // 'week' ou 'list' : on charge la semaine complète du lundi au dimanche
            $startDate = $targetDate->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
            $endDate = $targetDate->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();
        }

        $appointments = Appointment::with(['patient', 'dentist'])
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->orderBy('scheduled_at')
            ->get();

        $waitingRoom = Appointment::with(['patient', 'dentist'])
            ->whereDate('scheduled_at', Carbon::today())
            ->whereIn('status', ['waiting', 'in_chair'])
            ->orderBy('arrived_at', 'asc')
            ->get();

        $patients = Patient::select('id', 'first_name', 'last_name', 'phone', 'cin')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $dentists = User::where('cabinet_id', $request->user()->cabinet_id)
            ->where('role', 'dentist')
            ->get(['id', 'name']);

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'waitingRoom' => $waitingRoom,
            'currentDate' => $date,
            'viewMode' => $viewMode,
            'weekStart' => $targetDate->copy()->startOfWeek(Carbon::MONDAY)->toDateString(),
            'weekEnd' => $targetDate->copy()->endOfWeek(Carbon::SUNDAY)->toDateString(),
            'patients' => $patients,
            'dentists' => $dentists,
        ]);
    }

    /**
     * Prise de rendez-vous avec support de sélection ou création rapide à la volée.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        // Support de la création rapide à la volée d'un patient
        if ($request->boolean('create_new_patient') || empty($request->input('patient_id'))) {
            $user = $request->user();
            $cabinet = $user->cabinet;

            // Vérification du quota Freemium (50 patients max sur plan Free)
            if ($cabinet && $cabinet->isFree() && $cabinet->patients()->count() >= \App\Http\Middleware\CheckFreemiumLimit::FREE_PATIENTS_LIMIT) {
                $payload = [
                    'upgrade_required' => true,
                    'title' => 'Passer à DentiCare Pro',
                    'message' => 'La limite de 50 patients du plan Gratuit a été atteinte. Débloquez les dossiers patients illimités en passant à DentiCare Pro.',
                    'current_count' => $cabinet->patients()->count(),
                    'limit' => \App\Http\Middleware\CheckFreemiumLimit::FREE_PATIENTS_LIMIT,
                ];

                if ($request->wantsJson()) {
                    return response()->json($payload, 403);
                }

                return back()->with('upgrade_required', $payload)->withErrors([
                    'freemium_limit' => $payload['message'],
                ]);
            }

            $validatedPatient = $request->validate([
                'new_patient_first_name' => 'required|string|max:100',
                'new_patient_last_name' => 'required|string|max:100',
                'new_patient_phone' => 'nullable|string|max:30',
                'new_patient_cin' => 'nullable|string|max:30',
            ]);

            $newPatient = Patient::create([
                'cabinet_id' => $user->cabinet_id,
                'first_name' => $validatedPatient['new_patient_first_name'],
                'last_name' => $validatedPatient['new_patient_last_name'],
                'phone' => $validatedPatient['new_patient_phone'] ?? null,
                'cin' => $validatedPatient['new_patient_cin'] ?? null,
                'insurance_type' => 'none',
            ]);

            $patientId = $newPatient->id;
        } else {
            $validatedPatient = $request->validate([
                'patient_id' => 'required|exists:patients,id',
            ]);
            $patientId = $validatedPatient['patient_id'];
        }

        $validated = $request->validate([
            'dentist_id' => 'nullable|exists:users,id',
            'motif' => 'nullable|string|max:255',
            'reason' => 'nullable|string|max:255',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:10|max:240',
            'notes' => 'nullable|string',
        ]);

        $motif = $validated['motif'] ?? ($validated['reason'] ?? 'Consultation');

        $appointment = Appointment::create([
            'cabinet_id' => $request->user()->cabinet_id,
            'patient_id' => $patientId,
            'dentist_id' => $validated['dentist_id'] ?? $request->user()->id,
            'motif' => $motif,
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => $validated['duration_minutes'],
            'status' => 'scheduled',
            'notes' => $validated['notes'] ?? null,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous programmé avec succès.',
                'appointment' => $appointment->load(['patient', 'dentist']),
            ], 201);
        }

        return back()->with('success', 'Rendez-vous programmé avec succès pour le ' . Carbon::parse($appointment->scheduled_at)->format('d/m/Y à H:i'));
    }

    /**
     * Mise à jour du statut d'un patient et enregistrement de `arrived_at`.
     * PATCH /appointments/{id}/status
     */
    public function updateStatus(Request $request, Appointment $appointment): RedirectResponse|JsonResponse
    {
        Gate::authorize('update', $appointment);

        $validated = $request->validate([
            'status' => 'required|in:scheduled,waiting,in_chair,completed,cancelled,no_show',
        ]);

        $newStatus = $validated['status'];
        $appointment->status = $newStatus;

        // Enregistre arrived_at quand le patient passe en salle d'attente ('waiting')
        if ($newStatus === 'waiting' && is_null($appointment->arrived_at)) {
            $appointment->arrived_at = now();
        }

        $appointment->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Statut du patient mis à jour.',
                'appointment' => $appointment->fresh(['patient', 'dentist']),
            ]);
        }

        $messages = [
            'waiting' => 'Patient placé en salle d\'attente (chronomètre démarré).',
            'in_chair' => 'Patient installé au fauteuil de soins.',
            'completed' => 'Consultation terminée avec succès.',
            'cancelled' => 'Rendez-vous annulé.',
            'no_show' => 'Patient marqué absent (No-show).',
            'scheduled' => 'Rendez-vous remis à l\'agenda.',
        ];

        return back()->with('success', $messages[$newStatus] ?? 'Statut mis à jour.');
    }

    /**
     * Suppression d'un rendez-vous.
     */
    public function destroy(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('delete', $appointment);

        $appointment->delete();

        return back()->with('success', 'Rendez-vous supprimé.');
    }
}
