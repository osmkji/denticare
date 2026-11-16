<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    /**
     * L'agenda et les rendez-vous sont accessibles par le dentiste et l'assistante.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $user->cabinet_id === $appointment->cabinet_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $user->cabinet_id === $appointment->cabinet_id;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->cabinet_id === $appointment->cabinet_id;
    }
}

