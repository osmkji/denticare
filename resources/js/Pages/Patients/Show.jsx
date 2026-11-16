import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Odontogram from '@/Components/Odontogram';
import ToothActionModal from '@/Components/ToothActionModal';
import TreatmentPlanTable from '@/Components/TreatmentPlanTable';
import PatientDocumentsTab from '@/Components/PatientDocumentsTab';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function PatientsShow({ auth, patient }) {
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('clinical'); // 'clinical', 'documents', 'admin'
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [showToothModal, setShowToothModal] = useState(false);

    const hasAllergies = !emptyString(patient.allergies);
    const hasHistory = !emptyString(patient.medical_history);
    const hasMedicalAlerts = hasAllergies || hasHistory;

    const { data, setData, put, processing, errors } = useForm({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
        phone: patient.phone || '',
        cin: patient.cin || '',
        address: patient.address || '',
        insurance_type: patient.insurance_type || 'none',
        insurance_number: patient.insurance_number || '',
        allergies: patient.allergies || '',
        medical_history: patient.medical_history || '',
        email: patient.email || '',
        notes: patient.notes || '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('patients.update', patient.id), {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const handleDelete = () => {
        if (!user.is_dentist) {
            alert("Interdiction : Seul le chirurgien-dentiste peut supprimer définitivement un dossier patient.");
            return;
        }

        if (confirm(`Confirmez-vous la suppression définitive du dossier de ${patient.full_name} ? Cette action est irréversible.`)) {
            router.delete(route('patients.destroy', patient.id));
        }
    };

    const handleSelectTooth = (tooth) => {
        setSelectedTooth(tooth);
        setShowToothModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Dossier ${patient.full_name} - DentiCare`} />

            {/* BANDEAU ROUGE FIXE ET TRÈS VISIBLE EN HAUT DE L'ÉCRAN SI ALLERGIES OU ANTÉCÉDENTS */}
            {hasMedicalAlerts && (
                <div className="mb-6 -mt-2 p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-xl shadow-rose-900/20 border-2 border-rose-500 animate-fade-in relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-start sm:items-center gap-3.5 relative z-10">
                        <div className="w-11 h-11 rounded-xl bg-white text-rose-700 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                            🚨
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black uppercase tracking-wider text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                                    Vigilance Fauteuil • Risque Médical
                                </span>
                                <span className="text-xs font-bold text-rose-100 uppercase tracking-widest">
                                    ALERTES MÉDICALES DU PATIENT :
                                </span>
                            </div>

                            <div className="mt-1 text-sm font-extrabold text-white flex flex-wrap gap-x-4 gap-y-1">
                                {hasAllergies && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="underline decoration-white/60">Allergies :</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-lg">{patient.allergies}</span>
                                    </span>
                                )}
                                {hasHistory && (
                                    <span className="flex items-center gap-1.5 text-rose-100">
                                        <span className="underline decoration-white/40">Antécédents :</span>
                                        <span>{patient.medical_history}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header du Dossier Patient & Onglets */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm mb-6 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('patients.index')}
                            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition font-bold"
                            title="Retour au répertoire"
                        >
                            ←
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase text-[#2a9d8f] bg-[#2a9d8f]/10 px-2.5 py-0.5 rounded-full">
                                    Dossier #{patient.id}
                                </span>
                                {patient.cin && (
                                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                                        CIN : {patient.cin}
                                    </span>
                                )}
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500 font-medium">Cabinet DentiCare</span>
                            </div>
                            <h1 className="text-2xl font-black text-[#0f4c5c] mt-0.5">
                                {patient.full_name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(true)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition"
                        >
                            Modifier Fiche
                        </button>

                        {/* RBAC Supprimer Dossier */}
                        {user.is_dentist ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                                title="Supprimer définitivement le dossier"
                            >
                                Supprimer Dossier
                            </button>
                        ) : (
                            <span
                                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                                title="Action réservée au chirurgien-dentiste"
                            >
                                🔒 Suppression réservée au Dentiste
                            </span>
                        )}
                    </div>
                </div>

                {/* BARRE D'ONGLETS : Dossier Clinique & Odontogramme | Radios & Documents | Fiche Admin & Facturation */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('clinical')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                            activeTab === 'clinical'
                                ? 'bg-[#0f4c5c] text-white shadow-md shadow-[#0f4c5c]/20'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span>🦷</span>
                        <span>Dossier Clinique & Odontogramme</span>
                        {patient.dental_acts?.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                activeTab === 'clinical' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {patient.dental_acts.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('documents')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                            activeTab === 'documents'
                                ? 'bg-[#0f4c5c] text-white shadow-md shadow-[#0f4c5c]/20'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span>🩻</span>
                        <span>Radios & Documents</span>
                        {patient.documents?.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {patient.documents.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('admin')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                            activeTab === 'admin'
                                ? 'bg-[#0f4c5c] text-white shadow-md shadow-[#0f4c5c]/20'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span>📋</span>
                        <span>Informations & Facturation</span>
                        {patient.unpaid_balance > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
                                Impayé {patient.unpaid_balance} DH
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}

            {/* ONGLET 1 : DOSSIER CLINIQUE & ODONTOGRAMME */}
            {activeTab === 'clinical' && (
                <div className="space-y-6">
                    {/* Odontogramme SVG interactif */}
                    <Odontogram
                        teethStatus={patient.teeth_status_map || {}}
                        selectedTooth={selectedTooth}
                        onSelectTooth={handleSelectTooth}
                    />

                    {/* Tableau chronologique "Historique des Séances & Plan de Traitement" */}
                    <TreatmentPlanTable
                        acts={patient.dental_acts || []}
                        patient={patient}
                        user={user}
                    />
                </div>
            )}

            {/* ONGLET 2 : RADIOS & DOCUMENTS */}
            {activeTab === 'documents' && (
                <PatientDocumentsTab
                    patient={patient}
                    documents={patient.documents || []}
                    user={user}
                />
            )}

            {/* ONGLET 3 : FICHE ADMINISTRATIVE & FACTURATION */}
            {activeTab === 'admin' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* COLONNE 1 : FICHE ADMINISTRATIVE */}
                    <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-base font-black text-[#0f4c5c] pb-3 border-b border-slate-100">
                                Fiche Administrative
                            </h2>

                            <dl className="mt-4 space-y-3 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-slate-50">
                                    <dt className="text-slate-400 font-medium">CIN</dt>
                                    <dd className="font-mono font-bold text-slate-900">{patient.cin || 'Non renseigné'}</dd>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-slate-50">
                                    <dt className="text-slate-400 font-medium">Date de naissance</dt>
                                    <dd className="font-bold text-slate-900">
                                        {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('fr-FR') : '—'}
                                        {patient.age ? ` (${patient.age} ans)` : ''}
                                    </dd>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-slate-50">
                                    <dt className="text-slate-400 font-medium">Téléphone</dt>
                                    <dd className="font-bold text-slate-900">{patient.phone || '—'}</dd>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-slate-50">
                                    <dt className="text-slate-400 font-medium">Email</dt>
                                    <dd className="font-bold text-slate-900">{patient.email || '—'}</dd>
                                </div>

                                <div className="flex justify-between py-1.5 border-b border-slate-50">
                                    <dt className="text-slate-400 font-medium">Couverture Médicale</dt>
                                    <dd className="font-black text-slate-900 uppercase">
                                        {patient.insurance_type === 'none' ? 'Sans couverture' : patient.insurance_type}
                                    </dd>
                                </div>

                                {patient.insurance_number && (
                                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                                        <dt className="text-slate-400 font-medium">N° d'immatriculation</dt>
                                        <dd className="font-mono font-bold text-slate-900">{patient.insurance_number}</dd>
                                    </div>
                                )}

                                <div className="py-1.5">
                                    <dt className="text-slate-400 font-medium mb-1">Adresse</dt>
                                    <dd className="font-semibold text-slate-800">{patient.address || 'Non renseignée'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Encadré Médical */}
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                                Historique Médical
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                    <span className="font-bold text-slate-700 block mb-0.5">Allergies déclarées :</span>
                                    <span className={patient.allergies ? 'text-rose-700 font-extrabold' : 'text-slate-400'}>
                                        {patient.allergies || 'Aucune allergie connue'}
                                    </span>
                                </div>

                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                    <span className="font-bold text-slate-700 block mb-0.5">Antécédents médicaux :</span>
                                    <span className="text-slate-600">
                                        {patient.medical_history || 'Aucun antécédent particulier'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE 2 & 3 : BILAN FINANCIER & RENDEZ-VOUS */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* CARTE BILAN FINANCIER DU PATIENT (DH) */}
                        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <h2 className="text-base font-black text-[#0f4c5c]">
                                    Bilan Financier & Reliquats (DH)
                                </h2>
                                <span className="text-xs text-slate-400">Devise : Dirham (DH)</span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Facturé</p>
                                    <p className="text-xl font-black text-slate-900 mt-1">
                                        {Number(patient.total_billed).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Réglé</p>
                                    <p className="text-xl font-black text-emerald-700 mt-1">
                                        {Number(patient.total_paid).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </p>
                                </div>

                                <div className={`p-4 rounded-2xl border ${
                                    patient.unpaid_balance > 0
                                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                                        : 'bg-slate-50 border-slate-100 text-slate-800'
                                }`}>
                                    <p className="text-[11px] font-black uppercase tracking-wider">Reliquat Impayé Restant</p>
                                    <p className={`text-xl font-black mt-1 ${
                                        patient.unpaid_balance > 0 ? 'text-rose-700' : 'text-emerald-600'
                                    }`}>
                                        {Number(patient.unpaid_balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RENDEZ-VOUS DU PATIENT */}
                        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <h2 className="text-base font-black text-[#0f4c5c]">
                                    Historique des Rendez-vous
                                </h2>
                                <Link href={route('appointments.index')} className="text-xs font-bold text-[#2a9d8f] hover:underline">
                                    + Nouveau RDV
                                </Link>
                            </div>

                            <div className="mt-4 space-y-2.5">
                                {patient.appointments?.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-4 text-center">Aucun rendez-vous enregistré.</p>
                                ) : (
                                    patient.appointments?.map((apt) => (
                                        <div key={apt.id} className="p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
                                                    {new Date(apt.scheduled_at).toLocaleDateString('fr-FR')} {new Date(apt.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="font-bold text-slate-900">{apt.motif || apt.reason}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                apt.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                                                apt.status === 'in_chair' ? 'bg-[#2a9d8f] text-white' :
                                                apt.status === 'waiting' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {apt.status === 'completed' ? 'Terminé' :
                                                 apt.status === 'in_chair' ? 'Au Fauteuil' :
                                                 apt.status === 'waiting' ? 'En Attente' : 'Programmé'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE DU MENU DENTAIRE POPOVER / ACTE SUR UNE DENT */}
            <ToothActionModal
                show={showToothModal}
                onClose={() => {
                    setShowToothModal(false);
                    setSelectedTooth(null);
                }}
                patient={patient}
                toothNumber={selectedTooth}
                currentStatus={selectedTooth ? patient.teeth_status_map?.[selectedTooth] : null}
                toothActs={
                    selectedTooth
                        ? (patient.dental_acts || []).filter((act) => act.tooth_number === selectedTooth)
                        : []
                }
                user={user}
            />

            {/* MODALE DE MODIFICATION DU DOSSIER ADMINISTRATIF */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="2xl">
                <form onSubmit={handleUpdate} className="p-6 sm:p-8 bg-white rounded-3xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <h2 className="text-lg font-black text-[#0f4c5c]">
                            Modifier la Fiche Administrative de {patient.full_name}
                        </h2>
                        <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                            <input
                                type="text"
                                required
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                            <input
                                type="text"
                                required
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">CIN</label>
                            <input
                                type="text"
                                value={data.cin}
                                onChange={(e) => setData('cin', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Date de naissance</label>
                            <input
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Couverture Médicale</label>
                            <select
                                value={data.insurance_type}
                                onChange={(e) => setData('insurance_type', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            >
                                <option value="none">Sans couverture</option>
                                <option value="cnss">CNSS</option>
                                <option value="cnops">CNOPS</option>
                                <option value="private">Assurance Privée</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">N° d'immatriculation Mutuelle</label>
                            <input
                                type="text"
                                value={data.insurance_number}
                                onChange={(e) => setData('insurance_number', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Allergies connues</label>
                            <input
                                type="text"
                                value={data.allergies}
                                onChange={(e) => setData('allergies', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="Pénicilline, Latex, Anesthésiques locaux..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Antécédents médicaux</label>
                            <textarea
                                rows="2"
                                value={data.medical_history}
                                onChange={(e) => setData('medical_history', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="Diabète, cardiopathie, prise d'anticoagulants..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Adresse postale</label>
                            <input
                                type="text"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0a3540] text-white font-bold text-xs shadow-md transition"
                        >
                            {processing ? 'Sauvegarde...' : 'Sauvegarder Fiche'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

function emptyString(str) {
    return !str || str.trim() === '';
}
