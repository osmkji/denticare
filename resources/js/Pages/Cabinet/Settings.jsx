import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpgradeModal from '@/Components/UpgradeModal';
import { Head, useForm, router } from '@inertiajs/react';

export default function CabinetSettings({ auth, cabinet, patientCount }) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const { data, setData, put, processing, recentlySuccessful } = useForm({
        name: cabinet.name || '',
        phone: cabinet.phone || '',
        address: cabinet.address || '',
        city: cabinet.city || '',
    });

    const handleUpdateCabinet = (e) => {
        e.preventDefault();
        put(route('cabinet.update'));
    };

    const handlePlanChange = (plan) => {
        router.post(route('cabinet.plan.update'), { plan });
    };

    const handleDemo50Patients = () => {
        router.post(route('cabinet.demo.limit'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                            Multi-Tenant & Abonnement
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">Cabinet ID #{cabinet.id}</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mt-1">
                        Configuration du Cabinet & Offres DentiCare
                    </h1>
                </div>
            }
        >
            <Head title="Configuration Cabinet & Forfait - DentiCare" />

            <UpgradeModal
                show={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />

            {/* Test Helper Card for Freemium Limit */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-amber-950">
                            Outil d'Évaluation Freemium
                        </span>
                        <h2 className="text-lg font-bold mt-1 text-white">
                            Tester le Seuil de 50 Patients et la Modale "Passer à DentiCare Pro"
                        </h2>
                        <p className="text-xs text-teal-200/80 mt-0.5">
                            Votre cabinet compte actuellement <strong>{patientCount} patient(s)</strong> sur le forfait <strong>{cabinet.plan.toUpperCase()}</strong>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleDemo50Patients}
                            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition"
                        >
                            ⚡ Amener le cabinet à 50 patients
                        </button>
                    </div>
                </div>
            </div>

            {/* Plans Comparison & SaaS Pricing */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">
                            Formules & Abonnements DentiCare
                        </h2>
                        <p className="text-xs text-slate-500">
                            Basculez de formule en 1 clic pour tester le comportement multi-tenant.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Free Plan */}
                    <div className={`p-6 rounded-2xl border transition relative flex flex-col justify-between ${
                        cabinet.plan === 'free'
                            ? 'border-2 border-teal-500 bg-white shadow-md ring-4 ring-teal-500/10'
                            : 'border-slate-200 bg-white/70'
                    }`}>
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-sm text-slate-900">DentiCare Gratuit</span>
                                {cabinet.plan === 'free' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                        Forfait Actuel
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Pour démarrer son activité dentaire</p>
                            <p className="text-3xl font-black text-slate-900 mt-4">
                                0 € <span className="text-xs font-normal text-slate-400">/ mois</span>
                            </p>

                            <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                                <li className="flex items-center gap-2 font-bold text-slate-800">
                                    <span className="text-teal-600">✓</span> Jusqu'à 50 patients ({patientCount} / 50 créés)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-teal-600">✓</span> Agenda & Salle d'attente
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-teal-600">✓</span> Encaissement journalier
                                </li>
                                <li className="flex items-center gap-2 text-slate-400">
                                    <span>✕</span> Statistiques financières globales
                                </li>
                                <li className="flex items-center gap-2 text-slate-400">
                                    <span>✕</span> Rappels SMS automatiques
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100">
                            {cabinet.plan === 'free' ? (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-default"
                                >
                                    Formule en cours
                                </button>
                            ) : (
                                <button
                                    onClick={() => handlePlanChange('free')}
                                    className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                                >
                                    Repasser en Gratuit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Pro Plan (Hero) */}
                    <div className={`p-6 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                        cabinet.plan === 'pro'
                            ? 'border-teal-500 bg-white shadow-xl ring-4 ring-teal-500/10'
                            : 'border-teal-400/80 bg-gradient-to-b from-teal-50/30 to-white'
                    }`}>
                        <div className="absolute -top-3 right-6 bg-teal-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                            Le plus populaire
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-sm text-teal-950">DentiCare Pro</span>
                                {cabinet.plan === 'pro' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                        Forfait Actuel
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-teal-700/70 mt-1">Pour les cabinets en plein exercice</p>
                            <p className="text-3xl font-black text-teal-900 mt-4">
                                49 € <span className="text-xs font-normal text-slate-400">/ mois</span>
                            </p>

                            <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                                <li className="flex items-center gap-2 font-bold text-teal-700">
                                    <span className="text-teal-600">✓</span> <strong>Dossiers patients ILLIMITÉS</strong>
                                </li>
                                <li className="flex items-center gap-2 font-semibold">
                                    <span className="text-teal-600">✓</span> Chiffre d'Affaires & Statistiques complètes
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-teal-600">✓</span> Rappels automatiques des RDV par SMS
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-teal-600">✓</span> Gestion des actes validés & CCAM
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-teal-600">✓</span> Sauvegarde Cloud certifiée HDS
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100">
                            {cabinet.plan === 'pro' ? (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl bg-teal-100 text-teal-800 text-xs font-bold cursor-default"
                                >
                                    ✓ Formule Pro Active
                                </button>
                            ) : (
                                <button
                                    onClick={() => handlePlanChange('pro')}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition"
                                >
                                    Passer à DentiCare Pro (49 €)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 3. Clinic Plan */}
                    <div className={`p-6 rounded-2xl border transition relative flex flex-col justify-between ${
                        cabinet.plan === 'clinic'
                            ? 'border-2 border-purple-500 bg-white shadow-xl ring-4 ring-purple-500/10'
                            : 'border-slate-200 bg-white/70'
                    }`}>
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-sm text-slate-900">DentiCare Clinic</span>
                                {cabinet.plan === 'clinic' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                        Forfait Actuel
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Centres dentaires & cliniques multi-fauteuils</p>
                            <p className="text-3xl font-black text-slate-900 mt-4">
                                89 € <span className="text-xs font-normal text-slate-400">/ mois</span>
                            </p>

                            <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                                <li className="flex items-center gap-2 font-bold text-purple-700">
                                    <span className="text-purple-600">✓</span> Patients & Praticiens illimités
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-600">✓</span> Télétransmission SESAM-Vitale
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-600">✓</span> Imagerie 3D et liaison radio panoramique
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-600">✓</span> Support dédié prioritaire 24/7
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100">
                            {cabinet.plan === 'clinic' ? (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold cursor-default"
                                >
                                    ✓ Formule Clinic Active
                                </button>
                            ) : (
                                <button
                                    onClick={() => handlePlanChange('clinic')}
                                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md"
                                >
                                    Passer à Clinic (89 €)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cabinet Info Form */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-2xl">
                <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
                    Coordonnées du Cabinet Dentaire
                </h2>

                <form onSubmit={handleUpdateCabinet} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Raison Sociale / Nom du cabinet *</label>
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone fixe</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Ville</label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Adresse</label>
                        <input
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        {recentlySuccessful && (
                            <span className="text-xs font-bold text-emerald-600">✓ Enregistré avec succès</span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="ml-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
                        >
                            Sauvegarder les Coordonnées
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

