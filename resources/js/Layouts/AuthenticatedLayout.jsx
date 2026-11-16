import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import UpgradeModal from '@/Components/UpgradeModal';
import QuickPatientModal from '@/Components/QuickPatientModal';
import QuickAppointmentModal from '@/Components/QuickAppointmentModal';
import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children, patientsList = [], dentistsList = [] }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const cabinet = auth.cabinet;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeData, setUpgradeData] = useState(null);
    const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
    const [showQuickAppointmentModal, setShowQuickAppointmentModal] = useState(false);

    // Détection automatique des notifications d'upgrade
    useEffect(() => {
        if (flash?.upgrade_required) {
            setUpgradeData(flash.upgrade_required);
            setShowUpgradeModal(true);
        }
    }, [flash]);

    // Permutation rapide entre dentiste et assistante pour la démonstration
    const handleQuickSwitch = (targetEmail) => {
        router.post(route('login'), {
            email: targetEmail,
            password: 'password',
            remember: true,
        });
    };

    const navLinks = [
        {
            name: 'Tableau de bord',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Agenda',
            href: route('appointments.index'),
            active: route().current('appointments.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            name: 'Patients',
            href: route('patients.index'),
            active: route().current('patients.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            name: 'Facturation',
            href: route('payments.index'),
            active: route().current('payments.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            name: 'Paramètres',
            href: route('cabinet.settings'),
            active: route().current('cabinet.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex">
            {/* Upgrade Modal Global */}
            <UpgradeModal
                show={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                data={upgradeData}
            />

            {/* Quick Modals triggered from Permanent Sidebar Buttons */}
            <QuickPatientModal
                show={showQuickPatientModal}
                onClose={() => setShowQuickPatientModal(false)}
                onUpgradeRequired={() => setShowUpgradeModal(true)}
            />

            <QuickAppointmentModal
                show={showQuickAppointmentModal}
                onClose={() => setShowQuickAppointmentModal(false)}
                patients={patientsList}
                dentists={dentistsList}
            />

            {/* BARRE LATÉRALE FIXE (SIDEBAR) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 shadow-sm flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Haut de la Sidebar : Logo & Actions Rapides */}
                <div className="p-5 flex-1 flex flex-col overflow-y-auto">
                    {/* Brand Header */}
                    <div className="pb-5 border-b border-slate-100">
                        <Link href={route('dashboard')} className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#0f4c5c] text-white flex items-center justify-center shadow-md shadow-[#0f4c5c]/25">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C9.5 2 8 3.5 7 5C6 6.5 5 11 5 11C5 14 6 17 7 20C7.5 21.5 9 22 10 22C11 22 11.5 21 12 19.5C12.5 21 13 22 14 22C15 22 16.5 21.5 17 20C18 17 19 14 19 11C19 8 18 6.5 17 5C16 3.5 14.5 2 12 2ZM11 7H13V10H16V12H13V15H11V12H8V10H11V7Z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xl font-black tracking-tight text-[#0f4c5c] flex items-center">
                                    Denti<span className="text-[#2a9d8f]">Care</span>
                                </span>
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                                    Cabinet Dentaire
                                </div>
                            </div>
                        </Link>

                        {/* Cabinet Badge & Plan Info */}
                        <div className="mt-3.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <div className="truncate">
                                <p className="font-bold text-slate-800 text-[11px] truncate">
                                    {cabinet?.name || 'Cabinet DentiCare'}
                                </p>
                                <p className="text-[10px] text-slate-400 capitalize">
                                    Forfait {cabinet?.plan || 'free'}
                                </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cabinet?.is_free ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                                {cabinet?.is_free ? `${cabinet?.patient_count || 0}/50` : 'Illimité'}
                            </span>
                        </div>
                    </div>

                    {/* DEUX BOUTONS D'ACTION RAPIDE EN PERMANENCE */}
                    <div className="py-4 space-y-2 border-b border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowQuickPatientModal(true)}
                            className="w-full py-2.5 px-3.5 rounded-xl bg-[#0f4c5c] hover:bg-[#0a3540] text-white font-bold text-xs shadow-md shadow-[#0f4c5c]/20 transition flex items-center justify-center gap-2 group"
                        >
                            <span className="text-base leading-none font-bold text-[#2a9d8f] group-hover:text-white transition">+</span>
                            <span>Nouveau Patient</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowQuickAppointmentModal(true)}
                            className="w-full py-2.5 px-3.5 rounded-xl bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-xs shadow-md shadow-[#2a9d8f]/20 transition flex items-center justify-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Nouveau RDV</span>
                        </button>
                    </div>

                    {/* LIENS DE NAVIGATION */}
                    <nav className="py-4 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                            Menu Principal
                        </div>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-[#0f4c5c] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-[#0f4c5c] hover:bg-slate-100'
                                }`}
                            >
                                <span className={link.active ? 'text-[#2a9d8f]' : 'text-slate-400'}>
                                    {link.icon}
                                </span>
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Demo RBAC Switcher Shortcut */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                                <span>Rôle RBAC Actuel :</span>
                                <span className={`font-bold ${user.is_dentist ? 'text-[#0f4c5c]' : 'text-indigo-600'}`}>
                                    {user.is_dentist ? 'Dentiste' : 'Assistante'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    onClick={() => handleQuickSwitch('dentiste@denticare.fr')}
                                    className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition ${
                                        user.is_dentist
                                            ? 'bg-[#0f4c5c] text-white'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Dentiste
                                </button>
                                <button
                                    onClick={() => handleQuickSwitch('assistante@denticare.fr')}
                                    className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition ${
                                        user.is_assistant
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Assistante
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bas de la Sidebar : Profil Utilisateur & Déconnexion */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0 ${
                                user.is_dentist ? 'bg-[#0f4c5c]' : 'bg-indigo-600'
                            }`}>
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                    {user.is_dentist ? 'Praticien Titulaire' : 'Assistante Dentaire'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                            title="Se déconnecter"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Backdrop Mobile */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                />
            )}

            {/* CONTENU PRINCIPAL DÉCALÉ (md:pl-64) */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                {/* Barre supérieure mobile / info */}
                <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-700">{cabinet?.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium">Cabinet ouvert</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {cabinet?.is_free && (
                            <button
                                onClick={() => {
                                    setUpgradeData({
                                        message: `Cabinet à ${cabinet?.patient_count || 0}/50 patients sur le plan Gratuit.`,
                                    });
                                    setShowUpgradeModal(true);
                                }}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition"
                            >
                                <span>⚡ Passer à DentiCare Pro</span>
                            </button>
                        )}

                        <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-800">{user.name}</span>
                            <span className="text-[10px] text-slate-400 block -mt-0.5 capitalize">{user.role}</span>
                        </div>
                    </div>
                </header>

                {/* Messages Flash */}
                {flash?.success && (
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4">
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
                            <span className="text-emerald-600 font-black">✓</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4">
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm">
                            <span className="text-rose-600 font-black">✕</span>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Optional Custom Header Slot */}
                {header && (
                    <div className="bg-white border-b border-slate-200/60 shadow-xs py-4 px-4 sm:px-6">
                        <div className="max-w-7xl mx-auto">
                            {header}
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
