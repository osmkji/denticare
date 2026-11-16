import { useState } from 'react';

// Métadonnées descriptives de chaque dent FDI
export const TOOTH_NAMES = {
    // Adulte - Haut Droit
    '18': '3ème molaire (dent de sagesse) sup. droite',
    '17': '2ème molaire sup. droite',
    '16': '1ère molaire sup. droite',
    '15': '2ème prémolaire sup. droite',
    '14': '1ère prémolaire sup. droite',
    '13': 'Canine sup. droite',
    '12': 'Incisive latérale sup. droite',
    '11': 'Incisive centrale sup. droite',

    // Adulte - Haut Gauche
    '21': 'Incisive centrale sup. gauche',
    '22': 'Incisive latérale sup. gauche',
    '23': 'Canine sup. gauche',
    '24': '1ère prémolaire sup. gauche',
    '25': '2ème prémolaire sup. gauche',
    '26': '1ère molaire sup. gauche',
    '27': '2ème molaire sup. gauche',
    '28': '3ème molaire (dent de sagesse) sup. gauche',

    // Adulte - Bas Droit
    '48': '3ème molaire (dent de sagesse) inf. droite',
    '47': '2ème molaire inf. droite',
    '46': '1ère molaire inf. droite',
    '45': '2ème prémolaire inf. droite',
    '44': '1ère prémolaire inf. droite',
    '43': 'Canine inf. droite',
    '42': 'Incisive latérale inf. droite',
    '41': 'Incisive centrale inf. droite',

    // Adulte - Bas Gauche
    '31': 'Incisive centrale inf. gauche',
    '32': 'Incisive latérale inf. gauche',
    '33': 'Canine inf. gauche',
    '34': '1ère prémolaire inf. gauche',
    '35': '2ème prémolaire inf. gauche',
    '36': '1ère molaire inf. gauche',
    '37': '2ème molaire inf. gauche',
    '38': '3ème molaire (dent de sagesse) inf. gauche',

    // Enfant (Temporaire)
    '55': '2ème molaire tempo. sup. droite',
    '54': '1ère molaire tempo. sup. droite',
    '53': 'Canine tempo. sup. droite',
    '52': 'Incisive latérale tempo. sup. droite',
    '51': 'Incisive centrale tempo. sup. droite',
    '61': 'Incisive centrale tempo. sup. gauche',
    '62': 'Incisive latérale tempo. sup. gauche',
    '63': 'Canine tempo. sup. gauche',
    '64': '1ère molaire tempo. sup. gauche',
    '65': '2ème molaire tempo. sup. gauche',
    '85': '2ème molaire tempo. inf. droite',
    '84': '1ère molaire tempo. inf. droite',
    '83': 'Canine tempo. inf. droite',
    '82': 'Incisive latérale tempo. inf. droite',
    '81': 'Incisive centrale tempo. inf. droite',
    '71': 'Incisive centrale tempo. inf. gauche',
    '72': 'Incisive latérale tempo. inf. gauche',
    '73': 'Canine tempo. inf. gauche',
    '74': '1ère molaire tempo. inf. gauche',
    '75': '2ème molaire tempo. inf. gauche',
};

