<?php

namespace App\Models;

use App\Traits\BelongsToCabinet;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory, BelongsToCabinet;

    protected $fillable = [
        'cabinet_id',
        'patient_id',
        'dentist_id',
        'scheduled_at',
        'duration_minutes',
        'motif',
        'status',
        'arrived_at',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'arrived_at' => 'datetime',
        'duration_minutes' => 'integer',
    ];

    protected $appends = [
        'waiting_minutes',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    /**
     * Calcule les minutes d'attente écoulées depuis l'arrivée du patient.
     */
    public function getWaitingMinutesAttribute(): ?int
    {
        if (! $this->arrived_at) {
            return null;
        }

        return max(0, (int) Carbon::parse($this->arrived_at)->diffInMinutes(now()));
    }
}
