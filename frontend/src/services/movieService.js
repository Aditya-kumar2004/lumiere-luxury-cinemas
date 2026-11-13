import { MOVIES, FEATURED } from "@/data/movies";

const BACKEND_URL = "http://localhost:5000/api";

// Map static metadata so bundled HD poster assets and rich defaults are retained
const STATIC_MAP = new Map(MOVIES.map((m) => [m.id, m]));

// Helper to normalize any movie (from DB or fallback) into the exact format expected by the frontend
export function normalizeMovie(dbMovie) {
  if (!dbMovie) return null;
  const staticMeta = STATIC_MAP.get(dbMovie.id) || {};

  // Status: if 'now-showing' or 'now' -> 'now'; if 'coming-soon' or 'soon' -> 'soon'
  const isNow =
    dbMovie.status === "now" ||
    dbMovie.status === "now-showing" ||
    (!dbMovie.status && staticMeta.status === "now");
  const normalizedStatus = isNow ? "now" : "soon";

  // Genres: ensure array
  let genres = staticMeta.genres || [];
  if (dbMovie.genre) {
    genres = dbMovie.genre
      .split(/[,•/]/)
      .map((g) => g.trim())
      .filter(Boolean);
  }
  if (!genres || genres.length === 0) {
    genres = ["Cinema"];
  }

  // Poster image: priority order:
  // 1. Explicit poster_url / posterUrl in DB (if provided by admin)
  // 2. High-res bundled local asset from STATIC_MAP
  // 3. Fallback placeholder
  const poster =
    dbMovie.poster_url ||
    dbMovie.posterUrl ||
    staticMeta.poster ||
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";

  const backdrop = dbMovie.banner_url || dbMovie.bannerUrl || staticMeta.backdrop || poster;

  return {
    ...staticMeta,
    ...dbMovie,
    id: dbMovie.id,
    title: dbMovie.title || staticMeta.title,
    poster,
    backdrop,
    genres,
    duration: dbMovie.duration || staticMeta.duration || "2h 15m",
    language: staticMeta.language || "English",
    rating: Number(dbMovie.rating || staticMeta.rating || 8.0),
    age: staticMeta.age || "UA 13+",
    year: staticMeta.year || 2026,
    status: normalizedStatus,
    trending: Boolean(staticMeta.trending || Number(dbMovie.rating || 0) >= 8.5),
    description: dbMovie.synopsis || dbMovie.description || staticMeta.description || "",
  };
}

export const movieService = {
  async getAll() {
    try {
      const res = await fetch(`${BACKEND_URL}/movies`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
          return data.movies.map(normalizeMovie);
        }
      }
    } catch (err) {
      console.warn("Could not reach backend movies API, using fallback catalog:", err);
    }
    return MOVIES.map(normalizeMovie);
  },

  async getById(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/movies/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.movie) {
          return normalizeMovie(data.movie);
        }
      }
    } catch (err) {
      console.warn("Could not fetch movie by id from backend, checking fallback:", err);
    }
    const fallback = MOVIES.find((m) => m.id === id);
    return fallback ? normalizeMovie(fallback) : null;
  },

  async getFeatured() {
    try {
      const res = await fetch(`${BACKEND_URL}/movies/featured`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.movie) {
          return normalizeMovie(data.movie);
        }
      }
    } catch {}
    return FEATURED;
  },

  async subscribe(email) {
    try {
      const res = await fetch(`${BACKEND_URL}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { ok: true, demo: true };
  },
};

export function searchMovies(movies, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return movies.filter((m) => m.title.toLowerCase().includes(q));
}

export function filterByGenre(movies, genre) {
  if (!genre || genre === "All Movies") return movies;
  return movies.filter((m) => m.genres.includes(genre));
}
