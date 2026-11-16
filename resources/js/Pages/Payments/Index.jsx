import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, Link } from '@inertiajs/react';

export default function PaymentsIndex({
    auth,
    todayPayments,
    todayTotal,
    allPayments,
    monthlyRevenue,
    canViewGlobal,
    patients,
}) {
    const user = auth.user;
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        patient_id: patients[0]?.id || '',
        amount: '43.38',
        payment_method: 'card',
        paid_at: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
    });

    const handleCreatePayment = (e) => {
        e.preventDefault();
        post(route('payments.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                                Trésorerie & Facturation
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">Cabinet DentiCare</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mt-1">
                            Encaissements & Règlements
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Encaisser un Règlement</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Encaissements - DentiCare" />

            {/* SECTION 1 : Encaissement du jour (Accessible au Dentiste et à l'Assistante) */}
            <div className="mb-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Caisse Journalière
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">Accessible Praticien & Secrétariat</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 mt-1">
                            Encaissement du Jour ({new Date().toLocaleDateString('fr-FR')})
                        </h2>
                    </div>

                    <div className="text-right bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl">
                        <p className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">Total Encaissé Aujourd'hui</p>
                        <p className="text-2xl font-black text-emerald-600 mt-0.5">
                            {todayTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </p>
                    </div>
                </div>

                {/* Today's Transactions Table */}
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Mode de Paiement</th>
                                <th className="px-4 py-3">Référence / Notes</th>
                                <th className="px-4 py-3">Encaissé par</th>
                                <th className="px-4 py-3 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {todayPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-xs">
                                        Aucun règlement encaissé aujourd'hui.
                                    </td>
                                </tr>
                            ) : (
                                todayPayments.map((pmt) => (
                                    <tr key={pmt.id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-4 py-3 font-bold text-slate-900">
                                            {pmt.patient.first_name} {pmt.patient.last_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                pmt.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                                                pmt.payment_method === 'cash' ? 'bg-emerald-100 text-emerald-800' :
                                                pmt.payment_method === 'check' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {pmt.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {pmt.reference || '—'} {pmt.notes ? `(${pmt.notes})` : ''}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                                            {pmt.recorded_by?.name || 'Cabinet'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-emerald-600 text-sm">
                                            +{Number(pmt.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 2 : Statistiques Financières Globales & CA Mensuel (RBAC) */}
            <div>
                {canViewGlobal ? (
                    /* DENTIST : Full Monthly & Historical Turnover View */
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                        Privilège Dentiste
                                    </span>
                                    <h2 className="text-lg font-black text-slate-900">
                                        Chiffre d'Affaires Global & Historique Comptable
                                    </h2>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Historique complet des règlements et ventilation comptable du cabinet.
                                </p>
                            </div>

                            <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CA Global du Mois en Cours</p>
                                <p className="text-2xl font-black text-teal-700">
                                    {monthlyRevenue?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                </p>
                            </div>
                        </div>

                        {/* All Transactions Table */}
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Patient</th>
                                        <th className="px-4 py-3">Mode</th>
                                        <th className="px-4 py-3">Référence</th>
                                        <th className="px-4 py-3">Encaissé par</th>
                                        <th className="px-4 py-3 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allPayments?.data?.map((pmt) => (
                                        <tr key={pmt.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-4 py-3 text-xs font-medium text-slate-700">
                                                {new Date(pmt.paid_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-900">
                                                {pmt.patient.first_name} {pmt.patient.last_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                                                    {pmt.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                                                {pmt.reference || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                {pmt.recorded_by?.name || 'Cabinet'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                                                {Number(pmt.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {allPayments?.links && allPayments.links.length > 3 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">Total : {allPayments.total} transactions</span>
                                <div className="flex gap-1">
                                    {allPayments.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded text-xs ${
                                                link.active ? 'bg-teal-600 text-white font-bold' : 'bg-slate-100 text-slate-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ASSISTANT : Blocked RBAC Notice */
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                        Restriction Rôle Assistante
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Chiffre d'Affaires Global Mensuel Non Accessible
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Conformément à la politique RBAC de DentiCare, le rôle <strong>Assistante Dentaire</strong> a accès à l'enregistrement et à la consultation de l'<strong>encaissement journalier</strong>, mais n'est pas autorisé à consulter le chiffre d'affaires cumulé mensuel ou annuel, ni l'historique financier global du cabinet.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Encaisser un Règlement */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
                <form onSubmit={handleCreatePayment} className="p-6 bg-white rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
                        Encaisser un Règlement
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

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Montant (€) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full text-base font-black text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Moyen de paiement *</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            >
                                <option value="card">Carte Bancaire (CB)</option>
                                <option value="cash">Espèces</option>
                                <option value="check">Chèque</option>
                                <option value="transfer">Virement bancaire</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Date du règlement</label>
                            <input
                                type="date"
                                required
                                value={data.paid_at}
                                onChange={(e) => setData('paid_at', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de transaction / Référence chèque</label>
                            <input
                                type="text"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                className="w-full text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                placeholder="ex: CHQ-48192 ou CB-0091"
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
                            Enregistrer l'Encaissement
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

