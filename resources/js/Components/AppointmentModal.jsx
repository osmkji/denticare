import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';

export default function AppointmentModal({
    show,
    onClose,
    patients = [],
    dentists = [],
    initialDate = '',
    initialTime = '09:00',
}) {
    const { auth } = usePage().props;
    const [isCreatingNewPatient, setIsCreatingNewPatient] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Initialisation date & heure par défaut
    const defaultDate = initialDate || new Date().toISOString().split('T')[0];
    const defaultDateTime = `${defaultDate}T${initialTime}`;

    const { data, setData, post, processing, reset, errors } = useForm({
        patient_id: '',
        create_new_patient: false,
        new_patient_first_name: '',
        new_patient_last_name: '',
        new_patient_phone: '',
        new_patient_cin: '',
        dentist_id: dentists[0]?.id || auth?.user?.id || '',
        motif: 'Consultation',
        scheduled_at: defaultDateTime,
        duration_minutes: 30,
        notes: '',
    });

    useEffect(() => {
        if (initialDate) {
            setData((prev) => ({
                ...prev,
                scheduled_at: `${initialDate}T${initialTime}`,
            }));
        }
    }, [initialDate, initialTime]);

    // Filtrage autocomplété des patients
    const filteredPatients = patients.filter((p) => {
        if (!patientSearch.trim()) return true;
        const q = patientSearch.toLowerCase();
        return (
            p.first_name.toLowerCase().includes(q) ||
            p.last_name.toLowerCase().includes(q) ||
            (p.phone && p.phone.toLowerCase().includes(q)) ||
            (p.cin && p.cin.toLowerCase().includes(q))
        );
    });

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setData('patient_id', patient.id);
        setPatientSearch(`${patient.first_name} ${patient.last_name}`);
        setIsDropdownOpen(false);
    };

    const toggleMode = (createNew) => {
        setIsCreatingNewPatient(createNew);
        setData('create_new_patient', createNew);
        if (createNew) {
            setData('patient_id', '');
            setSelectedPatient(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('appointments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedPatient(null);
                setPatientSearch('');
                setIsCreatingNewPatient(false);
                onClose();
            },
        });
    };

    const predefinedMotifs = [
        { label: 'Consultation', icon: '🩺' },
        { label: 'Détartrage', icon: '✨' },
        { label: 'Extraction', icon: '🦷' },
        { label: 'Urgence', icon: '🚨' },
        { label: 'Contrôle', icon: '🔍' },
    ];

    const predefinedDurations = [15, 30, 45, 60];

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#0f4c5c]/10 text-[#0f4c5c] flex items-center justify-center font-black text-xl shadow-xs">
                            📅
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#0f4c5c]">
                                Nouveau Rendez-vous
                            </h2>
                            <p className="text-xs text-slate-400">
                                Planification sur l'agenda médical DentiCare
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    {/* Switch Mode : Patient existant autocomplété OU Création rapide à la volée */}
                    <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => toggleMode(false)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition text-center ${
                                !isCreatingNewPatient
                                    ? 'bg-white text-[#0f4c5c] shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            🔍 Patient existant (Recherche)
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleMode(true)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition text-center ${
                                isCreatingNewPatient
                                    ? 'bg-white text-[#2a9d8f] shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            + Nouveau Patient (À la volée)
                        </button>
                    </div>

                    {/* Mode 1 : Recherche Autocomplétée */}
                    {!isCreatingNewPatient ? (
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Rechercher un patient *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required={!isCreatingNewPatient}
                                    value={patientSearch}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onChange={(e) => {
                                        setPatientSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                        if (selectedPatient) setSelectedPatient(null);
                                    }}
                                    placeholder="Tapez un nom, prénom, tél (06...) ou CIN..."
                                    className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f] pl-9"
                                />
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                                    🔍
                                </span>
                            </div>

                            {/* Dropdown autocomplété */}
                            {isDropdownOpen && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                                    {filteredPatients.length === 0 ? (
                                        <div className="p-3 text-center text-xs text-slate-400">
                                            Aucun patient trouvé.
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    toggleMode(true);
                                                }}
                                                className="block mx-auto mt-1 font-bold text-[#2a9d8f] hover:underline"
                                            >
                                                + Créer à la volée maintenant
                                            </button>
                                        </div>
                                    ) : (
                                        filteredPatients.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handleSelectPatient(p)}
                                                className="w-full text-left p-3 hover:bg-slate-50 transition flex items-center justify-between"
                                            >
                                                <div>
                                                    <span className="font-extrabold text-xs text-slate-900 block">
                                                        {p.first_name} {p.last_name}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {p.phone || 'Pas de tél'} {p.cin ? `• CIN: ${p.cin}` : ''}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-[#2a9d8f] bg-[#2a9d8f]/10 px-2 py-0.5 rounded-full">
                                                    Choisir →
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {selectedPatient && (
                                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                                    <span className="font-bold text-emerald-800">
                                        Patient sélectionné : {selectedPatient.first_name} {selectedPatient.last_name} ({selectedPatient.phone || 'Sans tél'})
                                    </span>
                                    <span className="text-emerald-600 font-bold">✓</span>
                                </div>
                            )}
                            {errors.patient_id && (
                                <p className="text-red-500 text-[11px] mt-1">{errors.patient_id}</p>
                            )}
                        </div>
                    ) : (
                        /* Mode 2 : Création Rapide à la volée */
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                            <span className="text-[11px] font-black uppercase text-[#2a9d8f] tracking-wider block">
                                Fiche Patient Express :
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                                    <input
                                        type="text"
                                        required={isCreatingNewPatient}
                                        value={data.new_patient_first_name}
                                        onChange={(e) => setData('new_patient_first_name', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                        placeholder="Ex: Youssef"
                                    />
                                    {errors.new_patient_first_name && (
                                        <p className="text-red-500 text-[11px] mt-1">{errors.new_patient_first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        required={isCreatingNewPatient}
                                        value={data.new_patient_last_name}
                                        onChange={(e) => setData('new_patient_last_name', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                        placeholder="Ex: Alaoui"
                                    />
                                    {errors.new_patient_last_name && (
                                        <p className="text-red-500 text-[11px] mt-1">{errors.new_patient_last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone (06...)</label>
                                    <input
                                        type="tel"
                                        value={data.new_patient_phone}
                                        onChange={(e) => setData('new_patient_phone', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                        placeholder="06 12 34 56 78"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">CIN (Optionnel)</label>
                                    <input
                                        type="text"
                                        value={data.new_patient_cin}
                                        onChange={(e) => setData('new_patient_cin', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                        placeholder="Ex: BK123456"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Choix du Motif de consultation */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Motif de consultation *
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {predefinedMotifs.map((m) => (
                                <button
                                    key={m.label}
                                    type="button"
                                    onClick={() => setData('motif', m.label)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                        data.motif === m.label
                                            ? 'bg-[#0f4c5c] text-white shadow-xs'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    <span>{m.icon}</span>
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            required
                            value={data.motif}
                            onChange={(e) => setData('motif', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            placeholder="Ou précisez un autre motif..."
                        />
                    </div>

                    {/* Durée estimée */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Durée de la séance *
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {predefinedDurations.map((dur) => (
                                <button
                                    key={dur}
                                    type="button"
                                    onClick={() => setData('duration_minutes', dur)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                                        Number(data.duration_minutes) === dur
                                            ? 'bg-[#2a9d8f] text-white border-[#2a9d8f] shadow-xs'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {dur} min
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date, Heure & Praticien */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Date & Heure du RDV *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={data.scheduled_at}
                                onChange={(e) => setData('scheduled_at', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                            {errors.scheduled_at && (
                                <p className="text-red-500 text-[11px] mt-1">{errors.scheduled_at}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Chirurgien-Dentiste *
                            </label>
                            <select
                                value={data.dentist_id}
                                onChange={(e) => setData('dentist_id', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            >
                                {dentists.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        Dr. {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes additionnelles */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Notes & Recommandations
                        </label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            placeholder="Remarques au fauteuil, matériel à stériliser, devis..."
                        />
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0f4c5c]/90 text-white font-bold text-xs shadow-md shadow-[#0f4c5c]/20 transition flex items-center gap-2"
                    >
                        {processing ? 'Enregistrement...' : 'Confirmer le Rendez-vous'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

