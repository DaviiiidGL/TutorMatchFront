import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAcceptedBookings, getTutorAcceptedBookings } from '../api/bookings';
import { CalendarGrid } from '../components/CalendarGrid';
import type { Booking } from '../types';

// Lee el rol del JWT guardado en localStorage (mismo que usa client.ts para el token)
function getRoleFromToken(): 'tutor' | 'student' {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'student';
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role: string = payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? 'student';
    return role === 'tutor' ? 'tutor' : 'student';
  } catch {
    return 'student';
  }
}

function CalendarPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = getRoleFromToken();

  useEffect(() => {
    const fetch = role === 'tutor' ? getTutorAcceptedBookings : getAcceptedBookings;
    fetch()
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar el calendario'))
      .finally(() => setLoading(false));
  }, [role]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            ← Volver
          </button>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">Mi calendario</h1>
              <p className="mt-1 text-sm text-white/45">
                {role === 'tutor'
                  ? 'Sesiones que has aceptado con tus estudiantes.'
                  : 'Tus sesiones confirmadas con tutores.'}
              </p>
            </div>
            {bookings.length > 0 && (
              <span className="rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-sm font-semibold text-[#ff6a00]">
                {bookings.length} sesión{bookings.length > 1 ? 'es' : ''} confirmada{bookings.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="h-[520px] animate-pulse rounded-2xl border border-white/5 bg-[#161616]" />
        ) : bookings.length === 0 && !error ? (
          /* Empty state */
          <div className="rounded-2xl border border-white/5 bg-[#161616] px-4 py-20 text-center">
            <p className="text-4xl">📅</p>
            <h2 className="mt-4 text-lg font-semibold text-white">Sin sesiones confirmadas</h2>
            <p className="mt-1 text-sm text-white/40">
              {role === 'student'
                ? 'Cuando un tutor acepte tu reserva, aparecerá aquí.'
                : 'Cuando aceptes solicitudes de sesión, aparecerán aquí.'}
            </p>
            {role === 'student' && (
              <button
                onClick={() => navigate('/tutors')}
                className="mt-6 rounded-xl bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e85f00]"
              >
                Buscar tutores
              </button>
            )}
            {role === 'tutor' && (
              <button
                onClick={() => navigate('/tutor/reservas')}
                className="mt-6 rounded-xl bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e85f00]"
              >
                Ver solicitudes pendientes
              </button>
            )}
          </div>
        ) : (
          <CalendarGrid bookings={bookings} role={role} />
        )}

      </div>
    </main>
  );
}

export default CalendarPage;