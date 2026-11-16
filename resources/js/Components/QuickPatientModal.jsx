import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function QuickPatientModal({ show, onClose, onUpgradeRequired }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        birth_date: '',
        gender: 'M',
        social_security_number: '',
        allergies: '',
        medical_history: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('patients.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (err) => {
                if (err.freemium_limit && onUpgradeRequired) {
                    onClose();
                    onUpgradeRequired();
                }
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] flex items-center justify-center font-bold">
                            +
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#0f4c5c]">
                                Nouveau Patient
                            </h2>
                            <p className="text-xs text-slate-500">
                                Création rapide d'un dossier patient
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-4 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                            <input
                                type="text"
                                required
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="Karim"
                            />
                            {errors.first_name && <p className="text-xs text-rose-600 mt-0.5">{errors.first_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                            <input
                                type="text"
                                required
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="Bennani"
                            />
                            {errors.last_name && <p className="text-xs text-rose-600 mt-0.5">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                            <input
                                type="text"
                                required
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                                placeholder="06 12 34 56 78"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Date de naissance</label>
                            <input
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            placeholder="patient@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Allergies médicales</label>
                        <input
                            type="text"
                            value={data.allergies}
                            onChange={(e) => setData('allergies', e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-[#2a9d8f] focus:ring-[#2a9d8f]"
                            placeholder="Pénicilline, Latex, etc. (laisser vide si aucune)"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0a3540] text-white font-bold text-xs shadow-md transition"
                    >
                        {processing ? 'Création...' : 'Créer le dossier'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

