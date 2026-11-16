<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class CabinetScope implements Scope
{
    /**
     * Applique le scope global pour isoler strictement les données par cabinet_id.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (Auth::check() && Auth::user()->cabinet_id) {
            $builder->where($model->getTable() . '.cabinet_id', Auth::user()->cabinet_id);
        }
    }
}

