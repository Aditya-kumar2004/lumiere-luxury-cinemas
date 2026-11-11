import { MonitorPlay, AudioLines, Armchair, Popcorn } from "lucide-react";
import Reveal from "./Reveal";
import cinemaExpBg from "@/assets/cinema-experience-bg.jpg";

const FEATURES = [
  {
    icon: MonitorPlay,
    title: "Premium Screens",
    text: "Enjoy movies on large, high-quality screens.",
    stat: "4K Laser",
  },
  {
    icon: AudioLines,
    title: "Dolby Atmos Sound",
    text: "Experience immersive cinema-quality audio.",
    stat: "128 channels",
  },
  {
    icon: Armchair,
    title: "Luxury Seating",
    text: "Relax with comfortable seating arrangements.",
    stat: "Full recline",
  },
  {
    icon: Popcorn,
    title: "Delicious Food",
    text: "Enjoy popcorn, snacks and beverages.",
    stat: "In-seat service",
  },
];

export default function CinemaExperience() {
  return (
    <section
      id="cinemas"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/80 py-24 sm:py-28"
    >
      {/* Background Image - Bright, vibrant & crystal-clear (100% identical styling to the Hero Section) */}
      <div className="pointer-events-none absolute inset-0 -z-20 select-none overflow-hidden">
        <img
          src={cinemaExpBg}
          alt="LUMIÈRE Luxury Cinema Experience"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Subtle Vignettes from Hero Section (NO milky white fog, NO heavy black veil) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-overlay-left opacity-90" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-overlay-bottom opacity-80" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

      <Reveal className="container-cine relative z-10">
        {/* Section Heading with High-Legibility Cinema Drop Shadows */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
            THE LUMIÈRE STANDARD
          </p>
          <h2 className="font-display text-4xl tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] sm:text-5xl">
            THE CINEMA EXPERIENCE
          </h2>
          <p className="mt-2 text-sm text-zinc-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-base">
            Every detail designed around one thing — the perfect movie night.
          </p>
        </div>

        {/* 4 Feature Cards with Luxury Dark Glass Styling */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(function (item, index) {
            const Icon = item.icon;
            const number = "0" + (index + 1);

            return (
              <div
                key={item.title}
                className="group relative rounded-xl border border-white/20 bg-black/65 p-7 backdrop-blur-md shadow-2xl transition duration-500 hover:-translate-y-1.5 hover:border-primary/80 hover:bg-black/85 hover:shadow-card"
              >
                <span className="absolute right-6 top-6 font-display text-5xl text-white/15 transition group-hover:text-primary/30">
                  {number}
                </span>
                <span className="mb-6 grid h-14 w-14 place-items-center rounded-lg border border-primary/50 bg-primary/20 text-primary transition group-hover:bg-primary group-hover:text-black">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="font-display text-3xl tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-200 leading-relaxed">
                  {item.text}
                </p>
                <p className="mt-6 border-t border-white/15 pt-4 text-xs font-bold tracking-[0.2em] text-primary">
                  {item.stat.toUpperCase()}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
