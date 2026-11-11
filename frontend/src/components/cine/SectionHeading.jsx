export default function SectionHeading({ eyebrow, title, subtitle, action, className = "" }) {
  return (
    <div className={`mb-6 sm:mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-bold tracking-[0.25em] text-primary">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl xs:text-3xl sm:text-5xl tracking-wide text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-xs sm:text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
