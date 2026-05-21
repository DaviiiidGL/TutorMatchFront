import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingBookings, acceptBooking, rejectBooking } from '../api/bookings';
import { CountdownBadge } from '../components/CountdownBadge';
import type { Booking, BookingStatus } from '../types';

const MODALITY_LABEL = {
  online: 'Online',
  'in-person': 'Presencial',
  both: 'Ambas',
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  accepted:  'border-green-500/30 bg-green-500/10 text-green-400',
  rejected:  'border-red-500/30 bg-red-500/10 text-red-400',
  expired:   'border-white/10 bg-white/5 text-white/30',
  cancelled: 'border-white/10 bg-white/5 text-white/30',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending:   'Pendiente',
  accepted:  'Aceptada',
  rejected:  'Rechazada',
  expired:   'Expirada',
  cancelled: 'Cancelada',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function TutorBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setPageError('');
    try {
      const data = await getPendingBookings();
      setBookings(data);
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    setActionLoading(id);
    setActionError('');
    try {
      const updated = action === 'accept'
        ? await acceptBooking(id)
        : await rejectBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExpired = (id: number) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'expired' as BookingStatus } : b)
    );
  };

  const pending   = bookings.filter(b => b.status === 'pending');
  const resolved  = bookings.filter(b => b.status !== 'pending');

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            ← Volver
          </button>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Solicitudes de sesión</h1>
              <p className="mt-1 text-sm text-white/45">
                Acepta o rechaza antes de que el tiempo expire.
              </p>
            </div>
            {pending.length > 0 && (
              <span className="shrink-0 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-400">
                {pending.length} pendiente{pending.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        {/* Error global */}
        {(pageError || actionError) && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {pageError || actionError}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-40 animate-pulse rounded-2xl border border-white/5 bg-[#161616]" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#161616] px-4 py-16 text-center">
            <p className="text-4xl">📭</p>
            <h2 className="mt-4 text-lg font-semibold text-white">Sin solicitudes</h2>
            <p className="mt-1 text-sm text-white/40">
              Cuando un estudiante reserva contigo, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ─── Pendientes ─── */}
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/35">
                  Pendientes — responde antes de que expire
                </h2>
                <div className="flex flex-col gap-3">
                  {pending.map(booking => (
                    <article
                      key={booking.id}
                      className="rounded-2xl border border-yellow-500/15 bg-[#161616] p-5 transition hover:border-yellow-500/25"
                    >
                      {/* Top row */}
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{booking.studentName}</p>
                          <p className="text-xs text-white/40">{booking.subject} · {MODALITY_LABEL[booking.modality]} · {booking.durationMinutes} min</p>
                        </div>
                        <CountdownBadge
                          expiresAt={booking.expiresAt}
                          onExpired={() => handleExpired(booking.id)}
                        />
                      </div>

                      {/* Fecha */}
                      <div className="mb-4 rounded-xl border border-white/5 bg-[#111111] px-4 py-3">
                        <p className="text-xs text-white/35">Sesión solicitada para</p>
                        <p className="mt-0.5 text-sm font-medium text-white">{formatDate(booking.scheduledAt)}</p>
                      </div>

                      {/* Notas */}
                      {booking.notes && (
                        <p className="mb-4 text-sm italic text-white/40">
                          "{booking.notes}"
                        </p>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(booking.id, 'reject')}
                          disabled={actionLoading === booking.id}
                          className="flex-1 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/5 disabled:opacity-40"
                        >
                          {actionLoading === booking.id ? '...' : 'Rechazar'}
                        </button>
                        <button
                          onClick={() => handleAction(booking.id, 'accept')}
                          disabled={actionLoading === booking.id}
                          className="flex-1 rounded-xl bg-[#ff6a00] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:opacity-40"
                        >
                          {actionLoading === booking.id ? 'Procesando...' : 'Aceptar'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Resueltas ─── */}
            {resolved.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/35">
                  Historial
                </h2>
                <div className="flex flex-col gap-3">
                  {resolved.map(booking => (
                    <article
                      key={booking.id}
                      className="rounded-2xl border border-white/5 bg-[#161616] p-5 opacity-70"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{booking.studentName}</p>
                          <p className="text-xs text-white/40">{booking.subject} · {formatDate(booking.scheduledAt)}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
                          {STATUS_LABEL[booking.status]}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </main>
  );
}

export default TutorBookingsPage;