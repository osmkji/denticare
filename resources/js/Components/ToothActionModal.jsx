import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { useForm, router } from '@inertiajs/react';
import { TOOTH_NAMES, ACT_CONFIG } from './Odontogram';

export default function ToothActionModal({
    show,
    onClose,
    patient,
    toothNumber,
    currentStatus = null,
    toothActs = [],
    user,
}) {
    const toothName = TOOTH_NAMES[toothNumber] || `Dent #${toothNumber}`;
    const [selectedActType, setSelectedActType] = useState('caries');

    const { data, setData, post, processing, reset, errors } = useForm({
        tooth_number: toothNumber || '',
        act_type: 'caries',
        description: ACT_CONFIG.caries.defaultTitle,
        price: ACT_CONFIG.caries.defaultPrice,
        status: 'planned',
        clinical_notes: '',
        performed_at: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (toothNumber) {
            setData((prev) => ({
                ...prev,
                tooth_number: toothNumber,
            }));
        }
    }, [toothNumber]);

    const handleSelectType = (typeKey) => {
        setSelectedActType(typeKey);
        const config = ACT_CONFIG[typeKey] || ACT_CONFIG.healthy;
        setData((prev) => ({
            ...prev,
            act_type: typeKey,
            description: config.defaultTitle,
            price: config.defaultPrice,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dental-acts.store', patient.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleToggleStatus = (act) => {
        if (!user.is_dentist && act.status === 'completed') {
            alert("Interdiction : Seul le chirurgien-dentiste peut modifier un acte clinique déjà réalisé.");
            return;
        }

        router.patch(route('dental-acts.status', act.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteAct = (act) => {
        if (!user.is_dentist) {
            alert("Interdiction : Seul le chirurgien-dentiste peut supprimer un acte du dossier clinique.");
            return;
        }

        if (confirm(`Supprimer l'acte « ${act.description} » sur la dent ${act.tooth_number} ?`)) {
            router.delete(route('dental-acts.destroy', act.id), {
                preserveScroll: true,
            });
        }
    };

    const actKeys = ['caries', 'composite', 'endo', 'crown', 'extraction', 'absent', 'implant', 'scaling', 'healthy'];

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 sm:p-8 bg-white rounded-3xl">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#0f4c5c] text-white flex items-center justify-center font-mono font-black text-xl shadow-md">
                            {toothNumber || '—'}
                        </div>
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#2a9d8f]">
                                Dossier Clinique • Odontogramme
                            </span>
                            <h2 className="text-lg font-black text-[#0f4c5c]">
                                Dent #{toothNumber} : {toothName}
                            </h2>
                            {currentStatus && (
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <span className="font-bold text-slate-700">État actuel :</span>
                                    <span className="font-extrabold capitalize text-slate-900">
                                        {ACT_CONFIG[currentStatus.act_type]?.label || currentStatus.act_type}
                                    </span>
                                    <span>•</span>
                                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                                        currentStatus.status === 'completed'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {currentStatus.status === 'completed' ? 'Réalisé' : 'À faire'}
                                    </span>
                                </p>
                            )}
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

                {/* Formulaire d'ajout d'acte */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                    {/* Choix de l'état / type d'acte avec boutons colorés */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                            Sélectionner le diagnostic ou l'acte dentaire :
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {actKeys.map((key) => {
                                const config = ACT_CONFIG[key];
                                const isSelected = selectedActType === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleSelectType(key)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition text-left ${
                                            isSelected
                                                ? 'ring-2 ring-[#0f4c5c] ring-offset-1 bg-slate-50 border-slate-400 text-slate-900 shadow-xs'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <span
                                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-xs"
                                            style={{ backgroundColor: config.color }}
                                        />
                                        <span className="truncate">{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description et Prix en DH */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Libellé de l'acte / Soin *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="Ex: Obturation composite 2 faces"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-[11px] mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Tarif prévu (DH) *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="10"
                                    required
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f] pr-10 font-bold"
                                />
                                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                                    DH
                                </span>
                            </div>
                            {errors.price && (
                                <p className="text-red-500 text-[11px] mt-1">{errors.price}</p>
                            )}
                        </div>
                    </div>

                    {/* Statut : À faire vs Réalisé */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Statut de l'acte
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setData('status', 'planned')}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                        data.status === 'planned'
                                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    À faire (Plan)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('status', 'completed')}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                        data.status === 'completed'
                                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    Réalisé
                                </button>
                            </div>
                        </div>

                        {data.status === 'completed' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Date de réalisation
                                </label>
                                <input
                                    type="date"
                                    value={data.performed_at}
                                    onChange={(e) => setData('performed_at', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes Cliniques */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Notes cliniques & observations
                        </label>
                        <textarea
                            rows="2"
                            value={data.clinical_notes}
                            onChange={(e) => setData('clinical_notes', e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            placeholder="Observations au fauteuil, profondeur de la lésion, matériaux utilisés..."
                        />
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                            <span>+ Ajouter au Plan de Traitement</span>
                            <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">
                                {data.price || 0} DH
                            </span>
                        </button>
                    </div>
                </form>

                {/* Historique des actes enregistrés sur cette dent spécifique */}
                {toothActs.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                            Historique des actes sur la Dent #{toothNumber} ({toothActs.length}) :
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {toothActs.map((act) => (
                                <div
                                    key={act.id}
                                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: ACT_CONFIG[act.act_type]?.color || '#94a3b8' }}
                                            />
                                            <span className="font-black text-slate-900">{act.description}</span>
                                            <span className="font-bold text-[#0f4c5c] font-mono">
                                                {Number(act.price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                            </span>
                                        </div>
                                        {act.clinical_notes && (
                                            <p className="text-[11px] text-slate-500 mt-0.5 italic">
                                                « {act.clinical_notes} »
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {act.performed_at
                                                ? `Réalisé le ${new Date(act.performed_at).toLocaleDateString('fr-FR')}`
                                                : 'Planifié dans le plan de traitement'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(act)}
                                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                                act.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                            }`}
                                            title={
                                                act.status === 'completed'
                                                    ? 'Cliquez pour remettre en À faire'
                                                    : 'Cliquez pour marquer Réalisé'
                                            }
                                        >
                                            {act.status === 'completed' ? '✓ Réalisé' : 'À faire'}
                                        </button>

                                        {user.is_dentist && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAct(act)}
                                                className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-100 flex items-center justify-center transition"
                                                title="Supprimer cet acte"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

