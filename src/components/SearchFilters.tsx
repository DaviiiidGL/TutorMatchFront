import type { TutorFilters } from "../types";

interface SearchFiltersProps {
  filters: TutorFilters;
  subjects: string[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onClear: () => void;
  totalResults: number;
}

function SearchFilters({
  filters,
  subjects,
  onChange,
  onClear,
  totalResults,
}: SearchFiltersProps) {
  return (
    <section className="filters-panel">
      <div className="filters-panel__top">
        <div className="filters-panel__summary">
          <h2 className="filters-panel__title">Filtros</h2>
          <span className="filters-panel__results">
            {totalResults} resultado{totalResults !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="filter-clear-button"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="filters-grid filters-grid--compact">
        <div className="filter-field filter-field--search">
          <label htmlFor="search" className="filter-label">
            Buscar tutor
          </label>
          <input
            id="search"
            type="text"
            name="search"
            value={filters.search}
            onChange={onChange}
            placeholder="Nombre del profesor"
            className="filter-input"
          />
        </div>

        <div className="filter-field">
          <label htmlFor="subject" className="filter-label">
            Materia
          </label>
          <select
            id="subject"
            name="subject"
            value={filters.subject}
            onChange={onChange}
            className="filter-input"
          >
            <option value="">Todas las materias</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="minRating" className="filter-label">
            Calificación mínima
          </label>
          <select
            id="minRating"
            name="minRating"
            value={filters.minRating}
            onChange={onChange}
            className="filter-input"
          >
            <option value="">Cualquiera</option>
            <option value="3">3.0 o más</option>
            <option value="4">4.0 o más</option>
            <option value="4.5">4.5 o más</option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="hour" className="filter-label">
            Hora disponible
          </label>
          <input
            id="hour"
            type="time"
            name="hour"
            value={filters.hour}
            onChange={onChange}
            className="filter-input"
          />
        </div>

        <div className="filter-field filter-field--price-group">
          <div>
            <label htmlFor="minPrice" className="filter-label">
              Precio mín.
            </label>
            <input
              id="minPrice"
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={onChange}
              placeholder="0"
              min={0}
              className="filter-input"
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="filter-label">
              Precio máx.
            </label>
            <input
              id="maxPrice"
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={onChange}
              placeholder="50000"
              min={0}
              className="filter-input"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchFilters;