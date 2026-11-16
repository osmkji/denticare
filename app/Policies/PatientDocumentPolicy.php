<?php

namespace App\Policies;

use App\Models\PatientDocument;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PatientDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PatientDocument $document): bool
    {
        return $user->cabinet_id === $document->cabinet_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, PatientDocument $document): Response
    {
        if ($user->cabinet_id !== $document->cabinet_id) {
            return Response::deny("Ce document n'appartient pas à votre cabinet.");
        }

        return Response::allow();
    }
}

