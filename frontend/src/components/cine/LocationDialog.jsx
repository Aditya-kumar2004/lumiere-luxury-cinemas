import { MapPin, X, Check } from "lucide-react";
import { CITIES } from "@/data/movies";

export default function LocationDialog({ open, current, onSelect, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select your city"
        className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-card animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-3xl tracking-wide">Select Your City</h3>
            <p className="text-sm text-muted-foreground">
              See showtimes at LUMIÈRE cinemas near you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CITIES.map((city) => {
            const active = city === current;
            return (
              <button
                key={city}
                type="button"
                onClick={() => onSelect(city)}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"}`}
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{city}</span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
