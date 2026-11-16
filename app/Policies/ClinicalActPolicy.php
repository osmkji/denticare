<?php

namespace App\Policies;

use App\Models\ClinicalAct;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClinicalActPolicy
{
    /**
     * Détermine si l'utilisateur peut voir les actes cliniques.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut voir un acte clinique spécifique.
     */
    public function view(User $user, ClinicalAct $clinicalAct): bool
    {
        return $user->cabinet_id === $clinicalAct->cabinet_id;
    }

    /**
     * Détermine si l'utilisateur peut créer un acte clinique.
     * Le praticien (dentiste) réalise et enregistre les soins cliniques.
     */
    public function create(User $user): bool
    {
        return $user->isDentist();
    }

    /**
     * Détermine si l'utilisateur peut modifier un acte clinique.
     * Si l'acte est validé : SEUL le dentiste peut le modifier.
     * L'assistante n'a pas le droit de modifier un acte clinique réalisé/validé.
     */
    public function update(User $user, ClinicalAct $clinicalAct): Response
    {
        if ($user->cabinet_id !== $clinicalAct->cabinet_id) {
            return Response::deny("Cet acte n'appartient pas à votre cabinet.");
        }

        if ($clinicalAct->isValidated() && ! $user->isDentist()) {
            return Response::deny("Interdiction : Seul le chirurgien-dentiste peut modifier un acte clinique validé et réalisé.");
        }

        return Response::allow();
    }

    /**
     * Détermine si l'utilisateur peut supprimer un acte clinique.
     * Réservé au dentiste.
     */
    public function delete(User $user, ClinicalAct $clinicalAct): Response
    {
        if (! $user->isDentist()) {
            return Response::deny("Seul le chirurgien-dentiste peut supprimer un acte de soin.");
        }

        return $user->cabinet_id === $clinicalAct->cabinet_id
            ? Response::allow()
            : Response::deny("Cet acte n'appartient pas à votre cabinet.");
    }
}

