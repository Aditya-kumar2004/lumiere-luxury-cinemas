import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Play } from "lucide-react";

export default function TrailerDialog({ open, onClose, title, image }) {
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
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} trailer`}
        className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-primary/40 bg-zinc-950 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/75 text-zinc-200 transition hover:border-primary hover:bg-black hover:text-primary active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-primary uppercase shadow-sm">
              <Play className="h-3 w-3 fill-primary" /> Official Trailer Preview
            </span>
            <p className="font-display text-3xl xs:text-4xl sm:text-6xl tracking-wide text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {title}
            </p>
            <p className="mt-3 max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Full 4K Ultra HD Trailer & VIP Screenings coming soon to LUMIÈRE Cinemas.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
