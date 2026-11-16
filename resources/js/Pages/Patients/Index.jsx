import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpgradeModal from '@/Components/UpgradeModal';
import QuickPatientModal from '@/Components/QuickPatientModal';
import Modal from '@/Components/Modal';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function PatientsIndex({ auth, patients, filters, quota }) {
    const user = auth.user;
    const [search, setSearch] = useState(filters.search || '');
    const [unpaidOnly, setUnpaidOnly] = useState(filters.unpaid_only || false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Formulaire d'importation CSV
    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport } = useForm({
        file: null,
    });

    // Recherche temps réel avec debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '') || unpaidOnly !== (filters.unpaid_only || false)) {
                router.get(route('patients.index'), {
                    search: search || undefined,
                    unpaid_only: unpaidOnly ? '1' : undefined,
                }, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, unpaidOnly]);

    const handleToggleUnpaid = () => {
        setUnpaidOnly(!unpaidOnly);
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        postImport(route('patients.import'), {
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
            onError: (err) => {
                if (err.file && err.file.includes('limite')) {
                    setShowImportModal(false);
                    setShowUpgradeModal(true);
                }
            },
        });
    };

    const handleDeletePatient = (patient) => {
        if (!user.is_dentist) {
            alert("Interdiction : Seul le chirurgien-dentiste peut supprimer définitivement un dossier patient.");
            return;
        }

        if (confirm(`Confirmez-vous la suppression définitive du dossier de ${patient.full_name} ?`)) {
            router.delete(route('patients.destroy', patient.id));
        }
    };

    // Générateur d'exemple CSV téléchargeable
    const downloadCsvTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,first_name,last_name,phone,cin\nKarim,Bennani,0611223344,BE102938\nMeryem,Alaoui,0622334455,BK894712\nYoussef,Chraibi,0633445566,A748291";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modele_patients_denticare.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#2a9d8f] bg-[#2a9d8f]/10 px-2.5 py-0.5 rounded-full border border-[#2a9d8f]/20">
                                Répertoire & Administration
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium">Fichier Central Patients</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#0f4c5c] mt-1">
                            Répertoire Patients & Fiche Administrative
                        </h1>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-[#0f4c5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Importer CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (quota.has_reached_limit) {
                                    setShowUpgradeModal(true);
                                } else {
                                    setShowCreateModal(true);
                                }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0a3540] text-white font-bold text-xs shadow-md shadow-[#0f4c5c]/20 transition flex items-center gap-2"
                        >
                            <span className="text-sm font-bold text-[#2a9d8f]">+</span>
                            <span>Nouveau Patient</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Répertoire Patients - DentiCare" />

            <UpgradeModal
                show={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                data={{
                    message: `Votre cabinet a atteint le seuil limite de ${quota.limit} patients inclus dans le plan Gratuit (${quota.count} / ${quota.limit}). Pour créer ou importer des patients illimités, passez à DentiCare Pro.`,
                }}
            />

            <QuickPatientModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUpgradeRequired={() => setShowUpgradeModal(true)}
            />

            {/* INDICATEUR DE QUOTA DENTICARE FREE */}
            {quota.is_free && (
                <div className="mb-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Forfait DentiCare Free
                                </span>
                                <span className="text-xs font-extrabold text-slate-800">
                                    {quota.count} / {quota.limit} patients utilisés
                                </span>
                                {quota.has_reached_limit && (
                                    <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                                        Seuil de 50 Atteint
                                    </span>
                                )}
                            </div>

                            {/* Barre de progression */}
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden max-w-xl">
                                <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                        quota.has_reached_limit
                                            ? 'bg-rose-500'
                                            : quota.count >= 40
                                            ? 'bg-amber-500'
                                            : 'bg-[#2a9d8f]'
                                    }`}
                                    style={{ width: `${Math.min((quota.count / quota.limit) * 100, 100)}%` }}
                                />
                            </div>

                            <p className="text-xs text-slate-500">
                                {quota.has_reached_limit
                                    ? "La création et l'importation de nouveaux dossiers sont bloquées. Débloquez les dossiers patients illimités avec DentiCare Pro."
                                    : `Il vous reste ${quota.limit - quota.count} dossier(s) disponible(s) avant la limite Freemium.`}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition shrink-0 flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Passer à DentiCare Pro (Illimité)</span>
                        </button>
                    </div>
                </div>
            )}

            {/* BARRE DE RECHERCHE TEMPS RÉEL & FILTRES */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Recherche instantanée */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Recherche instantanée par nom, prénom, téléphone, CIN..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f] text-xs font-medium placeholder-slate-400"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filtre "Avec reliquats impayés" */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleToggleUnpaid}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                            unpaidOnly
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        <span>⚠️ Avec Reliquats Impayés</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            unpaidOnly ? 'bg-white text-rose-700 font-black' : 'bg-rose-100 text-rose-700 font-extrabold'
                        }`}>
                            {quota.unpaid_count}
                        </span>
                    </button>
                </div>
            </div>

            {/* TABLEAU RÉPERTOIRE PATIENTS */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-wider text-slate-400 font-black border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3.5">Patient</th>
                                <th className="px-5 py-3.5">CIN</th>
                                <th className="px-5 py-3.5">Téléphone</th>
                                <th className="px-5 py-3.5">Couverture Médicale</th>
                                <th className="px-5 py-3.5">Alertes Médicales</th>
                                <th className="px-5 py-3.5">Reliquat Impayé</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-xs">
                                        Aucun dossier patient ne correspond à votre recherche.
                                    </td>
                                </tr>
                            ) : (
                                patients.data.map((patient) => {
                                    const hasAllergies = !emptyString(patient.allergies);
                                    const hasHistory = !emptyString(patient.medical_history);
                                    const hasAlerts = hasAllergies || hasHistory;
                                    const hasDebt = patient.unpaid_balance > 0;

                                    return (
                                        <tr key={patient.id} className="hover:bg-slate-50/70 transition">
                                            {/* Nom & Prénom */}
                                            <td className="px-5 py-4">
                                                <Link href={route('patients.show', patient.id)} className="group block">
                                                    <div className="font-extrabold text-slate-900 group-hover:text-[#0f4c5c] text-sm transition">
                                                        {patient.first_name} {patient.last_name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {patient.age ? `${patient.age} ans` : 'Âge non renseigné'}
                                                    </div>
                                                </Link>
                                            </td>

                                            {/* CIN */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {patient.cin ? (
                                                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                                        {patient.cin}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Téléphone */}
                                            <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                                                {patient.phone || '—'}
                                            </td>

                                            {/* Couverture Médicale */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {patient.insurance_type === 'cnss' && (
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                                        CNSS
                                                    </span>
                                                )}
                                                {patient.insurance_type === 'cnops' && (
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                                        CNOPS
                                                    </span>
                                                )}
                                                {patient.insurance_type === 'private' && (
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                                        Assurance Privée
                                                    </span>
                                                )}
                                                {(!patient.insurance_type || patient.insurance_type === 'none') && (
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        Sans couverture
                                                    </span>
                                                )}
                                            </td>

                                            {/* Alertes Médicales (Allergies & Antécédents) */}
                                            <td className="px-5 py-4">
                                                {hasAlerts ? (
                                                    <div className="flex flex-col gap-1">
                                                        {hasAllergies && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                                🚨 {patient.allergies}
                                                            </span>
                                                        )}
                                                        {hasHistory && !hasAllergies && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                ⚠️ {patient.medical_history}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Aucune alerte</span>
                                                )}
                                            </td>

                                            {/* Reliquat Impayé (DH) */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {hasDebt ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                                        <span>⚠️</span>
                                                        <span>{Number(patient.unpaid_balance).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                        ✓ Réglé (0 DH)
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('patients.show', patient.id)}
                                                        className="px-3 py-1.5 rounded-xl bg-[#0f4c5c]/10 hover:bg-[#0f4c5c] text-[#0f4c5c] hover:text-white text-xs font-bold transition"
                                                    >
                                                        Consulter Dossier
                                                    </Link>

                                                    {user.is_dentist ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePatient(patient)}
                                                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                                            title="Supprimer (Dentiste)"
                                                        >
                                                            ✕
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className="p-1.5 text-slate-300 text-xs cursor-not-allowed"
                                                            title="Action réservée au dentiste"
                                                        >
                                                            🔒
                                                        </span>
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

                {/* Pagination */}
                {patients.links && patients.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                            Affichage de {patients.from || 0} à {patients.to || 0} sur {patients.total} dossiers
                        </div>
                        <div className="flex gap-1">
                            {patients.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                        link.active
                                            ? 'bg-[#0f4c5c] text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALE D'IMPORTATION CSV / EXCEL */}
            <Modal show={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="md">
                <form onSubmit={handleImportSubmit} className="p-6 bg-white rounded-3xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#0f4c5c]/10 text-[#0f4c5c] flex items-center justify-center font-bold">
                                📥
                            </div>
                            <div>
                                <h2 className="text-base font-black text-[#0f4c5c]">
                                    Importer des Patients (CSV)
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Ajout par lot dans votre base cabinet
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {/* Avertissement Quota Free */}
                        {quota.is_free && (
                            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                <p className="font-bold">Quota Forfait Gratuit :</p>
                                <p className="mt-0.5">
                                    Votre cabinet a <strong>{quota.count} / {quota.limit} patients</strong>. Le fichier importé ne doit pas dépasser le plafond restant de <strong>{Math.max(0, quota.limit - quota.count)} patient(s)</strong>.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Fichier CSV (.csv) *
                            </label>
                            <input
                                type="file"
                                accept=".csv,.txt"
                                required
                                onChange={(e) => setImportData('file', e.target.files[0])}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0f4c5c] file:text-white hover:file:bg-[#0a3540] cursor-pointer"
                            />
                            {importErrors.file && (
                                <p className="text-xs text-rose-600 mt-1 font-semibold">{importErrors.file}</p>
                            )}
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
                            <p className="font-bold text-slate-800">Colonnes acceptées dans l'en-tête CSV :</p>
                            <p className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                                first_name, last_name, phone, cin
                            </p>
                            <button
                                type="button"
                                onClick={downloadCsvTemplate}
                                className="text-xs font-bold text-[#2a9d8f] hover:underline flex items-center gap-1"
                            >
                                <span>📥 Télécharger un modèle CSV exemple</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowImportModal(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={importProcessing}
                            className="px-5 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0a3540] text-white font-bold text-xs shadow-md transition"
                        >
                            {importProcessing ? 'Importation en cours...' : 'Lancer l\'Importation'}
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
