<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Liste des règlements et encaissements.
     * Adapté au RBAC : l'assistante voit l'encaissement du jour, le dentiste voit tout.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        // Encaissements du jour (visibles pour dentiste et assistante)
        $todayPayments = Payment::with(['patient', 'recordedBy'])
            ->whereDate('paid_at', $today)
            ->orderBy('paid_at', 'desc')
            ->get();

        $todayTotal = $todayPayments->sum('amount');

        // RBAC : Chiffre d'affaires global et historique complet
        $allPayments = null;
        $monthlyRevenue = null;
        $canViewGlobal = $user->canViewGlobalRevenue();

        if ($canViewGlobal) {
            $allPayments = Payment::with(['patient', 'recordedBy'])
                ->orderBy('paid_at', 'desc')
                ->paginate(20);

            $monthlyRevenue = Payment::where('paid_at', '>=', Carbon::now()->startOfMonth())->sum('amount');
        }

        $patients = Patient::select('id', 'first_name', 'last_name')->orderBy('last_name')->get();

        return Inertia::render('Payments/Index', [
            'todayPayments' => $todayPayments,
            'todayTotal' => (float) $todayTotal,
            'allPayments' => $allPayments,
            'monthlyRevenue' => $canViewGlobal ? (float) $monthlyRevenue : null,
            'canViewGlobal' => $canViewGlobal,
            'patients' => $patients,
        ]);
    }

    /**
     * Enregistrement d'un encaissement (Dentiste et Assistante).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:card,cash,check,transfer',
            'paid_at' => 'required|date',
            'reference' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $validated['recorded_by_id'] = $request->user()->id;

        Payment::create($validated);

        return back()->with('success', 'Règlement de ' . number_format($validated['amount'], 2, ',', ' ') . ' € enregistré avec succès.');
    }
}

