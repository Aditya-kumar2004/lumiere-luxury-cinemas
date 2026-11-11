import { X } from "lucide-react";

export default function TrailerDialog({ open, onClose, title, image }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-background/90 p-4 backdrop-blur animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} trailer`}
        className="relative w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/70 text-foreground hover:text-primary"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative aspect-video">
          <img src={image} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-4xl tracking-wide">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Official trailer coming soon to LUMIÈRE Cinemas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
