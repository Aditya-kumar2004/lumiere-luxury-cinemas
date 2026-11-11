import { api, hasBackend } from "./api";
import { MOVIES, FEATURED } from "@/data/movies";

// Each method calls the real API when VITE_API_URL is set, otherwise returns mock data.
export const movieService = {
  async getAll() {
    if (hasBackend()) return (await api.get("/movies")).data;
    return MOVIES;
  },
  async getById(id) {
    if (hasBackend()) return (await api.get(`/movies/${id}`)).data;
    return MOVIES.find((m) => m.id === id) || null;
  },
  async getFeatured() {
    if (hasBackend()) return (await api.get("/movies/featured")).data;
    return FEATURED;
  },
  async subscribe(email) {
    if (hasBackend()) return (await api.post("/newsletter", { email })).data;
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
