import { useState } from 'react';
import Modal from '@/Components/Modal';
import { useForm, router } from '@inertiajs/react';

export default function PatientDocumentsTab({ patient, documents = [], user }) {
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [previewDoc, setPreviewDoc] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        type: 'xray',
        file: null,
    });

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('patient-documents.store', patient.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowUploadModal(false);
            },
        });
    };

    const handleDelete = (doc) => {
        if (confirm(`Confirmez-vous la suppression du document « ${doc.title} » ?`)) {
            router.delete(route('patient-documents.destroy', doc.id), {
                preserveScroll: true,
            });
        }
    };

    const filteredDocs = documents.filter((doc) => {
        if (selectedTypeFilter === 'all') return true;
        return doc.type === selectedTypeFilter;
    });

    const typeConfig = {
        xray: { label: 'Radiographie (X-Ray)', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🩻' },
        photo: { label: 'Photographie Clinique', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '📷' },
        other: { label: 'Autre Document', badge: 'bg-slate-50 text-slate-700 border-slate-200', icon: '📄' },
    };

    return (
        <div className="space-y-6">
            {/* Header de la section Radios & Documents */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-black text-[#0f4c5c]">
                        Imagerie Médicale & Documents Cliniques
                    </h2>
                    <p className="text-xs text-slate-400">
                        Panoramiques (OPT), rétro-alvéolaires, photographies intrabuccales et comptes-rendus.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-[#0f4c5c] hover:bg-[#0f4c5c]/90 text-white font-bold text-xs shadow-md shadow-[#0f4c5c]/20 transition flex items-center gap-2 self-start sm:self-auto"
                >
                    <span>+ Téléverser une Radio / Photo</span>
                </button>
            </div>

            {/* Filtres par type */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setSelectedTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selectedTypeFilter === 'all'
                                ? 'bg-white text-[#0f4c5c] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Tous ({documents.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTypeFilter('xray')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selectedTypeFilter === 'xray'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        🩻 Radiographies ({documents.filter((d) => d.type === 'xray').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTypeFilter('photo')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selectedTypeFilter === 'photo'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        📷 Photographies ({documents.filter((d) => d.type === 'photo').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTypeFilter('other')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selectedTypeFilter === 'other'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        📄 Autres ({documents.filter((d) => d.type === 'other').length})
                    </button>
                </div>
            </div>

            {/* Grille des documents */}
            {filteredDocs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-2xl mx-auto mb-3">
                        🩻
                    </div>
                    <h3 className="text-sm font-black text-slate-700">Aucun document dans cette catégorie</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Téléversez les radiographies panoramiques, clichés rétro-alvéolaires ou photographies de suivi clinique du patient.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#2a9d8f] text-white font-bold text-xs hover:bg-[#2a9d8f]/90 transition"
                    >
                        + Ajouter un premier cliché
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => {
                        const config = typeConfig[doc.type] || typeConfig.other;
                        return (
                            <div
                                key={doc.id}
                                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition duration-200"
                            >
                                {/* Zone d'aperçu d'image */}
                                <div
                                    onClick={() => setPreviewDoc(doc)}
                                    className="h-48 bg-slate-900 relative cursor-pointer overflow-hidden flex items-center justify-center"
                                >
                                    <img
                                        src={doc.file_url}
                                        alt={doc.title}
                                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                                        onError={(e) => {
                                            // Fallback visuel si image non trouvée
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                        <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-black text-xs shadow-md">
                                            🔍 Agrandir
                                        </span>
                                    </div>
                                    <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${config.badge}`}>
                                        {config.icon} {config.label}
                                    </span>
                                </div>

                                {/* Détails du document */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1" title={doc.title}>
                                            {doc.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Ajouté le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-[#2a9d8f] hover:underline"
                                        >
                                            Télécharger / Ouvrir ↗
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(doc)}
                                            className="text-slate-400 hover:text-rose-600 text-xs font-medium transition"
                                            title="Supprimer ce document"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODALE D'UPLOAD DE DOCUMENTS */}
            <Modal show={showUploadModal} onClose={() => setShowUploadModal(false)} maxWidth="lg">
                <form onSubmit={handleUpload} className="p-6 sm:p-8 bg-white rounded-3xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🩻</span>
                            <h3 className="text-base font-black text-[#0f4c5c]">
                                Téléverser un Document ou une Radio
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Titre du document *
                            </label>
                            <input
                                type="text"
                                required
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="Ex: Radio Panoramique Initiale"
                            />
                            {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Type de document *
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            >
                                <option value="xray">🩻 Radiographie (X-Ray, Panoramique, Rétro-alvéolaire)</option>
                                <option value="photo">📷 Photographie clinique intrabuccale</option>
                                <option value="other">📄 Autre document / Compte-rendu médical</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-[11px] mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Fichier (JPG, PNG, WEBP, PDF) *
                            </label>
                            <input
                                type="file"
                                required
                                accept="image/*,.pdf"
                                onChange={(e) => setData('file', e.target.files[0])}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0f4c5c]/10 file:text-[#0f4c5c] hover:file:bg-[#0f4c5c]/20"
                            />
                            {errors.file && <p className="text-red-500 text-[11px] mt-1">{errors.file}</p>}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0f4c5c]/90 text-white font-bold text-xs shadow-md shadow-[#0f4c5c]/20 transition"
                        >
                            {processing ? 'Téléversement...' : 'Ajouter au dossier'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODALE LIGHTBOX / AGRANDISSEMENT PLEIN ÉCRAN */}
            {previewDoc && (
                <Modal show={Boolean(previewDoc)} onClose={() => setPreviewDoc(null)} maxWidth="4xl">
                    <div className="p-4 sm:p-6 bg-slate-950 text-white rounded-3xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="font-bold text-sm text-white">{previewDoc.title}</h3>
                                <p className="text-xs text-slate-400">
                                    Patient : {patient.full_name} • Ajouté le {new Date(previewDoc.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewDoc(null)}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-center bg-black/50 rounded-2xl p-2 min-h-[400px] max-h-[70vh] overflow-hidden">
                            <img
                                src={previewDoc.file_url}
                                alt={previewDoc.title}
                                className="max-w-full max-h-[68vh] object-contain rounded-lg"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3 pt-2">
                            <a
                                href={previewDoc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                            >
                                Ouvrir dans un nouvel onglet ↗
                            </a>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

