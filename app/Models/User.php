<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cabinet_id',
        'name',
        'email',
        'password',
        'role',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Cabinet auquel l'utilisateur est rattaché.
     */
    public function cabinet(): BelongsTo
    {
        return $this->belongsTo(Cabinet::class);
    }

    /**
     * Rendez-vous assignés à ce praticien.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'dentist_id');
    }

    /**
     * Actes cliniques réalisés par ce praticien.
     */
    public function clinicalActs(): HasMany
    {
        return $this->hasMany(ClinicalAct::class, 'dentist_id');
    }

    /**
     * Encaissements saisis par cet utilisateur.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'recorded_by_id');
    }

    /**
     * Vérifie si l'utilisateur est dentiste / praticien.
     */
    public function isDentist(): bool
    {
        return $this->role === 'dentist';
    }

    /**
     * Vérifie si l'utilisateur est assistante dentaire.
     */
    public function isAssistant(): bool
    {
        return $this->role === 'assistant';
    }

    /**
     * RBAC : Seul le dentiste peut supprimer un patient.
     */
    public function canDeletePatient(): bool
    {
        return $this->isDentist();
    }

    /**
     * RBAC : Seul le dentiste peut modifier un acte clinique déjà validé.
     */
    public function canModifyValidatedAct(): bool
    {
        return $this->isDentist();
    }

    /**
     * RBAC : Seul le dentiste a accès aux statistiques financières globales (CA mensuel / annuel).
     */
    public function canViewGlobalRevenue(): bool
    {
        return $this->isDentist();
    }

    /**
     * RBAC : L'assistante et le dentiste ont tous les deux accès à l'encaissement du jour.
     */
    public function canViewDailyCash(): bool
    {
        return $this->isDentist() || $this->isAssistant();
    }
}
