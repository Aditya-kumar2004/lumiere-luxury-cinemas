import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/services/movieService";
import { hasBackend } from "@/services/api";
import { MOVIES } from "@/data/movies";

export function useMovies() {
  const query = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getAll,
    ...(hasBackend() ? {} : { initialData: MOVIES }),
  });
  const movies = query.data || [];
  return {
    ...query,
    movies,
    nowShowing: movies.filter((m) => m.status === "now"),
    comingSoon: movies.filter((m) => m.status === "soon"),
    trending: movies.filter((m) => m.trending),
    topRated: [...movies]
      .filter((m) => m.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8),
  };
}
