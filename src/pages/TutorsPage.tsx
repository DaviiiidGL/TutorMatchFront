import { useEffect, useMemo, useState } from "react";
import SearchFilters from "../components/SearchFilters";
import TutorCard from "../components/TutorCard";
import { getTutors } from "../api/tutor";
import type { Tutor, TutorFilters } from "../types";
import { useNavigate } from "react-router-dom";

const EMPTY_FILTERS: TutorFilters = {
  search: "",
  subject: "",
  minRating: "",
  hour: "",
  minPrice: "",
  maxPrice: "",
};

function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<TutorFilters>(EMPTY_FILTERS);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTutors = async () => {
      try {
        const tutorsResponse = await getTutors();
        setTutors(tutorsResponse);
      } catch {
        setErrorMessage("No se pudieron cargar los tutores. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTutors();
  }, []);

  const availableSubjects = useMemo(() => {
    const subjectList = tutors.flatMap((tutor) => tutor.subjects);
    return [...new Set(subjectList)].sort();
  }, [tutors]);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const filteredTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      // ── REQ 18: ocultar tutores marcados como hidden por el back ──
      if (tutor.isHidden) return false;

      const matchesSearch =
        !filters.search ||
        tutor.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesSubject =
        !filters.subject || tutor.subjects.includes(filters.subject);

      const matchesRating =
        !filters.minRating || tutor.rating >= Number(filters.minRating);

      const matchesHour =
        !filters.hour ||
        tutor.disponibility.some((slot) => {
          return filters.hour >= slot.startTime && filters.hour <= slot.endTime;
        });

      const matchesMinPrice =
        !filters.minPrice || tutor.pricePerHour >= Number(filters.minPrice);

      const matchesMaxPrice =
        !filters.maxPrice || tutor.pricePerHour <= Number(filters.maxPrice);

      return (
        matchesSearch &&
        matchesSubject &&
        matchesRating &&
        matchesHour &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    // ── REQ 18: tutores penalizados van al final, el resto mantiene orden original ──
    return filtered.sort((a, b) => {
      const aPenalty = a.penaltyScore ?? 0;
      const bPenalty = b.penaltyScore ?? 0;
      return aPenalty - bPenalty;
    });
  }, [tutors, filters]);

  // ── REQ 18: cuántos tutores penalizados hay en los resultados actuales ──
  const penalizedCount = useMemo(
    () => filteredTutors.filter((t) => (t.penaltyScore ?? 0) > 0).length,
    [filteredTutors]
  );

  return (
    <main className="tutors-page">
      <div className="tutors-page__container">
        <header className="tutors-page__header">
          <h1 className="tutors-page__title">Busca Tutores</h1>
          <p className="tutors-page__subtitle">
            Filtra por nombre, materias, calificación, horarios disponibles y
            rango de precios.
          </p>
        </header>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/mensajes")}
            className="tutor-card__button mb-8"
          >
            💬 Mensajes
          </button>
          <button
            onClick={() => navigate("/calendario")}
            className="tutor-card__button mb-8"
          >
            📅 Mi Calendario
          </button>
        </div>

        <SearchFilters
          filters={filters}
          subjects={availableSubjects}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          totalResults={filteredTutors.length}
        />

        {/* ── REQ 18: aviso si hay tutores penalizados en los resultados ── */}
        {!isLoading && penalizedCount > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
            <span className="mt-0.5 text-sm">⚠️</span>
            <p className="text-xs text-orange-300/80">
              {penalizedCount === 1
                ? "1 tutor en estos resultados tiene una alta tasa de cancelación. Aparece al final de la lista."
                : `${penalizedCount} tutores en estos resultados tienen una alta tasa de cancelación. Aparecen al final de la lista.`}
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && tutors.length > 0 && (
          <div className="tutors-list__header">
            <span>Foto</span>
            <span>Información del tutor</span>
            <span className="text-right">Acción</span>
          </div>
        )}

        <section className="tutors-list" aria-label="Lista de tutores">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="loading-card" />
              ))}
            </div>
          )}

          {errorMessage && (
            <div className="status-box status-box--error">{errorMessage}</div>
          )}

          {!isLoading && !errorMessage && filteredTutors.length === 0 && (
            <div className="status-box status-box--empty">
              <p className="text-2xl">🔍</p>
              <p className="mt-2 font-semibold text-white">Sin resultados</p>
              <p className="mt-1 text-sm text-slate-400">
                Nos estás pidiendo mucho. Intenta cambiando los filtros.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="tutor-card__button mt-4"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
        </section>
      </div>
    </main>
  );
}

export default TutorsPage;