import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, Check } from "lucide-react";
import { CITIES } from "@/data/movies";

export default function LocationDialog({ open, current, onSelect, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select your city"
        className="w-full max-w-lg rounded-xl border border-primary/40 bg-zinc-950 p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 sm:mb-5 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl tracking-wide text-white">Select Your City</h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              See showtimes at LUMIÈRE cinemas near you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/60 text-zinc-300 transition hover:border-primary hover:text-primary active:scale-95"
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
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "border-primary bg-primary/20 font-bold text-primary shadow-sm"
                    : "border-white/15 bg-black/50 text-zinc-200 hover:border-primary/50 hover:bg-black/80"
                }`}
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <MapPin className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-zinc-400"}`} />
                  <span className="truncate">{city}</span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
