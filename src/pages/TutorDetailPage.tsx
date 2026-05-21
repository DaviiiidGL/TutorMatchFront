import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTutorById } from "../api/tutor";
import { getReviewsForTutor, type Review } from "../api/review"; // ← REQ 17
import type { Tutor } from "../types";

// ── REQ 17: helpers de rating ────────────────────────────────────────

function StarDisplay({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeCls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <span className={sizeCls}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "text-[#ff6a00]" : "text-white/15"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  return `Hace ${Math.floor(days / 365)} años`;
}

// Distribución de estrellas: cuántas reseñas tiene cada valor 1–5
function RatingDistribution({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {[5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="w-4 text-right text-xs text-white/40">{star}</span>
            <span className="text-xs text-[#ff6a00]">★</span>
            <div className="flex-1 overflow-hidden rounded-full bg-white/5 h-1.5">
              <div
                className="h-full rounded-full bg-[#ff6a00] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-4 text-xs text-white/30">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────

function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTutor,  setSelectedTutor]  = useState<Tutor | null>(null);
  const [isPageLoading,  setIsPageLoading]  = useState(true);
  const [hasPageError,   setHasPageError]   = useState(false);

  // ── REQ 17: reseñas reales ──
  const [reviews,        setReviews]        = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const loadTutorDetail = async () => {
      try {
        setIsPageLoading(true);
        setHasPageError(false);
        const tutorData = await getTutorById(Number(id));
        if (!tutorData) { setHasPageError(true); return; }
        setSelectedTutor(tutorData);
      } catch {
        setHasPageError(true);
      } finally {
        setIsPageLoading(false);
      }
    };
    loadTutorDetail();
  }, [id]);

  // ── REQ 17: carga reseñas en paralelo ──
  useEffect(() => {
    if (!id) return;
    getReviewsForTutor(Number(id))
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  // ── REQ 17: promedio calculado desde las reseñas reales ──
  const computedRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  // El rating a mostrar: preferimos el calculado del front si ya cargó,
  // sino usamos el que devuelve el back (tutor.rating del TutorProfile)
  const displayRating = computedRating ?? selectedTutor?.rating ?? 0;

  const tutorInitials = useMemo(() => {
    if (!selectedTutor?.name) return "";
    const nameParts = selectedTutor.name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }, [selectedTutor]);

  const backNavigationHandler = () => navigate("/tutors");

  if (isPageLoading) {
    return (
      <main className="tutor-profile-page">
        <section className="tutor-profile-state">
          <p className="tutor-profile-state__message">Cargando info del tutor</p>
        </section>
      </main>
    );
  }

  if (hasPageError || !selectedTutor) {
    return (
      <main className="tutor-profile-page">
        <section className="tutor-profile-state">
          <p className="tutor-profile-state__message">Tutor no encontrado (Aún)</p>
          <button type="button" onClick={backNavigationHandler}
            className="tutor-profile-state__button">
            Volver a los tutores
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="tutor-profile-page">
      <section className="tutor-profile-layout">
        <aside className="tutor-profile-sidebar">
          <div className="tutor-profile-summary-card">
            <div className="tutor-profile-avatar">
              <span className="tutor-profile-avatar__text">{tutorInitials}</span>
            </div>
            <div className="tutor-profile-identity">
              <h1 className="tutor-profile-identity__name">{selectedTutor.name}</h1>
              <span className="tutor-profile-identity__mode">{selectedTutor.modalidad}</span>
            </div>
            <p className="tutor-profile-summary-card__description">
              {selectedTutor.description}
            </p>
          </div>
        </aside>

        <section className="tutor-profile-content">

          {/* Materias — igual que antes */}
          <article className="tutor-profile-panel">
            <h2 className="tutor-profile-panel__title">Materias</h2>
            <div className="tutor-profile-subject-list">
              {selectedTutor.subjects.map((subject) => (
                <span key={subject} className="tutor-profile-subject-list__item">
                  {subject}
                </span>
              ))}
            </div>
          </article>

          {/* ── REQ 17: Rating con datos reales ── */}
          <article className="tutor-profile-panel">
            <h2 className="tutor-profile-panel__title">Rating</h2>

            {reviewsLoading ? (
              <div className="mt-2 h-8 w-40 animate-pulse rounded-lg bg-white/5" />
            ) : reviews.length === 0 ? (
              <div className="mt-2">
                <p className="text-sm text-white/40">Sin reseñas aún</p>
                <p className="mt-0.5 text-xs text-white/25">
                  Sé el primero en calificar a este tutor tras tu sesión
                </p>
              </div>
            ) : (
              <>
                {/* Número grande + estrellas */}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl font-bold text-white">
                    {displayRating.toFixed(1)}
                  </span>
                  <div>
                    <StarDisplay rating={displayRating} size="lg" />
                    <p className="mt-0.5 text-xs text-white/40">
                      {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
                    </p>
                  </div>
                </div>
                {/* Distribución 5→1 */}
                <RatingDistribution reviews={reviews} />
              </>
            )}
          </article>

          {/* Disponibilidad — igual que antes */}
          <article className="tutor-profile-panel">
            <h2 className="tutor-profile-panel__title">Disponibilidad</h2>
            <div className="tutor-profile-availability-list">
              {selectedTutor.disponibility.map((slot, index) => (
                <div
                  key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
                  className="tutor-profile-availability-list__item"
                >
                  <span className="tutor-profile-availability-list__day">{slot.day}</span>
                  <span className="tutor-profile-availability-list__time">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* ── REQ 17: Sección de reseñas reales ── */}
          <article className="tutor-profile-panel">
            <h2 className="tutor-profile-panel__title">
              Reseñas
              {!reviewsLoading && reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-white/30">
                  ({reviews.length})
                </span>
              )}
            </h2>

            {reviewsLoading ? (
              <div className="mt-3 space-y-3">
                {[1, 2].map(n => (
                  <div key={n} className="h-20 animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="mt-2 text-sm text-white/30">
                Aún no hay reseñas para este tutor.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {reviews.map(review => (
                  <div key={review.id}
                    className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                    {/* Cabecera: nombre + fecha + estrellas */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {review.studentName}
                        </p>
                        <p className="text-xs text-white/30">
                          {formatRelativeDate(review.createdAt)}
                        </p>
                      </div>
                      <StarDisplay rating={review.rating} size="sm" />
                    </div>
                    {/* Comentario */}
                    <p className="mt-2 text-sm text-white/60 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Reserva — igual que antes */}
          <article className="tutor-profile-panel tutor-profile-panel--highlight">
            <h2 className="tutor-profile-panel__title">Reserva</h2>
            <p className="tutor-profile-booking__price">
              ${selectedTutor.pricePerHour.toLocaleString("es-CO")} COP / hour
            </p>
            <div className="tutor-profile-booking__actions">
              <button type="button"
                onClick={() => navigate(`/reserva/${selectedTutor.id}`)}
                className="tutor-profile-booking__button">
                Reserva la sesión
              </button>
              <button type="button"
                onClick={backNavigationHandler}
                className="tutor-profile-booking__secondary-button">
                Vuelve a todos los tutores
              </button>
            </div>
          </article>

        </section>
      </section>
    </main>
  );
}

export default TutorDetailPage;