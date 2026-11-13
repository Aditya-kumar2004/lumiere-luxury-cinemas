import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Film } from "lucide-react";
import MovieCard from "./MovieCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { GENRES } from "@/data/movies";
import { filterByGenre } from "@/services/movieService";

export function GenreFilters({ value, onChange }) {
  return (
    <div
      className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1"
      role="tablist"
      aria-label="Filter by genre"
    >
      {GENRES.map((g) => {
        const active = g === value;
        return (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(g)}
            className={`shrink-0 rounded-md border px-4 py-2 text-xs font-bold tracking-wide transition active:scale-95 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

export function PosterGrid({ movies }) {
  if (!movies.length) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-border py-16 text-center">
        <Film className="mb-3 h-8 w-8 text-primary" />
        <p className="font-semibold">No movies in this category right now.</p>
        <p className="text-sm text-muted-foreground">Try another genre.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5 2xl:grid-cols-6">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}

export default function MovieGrid({ movies = [] }) {
  const [genre, setGenre] = useState("All Movies");

  // Filter movies by chosen genre
  const filteredMovies = filterByGenre(movies, genre);
  // Show 12 movies on Now Showing section
  const displayedMovies = filteredMovies.slice(0, 12);
  const totalCount = filteredMovies.length;
  const hasMore = totalCount > 12;

  return (
    <Reveal as="section" id="now-showing" className="container-cine scroll-mt-24 pb-10 pt-20">
      <SectionHeading
        eyebrow="IN THEATRES"
        title="Now Showing"
        subtitle="Explore the movies currently playing in theatres."
        action={
          <Link
            to="/movies"
            className="group inline-flex shrink-0 items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover cursor-pointer transition hover:translate-x-0.5 active:scale-95"
            aria-label="View all movies"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        }
      />
      <GenreFilters value={genre} onChange={setGenre} />
      <PosterGrid movies={displayedMovies} />

      {/* When there are more than 12 movies, show button to view full catalogue */}
      {hasMore && (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
          <Link
            to="/movies"
            className="group inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 shadow-sm"
          >
            <span>View All Movies in Theatres ({totalCount})</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-xs text-muted-foreground">
            Explore all {totalCount} movies currently playing across all halls and timings.
          </p>
        </div>
      )}
    </Reveal>
  );
}
