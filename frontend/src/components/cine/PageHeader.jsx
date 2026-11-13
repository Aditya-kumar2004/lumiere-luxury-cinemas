import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs = [{ label: "Home", to: "/" }, { label: "Movies" }],
  centered = false,
  children,
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface/70 pb-8 pt-24 backdrop-blur-sm lg:pb-10 lg:pt-28">
      {/* Subtle ambient illumination */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-88 w-[900px] -translate-x-1/2 bg-glow-gold opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div
        className={`container-cine relative z-10 ${
          centered ? "flex flex-col items-center text-center" : ""
        }`}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className={`mb-3 flex items-center gap-1.5 text-xs text-muted-foreground ${
              centered ? "justify-center" : ""
            }`}
          >
            {breadcrumbs.map((b, i) => (
              <span key={b.label} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                {b.to ? (
                  <Link to={b.to} className="transition-colors hover:text-primary">
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-primary shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {eyebrow}
          </div>
        )}

        <h1 className="font-display-tight text-4xl tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          {title}
        </h1>

        {subtitle && (
          <p
            className={`mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground ${
              centered ? "mx-auto text-center" : ""
            }`}
          >
            {subtitle}
          </p>
        )}

        {children && (
          <div className={`mt-5 w-full ${centered ? "flex flex-col items-center" : ""}`}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
