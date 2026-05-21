import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyBookings } from '../api/booking';
import { CountdownBadge } from '../components/CountdownBadge';
import { ReviewForm } from '../components/ReviewForm';  // ← NUEVO
import type { Booking, BookingStatus } from '../types';

const MODALITY_LABEL = {
  online: 'Online',
  'in-person': 'Presencial',
  both: 'Ambas',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { emoji: string; label: string; desc: string; color: string }
> = {
  pending: {
    emoji: '⏳',
    label: 'Esperando respuesta',
    desc: 'El tutor tiene hasta el tiempo indicado para aceptar o rechazar tu solicitud.',
    color: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
  },
  accepted: {
    emoji: '✅',
    label: '¡Sesión confirmada!',
    desc: 'El tutor aceptó tu solicitud. Prepárate para la sesión.',
    color: 'border-green-500/20 bg-green-500/5 text-green-400',
  },
  rejected: {
    emoji: '❌',
    label: 'Solicitud rechazada',
    desc: 'El tutor no pudo aceptar tu solicitud. Puedes buscar otro tutor.',
    color: 'border-red-500/20 bg-red-500/5 text-red-400',
  },
  expired: {
    emoji: '⏰',
    label: 'Tiempo expirado',
    desc: 'El tutor no respondió a tiempo. La solicitud fue cancelada automáticamente.',
    color: 'border-white/10 bg-white/5 text-white/40',
  },
  cancelled: {
    emoji: '🚫',
    label: 'Cancelada',
    desc: 'Esta reserva fue cancelada.',
    color: 'border-white/10 bg-white/5 text-white/40',
  },
  // ── REQ 16 ──────────────────────────────────────────────
  completed: {
    emoji: '🎓',
    label: '¡Sesión completada!',
    desc: 'La sesión finalizó exitosamente. ¡Cuéntanos cómo te fue!',
    color: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  },
};

function TutorBookingsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyBookings()
      .then(list => {
        const found = list.find(b => b.id.toString() === bookingId);
        if (!found) setError('Reserva no encontrada');
        else setBooking(found);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleExpired = () => {
    setBooking(prev => prev ? { ...prev, status: 'expired' } : prev);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] px-4 py-10">
        <div className="mx-auto max-w-lg">
          <div className="h-64 animate-pulse rounded-2xl border border-white/5 bg-[#161616]" />
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-white/50">{error || 'Reserva no encontrada'}</p>
          <button onClick={() => navigate('/tutors')} className="mt-6 text-sm text-[#ff6a00] hover:underline">
            ← Ver tutores
          </button>
        </div>
      </main>
    );
  }

  const config = STATUS_CONFIG[booking.status];

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-white">Estado de tu reserva</h1>
          <p className="mt-1 text-sm text-white/45">
            Con <span className="text-white">{booking.tutorName}</span>
          </p>
        </header>

        {/* Status card */}
        <section className={`mb-5 rounded-2xl border p-6 ${config.color}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.emoji}</span>
            <div>
              <p className="font-bold text-lg">{config.label}</p>
              <p className="mt-0.5 text-sm opacity-80">{config.desc}</p>
            </div>
          </div>
        </section>

        {/* Countdown */}
        {booking.status === 'pending' && (
          <section className="mb-5 rounded-2xl border border-white/5 bg-[#161616] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Tiempo límite del tutor</p>
                <p className="mt-0.5 text-xs text-white/30">
                  Si no responde, la solicitud expira automáticamente
                </p>
              </div>
              <CountdownBadge expiresAt={booking.expiresAt} onExpired={handleExpired} />
            </div>
          </section>
        )}

        {/* Detalle */}
        <section className="rounded-2xl border border-white/5 bg-[#161616] p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#ff6a00]">
            Detalle de la sesión
          </h2>
          <div className="space-y-3">
            <Row label="Tutor" value={booking.tutorName} />
            <Row label="Materia" value={booking.subject} />
            <Row label="Fecha y hora" value={formatDate(booking.scheduledAt)} />
            <Row label="Duración" value={`${booking.durationMinutes} minutos`} />
            <Row label="Modalidad" value={MODALITY_LABEL[booking.modality]} />
            {booking.notes && <Row label="Notas" value={booking.notes} />}
          </div>
        </section>

        {/* Acciones por estado */}
        {(booking.status === 'rejected' || booking.status === 'expired') && (
          <button
            onClick={() => navigate('/tutors')}
            className="mt-5 w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00]"
          >
            Buscar otro tutor
          </button>
        )}

        {booking.status === 'accepted' && (
          <button
            onClick={() => navigate('/calendario')}
            className="mt-5 w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00]"
          >
            Ver en mi calendario →
          </button>
        )}

        {/* ── REQ 16: Formulario de review solo si la sesión está completada ── */}
        {booking.status === 'completed' && (
          <ReviewForm
            bookingId={booking.id}
            tutorId={booking.tutorId}
            tutorName={booking.tutorName}
          />
        )}

      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default TutorBookingsPage;