import { router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function UpgradeModal({ show, onClose, data = null }) {
    const handleUpgrade = (targetPlan = 'pro') => {
        router.post(route('cabinet.plan.update'), {
            plan: targetPlan,
        }, {
            onSuccess: () => {
                if (onClose) onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 sm:p-8 bg-white rounded-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Limite Forfait Gratuit Atteinte
                            </span>
                            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                                Passer à DentiCare Pro
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Explanation */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-sm">
                    <p className="font-semibold">
                        {data?.message || 'Vous avez atteint la limite de 50 patients du forfait Gratuit.'}
                    </p>
                    <p className="text-amber-800/90 mt-1">
                        Pour créer de nouveaux patients et accompagner la croissance de votre cabinet dentaire, débloquez immédiatement la formule <strong>DentiCare Pro</strong>.
                    </p>
                </div>

                {/* Features comparison */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Free Plan card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-75">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-sm">Forfait Gratuit</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">Actuel</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-800 mt-2">0 € <span className="text-xs font-normal text-slate-500">/ mois</span></p>
                        <ul className="mt-4 space-y-2 text-xs text-slate-600">
                            <li className="flex items-center gap-2 text-rose-600 font-semibold">
                                <span>✕</span> 50 patients maximum (Seuil atteint)
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✓</span> Agenda & Salle d'attente
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✓</span> Encaissement du jour
                            </li>
                            <li className="flex items-center gap-2 text-slate-400">
                                <span>✕</span> Rapports financiers avancés
                            </li>
                        </ul>
                    </div>

                    {/* Pro Plan card (Hero) */}
                    <div className="p-4 rounded-xl border-2 border-teal-500 bg-gradient-to-br from-teal-50/50 to-cyan-50/30 relative shadow-sm">
                        <div className="absolute -top-3 right-4 bg-teal-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                            Recommandé
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-teal-900 text-sm">DentiCare Pro</span>
                            <span className="text-xs font-semibold text-teal-600">Essai 14j sans engagement</span>
                        </div>
                        <p className="text-2xl font-extrabold text-teal-900 mt-2">49 € <span className="text-xs font-normal text-slate-500">/ mois</span></p>
                        <ul className="mt-4 space-y-2 text-xs text-slate-700">
                            <li className="flex items-center gap-2 font-bold text-teal-700">
                                <span className="text-teal-600">✓</span> Dossiers patients ILLIMITÉS
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-600">✓</span> Statistiques & Chiffre d'Affaires complet
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-600">✓</span> Rappels automatiques des RDV par SMS
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-teal-600">✓</span> Historique clinique & Sauvegarde HDS
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Guarantee / Info */}
                <div className="mt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Activation instantanée • Sans engagement • Annulation en 1 clic
                    </span>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                    >
                        Plus tard
                    </button>
                    <button
                        type="button"
                        onClick={() => handleUpgrade('pro')}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition flex items-center gap-2"
                    >
                        <span>Passer à DentiCare Pro (49 € / mois)</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </Modal>
    );
}

