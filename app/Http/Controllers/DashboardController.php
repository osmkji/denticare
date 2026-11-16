<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\ClinicalAct;
use App\Models\Payment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Calcule et retourne les indicateurs clés (KPIs) du jour pour le cabinet.
     */
    public function getTodayKpis(Request $request): JsonResponse
    {
        $today = Carbon::today();

        // 1. Nombre de RDV prévus aujourd'hui
        $scheduledCount = Appointment::whereDate('scheduled_at', $today)->count();

        // 2. Nombre de patients traités aujourd'hui (status 'completed')
        $treatedCount = Appointment::whereDate('scheduled_at', $today)
            ->where('status', 'completed')
            ->count();

        // 3. Recettes encaissées du jour (en DH)
        $todayRevenue = (float) Payment::whereDate('paid_at', $today)->sum('amount');

        // Patients en salle d'attente et au fauteuil
        $waitingCount = Appointment::whereDate('scheduled_at', $today)->where('status', 'waiting')->count();
        $inChairCount = Appointment::whereDate('scheduled_at', $today)->where('status', 'in_chair')->count();

        return response()->json([
            'scheduled_today' => $scheduledCount,
            'treated_today' => $treatedCount,
            'revenue_today' => $todayRevenue,
            'revenue_today_formatted' => number_format($todayRevenue, 2, ',', ' ') . ' DH',
            'currency' => 'DH',
            'waiting_count' => $waitingCount,
            'in_chair_count' => $inChairCount,
            'date' => $today->toDateString(),
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $cabinet = $user->cabinet;
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // 1. KPIs du jour demandés : RDV prévus, Patients traités, Recettes du jour (DH)
        $scheduledCount = Appointment::whereDate('scheduled_at', $today)->count();
        $treatedCount = Appointment::whereDate('scheduled_at', $today)
            ->where('status', 'completed')
            ->count();
        $todayRevenue = (float) Payment::whereDate('paid_at', $today)->sum('amount');

        $kpis = [
            'scheduled_today' => $scheduledCount,
            'treated_today' => $treatedCount,
            'revenue_today' => $todayRevenue,
            'revenue_today_formatted' => number_format($todayRevenue, 2, ',', ' ') . ' DH',
            'currency' => 'DH',
        ];

        // 2. File d'attente interactive du jour
        // Liste de tous les rendez-vous du jour avec patient et dentiste pour la file interactive
        $todayQueue = Appointment::with(['patient', 'dentist'])
            ->whereDate('scheduled_at', $today)
            ->orderByRaw("
                CASE
                    WHEN status = 'in_chair' THEN 1
                    WHEN status = 'waiting' THEN 2
                    WHEN status = 'scheduled' THEN 3
                    WHEN status = 'completed' THEN 4
                    ELSE 5
                END
            ")
            ->orderBy('scheduled_at')
            ->get();

        // Patients actuellement en salle d'attente
        $waitingRoomPatients = $todayQueue->where('status', 'waiting')->values();

        // Patient actuellement au fauteuil
        $inChairAppointment = $todayQueue->where('status', 'in_chair')->first();

        // 3. Statistiques Patients & Freemium
        $patientCount = Patient::count();
        $freemiumLimit = 50;
        $isFreePlan = $cabinet->isFree();
        $hasReachedLimit = $isFreePlan && $patientCount >= $freemiumLimit;

        // 4. Encaissements du jour détaillés
        $todayPayments = Payment::with(['patient', 'recordedBy'])
            ->whereDate('paid_at', $today)
            ->orderBy('paid_at', 'desc')
            ->get();

        // 5. Statistiques Financières Globales (RBAC Dentiste)
        $financialStats = null;
        if ($user->canViewGlobalRevenue()) {
            $monthRevenue = Payment::where('paid_at', '>=', $startOfMonth)->sum('amount');
            $yearRevenue = Payment::whereYear('paid_at', Carbon::now()->year)->sum('amount');

            $monthlyBreakdown = [];
            for ($i = 5; $i >= 0; $i--) {
                $monthDate = Carbon::now()->subMonths($i);
                $monthName = $monthDate->translatedFormat('F Y');
                $sum = Payment::whereYear('paid_at', $monthDate->year)
                    ->whereMonth('paid_at', $monthDate->month)
                    ->sum('amount');

                $monthlyBreakdown[] = [
                    'month' => ucfirst($monthName),
                    'total' => (float) $sum,
                ];
            }

            $financialStats = [
                'accessible' => true,
                'monthly_revenue' => (float) $monthRevenue,
                'monthly_revenue_formatted' => number_format($monthRevenue, 2, ',', ' ') . ' DH',
                'yearly_revenue' => (float) $yearRevenue,
                'monthly_breakdown' => $monthlyBreakdown,
            ];
        } else {
            $financialStats = [
                'accessible' => false,
                'message' => 'Consultation du Chiffre d\'Affaires global mensuel réservée au chirurgien-dentiste titulaire.',
            ];
        }

        // 6. Actes récents
        $recentActs = ClinicalAct::with(['patient', 'dentist'])
            ->orderBy('performed_at', 'desc')
            ->take(5)
            ->get();

        // Liste rapide des patients et praticiens pour les modales "+ Nouveau Patient" et "+ Nouveau RDV"
        $patientsList = Patient::select('id', 'first_name', 'last_name', 'phone')->orderBy('last_name')->get();
        $dentistsList = User::where('cabinet_id', $user->cabinet_id)->where('role', 'dentist')->get(['id', 'name']);

        return Inertia::render('Dashboard', [
            'kpis' => $kpis,
            'todayQueue' => $todayQueue,
            'waitingRoomPatients' => $waitingRoomPatients,
            'inChairAppointment' => $inChairAppointment,
            'todayPayments' => $todayPayments,
            'financialStats' => $financialStats,
            'recentActs' => $recentActs,
            'patientsList' => $patientsList,
            'dentistsList' => $dentistsList,
            'currentCabinet' => $cabinet,
            'stats' => [
                'patient_count' => $patientCount,
                'freemium_limit' => $freemiumLimit,
                'is_free_plan' => $isFreePlan,
                'has_reached_limit' => $hasReachedLimit,
                'today_appointments_count' => $scheduledCount,
                'today_total_cash' => $todayRevenue,
                'today_total_cash_formatted' => number_format($todayRevenue, 2, ',', ' ') . ' DH',
            ],
        ]);
    }
}
