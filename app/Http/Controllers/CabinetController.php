<?php

namespace App\Http\Controllers;

use App\Models\Cabinet;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CabinetController extends Controller
{
    /**
     * Page de gestion du cabinet et de l'abonnement SaaS.
     */
    public function show(Request $request): Response
    {
        $cabinet = $request->user()->cabinet;
        $patientCount = Patient::count();

        return Inertia::render('Cabinet/Settings', [
            'cabinet' => $cabinet,
            'patientCount' => $patientCount,
        ]);
    }

    /**
     * Mise à jour des informations du cabinet.
     */
    public function update(Request $request): RedirectResponse
    {
        $cabinet = $request->user()->cabinet;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
        ]);

        $cabinet->update($validated);

        return back()->with('success', 'Coordonnées du cabinet mises à jour.');
    }

    /**
     * Mise à niveau vers un forfait DentiCare (Passer à DentiCare Pro ou Clinic).
     */
    public function updatePlan(Request $request): RedirectResponse
    {
        $cabinet = $request->user()->cabinet;

        $validated = $request->validate([
            'plan' => 'required|in:free,pro,clinic',
        ]);

        $cabinet->update([
            'plan' => $validated['plan'],
            'subscription_ends_at' => $validated['plan'] === 'free' ? null : now()->addYear(),
        ]);

        $planNames = [
            'free' => 'DentiCare Gratuit (limité à 50 patients)',
            'pro' => 'DentiCare Pro (dossiers patients illimités)',
            'clinic' => 'DentiCare Clinic (multi-praticiens & télétransmission)',
        ];

        return back()->with('success', "Abonnement modifié : Vous êtes désormais sur l'offre {$planNames[$validated['plan']]}.");
    }

    /**
     * Outil de démonstration : Génère des patients factices pour atteindre immédiatement la limite de 50 patients.
     * Permet à l'utilisateur d'expérimenter instantanément le blocage Freemium et la modale d'upgrade.
     */
    public function reachFreemiumLimit(Request $request): RedirectResponse
    {
        $cabinet = $request->user()->cabinet;
        $currentCount = Patient::count();
        $target = 50;

        if ($currentCount < $target) {
            $needed = $target - $currentCount;
            for ($i = 1; $i <= $needed; $i++) {
                Patient::create([
                    'cabinet_id' => $cabinet->id,
                    'first_name' => "PatientDémo{$i}",
                    'last_name' => "TestFreemium",
                    'email' => "patient.demo{$i}@denticare.local",
                    'phone' => "06 00 00 " . sprintf('%02d', $i) . " 00",
                    'notes' => 'Patient généré automatiquement pour tester le seuil des 50 patients freemium.',
                ]);
            }
        }

        // S'assure que le cabinet est sur le plan free pour tester
        $cabinet->update(['plan' => 'free']);

        return back()->with('success', "50 patients atteints ! Le cabinet est sur le forfait Gratuit. Tentez maintenant d'ajouter un patient pour tester la modale d'upgrade.");
    }
}

