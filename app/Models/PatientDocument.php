<?php

namespace App\Models;

use App\Traits\BelongsToCabinet;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PatientDocument extends Model
{
    use HasFactory, BelongsToCabinet;

    protected $fillable = [
        'cabinet_id',
        'patient_id',
        'title',
        'file_path',
        'type',
    ];

    protected $appends = [
        'file_url',
        'is_image',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function getFileUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }

    public function getIsImageAttribute(): bool
    {
        $extension = strtolower(pathinfo($this->file_path, PATHINFO_EXTENSION));
        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
    }
}

