import MovieCarousel from "./MovieCarousel";
import MovieCard from "./MovieCard";

export default function TrendingMovies({ trending, topRated }) {
  return (
    <>
      <MovieCarousel
        id="trending"
        eyebrow="WHAT EVERYONE'S WATCHING"
        title="Trending This Week"
        items={trending}
        renderItem={(m, i) => (
          <MovieCard movie={m} variant="compact" badge={`#${i + 1} TRENDING`} />
        )}
      />
      <MovieCarousel
        id="top-rated"
        eyebrow="CRITICS & AUDIENCES AGREE"
        title="Top Rated Movies"
        items={topRated}
        renderItem={(m) => <MovieCard movie={m} variant="compact" />}
      />
    </>
  );
}
