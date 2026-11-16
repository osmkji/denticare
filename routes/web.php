<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CabinetController;
use App\Http\Controllers\ClinicalActController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DentalActController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientDocumentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirection de la racine vers le tableau de bord ou la page de bienvenue
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Welcome');
});

// Routes protégées par authentification et par l'isolation du cabinet (Multi-Tenant)
Route::middleware(['auth', 'verified', 'cabinet'])->group(function () {
    // Tableau de bord DentiCare & KPIs du jour
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/kpis/today', [DashboardController::class, 'getTodayKpis'])->name('kpis.today');

    // Dossiers Patients & Import CSV
    Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
    Route::post('/patients', [PatientController::class, 'store'])
        ->middleware('freemium.limit')
        ->name('patients.store');
    Route::post('/patients/import', [PatientController::class, 'import'])->name('patients.import');
    Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
    Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');

    // Agenda & Salle d'attente
    Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

    // Actes cliniques & Soins
    Route::get('/clinical-acts', [ClinicalActController::class, 'index'])->name('clinical-acts.index');
    Route::post('/clinical-acts', [ClinicalActController::class, 'store'])->name('clinical-acts.store');
    Route::put('/clinical-acts/{clinicalAct}', [ClinicalActController::class, 'update'])->name('clinical-acts.update');
    Route::delete('/clinical-acts/{clinicalAct}', [ClinicalActController::class, 'destroy'])->name('clinical-acts.destroy');

    // Odontogramme & Actes Dentaires Cliniques
    Route::post('/patients/{patient}/dental-acts', [DentalActController::class, 'store'])->name('dental-acts.store');
    Route::patch('/dental-acts/{dentalAct}/status', [DentalActController::class, 'updateStatus'])->name('dental-acts.status');
    Route::delete('/dental-acts/{dentalAct}', [DentalActController::class, 'destroy'])->name('dental-acts.destroy');

    // Documents & Radiographies Patient
    Route::post('/patients/{patient}/documents', [PatientDocumentController::class, 'store'])->name('patient-documents.store');
    Route::delete('/documents/{document}', [PatientDocumentController::class, 'destroy'])->name('patient-documents.destroy');

    // Encaissements & Règlements
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');

    // Gestion du Cabinet & Plans SaaS
    Route::get('/cabinet/settings', [CabinetController::class, 'show'])->name('cabinet.settings');
    Route::put('/cabinet/settings', [CabinetController::class, 'update'])->name('cabinet.update');
    Route::post('/cabinet/upgrade-plan', [CabinetController::class, 'updatePlan'])->name('cabinet.plan.update');
    Route::post('/cabinet/demo-limit', [CabinetController::class, 'reachFreemiumLimit'])->name('cabinet.demo.limit');

    // Profil utilisateur
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