// Configuration visuelle des états / actes dentaires
export const ACT_CONFIG = {
    healthy: {
        label: 'Saine',
        color: '#ffffff',
        border: '#cbd5e1',
        bgPill: 'bg-slate-100 text-slate-700 border-slate-300',
        badge: 'slate',
        defaultPrice: 0,
        defaultTitle: 'Examen dentaire - Dent saine',
    },
    caries: {
        label: 'Carie',
        color: '#ef4444',
        border: '#b91c1c',
        bgPill: 'bg-red-500 text-white border-red-600',
        badge: 'red',
        defaultPrice: 400,
        defaultTitle: 'Soin de carie / Traitement conservateur',
    },
    composite: {
        label: 'Composite',
        color: '#3b82f6',
        border: '#1d4ed8',
        bgPill: 'bg-blue-500 text-white border-blue-600',
        badge: 'blue',
        defaultPrice: 450,
        defaultTitle: 'Obturation composite esthétique',
    },
    endo: {
        label: 'Endo (Dévitalisation)',
        color: '#eab308',
        border: '#a16207',
        bgPill: 'bg-amber-400 text-amber-950 border-amber-500',
        badge: 'amber',
        defaultPrice: 900,
        defaultTitle: 'Traitement endodontique canalaire',
    },
    crown: {
        label: 'Couronne',
        color: '#10b981',
        border: '#047857',
        bgPill: 'bg-emerald-500 text-white border-emerald-600',
        badge: 'emerald',
        defaultPrice: 2500,
        defaultTitle: 'Pose de couronne céramo-céramique',
    },
    extraction: {
        label: 'Extraction',
        color: '#6b7280',
        border: '#374151',
        bgPill: 'bg-gray-600 text-white border-gray-700',
        badge: 'gray',
        defaultPrice: 350,
        defaultTitle: 'Extraction dentaire simple',
    },
    absent: {
        label: 'Dent Absente',
        color: '#9ca3af',
        border: '#4b5563',
        bgPill: 'bg-gray-400 text-slate-900 border-gray-500',
        badge: 'gray',
        defaultPrice: 0,
        defaultTitle: 'Dent absente constatée',
    },
    implant: {
        label: 'Implant',
        color: '#8b5cf6',
        border: '#6d28d9',
        bgPill: 'bg-purple-600 text-white border-purple-700',
        badge: 'purple',
        defaultPrice: 7500,
        defaultTitle: 'Pose implant titane ostéo-intégré',
    },
    scaling: {
        label: 'Détartrage',
        color: '#2a9d8f',
        border: '#0f4c5c',
        bgPill: 'bg-[#2a9d8f] text-white border-[#0f4c5c]',
        badge: 'teal',
        defaultPrice: 300,
        defaultTitle: 'Détartrage et polissage complet',
    },
};

/**
 * Dessin anatomique SVG d'une dent individuelle selon son quadrant et son état
 */
