import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs = [{ label: "Home", to: "/" }, { label: "Movies" }],
  children,
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface/70 pb-6 pt-24 backdrop-blur-sm lg:pb-8 lg:pt-26">
      {/* Subtle ambient illumination */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[900px] -translate-x-1/2 bg-glow-gold opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="container-cine relative z-10">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground"
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
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.25em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {eyebrow}
          </div>
        )}

        <h1 className="font-display-tight text-4xl tracking-tight sm:text-5xl lg:text-6xl text-foreground">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {subtitle}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}
