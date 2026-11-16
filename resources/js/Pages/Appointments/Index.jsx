import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AppointmentModal from '@/Components/AppointmentModal';
import WhatsAppButton from '@/Components/WhatsAppButton';
import { Head, router } from '@inertiajs/react';

export default function AppointmentsIndex({
    auth,
    appointments = [],
    waitingRoom = [],
    currentDate,
    viewMode: initialViewMode = 'week',
    weekStart,
    weekEnd,
    patients = [],
    dentists = [],
}) {
    const user = auth.user;
    const [viewMode, setViewMode] = useState(initialViewMode); // 'week', 'day', 'list'
    const [selectedDate, setSelectedDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalPrefilledDate, setModalPrefilledDate] = useState('');
    const [modalPrefilledTime, setModalPrefilledTime] = useState('09:00');
    const [listStatusFilter, setListStatusFilter] = useState('all');
    const [listSearch, setListSearch] = useState('');

    // Créneaux horaires de 08h30 à 19h00 (par tranches de 30 min)
    const timeSlots = useMemo(() => {
        const slots = [];
        let currentHour = 8;
        let currentMin = 30;

        while (currentHour < 19 || (currentHour === 19 && currentMin === 0)) {
            const hStr = String(currentHour).padStart(2, '0');
            const mStr = String(currentMin).padStart(2, '0');
            slots.push(`${hStr}:${mStr}`);

            currentMin += 30;
            if (currentMin >= 60) {
                currentHour += 1;
                currentMin = 0;
            }
        }
        return slots;
    }, []);

    // Jours de la semaine courante (Lundi au Samedi)
    const weekDays = useMemo(() => {
        const base = new Date(selectedDate);
        // Trouve le lundi de la semaine courante
        const day = base.getDay();
        const diff = base.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(base.setDate(diff));

        const days = [];
        const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        for (let i = 0; i < 6; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            days.push({
                dateStr,
                dayName: dayLabels[i],
                dayNumber: d.getDate(),
                monthName: d.toLocaleDateString('fr-FR', { month: 'short' }),
                isToday,
            });
        }
        return days;
    }, [selectedDate]);

    // Navigation de date
    const navigateDate = (deltaDays) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + deltaDays);
        const newDateStr = current.toISOString().split('T')[0];
        setSelectedDate(newDateStr);
        router.get(
            route('appointments.index'),
            { date: newDateStr, view_mode: viewMode },
            { preserveState: true }
        );
    };

    const goToToday = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        setSelectedDate(todayStr);
        router.get(
            route('appointments.index'),
            { date: todayStr, view_mode: viewMode },
            { preserveState: true }
        );
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        router.get(
            route('appointments.index'),
            { date: selectedDate, view_mode: mode },
            { preserveState: true }
        );
    };

    const handleDateInputChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        router.get(
            route('appointments.index'),
            { date: newDate, view_mode: viewMode },
            { preserveState: true }
        );
    };

    const openCreateAtSlot = (dateStr, timeStr) => {
        setModalPrefilledDate(dateStr);
        setModalPrefilledTime(timeStr);
        setShowCreateModal(true);
    };

    const updateStatus = (id, status) => {
        router.patch(route('appointments.status', id), { status }, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (confirm('Confirmez-vous la suppression de ce rendez-vous ?')) {
            router.delete(route('appointments.destroy', id), { preserveScroll: true });
        }
    };

    // Configuration des styles et badges de statut
    const statusConfig = {
        scheduled: {
            label: 'Programmé',
            badge: 'bg-blue-100 text-blue-900 border-blue-200',
            cardBg: 'bg-blue-50/90 border-l-4 border-blue-500 text-blue-950 hover:bg-blue-100/90',
            dot: 'bg-blue-500',
        },
        waiting: {
            label: 'En Salle d\'attente',
            badge: 'bg-amber-100 text-amber-900 border-amber-200',
            cardBg: 'bg-amber-50/90 border-l-4 border-amber-500 text-amber-950 hover:bg-amber-100/90',
            dot: 'bg-amber-500',
        },
        in_chair: {
            label: 'Au Fauteuil',
            badge: 'bg-[#2a9d8f]/20 text-[#0f4c5c] border-[#2a9d8f]/30',
            cardBg: 'bg-teal-50/95 border-l-4 border-[#2a9d8f] text-[#0f4c5c] hover:bg-teal-100/90',
            dot: 'bg-[#2a9d8f]',
        },
        completed: {
            label: 'Terminé',
            badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
            cardBg: 'bg-emerald-50/90 border-l-4 border-emerald-500 text-emerald-950 hover:bg-emerald-100/90',
            dot: 'bg-emerald-500',
        },
        cancelled: {
            label: 'Annulé',
            badge: 'bg-rose-100 text-rose-800 border-rose-200',
            cardBg: 'bg-rose-50/80 border-l-4 border-rose-400 text-rose-900 line-through opacity-60',
            dot: 'bg-rose-500',
        },
        no_show: {
            label: 'Absent (No-show)',
            badge: 'bg-slate-200 text-slate-800 border-slate-300',
            cardBg: 'bg-slate-100 border-l-4 border-slate-400 text-slate-700 opacity-70',
            dot: 'bg-slate-400',
        },
    };

    // Filtrage pour la vue liste
    const filteredListAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            const matchesStatus = listStatusFilter === 'all' || apt.status === listStatusFilter;
            const patientName = `${apt.patient?.first_name || ''} ${apt.patient?.last_name || ''}`.toLowerCase();
            const motif = (apt.motif || '').toLowerCase();
            const q = listSearch.toLowerCase();
            const matchesSearch = !q || patientName.includes(q) || motif.includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [appointments, listStatusFilter, listSearch]);

    return (
        <AuthenticatedLayout>
            <Head title="Agenda & Prise de Rendez-vous - DentiCare" />

            {/* BARRE SUPÉRIEURE DE L'AGENDA */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Titre & Navigation Date */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#2a9d8f] bg-[#2a9d8f]/10 px-2.5 py-0.5 rounded-full border border-[#2a9d8f]/20">
                                Planning Médical & WhatsApp
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">Cabinet DentiCare</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#0f4c5c] mt-1">
                            Agenda & Prise de Rendez-vous
                        </h1>
                    </div>

                    {/* Navigation Semaine / Jour */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => navigateDate(viewMode === 'day' ? -1 : -7)}
                            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition shadow-xs"
                            title="Période précédente"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={goToToday}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-[#0f4c5c] font-black text-xs transition shadow-xs"
                        >
                            Aujourd'hui
                        </button>
                        <button
                            type="button"
                            onClick={() => navigateDate(viewMode === 'day' ? 1 : 7)}
                            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition shadow-xs"
                            title="Période suivante"
                        >
                            →
                        </button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateInputChange}
                            className="text-xs font-bold rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f] py-1 px-2.5 bg-white ml-1"
                        />
                    </div>
                </div>

                {/* Sélecteur de vue (Semaine par défaut, Jour, Liste) & Bouton Nouveau RDV */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('week')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                viewMode === 'week'
                                    ? 'bg-white text-[#0f4c5c] shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span>📅</span>
                            <span>Semaine</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('day')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                viewMode === 'day'
                                    ? 'bg-white text-[#0f4c5c] shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span>☀️</span>
                            <span>Jour</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('list')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                                viewMode === 'list'
                                    ? 'bg-white text-[#0f4c5c] shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span>📋</span>
                            <span>Liste</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setModalPrefilledDate(selectedDate);
                            setModalPrefilledTime('09:00');
                            setShowCreateModal(true);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-[#0f4c5c] hover:bg-[#0f4c5c]/90 text-white font-bold text-xs shadow-md shadow-[#0f4c5c]/20 transition flex items-center gap-2"
                    >
                        <span>+ Nouveau RDV</span>
                    </button>
                </div>
            </div>

            {/* BANDEAU SALLE D'ATTENTE INTERACTIVE */}
            {waitingRoom.length > 0 && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0f4c5c] to-[#176274] text-white shadow-lg mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2a9d8f] animate-ping" />
                            <h2 className="text-sm font-black uppercase tracking-wider text-white">
                                Salle d'Attente Interactive ({waitingRoom.length} au cabinet)
                            </h2>
                        </div>
                        <span className="text-xs text-[#2a9d8f] font-bold">
                            Chronomètre d'attente actif
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {waitingRoom.map((apt) => (
                            <div
                                key={apt.id}
                                className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-xs text-white">
                                            {apt.patient?.first_name} {apt.patient?.last_name}
                                        </span>
                                        <span
                                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                apt.status === 'in_chair'
                                                    ? 'bg-[#2a9d8f] text-white'
                                                    : 'bg-amber-400 text-amber-950'
                                            }`}
                                        >
                                            {apt.status === 'in_chair' ? 'Au Fauteuil' : 'En Attente'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/80 mt-1 truncate">{apt.motif}</p>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                                    <WhatsAppButton
                                        phone={apt.patient?.phone}
                                        patientFirstName={apt.patient?.first_name}
                                        dentistName={apt.dentist?.name}
                                        scheduledAt={apt.scheduled_at}
                                        size="icon-only"
                                    />

                                    {apt.status === 'waiting' ? (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(apt.id, 'in_chair')}
                                            className="flex-1 py-1 px-2 rounded-xl bg-[#2a9d8f] hover:bg-[#21867a] text-white text-[11px] font-black transition text-center"
                                        >
                                            Fauteuil →
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(apt.id, 'completed')}
                                            className="flex-1 py-1 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition text-center"
                                        >
                                            Terminer ✓
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VUE 1 : CALENDRIER SEMAINE (PAR DÉFAUT) */}
            {viewMode === 'week' && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    {/* Légende de la semaine */}
                    <div className="p-4 px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="font-extrabold text-[#0f4c5c]">
                            Semaine du {weekDays[0]?.dayNumber} {weekDays[0]?.monthName} au {weekDays[5]?.dayNumber} {weekDays[5]?.monthName}
                        </div>

                        {/* Légende des statuts */}
                        <div className="flex items-center gap-3 flex-wrap text-[11px] font-bold">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Programmé
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> En attente
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#2a9d8f]" /> Au fauteuil
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Terminé
                            </span>
                        </div>
                    </div>

                    {/* Grille Calendrier : 6 Colonnes de Jours (Lun - Sam) */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[950px]">
                            {/* En-tête des colonnes jours */}
                            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center">
                                <div className="p-3 text-[11px] font-black uppercase text-slate-400 border-r border-slate-200">
                                    Heure
                                </div>
                                {weekDays.map((day) => (
                                    <div
                                        key={day.dateStr}
                                        className={`p-3 border-r border-slate-200 last:border-r-0 ${
                                            day.isToday ? 'bg-[#0f4c5c]/10 text-[#0f4c5c]' : 'text-slate-700'
                                        }`}
                                    >
                                        <span className="block text-[11px] font-black uppercase tracking-wider">
                                            {day.dayName}
                                        </span>
                                        <span className={`inline-block font-mono font-black text-sm px-2 py-0.5 rounded-full mt-0.5 ${
                                            day.isToday ? 'bg-[#0f4c5c] text-white' : 'text-slate-800'
                                        }`}>
                                            {day.dayNumber} {day.monthName}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Corps de la grille avec créneaux de 08h30 à 19h00 */}
                            <div className="divide-y divide-slate-100">
                                {timeSlots.map((time) => (
                                    <div key={time} className="grid grid-cols-7 min-h-[58px]">
                                        {/* Colonne horaire */}
                                        <div className="p-2 border-r border-slate-200 text-center text-[11px] font-mono font-bold text-slate-400 bg-slate-50/30 flex items-start justify-center pt-2.5">
                                            {time}
                                        </div>

                                        {/* 6 Colonnes pour chaque jour */}
                                        {weekDays.map((day) => {
                                            // Recherche les rendez-vous débutant sur ce créneau (dans la tranche de 30 min)
                                            const slotAppointments = appointments.filter((apt) => {
                                                const aptDate = apt.scheduled_at.split('T')[0];
                                                const aptTime = apt.scheduled_at.split('T')[1].slice(0, 5);
                                                return aptDate === day.dateStr && aptTime === time;
                                            });

                                            return (
                                                <div
                                                    key={day.dateStr + time}
                                                    onClick={() => openCreateAtSlot(day.dateStr, time)}
                                                    className="p-1 border-r border-slate-100 last:border-r-0 hover:bg-slate-50/90 transition relative cursor-pointer group"
                                                >
                                                    {/* Bouton d'ajout fantôme au survol du créneau */}
                                                    {slotAppointments.length === 0 && (
                                                        <span className="opacity-0 group-hover:opacity-100 transition absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-400">
                                                            + RDV
                                                        </span>
                                                    )}

                                                    {/* Rendez-vous programmés sur ce créneau */}
                                                    {slotAppointments.map((apt) => {
                                                        const conf = statusConfig[apt.status] || statusConfig.scheduled;
                                                        return (
                                                            <div
                                                                key={apt.id}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className={`p-2 rounded-xl text-xs mb-1 transition shadow-xs flex flex-col justify-between ${conf.cardBg}`}
                                                            >
                                                                <div>
                                                                    <div className="flex items-start justify-between gap-1">
                                                                        <span className="font-extrabold text-slate-900 leading-tight line-clamp-1">
                                                                            {apt.patient?.first_name} {apt.patient?.last_name}
                                                                        </span>
                                                                        
                                                                        {/* BOUTON WHATSAPP VERT OFFICIEL (FORMAT 2126...) */}
                                                                        <WhatsAppButton
                                                                            phone={apt.patient?.phone}
                                                                            patientFirstName={apt.patient?.first_name}
                                                                            dentistName={apt.dentist?.name}
                                                                            scheduledAt={apt.scheduled_at}
                                                                            size="icon-only"
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5 mt-1">
                                                                        <span className="text-[10px] font-mono font-bold bg-white/70 px-1.5 py-0.2 rounded text-slate-700">
                                                                            {time} • {apt.duration_minutes}m
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-slate-600 truncate">
                                                                            {apt.motif}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Mini actions rapides */}
                                                                <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[10px]">
                                                                    <span className="font-semibold text-slate-500">
                                                                        Dr. {apt.dentist?.name ? apt.dentist.name.split(' ')[0] : 'Martin'}
                                                                    </span>

                                                                    {apt.status === 'scheduled' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateStatus(apt.id, 'waiting')}
                                                                            className="font-black text-amber-700 hover:underline"
                                                                        >
                                                                            Arrivé →
                                                                        </button>
                                                                    )}
                                                                    {apt.status === 'waiting' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateStatus(apt.id, 'in_chair')}
                                                                            className="font-black text-[#0f4c5c] hover:underline"
                                                                        >
                                                                            Fauteuil →
                                                                        </button>
                                                                    )}
                                                                    {apt.status === 'in_chair' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateStatus(apt.id, 'completed')}
                                                                            className="font-black text-emerald-700 hover:underline"
                                                                        >
                                                                            Terminer ✓
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VUE 2 : CALENDRIER JOUR */}
            {viewMode === 'day' && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-black text-[#0f4c5c]">
                                Programme du {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Créneaux consultatoires de 08h30 à 19h00
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {timeSlots.map((time) => {
                            const slotAppointments = appointments.filter((apt) => {
                                const aptDate = apt.scheduled_at.split('T')[0];
                                const aptTime = apt.scheduled_at.split('T')[1].slice(0, 5);
                                return aptDate === selectedDate && aptTime === time;
                            });

                            return (
                                <div key={time} className="p-3.5 hover:bg-slate-50/60 transition flex items-start gap-4">
                                    <div className="w-16 text-center font-mono font-bold text-xs text-slate-400 pt-1 shrink-0">
                                        {time}
                                    </div>

                                    <div className="flex-1">
                                        {slotAppointments.length === 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => openCreateAtSlot(selectedDate, time)}
                                                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-[#2a9d8f] hover:text-[#2a9d8f] hover:bg-[#2a9d8f]/5 text-xs font-bold transition text-left"
                                            >
                                                + Créneau disponible (Cliquer pour réserver à {time})
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                {slotAppointments.map((apt) => {
                                                    const conf = statusConfig[apt.status] || statusConfig.scheduled;
                                                    return (
                                                        <div
                                                            key={apt.id}
                                                            className={`p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${conf.cardBg}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center font-mono font-black text-xs text-[#0f4c5c] shrink-0">
                                                                    {time}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-extrabold text-sm text-slate-900">
                                                                            {apt.patient?.first_name} {apt.patient?.last_name}
                                                                        </span>
                                                                        <span className="text-xs text-slate-500 font-mono">
                                                                            {apt.patient?.phone || 'Sans tél'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-700 font-bold mt-0.5">
                                                                        {apt.motif} • <span className="font-normal">{apt.duration_minutes} minutes</span>
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-500">
                                                                        Praticien : Dr. {apt.dentist?.name || 'Sophie Martin'}
                                                                        {apt.notes && ` • « ${apt.notes} »`}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2.5 self-end md:self-center">
                                                                {/* BOUTON WHATSAPP OFFICIEL MAROCAIN */}
                                                                <WhatsAppButton
                                                                    phone={apt.patient?.phone}
                                                                    patientFirstName={apt.patient?.first_name}
                                                                    dentistName={apt.dentist?.name}
                                                                    scheduledAt={apt.scheduled_at}
                                                                    size="normal"
                                                                />

                                                                {apt.status === 'scheduled' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateStatus(apt.id, 'waiting')}
                                                                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition"
                                                                    >
                                                                        Marquer Arrivé
                                                                    </button>
                                                                )}
                                                                {apt.status === 'waiting' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateStatus(apt.id, 'in_chair')}
                                                                        className="px-3 py-1.5 rounded-xl bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs transition"
                                                                    >
                                                                        Au Fauteuil →
                                                                    </button>
                                                                )}
                                                                {apt.status === 'in_chair' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateStatus(apt.id, 'completed')}
                                                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                                                                    >
                                                                        Terminer ✓
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(apt.id)}
                                                                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                                                                    title="Supprimer ce rendez-vous"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* VUE 3 : CALENDRIER LISTE */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                    {/* Filtres de la vue liste */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={listSearch}
                                onChange={(e) => setListSearch(e.target.value)}
                                placeholder="Filtrer par patient, motif..."
                                className="text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f] w-64"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {['all', 'scheduled', 'waiting', 'in_chair', 'completed'].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setListStatusFilter(st)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize ${
                                        listStatusFilter === st
                                            ? 'bg-[#0f4c5c] text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {st === 'all' ? 'Tous' : statusConfig[st]?.label || st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Liste */}
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                    <th className="py-3 px-3">Date & Heure</th>
                                    <th className="py-3 px-3">Patient</th>
                                    <th className="py-3 px-3">Motif</th>
                                    <th className="py-3 px-3">Durée</th>
                                    <th className="py-3 px-3">Praticien</th>
                                    <th className="py-3 px-3 text-center">Rappel WhatsApp</th>
                                    <th className="py-3 px-3 text-center">Statut</th>
                                    <th className="py-3 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredListAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                                            Aucun rendez-vous ne correspond aux critères.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredListAppointments.map((apt) => {
                                        const conf = statusConfig[apt.status] || statusConfig.scheduled;
                                        return (
                                            <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                                                    {new Date(apt.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à {new Date(apt.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="font-extrabold text-slate-900 block">
                                                        {apt.patient?.first_name} {apt.patient?.last_name}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        {apt.patient?.phone || 'Pas de tél'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 font-semibold text-slate-700">
                                                    {apt.motif}
                                                </td>
                                                <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                                                    {apt.duration_minutes} min
                                                </td>
                                                <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                                                    Dr. {apt.dentist?.name || 'Sophie Martin'}
                                                </td>
                                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                    <WhatsAppButton
                                                        phone={apt.patient?.phone}
                                                        patientFirstName={apt.patient?.first_name}
                                                        dentistName={apt.dentist?.name}
                                                        scheduledAt={apt.scheduled_at}
                                                        size="small"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${conf.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                                                        {conf.label}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {apt.status === 'scheduled' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateStatus(apt.id, 'waiting')}
                                                                className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition"
                                                            >
                                                                Arrivé
                                                            </button>
                                                        )}
                                                        {apt.status === 'waiting' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateStatus(apt.id, 'in_chair')}
                                                                className="px-2.5 py-1 rounded-lg bg-[#2a9d8f] text-white font-bold text-[11px] hover:bg-[#21867a] transition"
                                                            >
                                                                Fauteuil →
                                                            </button>
                                                        )}
                                                        {apt.status === 'in_chair' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateStatus(apt.id, 'completed')}
                                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                                                            >
                                                                Terminer ✓
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(apt.id)}
                                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                                                            title="Supprimer"
                                                        >
                                                            ✕
                                                        </button>
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
            )}

            {/* MODALE D'AJOUT DE RENDEZ-VOUS */}
            <AppointmentModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                patients={patients}
                dentists={dentists}
                initialDate={modalPrefilledDate || selectedDate}
                initialTime={modalPrefilledTime}
            />
        </AuthenticatedLayout>
    );
}
