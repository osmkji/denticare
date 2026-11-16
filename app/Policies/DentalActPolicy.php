<?php

namespace App\Policies;

use App\Models\DentalAct;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DentalActPolicy
{
    /**
     * Détermine si l'utilisateur peut voir les actes dentaires.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut voir un acte dentaire spécifique.
     */
    public function view(User $user, DentalAct $dentalAct): bool
    {
        return $user->cabinet_id === $dentalAct->cabinet_id;
    }

    /**
     * Détermine si l'utilisateur peut créer un acte dentaire.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut modifier un acte dentaire.
     * Si l'acte est déjà marqué "Réalisé" (completed) :
     * Seul le chirurgien-dentiste peut le modifier.
     * L'assistante n'a pas le droit de modifier un acte clinique réalisé.
     */
    public function update(User $user, DentalAct $dentalAct): Response
    {
        if ($user->cabinet_id !== $dentalAct->cabinet_id) {
            return Response::deny("Cet acte n'appartient pas à votre cabinet.");
        }

        if ($dentalAct->isCompleted() && ! $user->isDentist()) {
            return Response::deny("Interdiction : Seul le chirurgien-dentiste peut modifier un acte clinique déjà réalisé.");
        }

        return Response::allow();
    }

    /**
     * Détermine si l'utilisateur peut supprimer un acte dentaire.
     */
    public function delete(User $user, DentalAct $dentalAct): Response
    {
        if ($user->cabinet_id !== $dentalAct->cabinet_id) {
            return Response::deny("Cet acte n'appartient pas à votre cabinet.");
        }

        if (! $user->isDentist()) {
            return Response::deny("Interdiction : Seul le chirurgien-dentiste peut supprimer un acte du dossier clinique.");
        }

        return Response::allow();
    }
}

