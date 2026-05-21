import { useState, useEffect } from 'react';
import {
  submitReview,
  getMyReviewForBooking,
  type CreateReviewDTO,
  type Review,
} from '../api/review';

interface Props {
  bookingId: number;
  tutorId: number;
  tutorName: string;
}

function StarButton({
  index, filled, hovered, onClick, onEnter, onLeave,
}: {
  index: number; filled: boolean; hovered: boolean;
  onClick: () => void; onEnter: () => void; onLeave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={`${index} estrella${index > 1 ? 's' : ''}`}
      className="text-3xl transition-transform hover:scale-110 active:scale-95 focus:outline-none"
    >
      <span className={filled || hovered ? 'text-[#ff6a00]' : 'text-white/15'}>★</span>
    </button>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: 'Muy mala experiencia',
  2: 'Podría mejorar',
  3: 'Estuvo bien',
  4: 'Muy buena sesión',
  5: '¡Excelente tutor!',
};

export function ReviewForm({ bookingId, tutorId, tutorName }: Props) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState<Review | null>(null);
  const [loading,   setLoading]   = useState(true);

  // Verifica si ya calificó esta sesión
  useEffect(() => {
    getMyReviewForBooking(bookingId)
      .then(existing => { if (existing) setSubmitted(existing); })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Selecciona una calificación'); return; }
    if (comment.trim().length < 10) { setError('Escribe al menos 10 caracteres'); return; }

    setSubmitting(true);
    setError('');

    const dto: CreateReviewDTO = { bookingId, tutorId, rating, comment: comment.trim() };

    try {
      const review = await submitReview(dto);
      setSubmitted(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-5 h-40 animate-pulse rounded-2xl border border-white/5 bg-[#161616]" />
    );
  }

  // Estado: ya calificó
  if (submitted) {
    return (
      <section className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-400">¡Calificación enviada!</p>
            <p className="text-xs text-white/40">Tu reseña ayuda a otros estudiantes</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#111111] p-4">
          {/* Estrellas enviadas */}
          <div className="mb-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={`text-lg ${i <= submitted.rating ? 'text-[#ff6a00]' : 'text-white/15'}`}>
                ★
              </span>
            ))}
            <span className="ml-2 text-xs text-white/40">{RATING_LABELS[submitted.rating]}</span>
          </div>
          <p className="text-sm text-white/70">"{submitted.comment}"</p>
        </div>
      </section>
    );
  }

  // Estado: formulario
  const displayRating = hovered || rating;

  return (
    <section className="mt-5 rounded-2xl border border-white/5 bg-[#161616] p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#ff6a00]">
        Califica tu sesión
      </h2>
      <p className="mb-5 text-sm text-white/50">
        ¿Cómo fue tu experiencia con <span className="text-white">{tutorName}</span>?
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Estrellas */}
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <StarButton
                key={i}
                index={i}
                filled={i <= rating}
                hovered={i <= hovered && hovered > 0}
                onClick={() => { setRating(i); setError(''); }}
                onEnter={() => setHovered(i)}
                onLeave={() => setHovered(0)}
              />
            ))}
            {displayRating > 0 && (
              <span className="ml-3 text-sm text-white/50 transition-all">
                {RATING_LABELS[displayRating]}
              </span>
            )}
          </div>
        </div>

        {/* Comentario */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">
            Comentario
            <span className="ml-1 text-white/25 font-normal">(mínimo 10 caracteres)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => { setComment(e.target.value); setError(''); }}
            rows={4}
            maxLength={500}
            placeholder="Cuéntanos cómo fue la sesión, la puntualidad del tutor, si el tema quedó claro..."
            className={`w-full resize-none rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:ring-2 ${
              error && error.includes('caracteres')
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 focus:border-[#ff6a00] focus:ring-[#ff6a00]/20'
            }`}
          />
          <div className="mt-1 flex justify-between">
            {error && error.includes('caracteres')
              ? <p className="text-xs text-red-400">{error}</p>
              : <span />
            }
            <p className={`ml-auto text-xs ${comment.length < 10 ? 'text-white/20' : 'text-white/40'}`}>
              {comment.length}/500
            </p>
          </div>
        </div>

        {/* Error de rating */}
        {error && error.includes('calificación') && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        {/* Error de submit */}
        {error && !error.includes('caracteres') && !error.includes('calificación') && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0 || comment.trim().length < 10}
          className="w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Enviar calificación'}
        </button>

      </form>
    </section>
  );
}

export default ReviewForm;