import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';

export default function ClinicalActsIndex({ auth, acts, patients, dentists }) {
    const user = auth.user;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAct, setEditingAct] = useState(null);

    const { data, setData, post, put, processing, reset } = useForm({
        patient_id: patients[0]?.id || '',
        dentist_id: dentists[0]?.id || '',
        code: 'HBGD036',
        description: 'Détartrage et polissage complet sus et sous-gingival',
        tooth_number: '',
        amount: '43.38',
        status: 'validated',
        performed_at: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleCreateAct = (e) => {
        e.preventDefault();
        post(route('clinical-acts.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const handleOpenEdit = (act) => {
        if (act.status === 'validated' && !user.is_dentist) {
            alert("Interdiction RBAC : Seul le chirurgien-dentiste est autorisé à modifier un acte clinique validé et réalisé.");
            return;
        }

        setEditingAct(act);
        setData({
            description: act.description,
            code: act.code || '',
            tooth_number: act.tooth_number || '',
            amount: act.amount,
            status: act.status,
            performed_at: act.performed_at ? act.performed_at.split('T')[0] : '',
            notes: act.notes || '',
        });
    };

    const handleUpdateAct = (e) => {
        e.preventDefault();
        put(route('clinical-acts.update', editingAct.id), {
            onSuccess: () => {
                setEditingAct(null);
                reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (!user.is_dentist) {
            alert("Interdiction RBAC : Seul le chirurgien-dentiste peut supprimer un acte clinique.");
            return;
        }

        if (confirm('Voulez-vous supprimer cet acte clinique ?')) {
            router.delete(route('clinical-acts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                                Soins & Traitements
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">Nomenclature CCAM</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mt-1">
                            Actes Cliniques Dentaires
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {user.is_dentist ? (
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Enregistrer un Acte Clinique</span>
                            </button>
                        ) : (
                            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
                                Mode Consultation Assistante (Modification des actes validés réservée au dentiste)
                            </span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Actes Cliniques - DentiCare" />

            {/* Information RBAC Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">
                        Politique de Sécurité Clinique (RBAC Policy)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        • <strong>Chirurgien-Dentiste :</strong> Réalisation, validation, suppression et modification des actes cliniques validés.<br />
                        • <strong>Assistante Dentaire :</strong> Consultation de l'historique des soins et encaissement au comptoir. Interdiction formelle de modifier ou supprimer un acte médical validé.
                    </p>
                </div>
            </div>

            {/* Acts Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">Code CCAM</th>
                                <th className="px-6 py-3.5">Description de l'acte</th>
                                <th className="px-6 py-3.5">Patient</th>
                                <th className="px-6 py-3.5">Dent</th>
                                <th className="px-6 py-3.5">Date & Praticien</th>
                                <th className="px-6 py-3.5">Tarif</th>
                                <th className="px-6 py-3.5">Statut</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {acts.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-xs">
                                        Aucun acte clinique enregistré.
                                    </td>
                                </tr>
                            ) : (
                                acts.data.map((act) => (
                                    <tr key={act.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                                                {act.code || 'SOIN'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 text-sm">{act.description}</div>
                                            {act.notes && <div className="text-[11px] text-slate-400 italic mt-0.5">"{act.notes}"</div>}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800 text-xs">
                                            {act.patient.first_name} {act.patient.last_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {act.tooth_number ? (
                                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                    #{act.tooth_number}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="font-medium text-slate-700">
                                                {new Date(act.performed_at).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {act.dentist?.name || 'Dr. Sophie Martin'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-extrabold text-slate-900">
                                                {Number(act.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                act.status === 'validated'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {act.status === 'validated' ? 'Validé' : 'En cours'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* RBAC Edit Act : Allowed for dentist, or if not validated. Blocked for assistant if validated */}
                                                {user.is_dentist ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenEdit(act)}
                                                            className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(act.id)}
                                                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : act.status === 'validated' ? (
                                                    <span
                                                        className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded cursor-not-allowed"
                                                        title="Modification interdite pour l'assistante sur un acte validé."
                                                    >
                                                        🔒 Non modifiable
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenEdit(act)}
                                                        className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                                                    >
                                                        Modifier
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nouvel Acte */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="lg">
                <form onSubmit={handleCreateAct} className="p-6 bg-white rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
                        Enregistrer un Acte Clinique
                    </h2>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Patient *</label>
                            <select
                                required
                                value={data.patient_id}
                                onChange={(e) => setData('patient_id', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            >
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.first_name} {p.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Code CCAM</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="w-full text-sm font-mono rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    placeholder="ex: HBGD036"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de dent</label>
                                <input
                                    type="text"
                                    value={data.tooth_number}
                                    onChange={(e) => setData('tooth_number', e.target.value)}
                                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    placeholder="ex: 16, 21, 36..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Description du soin *</label>
                            <input
                                type="text"
                                required
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                placeholder="Détartrage, composite, dévitalisation..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tarif (€) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="w-full text-sm font-bold rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Statut de validation</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                >
                                    <option value="validated">Validé (acte réalisé)</option>
                                    <option value="in_progress">En cours de traitement</option>
                                    <option value="planned">Planifié / Devis</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Date de réalisation</label>
                            <input
                                type="date"
                                required
                                value={data.performed_at}
                                onChange={(e) => setData('performed_at', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
                        >
                            Valider le Soin
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Modification Acte (Réservé au Dentiste pour les actes validés) */}
            {editingAct && (
                <Modal show={!!editingAct} onClose={() => setEditingAct(null)} maxWidth="lg">
                    <form onSubmit={handleUpdateAct} className="p-6 bg-white rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
                            Modifier l'Acte Clinique #{editingAct.id}
                        </h2>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Code CCAM</label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full text-sm font-mono rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de dent</label>
                                    <input
                                        type="text"
                                        value={data.tooth_number}
                                        onChange={(e) => setData('tooth_number', e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tarif (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="w-full text-sm font-bold rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="validated">Validé</option>
                                        <option value="in_progress">En cours</option>
                                        <option value="planned">Planifié</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEditingAct(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
                            >
                                Sauvegarder les modifications
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}

