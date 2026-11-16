<?php

namespace App\Http\Middleware;

use App\Models\Patient;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFreemiumLimit
{
    /**
     * Limite Freemium : 50 patients maximum sur le plan 'free'.
     */
    public const FREE_PATIENTS_LIMIT = 50;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->cabinet) {
            $cabinet = $user->cabinet;

            if ($cabinet->plan === 'free') {
                $patientCount = Patient::where('cabinet_id', $cabinet->id)->count();

                if ($patientCount >= self::FREE_PATIENTS_LIMIT) {
                    $payload = [
                        'upgrade_required' => true,
                        'title' => 'Passer à DentiCare Pro',
                        'message' => "La limite de 50 patients du plan Gratuit a été atteinte ($patientCount / 50). Veuillez passer à DentiCare Pro pour débloquer les dossiers patients illimités.",
                        'current_count' => $patientCount,
                        'limit' => self::FREE_PATIENTS_LIMIT,
                        'current_plan' => 'free',
                        'recommended_plan' => 'pro',
                    ];

                    if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                        return response()->json([
                            'error' => 'freemium_limit_reached',
                            'upgrade_required' => true,
                            'message' => $payload['message'],
                            'payload' => $payload,
                        ], 403);
                    }

                    // Pour requêtes Web et Inertia : redirection avec session flash et erreurs
                    return back()->with('upgrade_required', $payload)
                        ->withErrors([
                            'freemium_limit' => $payload['message'],
                        ]);
                }
            }
        }

        return $next($request);
    }
}
