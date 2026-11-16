export default function ApplicationLogo({ className = 'h-9 w-auto', showText = true }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
                {/* Tooth Icon with Medical Plus */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C9.5 2 8 3.5 7 5C6 6.5 5 8 5 11C5 14 6 17 7 20C7.5 21.5 9 22 10 22C11 22 11.5 21 12 19.5C12.5 21 13 22 14 22C15 22 16.5 21.5 17 20C18 17 19 14 19 11C19 8 18 6.5 17 5C16 3.5 14.5 2 12 2ZM11 7H13V10H16V12H13V15H11V12H8V10H11V7Z" />
                </svg>
            </div>
            {showText && (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 leading-none font-bold tracking-tight text-xl text-slate-800">
                        <span>Denti</span>
                        <span className="text-teal-600">Care</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
                        SaaS Dentaire
                    </span>
                </div>
            )}
        </div>
    );
}
