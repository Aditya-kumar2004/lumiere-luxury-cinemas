import { createFileRoute, notFound } from "@tanstack/react-router";
import BookingPage from "@/components/pages/BookingPage";
import { MovieNotFound } from "@/components/pages/MovieDetailsPage";
import { movieService } from "@/services/movieService";
export const Route = createFileRoute("/book/$movieId")({
  loader: async ({ params }) => {
    const movie = await movieService.getById(params.movieId);
    if (!movie || movie.status !== "now") throw notFound();
    return { movie };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.movie;
    const title = m ? `Book ${m.title} — LUMIÈRE` : "Movie unavailable — LUMIÈRE Cinemas";
    const desc = m ? m.description : "This movie is not available.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: MovieNotFound,
  component: BookingPage,
});