function ToothSvg({ toothNumber, isUpper, statusInfo, onClick, isSelected }) {
    const actType = statusInfo?.act_type || 'healthy';
    const config = ACT_CONFIG[actType] || ACT_CONFIG.healthy;
    const isCompleted = statusInfo?.status === 'completed';
    const isAbsentOrExtracted = actType === 'absent' || actType === 'extraction';
    const isImplant = actType === 'implant';
    const isCrown = actType === 'crown';
    const isEndo = actType === 'endo';
    const isCaries = actType === 'caries';
    const isComposite = actType === 'composite';

    // Détermine si molaire, prémolaire ou antérieure pour le dessin des racines
    const num = parseInt(toothNumber.toString().slice(-1), 10);
    const isMolar = num >= 6;
    const isPremolar = num === 4 || num === 5;

    // Définition de la couleur de remplissage
    let fillColor = '#ffffff';
    let strokeColor = '#94a3b8';

    if (actType === 'caries') {
        fillColor = '#fee2e2';
        strokeColor = '#ef4444';
    } else if (actType === 'composite') {
        fillColor = '#dbeafe';
        strokeColor = '#3b82f6';
    } else if (actType === 'endo') {
        fillColor = '#fef3c7';
        strokeColor = '#f59e0b';
    } else if (actType === 'crown') {
        fillColor = '#d1fae5';
        strokeColor = '#10b981';
    } else if (actType === 'implant') {
        fillColor = '#ede9fe';
        strokeColor = '#8b5cf6';
    } else if (isAbsentOrExtracted) {
        fillColor = '#f1f5f9';
        strokeColor = '#94a3b8';
    }

    return (
        <button
            type="button"
            onClick={onClick}
            title={`Dent ${toothNumber} : ${TOOTH_NAMES[toothNumber] || ''} • État : ${config.label}${statusInfo ? ` (${statusInfo.status === 'completed' ? 'Réalisé' : 'À faire'})` : ''}`}
            className={`group flex flex-col items-center p-1 rounded-xl transition duration-150 relative ${
                isSelected
                    ? 'ring-2 ring-[#0f4c5c] ring-offset-2 bg-slate-100 shadow-md scale-105 z-20'
                    : 'hover:bg-slate-100/80 hover:scale-105 hover:shadow-xs'
            }`}
        >
            {/* Si arcade supérieure : N° au-dessus */}
            {isUpper && (
                <span className={`text-[11px] font-mono font-black mb-1 px-1 rounded transition ${
                    statusInfo ? 'text-slate-900 bg-white/80 shadow-xs' : 'text-slate-500'
                }`}>
                    {toothNumber}
                </span>
            )}

            {/* SVG Anatomique de la Dent */}
            <div className="w-8 h-12 sm:w-9 sm:h-14 relative flex items-center justify-center">
                <svg
                    viewBox="0 0 40 60"
                    className="w-full h-full drop-shadow-xs overflow-visible"
                >
                    {/* Dessin selon Upper (racine en haut, couronne en bas) ou Lower (couronne en haut, racine en bas) */}
                    {isUpper ? (
                        <g>
                            {/* Racines supérieures */}
                            {!isAbsentOrExtracted && !isImplant && (
                                <>
                                    {isMolar ? (
                                        // 3 racines pour molaires supérieures
                                        <path
                                            d="M 12 30 C 8 18 6 8 8 2 C 12 2 15 14 17 30 M 18 30 C 19 16 20 6 20 2 C 21 6 22 16 23 30 M 24 30 C 26 14 29 2 33 2 C 35 8 33 18 29 30"
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth="1.5"
                                        />
                                    ) : isPremolar ? (
                                        // 2 racines pour prémolaires
                                        <path
                                            d="M 14 30 C 11 16 11 4 15 2 C 18 4 18 16 19 30 M 21 30 C 22 16 22 4 25 2 C 29 4 29 16 26 30"
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth="1.5"
                                        />
                                    ) : (
                                        // 1 racine unique pour incisives/canines
                                        <path
                                            d="M 15 30 C 14 16 15 4 20 2 C 25 4 26 16 25 30 Z"
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth="1.5"
                                        />
                                    )}
                                </>
                            )}

                            {/* Vis d'Implant en titane si implant */}
                            {isImplant && (
                                <g>
                                    <path
                                        d="M 14 4 L 26 4 L 24 30 L 16 30 Z"
                                        fill="#ddd6fe"
                                        stroke="#8b5cf6"
                                        strokeWidth="1.5"
                                    />
                                    <line x1="15" y1="9" x2="25" y2="9" stroke="#8b5cf6" strokeWidth="1.5" />
                                    <line x1="16" y1="15" x2="24" y2="15" stroke="#8b5cf6" strokeWidth="1.5" />
                                    <line x1="17" y1="21" x2="23" y2="21" stroke="#8b5cf6" strokeWidth="1.5" />
                                    <line x1="18" y1="26" x2="22" y2="26" stroke="#8b5cf6" strokeWidth="1.5" />
                                </g>
                            )}

                            {/* Traitement Endo (Canaux obturés en jaune) */}
                            {isEndo && (
                                <path
                                    d="M 20 6 L 20 30"
                                    stroke="#f59e0b"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            )}

                            {/* Couronne anatomique supérieure */}
                            {!isAbsentOrExtracted ? (
                                <path
                                    d="M 8 30 C 6 42 10 56 20 56 C 30 56 34 42 32 30 C 25 31 15 31 8 30 Z"
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth={isCrown ? "2.5" : "1.5"}
                                />
                            ) : (
                                <path
                                    d="M 8 30 C 6 42 10 56 20 56 C 30 56 34 42 32 30 Z"
                                    fill="#f8fafc"
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                />
                            )}

                            {/* Détails occlusaux / caries / composite */}
                            {isCaries && (
                                <circle cx="20" cy="44" r="4.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
                            )}
                            {isComposite && (
                                <rect x="15" y="38" width="10" height="9" rx="2" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.8" />
                            )}
                            {isCrown && (
                                <path
                                    d="M 12 48 L 16 42 L 20 48 L 24 42 L 28 48"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="1.5"
                                />
                            )}

                            {/* Croix extraction / absence */}
                            {isAbsentOrExtracted && (
                                <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="10" y1="15" x2="30" y2="50" />
                                    <line x1="30" y1="15" x2="10" y2="50" />
                                </g>
                            )}
                        </g>
                    ) : (
                        <g>
                            {/* Arcade inférieure : Couronne en haut (y=4..30), racine(s) en bas (y=30..58) */}
                            {!isAbsentOrExtracted && !isImplant && (
                                <>
                                    {isMolar ? (
                                        // 2 racines pour molaires inférieures
                                        <path
                                            d="M 12 30 C 10 42 8 52 10 58 C 14 58 17 48 18 30 M 22 30 C 23 48 26 58 30 58 C 32 52 30 42 28 30"
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth="1.5"
                                        />
                                    ) : (
                                        // 1 racine
                                        <path
                                            d="M 15 30 C 14 44 16 56 20 58 C 24 56 26 44 25 30 Z"
                                            fill={fillColor}
                                            stroke={strokeColor}
                                            strokeWidth="1.5"
                                        />
                                    )}
                                </>
                            )}

                            {/* Implant inférieur */}
                            {isImplant && (
                                <g>
                                    <path
                                        d="M 16 30 L 24 30 L 26 56 L 14 56 Z"
                                        fill="#ddd6fe"
                                        stroke="#8b5cf6"
                                        strokeWidth="1.5"
                                    />
                                    <line x1="16" y1="36" x2="24" y2="36" stroke="#8b5cf6" strokeWidth="1.5" />
                                    <line x1="16" y1="42" x2="24" y2="42" stroke="#8b5cf6" strokeWidth="1.5" />
                                    <line x1="15" y1="48" x2="25" y2="48" stroke="#8b5cf6" strokeWidth="1.5" />
                                </g>
                            )}

                            {/* Traitement Endo inférieur */}
                            {isEndo && (
                                <path
                                    d="M 20 30 L 20 54"
                                    stroke="#f59e0b"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            )}

                            {/* Couronne anatomique inférieure */}
                            {!isAbsentOrExtracted ? (
                                <path
                                    d="M 8 30 C 6 18 10 4 20 4 C 30 4 34 18 32 30 C 25 29 15 29 8 30 Z"
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth={isCrown ? "2.5" : "1.5"}
                                />
                            ) : (
                                <path
                                    d="M 8 30 C 6 18 10 4 20 4 C 30 4 34 18 32 30 Z"
                                    fill="#f8fafc"
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                />
                            )}

                            {/* Détails carie / composite / couronne */}
                            {isCaries && (
                                <circle cx="20" cy="16" r="4.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
                            )}
                            {isComposite && (
                                <rect x="15" y="12" width="10" height="9" rx="2" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.8" />
                            )}
                            {isCrown && (
                                <path
                                    d="M 12 12 L 16 18 L 20 12 L 24 18 L 28 12"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="1.5"
                                />
                            )}

                            {/* Croix extraction / absence */}
                            {isAbsentOrExtracted && (
                                <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="10" y1="10" x2="30" y2="48" />
                                    <line x1="30" y1="10" x2="10" y2="48" />
                                </g>
                            )}
                        </g>
                    )}
                </svg>

                {/* Petit point de statut si acte en cours / planifié vs terminé */}
                {statusInfo && (
                    <div
                        className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${
                            isCompleted ? 'bg-emerald-500 shadow-xs' : 'bg-amber-400 animate-pulse'
                        }`}
                        title={isCompleted ? 'Acte réalisé' : 'À faire (Plan de traitement)'}
                    />
                )}
            </div>

            {/* Si arcade inférieure : N° au-dessous */}
            {!isUpper && (
                <span className={`text-[11px] font-mono font-black mt-1 px-1 rounded transition ${
                    statusInfo ? 'text-slate-900 bg-white/80 shadow-xs' : 'text-slate-500'
                }`}>
                    {toothNumber}
                </span>
            )}
        </button>
    );
}

export default function Odontogram({ teethStatus = {}, onSelectTooth, selectedTooth = null }) {
    // Mode : 'adult' (32 dents) ou 'child' (20 dents temporaires)
    const [dentitionMode, setDentitionMode] = useState('adult');

    // Quadrants Adultes (32 dents)
    const adultUpperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
    const adultUpperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'];
    const adultLowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
    const adultLowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'];

    // Quadrants Enfants (20 dents)
    const childUpperRight = ['55', '54', '53', '52', '51'];
    const childUpperLeft = ['61', '62', '63', '64', '65'];
    const childLowerRight = ['85', '84', '83', '82', '81'];
    const childLowerLeft = ['71', '72', '73', '74', '75'];

    const upperRight = dentitionMode === 'adult' ? adultUpperRight : childUpperRight;
    const upperLeft = dentitionMode === 'adult' ? adultUpperLeft : childUpperLeft;
    const lowerRight = dentitionMode === 'adult' ? adultLowerRight : childLowerRight;
    const lowerLeft = dentitionMode === 'adult' ? adultLowerLeft : childLowerLeft;

    return (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            {/* Header de l'Odontogramme avec Titre et Sélecteur Adulte / Enfant */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0f4c5c]/10 text-[#0f4c5c] flex items-center justify-center font-black text-lg">
                        🦷
                    </div>
                    <div>
                        <h2 className="text-base font-black text-[#0f4c5c]">
                            Odontogramme Interactif (Schéma Dentaire FDI)
                        </h2>
                        <p className="text-xs text-slate-400">
                            Cliquez sur une dent pour diagnostiquer un état ou programmer un acte.
                        </p>
                    </div>
                </div>

                {/* Sélecteur de Denture Adulte (32 dents) / Enfant (20 dents) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setDentitionMode('adult')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            dentitionMode === 'adult'
                                ? 'bg-white text-[#0f4c5c] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Denture Adulte (32 dents)
                    </button>
                    <button
                        type="button"
                        onClick={() => setDentitionMode('child')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            dentitionMode === 'child'
                                ? 'bg-white text-[#0f4c5c] shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Denture Enfant (20 dents)
                    </button>
                </div>
            </div>

            {/* Légende Clinique des Couleurs */}
            <div className="my-4 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                    Légende :
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Carie
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Composite
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Endo
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Couronne
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Implant
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500" /> Absent / Extraction
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-[#0f4c5c] border border-teal-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2a9d8f]" /> Détartrage
                </span>
            </div>

            {/* Schéma de l'Odontogramme SVG */}
            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 sm:p-6 overflow-x-auto">
                <div className="min-w-[700px] flex flex-col items-center select-none">
                    
                    {/* Indicateurs d'orientation (Droite Patient / Gauche Patient) */}
                    <div className="w-full flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-6 mb-2">
                        <span>← Droite Patient (Secteur 1 / 4)</span>
                        <span className="text-[#0f4c5c] font-black">MAXILLAIRE (SUPÉRIEUR)</span>
                        <span>Gauche Patient (Secteur 2 / 3) →</span>
                    </div>

                    {/* ARCADE SUPÉRIEURE (MAXILLAIRE) */}
                    <div className="flex items-center justify-center gap-1 sm:gap-2 pb-4 border-b border-dashed border-slate-200 w-full">
                        {/* Cadran Supérieur Droit */}
                        <div className="flex items-center gap-1">
                            {upperRight.map((tooth) => (
                                <ToothSvg
                                    key={tooth}
                                    toothNumber={tooth}
                                    isUpper={true}
                                    statusInfo={teethStatus[tooth]}
                                    isSelected={selectedTooth === tooth}
                                    onClick={() => onSelectTooth(tooth)}
                                />
                            ))}
                        </div>

                        {/* Ligne médiane de séparation */}
                        <div className="w-0.5 h-16 bg-[#2a9d8f]/40 mx-2 rounded-full" title="Ligne Médiane" />

                        {/* Cadran Supérieur Gauche */}
                        <div className="flex items-center gap-1">
                            {upperLeft.map((tooth) => (
                                <ToothSvg
                                    key={tooth}
                                    toothNumber={tooth}
                                    isUpper={true}
                                    statusInfo={teethStatus[tooth]}
                                    isSelected={selectedTooth === tooth}
                                    onClick={() => onSelectTooth(tooth)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ARCADE INFÉRIEURE (MANDIBULE) */}
                    <div className="flex items-center justify-center gap-1 sm:gap-2 pt-4 w-full">
                        {/* Cadran Inférieur Droit */}
                        <div className="flex items-center gap-1">
                            {lowerRight.map((tooth) => (
                                <ToothSvg
                                    key={tooth}
                                    toothNumber={tooth}
                                    isUpper={false}
                                    statusInfo={teethStatus[tooth]}
                                    isSelected={selectedTooth === tooth}
                                    onClick={() => onSelectTooth(tooth)}
                                />
                            ))}
                        </div>

                        {/* Ligne médiane de séparation */}
                        <div className="w-0.5 h-16 bg-[#2a9d8f]/40 mx-2 rounded-full" title="Ligne Médiane" />

                        {/* Cadran Inférieur Gauche */}
                        <div className="flex items-center gap-1">
                            {lowerLeft.map((tooth) => (
                                <ToothSvg
                                    key={tooth}
                                    toothNumber={tooth}
                                    isUpper={false}
                                    statusInfo={teethStatus[tooth]}
                                    isSelected={selectedTooth === tooth}
                                    onClick={() => onSelectTooth(tooth)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-6 mt-3">
                        <span>Vestibulaire</span>
                        <span className="text-[#0f4c5c] font-black">MANDIBULE (INFÉRIEUR)</span>
                        <span>Lingual</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

