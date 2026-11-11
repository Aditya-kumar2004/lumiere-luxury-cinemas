import { getRouteApi, Link } from "@tanstack/react-router";
import { Clock, Globe, Calendar, Ticket, ArrowLeft } from "lucide-react";
import Rating from "@/components/cine/Rating";

const Route = getRouteApi("/movies/$movieId");

export function MovieNotFound() {
  return (
    <div className="container-cine grid min-h-[70vh] place-items-center pt-24 text-center">
      <div>
        <h1 className="font-display text-5xl">Not available</h1>
        <p className="mt-2 text-muted-foreground">
          This movie could not be found or isn't bookable yet.
        </p>
        <Link to="/movies" className="btn-gold mt-6">
          Browse movies
        </Link>
      </div>
    </div>
  );
}

export default function MovieDetailsPage() {
  const { movie } = Route.useLoaderData();
  const soon = movie.status === "soon";
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-28">
      <img
        src={movie.poster}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
      />
      <div className="absolute inset-0 -z-10 bg-overlay-bottom" />
      <div className="container-cine">
        <Link
          to="/movies"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All movies
        </Link>
        <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] lg:gap-16">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            width={672}
            height={992}
            className="mx-auto md:mx-0 w-full max-w-[260px] xs:max-w-xs rounded-lg border border-border shadow-card"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-sm border border-primary/40 px-2 py-0.5 text-xs font-bold text-primary"
                >
                  {g}
                </span>
              ))}
              {movie.age && (
                <span className="rounded-sm border border-border px-2 py-0.5 text-xs font-bold">
                  {movie.age}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display-tight text-3xl xs:text-4xl sm:text-7xl lg:text-8xl">{movie.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Rating value={movie.rating} className="text-base" />
              {movie.duration && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {movie.duration}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {movie.language}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {movie.releaseDate || movie.year}
              </span>
            </div>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
              {movie.description}
            </p>
            <div className="mt-8 flex flex-col xs:flex-row flex-wrap gap-3">
              {soon ? (
                <span className="btn-outline w-full xs:w-auto text-center">Releasing {movie.releaseDate}</span>
              ) : (
                <Link
                  to="/book/$movieId"
                  params={{ movieId: movie.id }}
                  className="btn-gold !px-7 !py-3.5 w-full xs:w-auto text-center"
                >
                  <Ticket className="h-4 w-4" /> Book Tickets
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
