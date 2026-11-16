import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, router } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const loginAs = (email) => {
        router.post(route('login'), {
            email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
            <Head title="DentiCare - SaaS de Gestion de Cabinet Dentaire" />

            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-teal-500/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800">
                <ApplicationLogo />

                <div className="flex items-center gap-4">
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/25"
                        >
                            Accéder au Tableau de Bord →
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-xs font-bold text-slate-300 hover:text-white transition"
                            >
                                Connexion
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/25"
                            >
                                Créer un Cabinet (Gratuit)
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-6">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        Laravel 11 • React • Vite • Tailwind CSS • Inertia.js
                    </span>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                        La solution SaaS moderne pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">cabinets dentaires</span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed">
                        Gestion complète multi-tenant, isolation stricte des données de santé, contrôle d'accès RBAC (Dentiste & Assistante) et modèle Freemium avec seuil automatique à 50 dossiers patients.
                    </p>

                    {/* Quick Launch Buttons for Evaluation */}
                    <div className="mt-10 p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl shadow-2xl">
                        <p className="text-xs font-black uppercase tracking-wider text-teal-400 mb-4">
                            Accès Rapide Démonstration (1 clic sans saisie) :
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                            <button
                                onClick={() => loginAs('dentiste@denticare.fr')}
                                className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white text-left transition shadow-lg shadow-teal-700/30 group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider bg-teal-900/60 px-2 py-0.5 rounded text-teal-200">
                                        Rôle Dentiste
                                    </span>
                                    <span className="text-teal-300 group-hover:translate-x-1 transition">→</span>
                                </div>
                                <div className="text-base font-bold mt-2">Dr. Sophie Martin</div>
                                <div className="text-xs text-teal-200/80 mt-0.5">
                                    Accès complet, CA mensuel, suppression de dossiers & actes validés.
                                </div>
                            </button>

                            <button
                                onClick={() => loginAs('assistante@denticare.fr')}
                                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white text-left transition shadow-lg shadow-indigo-700/30 group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-200">
                                        Rôle Assistante
                                    </span>
                                    <span className="text-indigo-300 group-hover:translate-x-1 transition">→</span>
                                </div>
                                <div className="text-base font-bold mt-2">Claire Dubois</div>
                                <div className="text-xs text-indigo-200/80 mt-0.5">
                                    Agenda, salle d'attente, encaissement du jour. CA & suppression bloqués.
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Highlights Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-xl mb-4 border border-teal-500/20">
                            🏢
                        </div>
                        <h3 className="text-lg font-bold text-white">Multi-Tenant Strict</h3>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                            Global Scope Eloquent et Middleware <code>BelongsToCabinet</code> isolant rigoureusement chaque cabinet par <code>cabinet_id</code> sur toutes les tables métiers.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-xl mb-4 border border-amber-500/20">
                            ⚡
                        </div>
                        <h3 className="text-lg font-bold text-white">Freemium Limit (50 Patients)</h3>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                            Contrôle <code>CheckFreemiumLimit</code> : blocage automatique au 50ème patient avec affichage de la modale d'upgrade vers <strong>DentiCare Pro</strong>.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xl mb-4 border border-indigo-500/20">
                            🛡️
                        </div>
                        <h3 className="text-lg font-bold text-white">RBAC Dentiste / Assistante</h3>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                            Policies Laravel vérifiant finement les permissions : modification des actes validés, consultation du CA global mensuel et suppression de dossiers.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
