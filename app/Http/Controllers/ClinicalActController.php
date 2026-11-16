<?php

namespace App\Http\Controllers;

use App\Models\ClinicalAct;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalActController extends Controller
{
    /**
     * Liste des actes et soins du cabinet.
     */
    public function index(Request $request): Response
    {
        $acts = ClinicalAct::with(['patient', 'dentist'])
            ->orderBy('performed_at', 'desc')
            ->paginate(20);

        $patients = Patient::select('id', 'first_name', 'last_name')->orderBy('last_name')->get();
        $dentists = User::where('cabinet_id', $request->user()->cabinet_id)
            ->where('role', 'dentist')
            ->get(['id', 'name']);

        return Inertia::render('ClinicalActs/Index', [
            'acts' => $acts,
            'patients' => $patients,
            'dentists' => $dentists,
        ]);
    }

    /**
     * Enregistrement d'un acte clinique.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', ClinicalAct::class);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'dentist_id' => 'nullable|exists:users,id',
            'code' => 'nullable|string|max:20',
            'description' => 'required|string|max:255',
            'tooth_number' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:planned,in_progress,validated',
            'performed_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['dentist_id'])) {
            $validated['dentist_id'] = $request->user()->id;
        }

        ClinicalAct::create($validated);

        return back()->with('success', 'Acte clinique enregistré.');
    }

    /**
     * Modification d'un acte clinique.
     * RBAC : Si l'acte est validé, SEUL le dentiste peut le modifier.
     * Interdiction pour l'assistante.
     */
    public function update(Request $request, ClinicalAct $clinicalAct): RedirectResponse
    {
        Gate::authorize('update', $clinicalAct);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'code' => 'nullable|string|max:20',
            'tooth_number' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:planned,in_progress,validated',
            'performed_at' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $clinicalAct->update($validated);

        return back()->with('success', 'Acte clinique mis à jour.');
    }

    /**
     * Suppression d'un acte clinique (réservé au dentiste).
     */
    public function destroy(ClinicalAct $clinicalAct): RedirectResponse
    {
        Gate::authorize('delete', $clinicalAct);

        $clinicalAct->delete();

        return back()->with('success', 'Acte clinique supprimé.');
    }
}

