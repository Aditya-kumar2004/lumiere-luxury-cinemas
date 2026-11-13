import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Play,
  ArrowRight,
  Sparkles,
  Armchair,
  Smartphone,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import heroTheatre from "@/assets/hero-theatre.jpg";
import heroImax from "@/assets/hero-imax.jpg";
import heroVip from "@/assets/hero-vip-lounge.jpg";
import { FEATURED } from "@/data/movies";
import TrailerDialog from "./TrailerDialog";
import { CinemaEmblem } from "./Logo";

const HIGHLIGHTS = [
  { icon: Sparkles, label: "Premium Cinema Experience" },
  { icon: Armchair, label: "Comfortable Seating" },
  { icon: Smartphone, label: "Easy Online Booking" },
];

const SLIDES = [
  {
    id: "imax",
    image: heroImax,
    badge: "LUMIÈRE IMAX® LASER DOME",
    hall: "IMAX Laser Auditorium",
    tech: "Curved 4K Laser Projection",
  },
  {
    id: "vip",
    image: heroVip,
    badge: "ROYALE VIP RECLINER SUITES",
    hall: "Royale Lounge Suite",
    tech: "In-Seat Gourmet Service",
  },
  {
    id: "theatre",
    image: heroTheatre,
    badge: "DOLBY ATMOS® PANORAMIC SOUND",
    hall: "Dolby Atmos Theatre",
    tech: "128-Channel 360° Audio",
  },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const bg = useRef(null);
  const [current, setCurrent] = useState(0);
  const [trailer, setTrailer] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleExploreMovies = (e) => {
    try {
      const user = window.localStorage.getItem("lumiere-user");
      if (!user) {
        e.preventDefault();
        toast.info("Please sign in or create an account to view all movies.");
        navigate({ to: "/login", search: { redirect: "/movies" } });
      }
    } catch {}
  };

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance carousel left-to-right
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, nextSlide]);

  return (
    <section
      className="relative isolate flex min-h-[min(100svh,960px)] items-center overflow-hidden pb-16 pt-28 lg:pt-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Carousel Background Slider (Left-to-Right track, crystal-clear 1:1 sharp) */}
      <div ref={bg} className="absolute inset-0 -z-20 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="relative h-full w-full shrink-0">
              <img
                src={slide.image}
                alt={slide.badge}
                width={1920}
                height={1088}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clean, Subtle Contrast Vignette (no edge blur, no heavy black fog) */}
      <div className="absolute inset-0 -z-10 bg-overlay-left" />
      <div className="absolute inset-0 -z-10 bg-overlay-bottom" />

      {/* Hero Content */}
      <div className="container-cine grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="max-w-2xl animate-fade-up">
          {/* Active Slide Dynamic Badge */}
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-primary/50 bg-black/70 px-3.5 py-1.5 shadow-lg">
            <CinemaEmblem className="h-4 w-4" glow={false} />
            <span className="text-[10px] font-bold tracking-[0.28em] text-primary sm:text-[11px]">
              {SLIDES[current].badge}
            </span>
          </div>

          <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] font-bold tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] leading-[1.15]">
            Experience movies
            <br />
            <span className="text-primary">like never before.</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-base">
            Discover the latest blockbusters, explore upcoming releases and book your favourite
            seats for an unforgettable cinematic experience.
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-sm font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-sm border border-primary/50 bg-black/70 text-primary shadow-md">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col xs:flex-row flex-wrap gap-3">
            <Link
              to="/movies"
              onClick={handleExploreMovies}
              className="btn-gold !px-6 !py-3.5 shadow-lg w-full xs:w-auto"
            >
              Explore Movies <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setTrailer(true)}
              className="inline-flex w-full xs:w-auto items-center justify-center gap-2 rounded-sm border border-white/20 bg-black/60 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:border-primary hover:bg-black/80 hover:text-primary active:scale-95"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-primary">
                <Play className="h-3 w-3 translate-x-[1px] fill-primary text-primary" />
              </span>
              Watch Trailer
            </button>
          </div>

          {/* Carousel Slide Indicators & Controls */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-zinc-200 shadow-md transition hover:border-primary hover:bg-black/90 hover:text-primary active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-zinc-200 shadow-md transition hover:border-primary hover:bg-black/90 hover:text-primary active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            {/* Active Hall Info */}
            <span className="hidden text-xs sm:inline-block">
              <span className="font-semibold text-white">{SLIDES[current].hall}</span>{" "}
              <span className="text-zinc-400">• {SLIDES[current].tech}</span>
            </span>
          </div>
        </div>

        {/* Featured movie card (clean, sharp luxury glass panel) */}
        <div className="relative hidden animate-fade-up [animation-delay:250ms] md:block">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-zinc-950/85 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-primary/50">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={FEATURED.backdrop}
                alt={FEATURED.title}
                width={1920}
                height={832}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <span className="absolute left-4 top-4 rounded-sm bg-primary px-2 py-1 text-[10px] font-extrabold tracking-widest text-primary-foreground">
                FEATURED
              </span>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1 rounded-sm bg-primary/20 px-1.5 py-0.5 font-extrabold text-primary">
                  <Star className="h-3 w-3 fill-primary" /> IMDb {FEATURED.rating}
                </span>
                <span>{FEATURED.year}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>{FEATURED.genres.join(" / ")}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>{FEATURED.duration}</span>
              </div>
              <h3 className="mt-2.5 font-display text-2xl sm:text-3xl tracking-wide text-white">
                {FEATURED.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{FEATURED.description}</p>
            </div>
          </div>
        </div>
      </div>

      <TrailerDialog
        open={trailer}
        onClose={() => setTrailer(false)}
        title={FEATURED.title}
        image={FEATURED.backdrop}
      />
    </section>
  );
}
