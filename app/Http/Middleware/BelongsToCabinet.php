<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BelongsToCabinet
{
    /**
     * Handle an incoming request.
     *
     * Isole strictement les requêtes par cabinet_id et vérifie l'appartenance des ressources.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->cabinet_id || ! $user->cabinet) {
            abort(403, "Aucun cabinet dentaire n'est associé à ce compte utilisateur.");
        }

        // Partage l'instance du cabinet courant
        app()->instance('current_cabinet', $user->cabinet);

        // Vérification des paramètres de route pour garantir l'étanchéité multi-tenant
        foreach ($request->route()->parameters() as $parameter) {
            if (is_object($parameter) && isset($parameter->cabinet_id)) {
                if ($parameter->cabinet_id !== $user->cabinet_id) {
                    abort(403, "Accès refusé : cette ressource n'appartient pas à votre cabinet.");
                }
            }
        }

        return $next($request);
    }
}

