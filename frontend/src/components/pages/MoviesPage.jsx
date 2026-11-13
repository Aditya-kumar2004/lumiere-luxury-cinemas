import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  SlidersHorizontal,
  Flame,
  Star,
  Film,
  Calendar,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/cine/PageHeader";
import MovieCard from "@/components/cine/MovieCard";
import { useMovies } from "@/hooks/useMovies";
import { GENRES } from "@/data/movies";

const Route = getRouteApi("/movies/");

const QUICK_TAGS = ["Avengers", "Spider-Man", "Sci-Fi", "Action", "Horror"];

export default function MoviesPage() {
  const {
    q = "",
    genre = "All Movies",
    status = "all",
    sort = "rating",
  } = Route.useSearch();
  const navigate = useNavigate({ from: "/movies/" });
  const { movies } = useMovies();

  const update = (patch) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const clearAllFilters = () => {
    navigate({
      search: {
        q: undefined,
        genre: undefined,
        status: undefined,
        sort: undefined,
      },
      replace: true,
    });
  };

  // Genre counts mapping
  const genreCounts = useMemo(() => {
    const counts = { "All Movies": movies.length };
    for (const g of GENRES) {
      if (g === "All Movies") continue;
      counts[g] = movies.filter((m) => m.genres?.includes(g)).length;
    }
    return counts;
  }, [movies]);

  // Overall counts for status tabs
  const stats = useMemo(() => {
    const now = movies.filter((m) => m.status === "now").length;
    const soon = movies.filter((m) => m.status === "soon").length;
    const topRated = movies.filter((m) => (m.rating || 0) >= 8.0).length;
    return { now, soon, topRated, total: movies.length };
  }, [movies]);

  // Filtering & Sorting
  const filteredMovies = useMemo(() => {
    const term = q.trim().toLowerCase();

    const filtered = movies.filter((m) => {
      if (term) {
        const matchesTitle = m.title?.toLowerCase().includes(term);
        const matchesGenre = m.genres?.some((g) => g.toLowerCase().includes(term));
        const matchesDesc = m.description?.toLowerCase().includes(term);
        const matchesLang = m.language?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesGenre && !matchesDesc && !matchesLang) {
          return false;
        }
      }

      if (genre && genre !== "All Movies") {
        if (!m.genres?.includes(genre)) return false;
      }

      if (status === "now" && m.status !== "now") return false;
      if (status === "soon" && m.status !== "soon") return false;
      if (status === "top" && (m.rating || 0) < 8.0) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "year") return (b.year || 0) - (a.year || 0);
      return 0;
    });
  }, [movies, q, genre, status, sort]);

  const hasActiveFilters = Boolean(
    q || (genre && genre !== "All Movies") || (status && status !== "all") || (sort && sort !== "rating"),
  );

  return (
    <>
      <PageHeader
        centered
        eyebrow="LUMIÈRE CINEMATHEQUE"
        title="ALL MOVIES"
        subtitle="Explore critically acclaimed premieres, current blockbusters, and upcoming cinematic releases."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Movies" },
        ]}
      >
        {/* Refined Cinema Search Bar */}
        <div className="w-full max-w-xl">
          <div className="relative flex items-center rounded-full border border-border/90 bg-card/85 px-4 shadow-lg backdrop-blur-md transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              value={q}
              onChange={(e) => update({ q: e.target.value || undefined })}
              placeholder="Search movies by title, genre, director or star..."
              aria-label="Search movies"
              className="h-11 w-full bg-transparent px-3 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button
                type="button"
                onClick={() => update({ q: undefined })}
                aria-label="Clear search"
                className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-primary/90 flex items-center gap-1 text-[11px]">
              <Sparkles className="h-3 w-3" /> Trending:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => update({ q: tag })}
                className="rounded-full border border-border/80 bg-card/60 px-3 py-0.5 text-[11px] font-medium transition hover:border-primary/60 hover:bg-card hover:text-primary active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <div className="container-cine py-6">
        {/* Clean, Simple & Professional Cinema Discovery Toolbar */}
        <div className="mb-6 rounded-2xl border border-border/80 bg-card/60 p-3.5 sm:p-4.5 shadow-sm backdrop-blur-md">
          {/* Row 1: Release Status Segmented Control & Sort Dropdown */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Status Filter Tabs (Distinct "All Releases" label prevents duplicate "All Movies") */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5" role="tablist">
              {[
                { id: "all", label: "All Releases", count: stats.total, icon: Film },
                { id: "now", label: "Now Showing", count: stats.now, icon: Flame, pulse: true },
                { id: "soon", label: "Coming Soon", count: stats.soon, icon: Calendar },
                { id: "top", label: "Top Rated (8.0+)", count: stats.topRated, icon: Star },
              ].map(({ id, label, count, icon: Icon, pulse }) => {
                const active = (status || "all") === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => update({ status: id === "all" ? undefined : id })}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border/70 bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                    {pulse && !active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        active ? "bg-black/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground self-end lg:self-auto">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              <span>Sort:</span>
              <select
                value={sort || "rating"}
                onChange={(e) => update({ sort: e.target.value === "rating" ? undefined : e.target.value })}
                className="rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary"
                aria-label="Sort movies"
              >
                <option value="rating">Highest Rated (IMDb)</option>
                <option value="title">Title (A to Z)</option>
                <option value="year">Newest First</option>
              </select>
            </div>
          </div>

          {/* Row 2: Genre Filter Chips (Labeled "All Genres" for clarity) */}
          <div className="mt-3 border-t border-border/60 pt-3">
            <div
              className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
              role="tablist"
              aria-label="Filter by genre"
            >
              {GENRES.map((g) => {
                const isAll = g === "All Movies";
                const displayLabel = isAll ? "All Genres" : g;
                const active = isAll ? !genre || genre === "All Movies" : genre === g;
                const count = isAll ? stats.total : (genreCounts[g] ?? 0);

                return (
                  <button
                    key={g}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => update({ genre: isAll ? undefined : g })}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/80 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <span>{displayLabel}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        active ? "bg-black/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filters Summary Strip */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-primary">Active Filters:</span>
              {q && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-card px-2.5 py-0.5 text-foreground font-medium shadow-xs">
                  <span>Search: "{q}"</span>
                  <button
                    type="button"
                    onClick={() => update({ q: undefined })}
                    aria-label="Remove search"
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {genre && genre !== "All Movies" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-card px-2.5 py-0.5 text-foreground font-medium shadow-xs">
                  <span>Genre: {genre}</span>
                  <button
                    type="button"
                    onClick={() => update({ genre: undefined })}
                    aria-label="Remove genre"
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {status && status !== "all" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-card px-2.5 py-0.5 text-foreground font-medium shadow-xs">
                  <span>
                    Status: {status === "now" ? "Now Showing" : status === "soon" ? "Coming Soon" : "Top Rated"}
                  </span>
                  <button
                    type="button"
                    onClick={() => update({ status: undefined })}
                    aria-label="Remove status"
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                Showing <strong className="text-foreground">{filteredMovies.length}</strong> of {movies.length} films
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-primary transition hover:bg-primary/10"
              >
                <RotateCcw className="h-3 w-3" /> Reset All
              </button>
            </div>
          </div>
        )}

        {/* Movie Results */}
        {filteredMovies.length === 0 ? (
          <div className="my-8 grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
            <Film className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-display text-2xl tracking-wide text-foreground">
              No matching movies found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search query or selecting a different genre.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-gold mt-4 !py-2 !text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
                {status === "soon"
                  ? "Upcoming Premieres"
                  : status === "now"
                    ? "Now In Theatres"
                    : status === "top"
                      ? "Top Rated Movies"
                      : genre && genre !== "All Movies"
                        ? `${genre} Movies`
                        : "Now Showing"}
                <span className="ml-2.5 text-base font-normal text-muted-foreground">
                  ({filteredMovies.length})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5 2xl:grid-cols-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} variant="full" />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
