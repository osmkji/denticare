<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cabinet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'city',
        'logo_path',
        'plan',
        'subscription_ends_at',
    ];

    protected $casts = [
        'subscription_ends_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function clinicalActs(): HasMany
    {
        return $this->hasMany(ClinicalAct::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isFree(): bool
    {
        return $this->plan === 'free';
    }

    public function isPro(): bool
    {
        return $this->plan === 'pro';
    }

    public function isClinic(): bool
    {
        return $this->plan === 'clinic';
    }

    /**
     * Vérifie si le cabinet a atteint la limite du plan freemium (50 patients).
     */
    public function hasReachedFreemiumLimit(): bool
    {
        if (! $this->isFree()) {
            return false;
        }

        return $this->patients()->count() >= 50;
    }
}

