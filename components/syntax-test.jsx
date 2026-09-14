// syntax-test.jsx — archivo de prueba para visualizar el theme
// NO importar en producción

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "https://api.example.com/v1";
const MAX_RETRIES = 3;
const DEBOUNCE_MS = 300;

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// ─── Utility functions ────────────────────────────────────────────────────────

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function fetchProjects(page = 1, limit = 10) {
  const url = new URL(`${API_BASE}/projects`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", limit);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// ─── Custom hook ──────────────────────────────────────────────────────────────

function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const totalPages = useMemo(() => Math.ceil(total / 10), [total]);
  const canGoNext = page < totalPages;
  const canGoPrev = page > 1;

  const load = useCallback(async (targetPage) => {
    setStatus(STATUS.LOADING);
    setError(null);

    try {
      const result = await fetchProjects(targetPage);
      setData(result.items);
      setTotal(result.total);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setError(err.message);
      setStatus(STATUS.ERROR);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  return {
    page,
    data,
    total,
    totalPages,
    status,
    error,
    canGoNext,
    canGoPrev,
    next: () => setPage((p) => clamp(p + 1, 1, totalPages)),
    prev: () => setPage((p) => clamp(p - 1, 1, totalPages)),
    goTo: (n) => setPage(clamp(n, 1, totalPages)),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ variant = "default", children }) {
  const variants = {
    default: "badge--default",
    success: "badge--success",
    warning: "badge--warning",
    danger: "badge--danger",
  };

  return (
    <span className={`badge ${variants[variant] ?? variants.default}`}>
      {children}
    </span>
  );
}

function Skeleton({ width = "100%", height = 20, rounded = false }) {
  return (
    <div
      className={`skeleton ${rounded ? "skeleton--rounded" : ""}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

function ProjectCard({ project, onSelect, isSelected = false }) {
  const { id, title, description, tags = [], status, year } = project;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <article
      className={`project-card ${isSelected ? "project-card--selected" : ""}`}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Proyecto: ${title}`}
    >
      <header className="project-card__header">
        <h3 className="project-card__title">{title}</h3>
        <Badge variant={status === "active" ? "success" : "default"}>
          {status}
        </Badge>
      </header>

      <p className="project-card__description">{description}</p>

      <footer className="project-card__footer">
        <ul className="project-card__tags" aria-label="Tecnologías">
          {tags.map((tag) => (
            <li key={tag} className="project-card__tag">
              {tag}
            </li>
          ))}
        </ul>
        <time className="project-card__year" dateTime={`${year}`}>
          {year}
        </time>
      </footer>
    </article>
  );
}

function EmptyState({ message = "No hay resultados.", onReset }) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__message">{message}</p>
      {onReset && (
        <button className="btn btn--ghost" onClick={onReset} type="button">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, canGoNext, canGoPrev, next, prev, goTo }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        className="pagination__btn"
        onClick={prev}
        disabled={!canGoPrev}
        aria-label="Página anterior"
        type="button"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__page ${p === page ? "pagination__page--active" : ""}`}
          onClick={() => goTo(p)}
          aria-current={p === page ? "page" : undefined}
          type="button"
        >
          {p}
        </button>
      ))}

      <button
        className="pagination__btn"
        onClick={next}
        disabled={!canGoNext}
        aria-label="Página siguiente"
        type="button"
      >
        ›
      </button>
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectGallery({ initialFilter = "" }) {
  const [filter, setFilter] = useState(initialFilter);
  const [selectedId, setSelectedId] = useState(null);
  const searchRef = useRef(null);

  const {
    page,
    data,
    total,
    totalPages,
    status,
    error,
    canGoNext,
    canGoPrev,
    next,
    prev,
    goTo,
  } = usePagination(1);

  // Filtered projects (client-side, sobre los de la página actual)
  const filtered = useMemo(() => {
    if (!filter.trim()) return data;
    const q = filter.toLowerCase();
    return data.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [data, filter]);

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setFilter(value);
        setSelectedId(null);
      }, DEBOUNCE_MS),
    []
  );

  // Focus search on "/" keypress
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isLoading = status === STATUS.LOADING;
  const hasError = status === STATUS.ERROR;
  const isEmpty = !isLoading && !hasError && filtered.length === 0;

  return (
    <section className="project-gallery" aria-labelledby="gallery-heading">
      <header className="project-gallery__header">
        <h2 id="gallery-heading" className="project-gallery__title">
          Proyectos
          {total > 0 && (
            <span className="project-gallery__count" aria-label={`${total} proyectos`}>
              {total}
            </span>
          )}
        </h2>

        <label htmlFor="project-search" className="sr-only">
          Buscar proyectos
        </label>
        <input
          id="project-search"
          ref={searchRef}
          type="search"
          className="project-gallery__search"
          placeholder='Buscar… (presiona "/" para enfocar)'
          defaultValue={initialFilter}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Buscar proyectos"
        />
      </header>

      <div className="project-gallery__grid" role="list">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="project-card project-card--skeleton" role="listitem">
              <Skeleton height={24} width="60%" />
              <Skeleton height={16} />
              <Skeleton height={16} width="80%" />
            </div>
          ))}

        {hasError && (
          <div className="project-gallery__error" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isEmpty && (
          <EmptyState
            message={`Sin resultados para "${filter}"`}
            onReset={() => {
              setFilter("");
              if (searchRef.current) searchRef.current.value = "";
            }}
          />
        )}

        {!isLoading &&
          !hasError &&
          filtered.map((project) => (
            <div key={project.id} role="listitem">
              <ProjectCard
                project={project}
                onSelect={setSelectedId}
                isSelected={selectedId === project.id}
              />
            </div>
          ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          next={next}
          prev={prev}
          goTo={goTo}
        />
      )}
    </section>
  );
}
