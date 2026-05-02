import { Link } from "react-router-dom";
import type { Tutor } from "../types";

interface TutorCardProps {
  tutor: Tutor;
}

function TutorCard({ tutor }: TutorCardProps) {
  const modeLabelMap: Record<Tutor["modalidad"], string> = {
    online: "Online",
    "in-person": "Presencial",
    both: "Ambas",
  };

  const modeBadgeClassMap: Record<Tutor["modalidad"], string> = {
    online: "tutor-card__mode-badge tutor-card__mode-badge--online",
    "in-person": "tutor-card__mode-badge tutor-card__mode-badge--in-person",
    both: "tutor-card__mode-badge tutor-card__mode-badge--both",
  };

  const ratingClassName =
    tutor.rating >= 4.5
      ? "tutor-card__meta-item tutor-card__meta-item--rating-high"
      : tutor.rating >= 4.0
      ? "tutor-card__meta-item tutor-card__meta-item--rating-medium"
      : "tutor-card__meta-item tutor-card__meta-item--rating-low";

  return (
    <article className="tutor-card">
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
          tutor.name
        )}&background=1f1f1f&color=ff6a00&size=128`}
        alt={tutor.name}
        width={80}
        height={80}
        loading="lazy"
        className="tutor-card__image"
      />

      <div className="tutor-card__content">
        <div className="tutor-card__top">
          <h3 className="tutor-card__name">{tutor.name}</h3>
          <span className={modeBadgeClassMap[tutor.modalidad]}>
            {modeLabelMap[tutor.modalidad]}
          </span>
        </div>

        <div className="tutor-card__subjects">
          {tutor.subjects.map((subject) => (
            <span key={subject} className="tutor-card__subject-tag">
              {subject}
            </span>
          ))}
        </div>

        <p className="tutor-card__description">{tutor.description}</p>

        <div className="tutor-card__meta">
          <span className={ratingClassName}>⭐ {tutor.rating.toFixed(1)}</span>
          <span className="tutor-card__meta-item tutor-card__meta-item--price">
            ${tutor.pricePerHour.toLocaleString("es-CO")}/h
          </span>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            Horarios disponibles
          </p>

          <div className="tutor-card__schedule">
            {tutor.disponibility.length > 0 ? (
              tutor.disponibility.slice(0, 2).map((slot, index) => (
                <span
                  key={`${slot.day}-${slot.startTime}-${index}`}
                  className="tutor-card__schedule-tag"
                >
                  {slot.day} · {slot.startTime} - {slot.endTime}
                </span>
              ))
            ) : (
              <span className="tutor-card__schedule-tag">
                Sin horarios disponibles
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="tutor-card__action">
        <Link to={`/tutors/${tutor.id}`} className="tutor-card__button">
          Ver perfil
        </Link>
      </div>
    </article>
  );
}

export default TutorCard;