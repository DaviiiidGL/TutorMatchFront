import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTutorById } from "../api/tutor";
import type { Tutor } from "../types";

function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasPageError, setHasPageError] = useState(false);

  useEffect(() => {
    const loadTutorDetail = async () => {
      try {
        setIsPageLoading(true);
        setHasPageError(false);

        const tutorData = await getTutorById(Number(id));

        if (!tutorData) {
          setHasPageError(true);
          return;
        }

        setSelectedTutor(tutorData);
      } catch (error) {
        setHasPageError(true);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadTutorDetail();
  }, [id]);

  const tutorInitials = useMemo(() => {
    if (!selectedTutor?.name) return "";

    const nameParts = selectedTutor.name.trim().split(" ");

    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }

    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }, [selectedTutor]);

  const bookingNavigationHandler = () => {
    if (!selectedTutor) return;
    navigate(`/booking/${selectedTutor.id}`);
  };

  const backNavigationHandler = () => {
    navigate("/tutors");
  };

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
          <button
            type="button"
            onClick={backNavigationHandler}
            className="tutor-profile-state__button"
          >
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
              <span className="tutor-profile-identity__mode">
                {selectedTutor.modalidad}
              </span>
            </div>

            <p className="tutor-profile-summary-card__description">
              {selectedTutor.description}
            </p>
          </div>
        </aside>

        <section className="tutor-profile-content">
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

          <article className="tutor-profile-panel">
            <h2 className="tutor-profile-panel__title">Rating</h2>
            <div className="tutor-profile-rating">
              <span className="tutor-profile-rating__stars">
                {"★".repeat(Math.round(selectedTutor.rating))}
                {"☆".repeat(5 - Math.round(selectedTutor.rating))}
              </span>
              <span className="tutor-profile-rating__value">
                {selectedTutor.rating} / 5
              </span>
            </div>
          </article>

          <article className="tutor-profile-panel">
            <h2 className="tutor-profile-panel__title">Disponibilidad</h2>
            <div className="tutor-profile-availability-list">
              {selectedTutor.disponibility.map((slot, index) => (
                <div
                  key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
                  className="tutor-profile-availability-list__item"
                >
                  <span className="tutor-profile-availability-list__day">
                    {slot.day}
                  </span>
                  <span className="tutor-profile-availability-list__time">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="tutor-profile-panel tutor-profile-panel--highlight">
            <h2 className="tutor-profile-panel__title">Reserva</h2>
            <p className="tutor-profile-booking__price">
              ${selectedTutor.pricePerHour.toLocaleString("es-CO")} COP / hour
            </p>

            <div className="tutor-profile-booking__actions">
              <button
                type="button"
                onClick={() => navigate(`/reserva/${selectedTutor.id}`)}
                className="tutor-profile-booking__button"
              >
                Reserva la sesión
              </button>

              <button
                type="button"
                onClick={backNavigationHandler}
                className="tutor-profile-booking__secondary-button"
              >
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