import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Ticket, Clock, Calendar } from "lucide-react";
import { FEATURED } from "@/data/movies";
import Rating from "./Rating";
import Reveal from "./Reveal";
import TrailerDialog from "./TrailerDialog";

export default function FeaturedMovie({ movie = FEATURED }) {
  const [trailer, setTrailer] = useState(false);
  return (
    <Reveal as="section" className="container-cine py-14">
      <div className="group relative isolate overflow-hidden rounded-lg border border-border shadow-card">
        <img
          src={movie.backdrop}
          alt={`${movie.title} key art`}
          loading="lazy"
          width={1920}
          height={832}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-right transition-transform duration-[1500ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/80 to-transparent" />
        <div className="max-w-xl px-6 py-14 sm:px-12 sm:py-20 lg:py-24">
          <p className="mb-4 text-xs font-bold tracking-[0.3em] text-primary">FEATURED PREMIERE</p>
          <h2 className="font-display-tight text-5xl text-white sm:text-7xl">{movie.title}</h2>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300">
            <Rating value={movie.rating} />
            <span>{movie.genres.join(" / ")}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {movie.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {movie.releaseDate}
            </span>
            <span className="rounded-sm border border-white/20 px-1.5 text-xs text-zinc-300">
              {movie.age}
            </span>
          </div>
          <p className="mt-5 text-base leading-relaxed text-zinc-300">{movie.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/movies" className="btn-gold">
              <Ticket className="h-4 w-4" /> Book Tickets
            </Link>
            <button
              type="button"
              onClick={() => setTrailer(true)}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-primary hover:bg-white/20 hover:text-primary active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" /> Watch Trailer
            </button>
          </div>
        </div>
      </div>
      <TrailerDialog
        open={trailer}
        onClose={() => setTrailer(false)}
        title={movie.title}
        image={movie.backdrop}
      />
    </Reveal>
  );
}
