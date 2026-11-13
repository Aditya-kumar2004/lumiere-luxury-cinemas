import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Flame, Ticket, Info, Bell } from "lucide-react";
import { toast } from "sonner";
import Rating from "./Rating";

/** variant: "full" (Now Showing grid) | "compact" (carousels) | "soon" */
export default function MovieCard({ movie, variant = "full", badge, onRemind, reminded }) {
  const navigate = useNavigate();
  const isSoon = movie.status === "soon";

  const handleBookClick = (e) => {
    try {
      const user = window.localStorage.getItem("lumiere-user");
      if (!user) {
        e.preventDefault();
        toast.info("Please sign in or create an account to book tickets.");
        navigate({
          to: "/login",
          search: { redirect: `/book/${movie.id}` },
        });
      }
    } catch {}
  };
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-card shadow-card">
        <img
          src={movie.poster}
          alt=""
          loading="lazy"
          width={672}
          height={992}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {movie.age && (
          <span className="absolute right-2 top-2 rounded-sm border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-bold text-foreground backdrop-blur">
            {movie.age}
          </span>
        )}
        {badge && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-primary-foreground">
            <Flame className="h-3 w-3" /> {badge}
          </span>
        )}
        {isSoon && movie.releaseDate && (
          <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-primary-foreground">
            {movie.releaseDate.toUpperCase()}
          </span>
        )}
        {/* Hover overlay - sleek dark cinematic glass for pristine contrast in all modes */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/80 to-black/25 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:p-4">
          <p className="mb-3 line-clamp-4 text-xs leading-relaxed text-zinc-300">
            {movie.description}
          </p>
          <div className="flex flex-col gap-2">
            {isSoon ? (
              <button
                type="button"
                onClick={() => onRemind?.(movie)}
                className="btn-gold !px-3 !py-2 !text-xs"
              >
                <Bell className="h-3.5 w-3.5" /> {reminded ? "Reminder Set" : "Remind Me"}
              </button>
            ) : (
              <Link
                to="/book/$movieId"
                params={{ movieId: movie.id }}
                onClick={handleBookClick}
                className="btn-gold !px-3 !py-2 !text-xs"
              >
                <Ticket className="h-3.5 w-3.5" /> Book Tickets
              </Link>
            )}
            <Link
              to="/movies/$movieId"
              params={{ movieId: movie.id }}
              className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-primary hover:bg-white/20 hover:text-primary"
            >
              <Info className="h-3.5 w-3.5" /> View Details
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-3 min-w-0">
        <Link
          to="/movies/$movieId"
          params={{ movieId: movie.id }}
          className="block truncate font-display text-xl tracking-wide text-foreground transition hover:text-primary-soft"
        >
          {movie.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{movie.genres.join(" • ")}</p>
        {variant === "full" && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Rating value={movie.rating} />
            {movie.duration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {movie.duration}
              </span>
            )}
            <span>{movie.language}</span>
          </div>
        )}
        {variant === "compact" && (
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <Rating value={movie.rating} /> <span>{movie.year}</span>
          </div>
        )}
        {variant === "full" && (
          <div className="mt-3 flex items-center gap-2">
            {!isSoon ? (
              <Link
                to="/book/$movieId"
                params={{ movieId: movie.id }}
                onClick={handleBookClick}
                className="btn-gold flex flex-1 items-center justify-center gap-1.5 !py-2 !text-xs font-bold shadow-sm"
              >
                <Ticket className="h-3.5 w-3.5" /> Book Tickets
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onRemind?.(movie)}
                className="btn-outline flex flex-1 items-center justify-center gap-1.5 !py-2 !text-xs text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-3.5 w-3.5" /> {reminded ? "Reminder Set" : "Coming Soon"}
              </button>
            )}
            <Link
              to="/movies/$movieId"
              params={{ movieId: movie.id }}
              className="inline-flex items-center justify-center rounded-md border border-border/80 bg-card p-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-primary"
              aria-label={`View details for ${movie.title}`}
              title="View Details"
            >
              <Info className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
