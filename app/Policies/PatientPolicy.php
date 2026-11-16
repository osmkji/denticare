<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PatientPolicy
{
    /**
     * Détermine si l'utilisateur peut afficher la liste des patients.
     * Le dentiste et l'assistante ont accès à la liste.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut voir un patient spécifique.
     */
    public function view(User $user, Patient $patient): bool
    {
        return $user->cabinet_id === $patient->cabinet_id;
    }

    /**
     * Détermine si l'utilisateur peut créer un patient.
     * Accessible par le dentiste et l'assistante, sous réserve de la limite freemium.
     */
    public function create(User $user): Response
    {
        $cabinet = $user->cabinet;

        if ($cabinet && $cabinet->isFree() && $cabinet->patients()->count() >= 50) {
            return Response::deny("Limite du plan Gratuit atteinte (50 patients). Passez à DentiCare Pro pour ajouter des patients illimités.");
        }

        return Response::allow();
    }

    /**
     * Détermine si l'utilisateur peut modifier un dossier patient.
     * Le dentiste et l'assistante peuvent mettre à jour les coordonnées et informations administratives.
     */
    public function update(User $user, Patient $patient): bool
    {
        return $user->cabinet_id === $patient->cabinet_id;
    }

    /**
     * Détermine si l'utilisateur peut supprimer un dossier patient.
     * STRICTEMENT RÉSERVÉ AU DENTISTE. Interdit pour l'assistante.
     */
    public function delete(User $user, Patient $patient): Response
    {
        if (! $user->isDentist()) {
            return Response::deny("Seul le chirurgien-dentiste est autorisé à supprimer définitivement un dossier patient.");
        }

        return $user->cabinet_id === $patient->cabinet_id
            ? Response::allow()
            : Response::deny("Ce patient n'appartient pas à votre cabinet.");
    }
}

