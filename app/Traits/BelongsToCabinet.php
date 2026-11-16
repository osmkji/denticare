<?php

namespace App\Traits;

use App\Models\Cabinet;
use App\Models\Scopes\CabinetScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToCabinet
{
    /**
     * Boot the trait to attach the global scope and auto-assign cabinet_id.
     */
    protected static function bootBelongsToCabinet(): void
    {
        static::addGlobalScope(new CabinetScope);

        static::creating(function ($model) {
            if (empty($model->cabinet_id) && Auth::check() && Auth::user()->cabinet_id) {
                $model->cabinet_id = Auth::user()->cabinet_id;
            }
        });
    }

    /**
     * Relation avec le cabinet dentaire.
     */
    public function cabinet(): BelongsTo
    {
        return $this->belongsTo(Cabinet::class);
    }
}

