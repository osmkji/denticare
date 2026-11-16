import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ACT_CONFIG } from './Odontogram';

export default function TreatmentPlanTable({ acts = [], patient, user }) {
    const [filter, setFilter] = useState('all'); // 'all', 'planned', 'completed'

    const plannedActs = acts.filter((act) => act.status === 'planned');
    const completedActs = acts.filter((act) => act.status === 'completed');

    const totalPlannedAmount = plannedActs.reduce((acc, act) => acc + Number(act.price || 0), 0);
    const totalCompletedAmount = completedActs.reduce((acc, act) => acc + Number(act.price || 0), 0);

    const filteredActs = acts.filter((act) => {
        if (filter === 'planned') return act.status === 'planned';
        if (filter === 'completed') return act.status === 'completed';
        return true;
    });

    const handleToggleStatus = (act) => {
        if (!user.is_dentist && act.status === 'completed') {
            alert("Interdiction : Seul le chirurgien-dentiste peut modifier un acte clinique déjà validé et réalisé.");
            return;
        }

        router.patch(route('dental-acts.status', act.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (act) => {
        if (!user.is_dentist) {
            alert("Interdiction : Seul le chirurgien-dentiste peut supprimer un acte du dossier clinique.");
            return;
        }

        if (confirm(`Confirmez-vous la suppression de l'acte « ${act.description} » ?`)) {
            router.delete(route('dental-acts.destroy', act.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            {/* Header du Tableau & Résumé Financier du Plan de Traitement */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-black text-[#0f4c5c]">
                        Historique des Séances & Plan de Traitement
                    </h2>
                    <p className="text-xs text-slate-400">
                        Suivi chronologique des actes prévus, diagnostics au fauteuil et soins réalisés.
                    </p>
                </div>

                {/* Synthèse Devis / Réalisé (DH) */}
                <div className="flex items-center gap-3">
                    <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-right">
                        <span className="block text-[10px] font-black uppercase text-amber-800">
                            Plan de Traitement (À faire)
                        </span>
                        <span className="text-sm font-black text-amber-900 font-mono">
                            {totalPlannedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                        </span>
                    </div>

                    <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-right">
                        <span className="block text-[10px] font-black uppercase text-emerald-800">
                            Soins Réalisés
                        </span>
                        <span className="text-sm font-black text-emerald-900 font-mono">
                            {totalCompletedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                        </span>
                    </div>
                </div>
            </div>

            {/* Onglets Filtres (Tous, À faire, Réalisé) */}
            <div className="my-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            filter === 'all'
                                ? 'bg-white text-[#0f4c5c] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Tous les actes ({acts.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('planned')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            filter === 'planned'
                                ? 'bg-white text-amber-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        À faire ({plannedActs.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('completed')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            filter === 'completed'
                                ? 'bg-white text-emerald-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Réalisés ({completedActs.length})
                    </button>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                    {filteredActs.length} acte{filteredActs.length > 1 ? 's' : ''} affiché{filteredActs.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Tableau des Actes Cliniques */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Dent N°</th>
                            <th className="py-3 px-3">Acte / Diagnostic</th>
                            <th className="py-3 px-3">Notes Cliniques</th>
                            <th className="py-3 px-3">Praticien</th>
                            <th className="py-3 px-3 text-right">Tarif (DH)</th>
                            <th className="py-3 px-3 text-center">Statut</th>
                            <th className="py-3 px-3 text-right">Action rapide</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredActs.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                                    Aucun acte enregistré pour ce filtre. Cliquez sur une dent de l'odontogramme pour ajouter un acte.
                                </td>
                            </tr>
                        ) : (
                            filteredActs.map((act) => {
                                const actConfig = ACT_CONFIG[act.act_type] || ACT_CONFIG.healthy;
                                const isCompleted = act.status === 'completed';
                                const canEditStatus = user.is_dentist || !isCompleted;

                                return (
                                    <tr key={act.id} className="hover:bg-slate-50/70 transition">
                                        {/* Date */}
                                        <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                                            {act.performed_at
                                                ? new Date(act.performed_at).toLocaleDateString('fr-FR')
                                                : act.created_at
                                                ? new Date(act.created_at).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </td>

                                        {/* Dent */}
                                        <td className="py-3.5 px-3 whitespace-nowrap">
                                            {act.tooth_number ? (
                                                <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                    #{act.tooth_number}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-semibold italic text-[11px]">
                                                    Général
                                                </span>
                                            )}
                                        </td>

                                        {/* Type & Libellé */}
                                        <td className="py-3.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                                    style={{ backgroundColor: actConfig.color }}
                                                    title={actConfig.label}
                                                />
                                                <span className="font-black text-slate-900">
                                                    {act.description}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                                                {actConfig.label}
                                            </span>
                                        </td>

                                        {/* Notes Cliniques */}
                                        <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                                            {act.clinical_notes || <span className="text-slate-300 italic">—</span>}
                                        </td>

                                        {/* Praticien */}
                                        <td className="py-3.5 px-3 text-slate-700 font-semibold whitespace-nowrap">
                                            {act.dentist ? act.dentist.name : 'Dr. Cabinet'}
                                        </td>

                                        {/* Tarif en DH */}
                                        <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                                            {Number(act.price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                        </td>

                                        {/* Statut Badge */}
                                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    isCompleted
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                                                {isCompleted ? 'Réalisé' : 'À faire'}
                                            </span>
                                        </td>

                                        {/* Action rapide en 1 clic */}
                                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {canEditStatus ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(act)}
                                                        className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition shadow-xs flex items-center gap-1 ${
                                                            isCompleted
                                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                                : 'bg-[#2a9d8f] hover:bg-[#2a9d8f]/90 text-white shadow-[#2a9d8f]/20'
                                                        }`}
                                                        title={
                                                            isCompleted
                                                                ? 'Remettre l\'acte en À faire'
                                                                : 'Passer l\'acte en 1 clic à Réalisé'
                                                        }
                                                    >
                                                        {isCompleted ? (
                                                            <span>↩ Remettre À faire</span>
                                                        ) : (
                                                            <span>✓ Passer à Réalisé</span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span
                                                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-bold cursor-not-allowed"
                                                        title="Action réservée au chirurgien-dentiste pour un acte réalisé"
                                                    >
                                                        🔒 Validé
                                                    </span>
                                                )}

                                                {user.is_dentist && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(act)}
                                                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                                                        title="Supprimer définitivement l'acte"
                                                    >
                                                        ✕
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
    );
}

