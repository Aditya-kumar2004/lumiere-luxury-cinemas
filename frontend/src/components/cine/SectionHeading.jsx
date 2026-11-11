export default function SectionHeading({ eyebrow, title, subtitle, action, className = "" }) {
  return (
    <div className={`mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-primary">{eyebrow}</p>
        )}
        <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">{title}</h2>
        {subtitle && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
