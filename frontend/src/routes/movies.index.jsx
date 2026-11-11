import { createFileRoute } from "@tanstack/react-router";
import MoviesPage from "@/components/pages/MoviesPage";
export const Route = createFileRoute("/movies/")({
  validateSearch: (search) => {
    const result = {};
    if (typeof search.q === "string" && search.q) {
      result.q = search.q;
    }
    if (typeof search.genre === "string" && search.genre) {
      result.genre = search.genre;
    }
    if (typeof search.status === "string" && search.status) {
      result.status = search.status;
    }
    if (typeof search.sort === "string" && search.sort) {
      result.sort = search.sort;
    }
    return result;
  },
  head: () => ({
    meta: [
      { title: "All Movies — LUMIÈRE Cinemas" },
      {
        name: "description",
        content:
          "Browse every movie now showing and coming soon at LUMIÈRE. Filter by genre, language, and search by title.",
      },
      { property: "og:title", content: "All Movies — LUMIÈRE Cinemas" },
      {
        property: "og:description",
        content: "Browse and book movies now showing at LUMIÈRE Cinemas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MoviesPage,
});
