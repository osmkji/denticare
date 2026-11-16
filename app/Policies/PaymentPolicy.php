<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PaymentPolicy
{
    /**
     * Détermine si l'utilisateur peut voir la liste des encaissements.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut encaisser un règlement.
     * Le dentiste et l'assistante peuvent enregistrer un paiement du jour.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut consulter l'encaissement du jour.
     * Accessible au dentiste et à l'assistante.
     */
    public function viewDailyCash(User $user): bool
    {
        return true;
    }

    /**
     * Détermine si l'utilisateur peut consulter le CA global mensuel et annuel.
     * STRICTEMENT RÉSERVÉ AU DENTISTE. Interdit pour l'assistante.
     */
    public function viewGlobalRevenue(User $user): Response
    {
        if (! $user->isDentist()) {
            return Response::deny("Accès interdit : La consultation du chiffre d'affaires global mensuel et des statistiques financières est réservée au praticien titulaire.");
        }

        return Response::allow();
    }
}

