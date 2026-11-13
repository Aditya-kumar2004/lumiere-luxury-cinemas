import { Link } from "@tanstack/react-router";

export function CinemaEmblem({ className = "h-9 w-9", glow = true }) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      {glow && (
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md transition group-hover:bg-primary/30" />
      )}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full drop-shadow-[0_2px_8px_rgba(229,9,20,0.35)]"
      >
        <defs>
          <linearGradient
            id="logoCrimson"
            x1="8"
            y1="8"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="35%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <radialGradient id="logoRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0B0D13" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shield Frame */}
        <rect
          width="60"
          height="60"
          x="2"
          y="2"
          rx="14"
          fill="#0B0D13"
          stroke="url(#logoCrimson)"
          strokeWidth="1.5"
          className="transition duration-300 group-hover:stroke-red-400"
        />
        <circle cx="32" cy="32" r="22" fill="url(#logoRadial)" />

        {/* Outer Faceted Diamond */}
        <path
          d="M32 11 L51 32 L32 53 L13 32 Z"
          stroke="url(#logoCrimson)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner Diamond Shimmer */}
        <path
          d="M32 17 L45 32 L32 47 L19 32 Z"
          stroke="url(#logoCrimson)"
          strokeWidth="1"
          strokeOpacity="0.55"
          strokeLinejoin="round"
        />

        {/* Cinematic Monogram "L" */}
        <path
          d="M26 21 V41 H38"
          stroke="url(#logoCrimson)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sparkle Star */}
        <path
          d="M42 22 L43 25 L46 26 L43 27 L42 30 L41 27 L38 26 L41 25 Z"
          fill="#FDE047"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

export default function Logo({
  size = "md",
  showTagline = true,
  className = "",
  contrast = "auto",
}) {
  const sizeClasses = {
    sm: {
      emblem: "h-8 w-8",
      title: "text-xl tracking-[0.14em]",
      tagline: "text-[7.5px] tracking-[0.32em]",
    },
    md: {
      emblem: "h-9 w-9",
      title: "text-2xl tracking-[0.16em]",
      tagline: "text-[8.5px] tracking-[0.38em]",
    },
    lg: {
      emblem: "h-11 w-11",
      title: "text-3xl tracking-[0.18em]",
      tagline: "text-[10px] tracking-[0.4em]",
    },
  }[size] || {
    emblem: "h-9 w-9",
    title: "text-2xl tracking-[0.16em]",
    tagline: "text-[8.5px] tracking-[0.38em]",
  };

  const titleColor =
    contrast === "light"
      ? "text-white"
      : contrast === "dark"
        ? "text-slate-900"
        : "text-foreground";

  return (
    <Link
      to="/"
      className={`group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-95 ${className}`}
      aria-label="LUMIÈRE Cinemas Home"
    >
      <CinemaEmblem className={sizeClasses.emblem} />
      <span className="leading-none">
        <span
          className={`block font-display font-bold uppercase transition-colors ${titleColor} ${sizeClasses.title}`}
        >
          LUMIÈRE
        </span>
        {showTagline && (
          <span className={`block font-semibold uppercase text-primary ${sizeClasses.tagline}`}>
            PREMIER LUXURY CINEMAS
          </span>
        )}
      </span>
    </Link>
  );
}
