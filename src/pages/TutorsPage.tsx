import { useEffect, useMemo, useState } from "react";
import SearchFilters from "../components/SearchFilters";
import TutorCard from "../components/TutorCard";
import { getTutors } from "../api/tutor";
import type { Tutor, TutorFilters } from "../types";

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
    return tutors.filter((tutor) => {
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
  }, [tutors, filters]);

  return (
    <main className="tutors-page">
      <div className="tutors-page__container">
        <header className="tutors-page__header">
          <h1 className="tutors-page__title">Busca Tutores</h1>
          <p className="tutors-page__subtitle">
            Filtra por nombre, materias, calificación, horarios disponibles y rango de
            precios.
          </p>
        </header>

        <SearchFilters
          filters={filters}
          subjects={availableSubjects}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          totalResults={filteredTutors.length}
        />

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