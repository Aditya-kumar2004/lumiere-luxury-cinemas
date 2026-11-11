import { useMemo } from "react";
import { getRouteApi, useNavigate, Link } from "@tanstack/react-router";
import {
  Search,
  X,
  SlidersHorizontal,
  Flame,
  Star,
  Film,
  Calendar,
  RotateCcw,
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

  // Overall counts
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
        eyebrow="LUMIÈRE CINEMATHEQUE"
        title="ALL MOVIES"
        subtitle="Search by title, actor, or genre to find your next big-screen night."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Movies" },
        ]}
      >
        {/* Long, Full-Width Search Input Box */}
        <div className="w-full">
          <div className="relative flex items-center rounded-xl border border-border/80 bg-card/90 shadow-md backdrop-blur-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="ml-4 h-4.5 w-4.5 shrink-0 text-primary" />
            <input
              value={q}
              onChange={(e) => update({ q: e.target.value || undefined })}
              placeholder="Search movies by title, genre, director or star (e.g. Avengers, Nolan, Sci-Fi)..."
              aria-label="Search movies"
              className="h-11.5 w-full bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button
                type="button"
                onClick={() => update({ q: undefined })}
                aria-label="Clear search"
                className="mr-2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Search Chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Quick Search:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => update({ q: tag })}
                className="rounded-full border border-border/80 bg-card/60 px-2.5 py-0.5 text-[11px] transition hover:border-primary/50 hover:bg-card hover:text-primary active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      {/* Reduced Spacing Container */}
      <div className="container-cine py-6">
        {/* Simple & Clear Filter Section */}
        <div className="mb-5 rounded-xl border border-border/80 bg-card/50 p-3.5 backdrop-blur-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Status Filter Tabs */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5" role="tablist">
              {[
                { id: "all", label: "All Movies", count: stats.total, icon: Film },
                { id: "now", label: "Now Showing", count: stats.now, icon: Flame, pulse: true },
                { id: "soon", label: "Coming Soon", count: stats.soon, icon: Calendar },
                { id: "top", label: "Top Rated", count: stats.topRated, icon: Star },
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

          {/* Genre Filter Pills */}
          <div className="mt-3 border-t border-border/60 pt-3">
            <div
              className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
              role="tablist"
              aria-label="Filter by genre"
            >
              {GENRES.map((g) => {
                const active = g === (genre || "All Movies");
                const count = genreCounts[g] ?? 0;
                return (
                  <button
                    key={g}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => update({ genre: g === "All Movies" ? undefined : g })}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/80 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <span>{g}</span>
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

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-primary">Active:</span>
              {q && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-card px-2 py-0.5 text-foreground">
                  "{q}"
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
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-card px-2 py-0.5 text-foreground">
                  {genre}
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
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-card px-2 py-0.5 text-foreground">
                  {status === "now" ? "Now Showing" : status === "soon" ? "Coming Soon" : "Top Rated"}
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
                Showing <strong className="text-foreground">{filteredMovies.length}</strong> of {movies.length}
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 font-semibold text-primary transition hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Movie Results */}
        {filteredMovies.length === 0 ? (
          <div className="my-8 grid place-items-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
            <Film className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-display text-2xl tracking-wide text-foreground">
              No matching movies found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filter options.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-gold mt-4 !py-2 !text-xs"
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
