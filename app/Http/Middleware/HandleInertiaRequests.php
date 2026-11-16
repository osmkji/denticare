<?php

namespace App\Http\Middleware;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $cabinet = $user ? $user->cabinet : null;
        $patientCount = $cabinet ? Patient::where('cabinet_id', $cabinet->id)->count() : 0;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_dentist' => $user->isDentist(),
                    'is_assistant' => $user->isAssistant(),
                    'can_delete_patient' => $user->canDeletePatient(),
                    'can_modify_validated_act' => $user->canModifyValidatedAct(),
                    'can_view_global_revenue' => $user->canViewGlobalRevenue(),
                    'can_view_daily_cash' => $user->canViewDailyCash(),
                ] : null,
                'cabinet' => $cabinet ? [
                    'id' => $cabinet->id,
                    'name' => $cabinet->name,
                    'address' => $cabinet->address,
                    'phone' => $cabinet->phone,
                    'city' => $cabinet->city,
                    'plan' => $cabinet->plan,
                    'patient_count' => $patientCount,
                    'is_free' => $cabinet->isFree(),
                    'is_pro' => $cabinet->isPro(),
                    'is_clinic' => $cabinet->isClinic(),
                    'patient_limit' => $cabinet->isFree() ? 50 : null,
                    'has_reached_limit' => $cabinet->isFree() && $patientCount >= 50,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'upgrade_required' => fn () => $request->session()->get('upgrade_required'),
            ],
        ];
    }
}
