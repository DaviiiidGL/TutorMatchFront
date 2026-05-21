import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTutorById } from '../api/tutor';
import ReservationForm from '../components/ReservationForm';
import type { Tutor } from '../types';

function ReservationPage() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tutorId) { setError('ID de tutor no válido'); setLoading(false); return; }
    getTutorById(Number(tutorId))
      .then(setTutor)
      .catch(err => setError(err instanceof Error ? err.message : 'Tutor no encontrado'))
      .finally(() => setLoading(false));
  }, [tutorId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] px-4 py-10">
        <div className="mx-auto max-w-lg space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-16 animate-pulse rounded-2xl border border-white/5 bg-[#161616]" />
          ))}
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] px-4 py-20 text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold text-white mb-2">Tutor no encontrado</h2>
          <p className="text-sm text-white/40 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tutors')}
            className="text-sm text-[#ff6a00] hover:underline"
          >
            ← Ver todos los tutores
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            ← Volver al perfil
          </button>
          <h1 className="text-3xl font-bold text-white">Reservar sesión</h1>
          <p className="mt-1 text-sm text-white/45">
            Con <span className="text-white font-semibold">{tutor.name}</span>
          </p>
        </header>

        {/* Info del tutor */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-[#161616] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff6a00]/15 text-lg font-bold text-[#ff6a00]">
            {tutor.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white">{tutor.name}</p>
            <p className="truncate text-xs text-white/40">
              {tutor.subjects.slice(0, 3).join(' · ')}
              {tutor.subjects.length > 3 && ` +${tutor.subjects.length - 3}`}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-sm font-semibold text-[#ff6a00]">
            ${tutor.pricePerHour.toLocaleString('es-CO')}/h
          </span>
        </div>

        {/* Form */}
        <ReservationForm tutor={tutor} />

      </div>
    </main>
  );
}

export default ReservationPage;