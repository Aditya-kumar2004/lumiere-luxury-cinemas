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

export default function MovieGrid({ movies }) {
  const [genre, setGenre] = useState("All Movies");
  return (
    <Reveal as="section" id="now-showing" className="container-cine scroll-mt-24 pb-10 pt-20">
      <SectionHeading
        eyebrow="IN THEATRES"
        title="Now Showing"
        subtitle="Explore the movies currently playing in theatres."
        action={
          <Link
            to="/movies"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <GenreFilters value={genre} onChange={setGenre} />
      <PosterGrid movies={filterByGenre(movies, genre)} />
    </Reveal>
  );
}
