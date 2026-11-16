<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Cabinet;
use App\Models\ClinicalAct;
use App\Models\DentalAct;
use App\Models\Patient;
use App\Models\PatientDocument;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class DentiCareTest extends TestCase
{
    use RefreshDatabase;

    protected Cabinet $cabinet;
    protected User $dentist;
    protected User $assistant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cabinet = Cabinet::create([
            'name' => 'Cabinet Dentaire DentiCare',
            'city' => 'Paris',
            'plan' => 'free',
        ]);

        $this->dentist = User::create([
            'cabinet_id' => $this->cabinet->id,
            'name' => 'Dr. Sophie Martin',
            'email' => 'dentiste@denticare.fr',
            'password' => bcrypt('password'),
            'role' => 'dentist',
            'email_verified_at' => now(),
        ]);

        $this->assistant = User::create([
            'cabinet_id' => $this->cabinet->id,
            'name' => 'Claire Dubois',
            'email' => 'assistante@denticare.fr',
            'password' => bcrypt('password'),
            'role' => 'assistant',
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Test 1 : Isolation Multi-Tenant stricte par CabinetScope.
     */
    public function test_multi_tenant_isolation_strictly_scopes_data_by_cabinet(): void
    {
        // Patient dans le cabinet DentiCare
        $patient1 = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Patient',
            'last_name' => 'DentiCare',
        ]);

        // Autre cabinet
        $otherCabinet = Cabinet::create([
            'name' => 'Autre Cabinet Dentaire',
            'plan' => 'free',
        ]);

        $patient2 = Patient::create([
            'cabinet_id' => $otherCabinet->id,
            'first_name' => 'Patient',
            'last_name' => 'AutreCabinet',
        ]);

        // Connecté en tant que dentiste de DentiCare
        $this->actingAs($this->dentist);

        // La requête est automatiquement scopée par BelongsToCabinet
        $patients = Patient::all();

        $this->assertTrue($patients->contains($patient1));
        $this->assertFalse($patients->contains($patient2));
        $this->assertEquals(1, $patients->count());
    }

    /**
     * Test 2 : Seuil Freemium de 50 patients (CheckFreemiumLimit).
     */
    public function test_freemium_limit_blocks_creation_at_50_patients_on_free_plan(): void
    {
        $this->actingAs($this->dentist);

        // Création de 50 patients pour atteindre le seuil
        for ($i = 1; $i <= 50; $i++) {
            Patient::create([
                'cabinet_id' => $this->cabinet->id,
                'first_name' => "Patient{$i}",
                'last_name' => "Test",
            ]);
        }

        $this->assertEquals(50, Patient::count());

        // Tentative de création du 51ème patient
        $response = $this->post(route('patients.store'), [
            'first_name' => 'Patient51',
            'last_name' => 'Interdit',
            'phone' => '06 00 00 00 00',
        ]);

        // Doit bloquer et rediriger avec flash upgrade_required
        $response->assertSessionHas('upgrade_required');
        $response->assertSessionHasErrors(['freemium_limit']);

        // Le 51ème patient n'a pas été inséré
        $this->assertEquals(50, Patient::count());
    }

    /**
     * Test 3 : Le forfait Pro permet de dépasser 50 patients sans blocage.
     */
    public function test_pro_plan_allows_unlimited_patients(): void
    {
        $this->cabinet->update(['plan' => 'pro']);
        $this->actingAs($this->dentist);

        for ($i = 1; $i <= 50; $i++) {
            Patient::create([
                'cabinet_id' => $this->cabinet->id,
                'first_name' => "Patient{$i}",
                'last_name' => "Pro",
            ]);
        }

        // Création du 51ème patient sous forfait Pro
        $response = $this->post(route('patients.store'), [
            'first_name' => 'Patient51',
            'last_name' => 'Autorise',
            'phone' => '06 11 22 33 44',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(51, Patient::count());
    }

    /**
     * Test 4 : RBAC - Seul le Dentiste peut supprimer un dossier patient.
     */
    public function test_only_dentist_can_delete_patient_dossier(): void
    {
        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Marc',
            'last_name' => 'Vidal',
        ]);

        // 1. L'assistante tente de supprimer le patient -> 403 Forbidden
        $this->actingAs($this->assistant);
        $responseAssistant = $this->delete(route('patients.destroy', $patient->id));
        $responseAssistant->assertForbidden();
        $this->assertDatabaseHas('patients', ['id' => $patient->id]);

        // 2. Le dentiste supprime le patient -> Succès 302
        $this->actingAs($this->dentist);
        $responseDentist = $this->delete(route('patients.destroy', $patient->id));
        $responseDentist->assertRedirect(route('patients.index'));
        $this->assertDatabaseMissing('patients', ['id' => $patient->id]);
    }

    /**
     * Test 5 : RBAC - Seul le Dentiste peut modifier un acte clinique validé.
     */
    public function test_only_dentist_can_modify_validated_clinical_act(): void
    {
        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Claire',
            'last_name' => 'Dupont',
        ]);

        $act = ClinicalAct::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'code' => 'HBGD036',
            'description' => 'Détartrage complet',
            'amount' => 43.38,
            'status' => 'validated', // Acte validé
            'performed_at' => now(),
        ]);

        // 1. L'assistante tente de modifier l'acte validé -> 403 Forbidden
        $this->actingAs($this->assistant);
        $responseAssistant = $this->put(route('clinical-acts.update', $act->id), [
            'description' => 'Tentative modification assistante',
            'amount' => 50.00,
            'status' => 'validated',
            'performed_at' => now()->toDateString(),
        ]);
        $responseAssistant->assertForbidden();

        // 2. Le dentiste modifie l'acte validé -> Succès
        $this->actingAs($this->dentist);
        $responseDentist = $this->put(route('clinical-acts.update', $act->id), [
            'description' => 'Détartrage et surfaçage radiculaire',
            'amount' => 80.00,
            'status' => 'validated',
            'performed_at' => now()->toDateString(),
        ]);
        $responseDentist->assertSessionHas('success');
        $this->assertDatabaseHas('clinical_acts', [
            'id' => $act->id,
            'description' => 'Détartrage et surfaçage radiculaire',
        ]);
    }

    /**
     * Test 6 : RBAC - L'assistante accède à l'encaissement du jour mais pas au CA global mensuel.
     */
    public function test_assistant_can_view_daily_cash_but_not_global_monthly_revenue(): void
    {
        $this->actingAs($this->assistant);

        $response = $this->get(route('dashboard'));
        $response->assertOk();

        // Vérification des données passées à la vue Inertia
        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard')
                ->where('financialStats.accessible', false)
                ->has('stats.today_total_cash')
        );

        // Pour le dentiste, financialStats.accessible doit être true
        $this->actingAs($this->dentist);
        $responseDentist = $this->get(route('dashboard'));
        $responseDentist->assertInertia(fn ($page) =>
            $page->component('Dashboard')
                ->where('financialStats.accessible', true)
                ->has('financialStats.monthly_revenue')
        );
    }

    /**
     * Test 7 : Endpoint des KPIs du jour (RDV prévus, patients traités, recettes en DH).
     */
    public function test_kpis_endpoint_returns_scheduled_treated_and_revenue_in_dh(): void
    {
        $this->actingAs($this->dentist);

        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Youssef',
            'last_name' => 'El Alami',
        ]);

        // RDV 1 : prévu (scheduled)
        Appointment::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'motif' => 'Contrôle annuel',
            'scheduled_at' => now(),
            'status' => 'scheduled',
        ]);

        // RDV 2 : patient traité (completed)
        Appointment::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'motif' => 'Extraction',
            'scheduled_at' => now(),
            'status' => 'completed',
        ]);

        // Recette du jour (ex: 450 DH)
        Payment::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'recorded_by_id' => $this->dentist->id,
            'amount' => 450.00,
            'payment_method' => 'card',
            'paid_at' => now(),
        ]);

        $response = $this->getJson(route('kpis.today'));

        $response->assertOk()
            ->assertJson([
                'scheduled_today' => 2,
                'treated_today' => 1,
                'revenue_today' => 450.00,
                'currency' => 'DH',
            ]);
    }

    /**
     * Test 8 : PATCH /appointments/{id}/status enregistre arrived_at lors du passage en 'waiting'.
     */
    public function test_patch_appointment_status_updates_status_and_records_arrived_at_when_waiting(): void
    {
        $this->actingAs($this->dentist);

        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Fatima',
            'last_name' => 'Zahra',
        ]);

        $appointment = Appointment::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'motif' => 'Soin carie',
            'scheduled_at' => now()->addHour(),
            'status' => 'scheduled',
            'arrived_at' => null,
        ]);

        $this->assertNull($appointment->arrived_at);

        // 1. Passage en salle d'attente ('waiting')
        $response = $this->patchJson(route('appointments.status', $appointment->id), [
            'status' => 'waiting',
        ]);

        $response->assertOk();
        $appointment->refresh();
        $this->assertEquals('waiting', $appointment->status);
        $this->assertNotNull($appointment->arrived_at);

        // 2. Passage au fauteuil ('in_chair')
        $response2 = $this->patchJson(route('appointments.status', $appointment->id), [
            'status' => 'in_chair',
        ]);
        $response2->assertOk();
        $appointment->refresh();
        $this->assertEquals('in_chair', $appointment->status);

        // 3. Passage à terminé ('completed')
        $response3 = $this->patchJson(route('appointments.status', $appointment->id), [
            'status' => 'completed',
        ]);
        $response3->assertOk();
        $appointment->refresh();
        $this->assertEquals('completed', $appointment->status);
    }

    /**
     * Test 9 : Scopes de recherche (nom, téléphone, CIN) et filtre reliquats impayés.
     */
    public function test_patient_scopes_search_and_unpaid_balance(): void
    {
        $this->actingAs($this->dentist);

        $patient1 = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Amine',
            'last_name' => 'Tazi',
            'phone' => '0699887766',
            'cin' => 'AB123456',
        ]);

        $patient2 = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Nadia',
            'last_name' => 'Berrada',
            'phone' => '0611223344',
            'cin' => 'CD789012',
        ]);

        // Recherche par CIN
        $resultsCin = Patient::search('AB123456')->get();
        $this->assertTrue($resultsCin->contains($patient1));
        $this->assertFalse($resultsCin->contains($patient2));

        // Recherche par Téléphone
        $resultsPhone = Patient::search('0611223344')->get();
        $this->assertTrue($resultsPhone->contains($patient2));
        $this->assertFalse($resultsPhone->contains($patient1));

        // Reliquats impayés : Patient 1 a un acte de 300 DH et aucun paiement -> Reliquat 300 DH
        ClinicalAct::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient1->id,
            'dentist_id' => $this->dentist->id,
            'description' => 'Soin endodontique',
            'amount' => 300.00,
            'status' => 'validated',
            'performed_at' => now(),
        ]);

        // Patient 2 a un acte de 200 DH et a réglé 200 DH -> Solde 0
        ClinicalAct::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient2->id,
            'dentist_id' => $this->dentist->id,
            'description' => 'Détartrage',
            'amount' => 200.00,
            'status' => 'validated',
            'performed_at' => now(),
        ]);

        Payment::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient2->id,
            'recorded_by_id' => $this->dentist->id,
            'amount' => 200.00,
            'payment_method' => 'card',
            'paid_at' => now(),
        ]);

        $unpaidPatients = Patient::withUnpaidBalance()->get();
        $this->assertTrue($unpaidPatients->contains($patient1));
        $this->assertFalse($unpaidPatients->contains($patient2));
    }

    /**
     * Test 10 : Importation CSV et respect de la limite des 50 patients du forfait Free.
     */
    public function test_patient_csv_import_respects_freemium_50_limit(): void
    {
        $this->actingAs($this->dentist);

        // 1. Importation réussie sous le quota
        $csvContent = "first_name,last_name,phone,cin\nMehdi,Idrissi,0655443322,BE998877\nSalma,Kabbaj,0644332211,BK554433";
        $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('patients.csv', $csvContent);

        $response = $this->post(route('patients.import'), [
            'file' => $file,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('patients', ['first_name' => 'Mehdi', 'cin' => 'BE998877']);
        $this->assertDatabaseHas('patients', ['first_name' => 'Salma', 'cin' => 'BK554433']);

        // 2. Amener le cabinet à 49 patients
        $currentCount = Patient::count();
        for ($i = $currentCount + 1; $i <= 49; $i++) {
            Patient::create([
                'cabinet_id' => $this->cabinet->id,
                'first_name' => "P{$i}",
                'last_name' => "Demo",
            ]);
        }
        $this->assertEquals(49, Patient::count());

        // 3. Tenter d'importer 3 patients -> Dépasserait 50 (49 + 3 = 52) -> Bloqué
        $csvExceed = "first_name,last_name,phone\nP50,Test,0600000001\nP51,Test,0600000002\nP52,Test,0600000003";
        $fileExceed = \Illuminate\Http\UploadedFile::fake()->createWithContent('exceed.csv', $csvExceed);

        $responseExceed = $this->post(route('patients.import'), [
            'file' => $fileExceed,
        ]);

        $responseExceed->assertSessionHas('upgrade_required');
        $responseExceed->assertSessionHasErrors(['file']);
        $this->assertEquals(49, Patient::count());
    }

    /**
     * Test 11 : Création d'un acte dentaire pour l'odontogramme avec tarif en DH.
     */
    public function test_dental_act_creation_and_odontogram_status(): void
    {
        $this->actingAs($this->dentist);

        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Karim',
            'last_name' => 'Bennani',
        ]);

        $response = $this->post(route('dental-acts.store', $patient->id), [
            'tooth_number' => '16',
            'act_type' => 'caries',
            'description' => 'Soin de carie occlusale molaire',
            'price' => 450.00,
            'status' => 'planned',
            'clinical_notes' => 'Sensibilité au froid, excavation sous digue.',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('dental_acts', [
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'tooth_number' => '16',
            'act_type' => 'caries',
            'price' => 450.00,
            'status' => 'planned',
        ]);

        $patient->refresh();
        $this->assertArrayHasKey('16', $patient->teeth_status_map);
        $this->assertEquals('caries', $patient->teeth_status_map['16']['act_type']);
        $this->assertEquals(450.00, $patient->dental_total_planned);
    }

    /**
     * Test 12 : Bascule en 1 clic d'un acte dentaire de "À faire" à "Réalisé".
     */
    public function test_dental_act_status_toggle_in_one_click(): void
    {
        $this->actingAs($this->dentist);

        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Amina',
            'last_name' => 'El Fassi',
        ]);

        $act = DentalAct::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'tooth_number' => '21',
            'act_type' => 'composite',
            'description' => 'Obturation composite angle incisif',
            'price' => 500.00,
            'status' => 'planned',
        ]);

        $this->assertEquals('planned', $act->status);
        $this->assertNull($act->performed_at);

        // Bascule en 1 clic vers "completed"
        $response = $this->patch(route('dental-acts.status', $act->id));

        $response->assertSessionHas('success');
        $act->refresh();
        $this->assertEquals('completed', $act->status);
        $this->assertNotNull($act->performed_at);
    }

    /**
     * Test 13 : RBAC - L'assistante a interdiction formelle de modifier un acte clinique déjà réalisé.
     */
    public function test_assistant_forbidden_from_modifying_completed_dental_act(): void
    {
        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Omar',
            'last_name' => 'Tazi',
        ]);

        // Acte validé et réalisé par le dentiste
        $act = DentalAct::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'tooth_number' => '46',
            'act_type' => 'crown',
            'description' => 'Couronne tout-céramique',
            'price' => 2500.00,
            'status' => 'completed',
            'performed_at' => now()->toDateString(),
        ]);

        // Connecté en tant qu'assistante
        $this->actingAs($this->assistant);

        // Tentative de modification du statut d'un acte déjà réalisé -> 403 Forbidden
        $response = $this->patch(route('dental-acts.status', $act->id), [
            'status' => 'planned',
        ]);

        $response->assertForbidden();

        // Tentative de suppression -> 403 Forbidden
        $responseDelete = $this->delete(route('dental-acts.destroy', $act->id));
        $responseDelete->assertForbidden();

        // Vérification que le statut n'a pas bougé en base
        $act->refresh();
        $this->assertEquals('completed', $act->status);
    }

    /**
     * Test 14 : Téléversement et suppression d'un document/radio patient.
     */
    public function test_patient_document_upload_and_deletion(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');

        $this->actingAs($this->dentist);

        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Nadia',
            'last_name' => 'Chraibi',
        ]);

        $fakeFile = \Illuminate\Http\UploadedFile::fake()->image('radio-panoramique.jpg');

        $response = $this->post(route('patient-documents.store', $patient->id), [
            'title' => 'Radio Panoramique HD',
            'type' => 'xray',
            'file' => $fakeFile,
        ]);

        $response->assertSessionHas('success');

        $document = PatientDocument::where('patient_id', $patient->id)->first();
        $this->assertNotNull($document);
        $this->assertEquals('Radio Panoramique HD', $document->title);
        $this->assertEquals('xray', $document->type);
        $this->assertEquals($this->cabinet->id, $document->cabinet_id);
        $this->assertTrue($document->is_image);

        // Suppression du document
        $deleteResponse = $this->delete(route('patient-documents.destroy', $document->id));
        $deleteResponse->assertSessionHas('success');
        $this->assertDatabaseMissing('patient_documents', ['id' => $document->id]);
    }

    /**
     * Test 15 : Agenda et vues Calendrier (Semaine et Jour).
     */
    public function test_appointments_index_renders_week_view_and_day_view(): void
    {
        $this->actingAs($this->dentist);

        $patient = Patient::create([
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Sara',
            'last_name' => 'Mansouri',
            'phone' => '06 12 34 56 78',
        ]);

        Appointment::create([
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $patient->id,
            'dentist_id' => $this->dentist->id,
            'motif' => 'Détartrage & Polissage',
            'scheduled_at' => now()->startOfWeek()->addHours(10), // Lundi à 10h00
            'duration_minutes' => 30,
            'status' => 'scheduled',
        ]);

        // 1. Vue semaine (par défaut)
        $responseWeek = $this->get(route('appointments.index', ['view_mode' => 'week']));
        $responseWeek->assertOk();
        $responseWeek->assertInertia(fn ($page) => $page
            ->component('Appointments/Index')
            ->has('appointments', 1)
            ->where('viewMode', 'week')
        );

        // 2. Vue jour
        $responseDay = $this->get(route('appointments.index', ['view_mode' => 'day']));
        $responseDay->assertOk();
        $responseDay->assertInertia(fn ($page) => $page
            ->component('Appointments/Index')
            ->where('viewMode', 'day')
        );
    }

    /**
     * Test 16 : Prise de RDV avec création rapide d'un patient à la volée.
     */
    public function test_appointment_booking_with_quick_patient_creation_on_the_fly(): void
    {
        $this->actingAs($this->dentist);

        $response = $this->post(route('appointments.store'), [
            'create_new_patient' => true,
            'new_patient_first_name' => 'Anas',
            'new_patient_last_name' => 'Benjelloun',
            'new_patient_phone' => '06 99 88 77 66',
            'new_patient_cin' => 'AB654321',
            'motif' => 'Urgence',
            'scheduled_at' => now()->addDay()->format('Y-m-d 11:00:00'),
            'duration_minutes' => 45,
            'dentist_id' => $this->dentist->id,
            'notes' => 'Douleur aiguë nocturne molaire.',
        ]);

        $response->assertSessionHas('success');

        // Vérification de la création du patient
        $this->assertDatabaseHas('patients', [
            'cabinet_id' => $this->cabinet->id,
            'first_name' => 'Anas',
            'last_name' => 'Benjelloun',
            'phone' => '06 99 88 77 66',
            'cin' => 'AB654321',
        ]);

        $createdPatient = Patient::where('first_name', 'Anas')->first();

        // Vérification de la création du rendez-vous
        $this->assertDatabaseHas('appointments', [
            'cabinet_id' => $this->cabinet->id,
            'patient_id' => $createdPatient->id,
            'motif' => 'Urgence',
            'duration_minutes' => 45,
            'status' => 'scheduled',
        ]);
    }

    /**
     * Test 17 : La création de patient à la volée lors d'un RDV respecte le quota Freemium de 50 patients.
     */
    public function test_appointment_quick_patient_creation_respects_freemium_50_limit(): void
    {
        $this->actingAs($this->dentist);

        // Remplir le cabinet jusqu'à 50 patients
        for ($i = 1; $i <= 50; $i++) {
            Patient::create([
                'cabinet_id' => $this->cabinet->id,
                'first_name' => "Pat{$i}",
                'last_name' => 'Limit',
            ]);
        }

        // Tentative de prise de RDV avec nouveau patient à la volée -> doit être bloqué par le freemium limit
        $response = $this->post(route('appointments.store'), [
            'create_new_patient' => true,
            'new_patient_first_name' => 'Patient51',
            'new_patient_last_name' => 'Exceed',
            'motif' => 'Consultation',
            'scheduled_at' => now()->format('Y-m-d 15:00:00'),
            'duration_minutes' => 30,
        ]);

        $response->assertSessionHas('upgrade_required');
        $response->assertSessionHasErrors(['freemium_limit']);
        $this->assertEquals(50, Patient::count());
    }
}

