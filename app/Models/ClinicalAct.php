<?php

namespace App\Models;

use App\Traits\BelongsToCabinet;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicalAct extends Model
{
    use HasFactory, BelongsToCabinet;

    protected $fillable = [
        'cabinet_id',
        'patient_id',
        'dentist_id',
        'code',
        'description',
        'tooth_number',
        'amount',
        'status',
        'performed_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'performed_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function isValidated(): bool
    {
        return $this->status === 'validated';
    }
}

