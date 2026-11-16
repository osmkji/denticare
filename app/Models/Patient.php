<?php

namespace App\Models;

use App\Traits\BelongsToCabinet;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory, BelongsToCabinet;

    protected $fillable = [
        'cabinet_id',
        'first_name',
        'last_name',
        'birth_date',
        'phone',
        'cin',
        'address',
        'insurance_type',
        'insurance_number',
        'allergies',
        'medical_history',
        'email',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = [
        'full_name',
        'age',
        'unpaid_balance',
        'has_medical_alerts',
        'teeth_status_map',
        'dental_total_planned',
        'dental_total_completed',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class)->orderBy('scheduled_at', 'desc');
    }

    public function clinicalActs(): HasMany
    {
        return $this->hasMany(ClinicalAct::class)->orderBy('performed_at', 'desc');
    }

    public function dentalActs(): HasMany
    {
        return $this->hasMany(DentalAct::class)->orderBy('created_at', 'desc');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PatientDocument::class)->orderBy('created_at', 'desc');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('paid_at', 'desc');
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute(): ?int
    {
        return $this->birth_date ? Carbon::parse($this->birth_date)->age : null;
    }

    /**
     * Calcule le total facturé des actes cliniques.
     */
    public function getTotalBilledAttribute(): float
    {
        return (float) $this->clinicalActs()->sum('amount');
    }

    /**
     * Calcule le total des règlements perçus.
     */
    public function getTotalPaidAttribute(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    /**
     * Reliquat impayé = Total facturé - Total réglé (en DH).
     */
    public function getUnpaidBalanceAttribute(): float
    {
        $balance = $this->total_billed - $this->total_paid;
        return max(0, round($balance, 2));
    }

    /**
     * Indique si le patient a des alertes médicales (allergies ou antécédents).
     */
    public function getHasMedicalAlertsAttribute(): bool
    {
        return ! empty(trim($this->allergies ?? '')) || ! empty(trim($this->medical_history ?? ''));
    }

    /**
     * Carte des statuts actuels des dents du patient pour l'odontogramme.
     */
    public function getTeethStatusMapAttribute(): array
    {
        $map = [];
        $acts = $this->relationLoaded('dentalActs') ? $this->dentalActs : $this->dentalActs()->get();

        foreach ($acts as $act) {
            if ($act->tooth_number && !isset($map[$act->tooth_number])) {
                $map[$act->tooth_number] = [
                    'id' => $act->id,
                    'act_type' => $act->act_type,
                    'status' => $act->status,
                    'description' => $act->description,
                    'price' => (float) $act->price,
                    'clinical_notes' => $act->clinical_notes,
                    'performed_at' => $act->performed_at?->format('Y-m-d'),
                ];
            }
        }

        return $map;
    }

    /**
     * Total du devis en cours (actes planifiés "À faire").
     */
    public function getDentalTotalPlannedAttribute(): float
    {
        if ($this->relationLoaded('dentalActs')) {
            return (float) $this->dentalActs->where('status', 'planned')->sum('price');
        }

        return (float) $this->dentalActs()->where('status', 'planned')->sum('price');
    }

    /**
     * Total des actes dentaires réalisés.
     */
    public function getDentalTotalCompletedAttribute(): float
    {
        if ($this->relationLoaded('dentalActs')) {
            return (float) $this->dentalActs->where('status', 'completed')->sum('price');
        }

        return (float) $this->dentalActs()->where('status', 'completed')->sum('price');
    }

    /**
     * Scope de recherche instantanée par nom, prénom, téléphone et CIN.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('first_name', 'like', "%{$term}%")
              ->orWhere('last_name', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('cin', 'like', "%{$term}%");
        });
    }

    /**
     * Scope pour filtrer les patients ayant un reliquat impayé (total actes > total paiements).
     */
    public function scopeWithUnpaidBalance(Builder $query): Builder
    {
        return $query->whereRaw('(
            COALESCE((SELECT SUM(amount) FROM clinical_acts WHERE clinical_acts.patient_id = patients.id), 0) -
            COALESCE((SELECT SUM(amount) FROM payments WHERE payments.patient_id = patients.id), 0)
        ) > 0.01');
    }
}
