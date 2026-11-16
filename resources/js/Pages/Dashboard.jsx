import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpgradeModal from '@/Components/UpgradeModal';
import WhatsAppButton from '@/Components/WhatsAppButton';
import { Head, Link, router } from '@inertiajs/react';

// Composant Chronomètre en temps réel calculant les minutes d'attente depuis `arrived_at`
function WaitingStopwatch({ arrivedAt, status }) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!arrivedAt) {
            setElapsedSeconds(0);
            return;
        }

        const calculateElapsed = () => {
            const start = new Date(arrivedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((now - start) / 1000));
            setElapsedSeconds(diff);
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 1000);

        return () => clearInterval(interval);
    }, [arrivedAt]);

    if (!arrivedAt) {
        return (
            <span className="text-xs text-slate-400 italic">
                Non arrivé
            </span>
        );
    }

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Code couleur d'alerte selon l'attente
    let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let icon = '⏱️';

    if (status === 'in_chair') {
        colorClass = 'bg-[#2a9d8f]/10 text-[#0f4c5c] border-[#2a9d8f]/30';
        icon = '🦷';
    } else if (minutes >= 30) {
        colorClass = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        icon = '⚠️';
    } else if (minutes >= 15) {
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = '⏳';
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${colorClass}`}>
            <span>{icon}</span>
            <span>{formattedTime}</span>
            <span className="text-[10px] font-sans font-medium text-slate-500">
                ({minutes} min)
            </span>
        </span>
    );
}

export default function Dashboard({
    auth,
    kpis,
    todayQueue,
    waitingRoomPatients,
    inChairAppointment,
    todayPayments,
    financialStats,
    recentActs,
    patientsList,
    dentistsList,
    currentCabinet,
    stats,
}) {
    const user = auth.user;
    const [statusFilter, setStatusFilter] = useState('all');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Changement de statut 1-clic pour faire avancer le patient
    const updatePatientStatus = (appointmentId, newStatus) => {
        router.patch(route('appointments.status', appointmentId), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    // Filtrage des rendez-vous
    const filteredQueue = todayQueue.filter((apt) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'waiting') return apt.status === 'waiting';
        if (statusFilter === 'in_chair') return apt.status === 'in_chair';
        if (statusFilter === 'completed') return apt.status === 'completed';
        return true;
    });

    return (
        <AuthenticatedLayout
            patientsList={patientsList}
            dentistsList={dentistsList}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#2a9d8f] bg-[#2a9d8f]/10 px-2.5 py-0.5 rounded-full border border-[#2a9d8f]/20">
                                {user.is_dentist ? 'Espace Praticien Dentiste' : 'Espace Assistante & Accueil'}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium">Cabinet DentiCare</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#0f4c5c] mt-1">
                            Tableau de Bord & Salle d'Attente
                        </h1>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-medium shadow-xs">
                            Aujourd'hui : <strong>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Tableau de Bord & Salle d'Attente - DentiCare" />

            <UpgradeModal
                show={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />

            {/* 1. LES 3 CARTES KPIS DU JOUR EN HAUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* KPI 1 : Nombre de RDV prévus aujourd'hui */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-[#0f4c5c]/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Planning du Jour
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-[#0f4c5c]/10 text-[#0f4c5c] flex items-center justify-center font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#0f4c5c]">
                            {kpis.scheduled_today}
                        </span>
                        <span className="text-xs font-bold text-slate-400">rendez-vous prévus</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0f4c5c]"></span>
                        <span>Total des consultations programmées pour aujourd'hui</span>
                    </p>
                </div>

                {/* KPI 2 : Nombre de patients traités aujourd'hui */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-[#2a9d8f]/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Patients Traités
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] flex items-center justify-center font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#2a9d8f]">
                            {kpis.treated_today}
                        </span>
                        <span className="text-xs font-bold text-slate-400">soins terminés</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2a9d8f]"></span>
                        <span>Patients passés au fauteuil et validés</span>
                    </p>
                </div>

                {/* KPI 3 : Recettes encaissées du jour (en DH) */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-[#2a9d8f]/40 transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Recettes du Jour
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <span className="font-extrabold text-xs">DH</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                            {kpis.revenue_today_formatted}
                        </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Caisse journalière collectée en Dirhams ({kpis.currency})</span>
                    </p>
                </div>
            </div>

            {/* 2. FILE D'ATTENTE INTERACTIVE DU JOUR */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm mb-8">
                {/* En-tête de la File d'attente */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-[#2a9d8f] animate-ping" />
                            <h2 className="text-lg font-black text-[#0f4c5c]">
                                File d'Attente Interactive & Fauteuil de Soins
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0f4c5c]/10 text-[#0f4c5c]">
                                {todayQueue.length} patient(s)
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Suivi du flux patient en temps réel avec chronomètre d'attente et progression en 1 clic : <strong>En salle d'attente</strong> → <strong>Au fauteuil</strong> → <strong>Terminé</strong>.
                        </p>
                    </div>

                    {/* Filtres d'état */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                statusFilter === 'all' ? 'bg-white text-[#0f4c5c] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Tous ({todayQueue.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('waiting')}
                            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                                statusFilter === 'waiting' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Attente</span>
                            <span className="bg-white/20 px-1 rounded text-[10px]">{waitingRoomPatients.length}</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('in_chair')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                statusFilter === 'in_chair' ? 'bg-[#2a9d8f] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Au Fauteuil ({inChairAppointment ? 1 : 0})
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Terminés ({kpis.treated_today})
                        </button>
                    </div>
                </div>

                {/* Tableau interactif de la File d'attente */}
                <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-slate-400 font-extrabold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3.5">Heure</th>
                                <th className="px-5 py-3.5">Patient</th>
                                <th className="px-5 py-3.5">Motif du Soin</th>
                                <th className="px-5 py-3.5">Statut Actuel</th>
                                <th className="px-5 py-3.5">Chronomètre d'Attente</th>
                                <th className="px-5 py-3.5 text-right">Progression 1-Clic</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredQueue.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs">
                                        Aucun patient dans cette vue pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                filteredQueue.map((apt) => {
                                    const isWaiting = apt.status === 'waiting';
                                    const isInChair = apt.status === 'in_chair';
                                    const isCompleted = apt.status === 'completed';
                                    const isScheduled = apt.status === 'scheduled';

                                    return (
                                        <tr
                                            key={apt.id}
                                            className={`transition ${
                                                isInChair
                                                    ? 'bg-[#2a9d8f]/5 font-semibold'
                                                    : isWaiting
                                                    ? 'hover:bg-amber-50/50'
                                                    : 'hover:bg-slate-50/80'
                                            }`}
                                        >
                                            {/* Heure prévue */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded-lg inline-block">
                                                    {new Date(apt.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {apt.duration_minutes} min
                                                </div>
                                            </td>

                                            {/* Nom du patient & contact */}
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={route('patients.show', apt.patient.id)}
                                                    className="font-bold text-slate-900 hover:text-[#0f4c5c] text-sm block"
                                                >
                                                    {apt.patient.first_name} {apt.patient.last_name}
                                                </Link>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span>{apt.patient.phone || 'Sans tél'}</span>
                                                    {apt.patient.allergies && (
                                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                                            ⚠️ Allergie
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Motif de la consultation */}
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800 text-xs">
                                                    {apt.motif || apt.reason}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    Dr. {apt.dentist?.name || 'Dr. Sophie Martin'}
                                                </div>
                                            </td>

                                            {/* Badge de statut coloré */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {isWaiting && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                                        <span>En salle d'attente</span>
                                                    </span>
                                                )}
                                                {isInChair && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#2a9d8f] text-white shadow-xs">
                                                        <span>🦷 Au fauteuil</span>
                                                    </span>
                                                )}
                                                {isCompleted && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                        <span>✓ Terminé</span>
                                                    </span>
                                                )}
                                                {isScheduled && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <span>Programmé</span>
                                                    </span>
                                                )}
                                                {apt.status === 'no_show' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span>Absent (No-show)</span>
                                                    </span>
                                                )}
                                                {apt.status === 'cancelled' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                                        <span>Annulé</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Chronomètre en temps réel calculant depuis arrived_at */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <WaitingStopwatch
                                                    arrivedAt={apt.arrived_at}
                                                    status={apt.status}
                                                />
                                            </td>

                                            {/* Bouton d'action rapide en 1 clic pour faire avancer le patient */}
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Rappel WhatsApp Marocain (wa.me/2126...) */}
                                                    <WhatsAppButton
                                                        phone={apt.patient?.phone}
                                                        patientFirstName={apt.patient?.first_name}
                                                        dentistName={apt.dentist?.name}
                                                        scheduledAt={apt.scheduled_at}
                                                        size="icon-only"
                                                    />

                                                    {/* Étape 1 : Si programmé -> Passer en salle d'attente */}
                                                    {isScheduled && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePatientStatus(apt.id, 'waiting')}
                                                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                                                            title="Enregistrer l'arrivée et démarrer le chronomètre"
                                                        >
                                                            <span>Marquer Arrivé</span>
                                                            <span>→</span>
                                                        </button>
                                                    )}

                                                    {/* Étape 2 : Si en salle d'attente -> Faire entrer au fauteuil */}
                                                    {isWaiting && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePatientStatus(apt.id, 'in_chair')}
                                                            className="px-3.5 py-1.5 rounded-xl bg-[#2a9d8f] hover:bg-[#21867a] text-white font-black text-xs shadow-md shadow-[#2a9d8f]/25 transition flex items-center gap-1.5"
                                                            title="Installer le patient au fauteuil de soins"
                                                        >
                                                            <span>Au Fauteuil</span>
                                                            <span>→</span>
                                                        </button>
                                                    )}

                                                    {/* Étape 3 : Si au fauteuil -> Marquer comme terminé */}
                                                    {isInChair && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePatientStatus(apt.id, 'completed')}
                                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5"
                                                            title="Fin de consultation"
                                                        >
                                                            <span>Marquer Terminé ✓</span>
                                                        </button>
                                                    )}

                                                    {/* Actions alternatives */}
                                                    {isCompleted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePatientStatus(apt.id, 'in_chair')}
                                                            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
                                                            title="Repasser au fauteuil"
                                                        >
                                                            ↩ Rouvrir
                                                        </button>
                                                    )}

                                                    {isScheduled && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePatientStatus(apt.id, 'no_show')}
                                                            className="text-xs font-semibold text-slate-400 hover:text-rose-600 px-2 py-1"
                                                            title="Marquer comme absent"
                                                        >
                                                            Absent
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Split Row : Fauteuil en cours & Règlements du jour */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Carte Fauteuil de Soins Actif */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] flex items-center justify-center font-bold">
                                🦷
                            </div>
                            <h2 className="text-base font-black text-[#0f4c5c]">
                                Fauteuil de Soins Actif
                            </h2>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            inChairAppointment ? 'bg-[#2a9d8f] text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {inChairAppointment ? 'En Consultation' : 'Fauteuil Libre'}
                        </span>
                    </div>

                    <div className="mt-4">
                        {inChairAppointment ? (
                            <div className="p-4 rounded-2xl bg-[#2a9d8f]/5 border border-[#2a9d8f]/20">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs uppercase font-extrabold tracking-wider text-[#2a9d8f]">
                                            Patient en cours de traitement
                                        </p>
                                        <h3 className="text-lg font-black text-slate-900 mt-0.5">
                                            {inChairAppointment.patient.first_name} {inChairAppointment.patient.last_name}
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-1 font-medium">
                                            Motif : {inChairAppointment.motif || inChairAppointment.reason}
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <WaitingStopwatch
                                                arrivedAt={inChairAppointment.arrived_at}
                                                status="in_chair"
                                            />
                                            <span className="text-xs text-slate-400">
                                                Praticien : Dr. {inChairAppointment.dentist?.name || 'Dr. Sophie Martin'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => updatePatientStatus(inChairAppointment.id, 'completed')}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition"
                                    >
                                        Terminer le Soin ✓
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-xs">
                                Aucun patient n'est actuellement installé au fauteuil.
                                {waitingRoomPatients.length > 0 && (
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={() => updatePatientStatus(waitingRoomPatients[0].id, 'in_chair')}
                                            className="px-4 py-2 rounded-xl bg-[#2a9d8f] text-white font-bold text-xs shadow-sm hover:bg-[#21867a] transition"
                                        >
                                            Faire entrer {waitingRoomPatients[0].patient.first_name} {waitingRoomPatients[0].patient.last_name} au fauteuil →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Carte Encaissements du Jour (DH) */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                💳
                            </div>
                            <h2 className="text-base font-black text-[#0f4c5c]">
                                Encaissements du Jour ({kpis.currency})
                            </h2>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Total : {kpis.revenue_today_formatted}
                        </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {todayPayments.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs">
                                Aucun encaissement enregistré aujourd'hui.
                            </div>
                        ) : (
                            todayPayments.slice(0, 4).map((pmt) => (
                                <div key={pmt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-bold text-slate-900">
                                            {pmt.patient.first_name} {pmt.patient.last_name}
                                        </span>
                                        <span className="text-slate-400 ml-2 font-mono uppercase text-[10px]">
                                            ({pmt.payment_method})
                                        </span>
                                    </div>
                                    <span className="font-black text-emerald-700">
                                        +{Number(pmt.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {kpis.currency}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <Link
                            href={route('payments.index')}
                            className="text-xs font-bold text-[#0f4c5c] hover:text-[#2a9d8f] transition"
                        >
                            Accéder à la Facturation Complète →
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
