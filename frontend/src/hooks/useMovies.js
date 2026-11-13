import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/services/movieService";

export function useMovies() {
  const query = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getAll,
    staleTime: 1000 * 10, // 10 seconds
    refetchOnWindowFocus: true,
  });

  const movies = query.data || [];

  return {
    ...query,
    movies,
    nowShowing: movies.filter((m) => m.status === "now" || m.status === "now-showing"),
    comingSoon: movies.filter((m) => m.status === "soon" || m.status === "coming-soon"),
    trending: movies.filter((m) => m.trending),
    topRated: [...movies]
      .filter((m) => (m.rating || 0) > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8),
  };
}
