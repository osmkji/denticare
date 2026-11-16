import AppointmentModal from '@/Components/AppointmentModal';

export default function QuickAppointmentModal({ show, onClose, patients = [], dentists = [] }) {
    return (
        <AppointmentModal
            show={show}
            onClose={onClose}
            patients={patients}
            dentists={dentists}
        />
    );
}
