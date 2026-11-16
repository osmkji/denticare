<?php

namespace App\Models;

use App\Traits\BelongsToCabinet;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DentalAct extends Model
{
    use HasFactory, BelongsToCabinet;

    protected $fillable = [
        'cabinet_id',
        'patient_id',
        'dentist_id',
        'tooth_number',
        'act_type',
        'description',
        'clinical_notes',
        'price',
        'status',
        'performed_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'performed_at' => 'date',
    ];

    public const ACT_TYPES = [
        'healthy' => ['label' => 'Saine', 'color' => '#ffffff', 'badge' => 'slate'],
        'caries' => ['label' => 'Carie', 'color' => '#ef4444', 'badge' => 'red'],
        'composite' => ['label' => 'Composite', 'color' => '#3b82f6', 'badge' => 'blue'],
        'endo' => ['label' => 'Dévitalisation (Endo)', 'color' => '#eab308', 'badge' => 'amber'],
        'crown' => ['label' => 'Couronne', 'color' => '#10b981', 'badge' => 'emerald'],
        'extraction' => ['label' => 'Extraction', 'color' => '#6b7280', 'badge' => 'gray'],
        'absent' => ['label' => 'Dent Absente', 'color' => '#6b7280', 'badge' => 'gray'],
        'implant' => ['label' => 'Implant', 'color' => '#8b5cf6', 'badge' => 'purple'],
        'scaling' => ['label' => 'Détartrage', 'color' => '#2a9d8f', 'badge' => 'teal'],
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPlanned(): bool
    {
        return $this->status === 'planned';
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopePlanned(Builder $query): Builder
    {
        return $query->where('status', 'planned');
    }

    public function scopeForTooth(Builder $query, string $toothNumber): Builder
    {
        return $query->where('tooth_number', $toothNumber);
    }
}

