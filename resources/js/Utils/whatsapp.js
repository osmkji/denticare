/**
 * Formate un numéro de téléphone marocain en format international standard (212...)
 * et génère le lien d'envoi WhatsApp avec message pré-rempli.
 *
 * Règles marocaines :
 *  - 06XXXXXXXX -> 2126XXXXXXXX
 *  - 07XXXXXXXX -> 2127XXXXXXXX
 *  - 05XXXXXXXX -> 2125XXXXXXXX
 *  - +2126...   -> 2126...
 */
export function formatMoroccanPhoneForWhatsApp(phone) {
    if (!phone) return null;

    // Supprime espaces, tirets, points, parenthèses et '+'
    let cleaned = phone.toString().replace(/[\s\.\-\(\)\+]/g, '');

    if (cleaned.startsWith('00212')) {
        cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        // Ex: 0611223344 -> 212611223344
        cleaned = '212' + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('6') || cleaned.startsWith('7') || cleaned.startsWith('5'))) {
        // Ex: 611223344 -> 212611223344
        cleaned = '212' + cleaned;
    }

    return cleaned;
}

/**
 * Construit l'URL WhatsApp avec le message de rappel officiel DentiCare :
 * "Bonjour [Prénom], rappel de votre rendez-vous au cabinet dentaire Dr. [Nom] le [Date] à [Heure]. Merci de confirmer votre présence. — Envoyé via DentiCare"
 */
export function buildWhatsAppReminderUrl({ phone, patientFirstName, dentistName, scheduledAt }) {
    const formattedPhone = formatMoroccanPhoneForWhatsApp(phone);
    if (!formattedPhone) return null;

    const dateObj = new Date(scheduledAt);
    
    // Date en français (ex: "lundi 16 novembre")
    const dateStr = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    // Heure en français (ex: "10h30" ou "14h00")
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}h${minutes}`;

    const doctor = dentistName || 'Sophie Martin';
    const firstName = patientFirstName ? patientFirstName.trim() : 'Patient';

    const message = `Bonjour ${firstName}, rappel de votre rendez-vous au cabinet dentaire Dr. ${doctor} le ${dateStr} à ${timeStr}. Merci de confirmer votre présence. — Envoyé via DentiCare`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

