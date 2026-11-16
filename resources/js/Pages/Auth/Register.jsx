import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'dentist',
        cabinet_name: '',
        city: 'Paris',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Créer un Cabinet - DentiCare" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-extrabold text-slate-900">
                    Créer votre Cabinet DentiCare
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Essai gratuit immédiat • Jusqu'à 50 patients inclus sans carte bancaire
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Informations Cabinet */}
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                        1. Votre Cabinet Dentaire
                    </p>

                    <div>
                        <InputLabel htmlFor="cabinet_name" value="Nom du cabinet dentaire *" />
                        <TextInput
                            id="cabinet_name"
                            type="text"
                            name="cabinet_name"
                            value={data.cabinet_name}
                            className="mt-1 block w-full rounded-xl text-sm"
                            placeholder="ex: Cabinet Dentaire des Étoiles"
                            onChange={(e) => setData('cabinet_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.cabinet_name} className="mt-1 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <InputLabel htmlFor="city" value="Ville" />
                            <TextInput
                                id="city"
                                type="text"
                                name="city"
                                value={data.city}
                                className="mt-1 block w-full rounded-xl text-sm"
                                placeholder="Paris"
                                onChange={(e) => setData('city', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="phone" value="Téléphone" />
                            <TextInput
                                id="phone"
                                type="text"
                                name="phone"
                                value={data.phone}
                                className="mt-1 block w-full rounded-xl text-sm"
                                placeholder="01 23 45 67 89"
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Utilisateur Praticien ou Assistante */}
                <div className="space-y-3 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        2. Identité de l'Utilisateur
                    </p>

                    <div>
                        <InputLabel htmlFor="name" value="Nom et Prénom *" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full rounded-xl text-sm"
                            placeholder="Dr. Alexandre Dupont"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1 text-xs" />
                    </div>

                    <div>
                        <InputLabel htmlFor="role" value="Rôle au cabinet (RBAC) *" />
                        <select
                            id="role"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-teal-500"
                        >
                            <option value="dentist">Chirurgien-Dentiste (Praticien - Accès Total)</option>
                            <option value="assistant">Assistante Dentaire (Accueil, Agenda, Caisse)</option>
                        </select>
                        <InputError message={errors.role} className="mt-1 text-xs" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Adresse Email Professionnelle *" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-xl text-sm"
                            placeholder="contact@cabinet.fr"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-1 text-xs" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="password" value="Mot de passe *" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl text-sm"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1 text-xs" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmation *" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-xl text-sm"
                                placeholder="••••••••"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/25 transition"
                    >
                        {processing ? 'Création du cabinet...' : 'Créer mon Cabinet DentiCare'}
                    </button>
                </div>

                <div className="text-center pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Déjà inscrit ? </span>
                    <Link
                        href={route('login')}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                        Se connecter
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
