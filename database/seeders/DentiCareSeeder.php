<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Cabinet;
use App\Models\ClinicalAct;
use App\Models\DentalAct;
use App\Models\PatientDocument;
use App\Models\Payment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DentiCareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Création du Cabinet de Démonstration DentiCare
        $cabinet = Cabinet::create([
            'name' => 'Cabinet Dentaire DentiCare',
            'address' => '15 Avenue des Champs-Élysées',
            'city' => 'Paris',
            'phone' => '01 42 68 55 00',
            'plan' => 'free', // Plan initial 'free' pour tester la limite des 50 patients et la modale d'upgrade
            'subscription_ends_at' => null,
        ]);

        // 2. Création du Dentiste (Dr. Sophie Martin)
        $dentist = User::create([
            'cabinet_id' => $cabinet->id,
            'name' => 'Dr. Sophie Martin',
            'email' => 'dentiste@denticare.fr',
            'password' => Hash::make('password'),
            'role' => 'dentist',
            'phone' => '06 12 34 56 78',
            'email_verified_at' => now(),
        ]);

        // 3. Création de l'Assistante (Claire Dubois)
        $assistant = User::create([
            'cabinet_id' => $cabinet->id,
            'name' => 'Claire Dubois',
            'email' => 'assistante@denticare.fr',
            'password' => Hash::make('password'),
            'role' => 'assistant',
            'phone' => '06 98 76 54 32',
            'email_verified_at' => now(),
        ]);

        // 4. Création d'un second cabinet isolé pour prouver l'isolation multi-tenant stricte
        $otherCabinet = Cabinet::create([
            'name' => 'Cabinet Sourire & Santé',
            'address' => '42 Rue de la République',
            'city' => 'Lyon',
            'phone' => '04 78 00 00 00',
            'plan' => 'pro',
            'subscription_ends_at' => now()->addYear(),
        ]);

        $otherDentist = User::create([
            'cabinet_id' => $otherCabinet->id,
            'name' => 'Dr. Paul Durand',
            'email' => 'paul.durand@sourire-sante.fr',
            'password' => Hash::make('password'),
            'role' => 'dentist',
            'phone' => '06 00 11 22 33',
            'email_verified_at' => now(),
        ]);

        $otherPatient = Patient::create([
            'cabinet_id' => $otherCabinet->id,
            'first_name' => 'Jean',
            'last_name' => 'Secret',
            'email' => 'jean.secret@example.fr',
            'phone' => '06 55 44 33 22',
            'birth_date' => '1985-04-12',
            'address' => '42 Rue de la République, Lyon',
            'notes' => 'Patient du cabinet de Lyon (inaccessible depuis DentiCare Paris).',
        ]);

        // 5. Création d'une cohorte de patients réalistes avec CIN et Mutuelles (CNSS, CNOPS, Privée)
        $patientsData = [
            [
                'first_name' => 'Thomas',
                'last_name' => 'Bernard',
                'email' => 'thomas.bernard@gmail.com',
                'phone' => '06 11 22 33 44',
                'cin' => 'BE102938',
                'birth_date' => '1988-06-15',
                'address' => '24 Rue de Rivoli, Paris',
                'insurance_type' => 'cnss',
                'insurance_number' => '102938475',
                'allergies' => 'Pénicilline (Choc anaphylactique)',
                'medical_history' => 'Hypertension artérielle sous traitement.',
                'notes' => 'Patient anxieux lors des anesthésies locales.',
            ],
            [
                'first_name' => 'Camille',
                'last_name' => 'Leroy',
                'email' => 'camille.leroy@outlook.fr',
                'phone' => '06 22 33 44 55',
                'cin' => 'BK894712',
                'birth_date' => '1995-11-20',
                'address' => '8 Boulevard Saint-Germain, Paris',
                'insurance_type' => 'cnops',
                'insurance_number' => '994821034',
                'allergies' => null,
                'medical_history' => 'Port d appareil orthodontique dans l adolescence.',
                'notes' => 'Suivi annuel régulier.',
            ],
            [
                'first_name' => 'Alexandre',
                'last_name' => 'Moreau',
                'email' => 'alex.moreau@free.fr',
                'phone' => '06 33 44 55 66',
                'cin' => 'A748291',
                'birth_date' => '1974-03-08',
                'address' => '12 Rue La Fayette, Paris',
                'insurance_type' => 'private',
                'insurance_number' => 'AXA-98124',
                'allergies' => 'Latex',
                'medical_history' => 'Diabète de type 2 équilibré.',
                'notes' => 'Sensibilité gingivale accentuée secteur 4.',
            ],
            [
                'first_name' => 'Julie',
                'last_name' => 'Petit',
                'email' => 'julie.petit@yahoo.fr',
                'phone' => '06 44 55 66 77',
                'cin' => 'C981245',
                'birth_date' => '2001-09-02',
                'address' => '45 Rue de Vaugirard, Paris',
                'insurance_type' => 'none',
                'insurance_number' => null,
                'allergies' => null,
                'medical_history' => null,
                'notes' => 'Souhaite un éclaircissement dentaire après détartrage.',
            ],
            [
                'first_name' => 'Lucas',
                'last_name' => 'Garcia',
                'email' => 'lucas.garcia@sfr.fr',
                'phone' => '06 55 66 77 88',
                'cin' => 'D481920',
                'birth_date' => '1982-12-30',
                'address' => '3 Rue Monge, Paris',
                'insurance_type' => 'cnss',
                'insurance_number' => '748201948',
                'allergies' => 'Aspirine',
                'medical_history' => 'Bruxisme nocturne sévère.',
                'notes' => 'Porte une gouttière de libération occlusale.',
            ],
            [
                'first_name' => 'Emma',
                'last_name' => 'Roux',
                'email' => 'emma.roux@gmail.com',
                'phone' => '06 66 77 88 99',
                'cin' => 'E194820',
                'birth_date' => '1990-07-14',
                'address' => '18 Avenue Montaigne, Paris',
                'insurance_type' => 'cnops',
                'insurance_number' => '581920394',
                'allergies' => null,
                'medical_history' => 'Grossesse en cours (2ème trimestre).',
                'notes' => 'Attention aux radiographies et aux prescriptions médicamenteuses.',
            ],
            [
                'first_name' => 'Maxime',
                'last_name' => 'Faure',
                'email' => 'maxime.faure@orange.fr',
                'phone' => '06 77 88 99 00',
                'cin' => 'F382910',
                'birth_date' => '1968-01-25',
                'address' => '97 Rue de Rennes, Paris',
                'insurance_type' => 'private',
                'insurance_number' => 'RMA-849102',
                'allergies' => 'Iode',
                'medical_history' => 'Sous anticoagulant (Cardégic).',
                'notes' => 'Surveiller l hémostase lors des actes chirurgicaux.',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Lambert',
                'email' => 'sarah.lambert@gmail.com',
                'phone' => '06 88 99 00 11',
                'cin' => 'G910293',
                'birth_date' => '1997-04-18',
                'address' => '5 Rue de Passy, Paris',
                'insurance_type' => 'cnss',
                'insurance_number' => '839201948',
                'allergies' => null,
                'medical_history' => 'Asthme d effort modéré.',
                'notes' => 'Garde son inhalateur en poche lors des soins.',
            ],
        ];

        $createdPatients = [];
        foreach ($patientsData as $data) {
            $createdPatients[] = Patient::create(array_merge($data, [
                'cabinet_id' => $cabinet->id,
            ]));
        }

        // 6. Rendez-vous (Agenda & File d'attente)
        $now = Carbon::now();

        // Salle d'attente (patients en attente avec arrived_at)
        Appointment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[0]->id, // Thomas Bernard
            'dentist_id' => $dentist->id,
            'motif' => 'Détartrage & Polissage complet',
            'scheduled_at' => $now->copy()->subMinutes(20),
            'arrived_at' => $now->copy()->subMinutes(18),
            'duration_minutes' => 30,
            'status' => 'waiting', // En salle d'attente
            'notes' => 'Patient arrivé à l accueil, installé en salle d attente.',
        ]);

        Appointment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[1]->id, // Camille Leroy
            'dentist_id' => $dentist->id,
            'motif' => 'Contrôle annuel et bilan carieux',
            'scheduled_at' => $now->copy()->addMinutes(10),
            'arrived_at' => $now->copy()->subMinutes(6),
            'duration_minutes' => 30,
            'status' => 'waiting', // En salle d'attente
            'notes' => 'Arrivée en avance.',
        ]);

        // Au fauteuil (en cours de traitement)
        Appointment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[2]->id, // Alexandre Moreau
            'dentist_id' => $dentist->id,
            'motif' => 'Traitement endodontique dent 16',
            'scheduled_at' => $now->copy()->subMinutes(30),
            'arrived_at' => $now->copy()->subMinutes(35),
            'duration_minutes' => 45,
            'status' => 'in_chair', // Au fauteuil
            'notes' => 'Anesthésie tronculaire effectuée, soin en cours.',
        ]);

        // Rendez-vous programmés plus tard aujourd'hui
        Appointment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[3]->id, // Julie Petit
            'dentist_id' => $dentist->id,
            'motif' => 'Consultation esthétique & blanchiment',
            'scheduled_at' => $now->copy()->addHours(2),
            'arrived_at' => null,
            'duration_minutes' => 30,
            'status' => 'scheduled',
            'notes' => 'Devis à préparer.',
        ]);

        Appointment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[4]->id, // Lucas Garcia
            'dentist_id' => $dentist->id,
            'motif' => 'Contrôle gouttière occlusale',
            'scheduled_at' => $now->copy()->addHours(3),
            'arrived_at' => null,
            'duration_minutes' => 30,
            'status' => 'scheduled',
            'notes' => 'Vérification points d impact.',
        ]);

        // Rendez-vous terminés ce matin
        Appointment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[5]->id, // Emma Roux
            'dentist_id' => $dentist->id,
            'motif' => 'Soins carie molaire 36',
            'scheduled_at' => $now->copy()->subHours(4),
            'arrived_at' => $now->copy()->subHours(4)->subMinutes(10),
            'duration_minutes' => 45,
            'status' => 'completed',
            'notes' => 'Soins terminés sans douleur.',
        ]);

        // 7. Actes cliniques réalisés et validés
        ClinicalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[5]->id, // Emma Roux
            'dentist_id' => $dentist->id,
            'code' => 'HBFD021',
            'description' => 'Restauration composite 2 faces sur molaire',
            'tooth_number' => '36',
            'amount' => 120.00,
            'status' => 'validated',
            'performed_at' => $now->copy()->subHours(4),
            'notes' => 'Cavité classe II traitée sous digue.',
        ]);

        ClinicalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[6]->id, // Maxime Faure
            'dentist_id' => $dentist->id,
            'code' => 'HBQK002',
            'description' => 'Pose de couronne céramo-métallique',
            'tooth_number' => '46',
            'amount' => 580.00,
            'status' => 'validated',
            'performed_at' => $now->copy()->subDays(1),
            'notes' => 'Scellement définitif verre ionomère.',
        ]);

        ClinicalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[7]->id, // Sarah Lambert
            'dentist_id' => $dentist->id,
            'code' => 'HBGD036',
            'description' => 'Détartrage complet sus et sous-gingival',
            'tooth_number' => 'Arcades complètes',
            'amount' => 43.38,
            'status' => 'validated',
            'performed_at' => $now->copy()->subDays(2),
            'notes' => 'Polissage à la pâte fluorée.',
        ]);

        ClinicalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[2]->id, // Alexandre Moreau
            'dentist_id' => $dentist->id,
            'code' => 'HBFD033',
            'description' => 'Traitement endodontique d une molaire (dévitalisation)',
            'tooth_number' => '16',
            'amount' => 280.00,
            'status' => 'in_progress',
            'performed_at' => $now->copy()->subMinutes(10),
            'notes' => 'Obturation provisoire en place.',
        ]);

        // 8. Encaissements (du jour + historiques)
        // Encaissement du jour (accessible au dentiste ET à l'assistante)
        Payment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[5]->id, // Emma Roux
            'recorded_by_id' => $assistant->id,
            'amount' => 120.00,
            'payment_method' => 'card',
            'paid_at' => $now->copy()->subHours(3),
            'reference' => 'CB-2026-001',
            'notes' => 'Règlement par carte bancaire au comptoir.',
        ]);

        Payment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[7]->id, // Sarah Lambert
            'recorded_by_id' => $assistant->id,
            'amount' => 43.38,
            'payment_method' => 'cash',
            'paid_at' => $now->copy()->subHours(1),
            'reference' => 'ESP-2026-002',
            'notes' => 'Paiement en espèces.',
        ]);

        // Encaissements antérieurs (qui composent le CA global mensuel)
        Payment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[6]->id, // Maxime Faure
            'recorded_by_id' => $dentist->id,
            'amount' => 580.00,
            'payment_method' => 'check',
            'paid_at' => $now->copy()->subDays(1),
            'reference' => 'CHQ-784152',
            'notes' => 'Chèque pour couronne céramique.',
        ]);

        Payment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[0]->id,
            'recorded_by_id' => $dentist->id,
            'amount' => 750.00,
            'payment_method' => 'transfer',
            'paid_at' => $now->copy()->subDays(5),
            'reference' => 'VIR-89104',
            'notes' => 'Virement bancaire acompte prothèse.',
        ]);

        Payment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[1]->id,
            'recorded_by_id' => $assistant->id,
            'amount' => 320.00,
            'payment_method' => 'card',
            'paid_at' => $now->copy()->subDays(12),
            'reference' => 'CB-2026-088',
            'notes' => 'Soins conservateurs et détartrage.',
        ]);

        Payment::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $createdPatients[3]->id,
            'recorded_by_id' => $assistant->id,
            'amount' => 450.00,
            'payment_method' => 'card',
            'paid_at' => $now->copy()->subDays(18),
            'reference' => 'CB-2026-065',
            'notes' => 'Inlay-core céramique.',
        ]);

        // 9. Actes Dentaires Cliniques (Odontogramme & Plan de traitement)
        $primaryPatient = $createdPatients[0]; // Thomas Bernard

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '16',
            'act_type' => 'caries',
            'description' => 'Carie occlusale et mésiale',
            'clinical_notes' => 'Sensibilité au froid. Prévoir restauration composite.',
            'price' => 450.00,
            'status' => 'planned',
            'performed_at' => null,
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '26',
            'act_type' => 'endo',
            'description' => 'Dévitalisation et traitement canalaire 3 canaux',
            'clinical_notes' => 'Pulpite aiguë traitée sous digue.',
            'price' => 900.00,
            'status' => 'completed',
            'performed_at' => $now->copy()->subDays(5)->toDateString(),
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '26',
            'act_type' => 'crown',
            'description' => 'Couronne tout-céramique Zircone',
            'clinical_notes' => 'Empreinte numérique réalisée avec succès.',
            'price' => 2600.00,
            'status' => 'planned',
            'performed_at' => null,
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '36',
            'act_type' => 'composite',
            'description' => 'Obturation esthétique composite face vestibulaire',
            'clinical_notes' => 'Teinte A2, polymérisation par couches.',
            'price' => 400.00,
            'status' => 'completed',
            'performed_at' => $now->copy()->subDays(12)->toDateString(),
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '46',
            'act_type' => 'implant',
            'description' => 'Pose d implant dentaire ostéo-intégré en titane',
            'clinical_notes' => 'Implant 4.1mm x 10mm, bonne stabilité primaire.',
            'price' => 7500.00,
            'status' => 'completed',
            'performed_at' => $now->copy()->subDays(30)->toDateString(),
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '18',
            'act_type' => 'absent',
            'description' => 'Dent de sagesse absente (agénésie)',
            'clinical_notes' => 'Absence constatée sur panoramique.',
            'price' => 0.00,
            'status' => 'completed',
            'performed_at' => $now->copy()->subDays(60)->toDateString(),
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => '38',
            'act_type' => 'extraction',
            'description' => 'Extraction chirurgicale de dent incluse',
            'clinical_notes' => 'Suites opératoires simples.',
            'price' => 500.00,
            'status' => 'completed',
            'performed_at' => $now->copy()->subDays(45)->toDateString(),
        ]);

        DentalAct::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'dentist_id' => $dentist->id,
            'tooth_number' => null,
            'act_type' => 'scaling',
            'description' => 'Détartrage et polissage complet des deux arcades',
            'clinical_notes' => 'Aéropolisseur avec bicarbonate doux.',
            'price' => 300.00,
            'status' => 'completed',
            'performed_at' => $now->copy()->subDays(15)->toDateString(),
        ]);

        // 10. Documents & Radios patients
        PatientDocument::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'title' => 'Radio Panoramique Numérique Initiale (OPT)',
            'file_path' => 'demo/panoramique.svg',
            'type' => 'xray',
        ]);

        PatientDocument::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'title' => 'Cliché Rétro-alvéolaire HD Dent 26',
            'file_path' => 'demo/retro-alveolaire-26.svg',
            'type' => 'xray',
        ]);

        PatientDocument::create([
            'cabinet_id' => $cabinet->id,
            'patient_id' => $primaryPatient->id,
            'title' => 'Photographie intrabuccale pré-opératoire',
            'file_path' => 'demo/photo-sourire.svg',
            'type' => 'photo',
        ]);
    }
}

