<?php

namespace App\Http\Controllers;

use App\Models\DentalAct;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DentalActController extends Controller
{
    /**
     * Enregistre un nouvel acte dentaire / soin au plan de traitement du patient.
     */
    public function store(Request $request, Patient $patient): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'tooth_number' => 'nullable|string|max:5',
            'act_type' => 'required|in:healthy,caries,composite,endo,extraction,crown,implant,absent,scaling',
            'description' => 'required|string|max:255',
            'clinical_notes' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:planned,completed',
            'performed_at' => 'nullable|date',
        ]);

        if ($validated['status'] === 'completed' && empty($validated['performed_at'])) {
            $validated['performed_at'] = now()->toDateString();
        }

        $validated['cabinet_id'] = $request->user()->cabinet_id;
        $validated['patient_id'] = $patient->id;
        $validated['dentist_id'] = $request->user()->id;

        $act = DentalAct::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'act' => $act->load('dentist'),
                'message' => "Acte dentaire enregistré sur la dent {$act->tooth_number}.",
            ], 201);
        }

        $toothLabel = $act->tooth_number ? "sur la dent {$act->tooth_number}" : "";
        return back()->with('success', "Acte « {$act->description} » {$toothLabel} ajouté au dossier clinique.");
    }

    /**
     * Bascule ou met à jour le statut d'un acte dentaire ('planned' -> 'completed' ou inversement).
     * Vérifie la règle RBAC : l'assistante ne peut pas modifier un acte déjà réalisé.
     */
    public function updateStatus(Request $request, DentalAct $dentalAct): RedirectResponse|JsonResponse
    {
        Gate::authorize('update', $dentalAct);

        $newStatus = $request->input('status');
        if (! in_array($newStatus, ['planned', 'completed'])) {
            $newStatus = $dentalAct->status === 'planned' ? 'completed' : 'planned';
        }

        $dentalAct->status = $newStatus;

        if ($newStatus === 'completed' && ! $dentalAct->performed_at) {
            $dentalAct->performed_at = now()->toDateString();
        }

        $dentalAct->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'act' => $dentalAct,
                'status' => $dentalAct->status,
                'message' => $dentalAct->status === 'completed' ? 'Acte marqué comme Réalisé.' : 'Acte replacé dans le Plan de traitement.',
            ]);
        }

        $msg = $dentalAct->status === 'completed' 
            ? "Acte « {$dentalAct->description} » marqué comme Réalisé." 
            : "Acte « {$dentalAct->description} » remis en À faire.";

        return back()->with('success', $msg);
    }

    /**
     * Supprime un acte dentaire (réservé au chirurgien-dentiste).
     */
    public function destroy(DentalAct $dentalAct): RedirectResponse|JsonResponse
    {
        Gate::authorize('delete', $dentalAct);

        $description = $dentalAct->description;
        $tooth = $dentalAct->tooth_number;
        $dentalAct->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', "Acte « {$description} » (Dent {$tooth}) supprimé du plan de traitement.");
    }
}

