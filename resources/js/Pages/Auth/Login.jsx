import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const loginAs = (email, password = 'password') => {
        setData({
            email,
            password,
            remember: true,
        });
        post(route('login'), {
            data: { email, password, remember: true },
        });
    };

    return (
        <GuestLayout>
            <Head title="Connexion - DentiCare" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-extrabold text-slate-900">
                    Connexion à votre Cabinet
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Accédez à votre espace de gestion DentiCare
                </p>
            </div>

            {/* Quick Demo Login Cards */}
            <div className="mb-6 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                <p className="text-[11px] font-black uppercase tracking-wider text-teal-800 text-center mb-2.5">
                    Comptes Démonstration Immédiats (RBAC) :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => loginAs('dentiste@denticare.fr')}
                        className="p-2.5 rounded-xl bg-white border border-teal-200 hover:border-teal-400 hover:shadow-sm text-left transition group"
                    >
                        <div className="text-xs font-bold text-teal-900 group-hover:text-teal-700">
                            Dr. Sophie Martin
                        </div>
                        <div className="text-[10px] text-teal-600 font-semibold uppercase mt-0.5">
                            Dentiste (Accès Total)
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => loginAs('assistante@denticare.fr')}
                        className="p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-sm text-left transition group"
                    >
                        <div className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">
                            Claire Dubois
                        </div>
                        <div className="text-[10px] text-indigo-600 font-semibold uppercase mt-0.5">
                            Assistante (Accès Restreint)
                        </div>
                    </button>
                </div>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Adresse Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="praticien@cabinet.fr"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-xs text-slate-600">
                            Se souvenir de moi
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                        >
                            Mot de passe oublié ?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/25 transition"
                    >
                        {processing ? 'Connexion...' : 'Se Connecter à DentiCare'}
                    </button>
                </div>

                <div className="text-center pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Nouveau cabinet ? </span>
                    <Link
                        href={route('register')}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                        Créer un compte cabinet (Essai Gratuit)
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
