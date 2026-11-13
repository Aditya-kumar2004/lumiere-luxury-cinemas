import { useState } from "react";
import {
  X,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function StaffScannerDialog({ open, onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (ticketCodeToVerify) => {
    const searchCode = (ticketCodeToVerify || code).trim().toUpperCase();
    if (!searchCode) {
      toast.error("Please enter a ticket code (e.g. CP-73287).");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/verify/${searchCode}`);
      const data = await res.json();
      setResult(data);
      if (data.valid) {
        toast.success("✅ Ticket Approved! Customer admitted.");
      } else if (data.status === "CANCELLED") {
        toast.error("🚫 TICKET CANCELLED: Entry Denied!");
      } else {
        toast.error(data.message || "Invalid ticket code.");
      }
    } catch {
      toast.error("Failed to connect to verification server.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (sampleCode) => {
    setCode(sampleCode);
    handleVerify(sampleCode);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-primary/40 bg-[#0e1118] text-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-5 sm:p-6 bg-[#131620]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wide text-foreground">
                  STAFF GATE SCANNER
                </h2>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  STAFF ONLY
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Scan QR or enter booking code to check admission eligibility.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Input & Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Scan or enter code (e.g. CP-73287)..."
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-border/60 bg-[#161922] py-2.5 pl-9 pr-3 text-sm font-mono tracking-wider text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold !px-5 !py-2.5 text-xs font-bold shrink-0"
            >
              {loading ? "Checking..." : "Verify Pass"}
            </button>
          </form>

          {/* Quick Test Chips for demo/testing */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground text-[11px]">Quick Test:</span>
            <button
              type="button"
              onClick={() => handleQuickTest("CP-73287")}
              className="rounded border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-mono text-rose-300 hover:bg-rose-500/20 transition"
            >
              CP-73287 (Cancelled)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest("CP-63552")}
              className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              CP-63552 (Confirmed)
            </button>
          </div>

          {/* VERIFICATION RESULT DISPLAY */}
          {result && (
            <div className="animate-fade-in">
              {/* CASE 1: CANCELLED TICKET */}
              {result.status === "CANCELLED" && (
                <div className="rounded-xl border-2 border-rose-500 bg-rose-950/30 p-5 shadow-lg">
                  <div className="flex items-center gap-3 text-rose-400">
                    <XCircle className="h-8 w-8 shrink-0 text-rose-500" />
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-wide text-rose-400">
                        🚫 ENTRY DENIED: TICKET CANCELLED
                      </h3>
                      <p className="text-xs text-rose-300/80">
                        This ticket was cancelled by the customer. It is strictly VOID.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-rose-500/30 bg-[#0e1118]/80 p-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Booking Code</span>
                      <p className="font-mono text-base font-bold text-rose-400">
                        {result.booking?.bookingCode}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Status</span>
                      <p className="font-bold text-rose-400">CANCELLED & VOID</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Movie</span>
                      <p className="font-bold text-foreground">{result.booking?.movieTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Cinema</span>
                      <p className="font-bold text-foreground">{result.booking?.cinemaName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Cancelled Seats</span>
                      <p className="font-bold text-rose-400">
                        {Array.isArray(result.booking?.seats)
                          ? result.booking.seats.join(", ")
                          : result.booking?.seats}{" "}
                        (Released)
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Customer</span>
                      <p className="font-bold text-foreground">{result.booking?.userName}</p>
                      <p className="text-[10px] text-muted-foreground">{result.booking?.userEmail}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md bg-rose-500/20 p-2.5 text-center text-xs font-bold text-rose-300">
                    ⚠️ DO NOT ALLOW ENTRY — SEATS HAVE BEEN CANCELLED
                  </div>
                </div>
              )}

              {/* CASE 2: CONFIRMED TICKET */}
              {result.valid && result.status === "CONFIRMED" && (
                <div className="rounded-xl border-2 border-emerald-500 bg-emerald-950/30 p-5 shadow-lg">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-wide text-emerald-400">
                        ✅ ENTRY APPROVED: VALID PASS
                      </h3>
                      <p className="text-xs text-emerald-300/80">
                        Ticket is authentic and active. Welcome to LUMIÈRE Cinemas!
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-emerald-500/30 bg-[#0e1118]/80 p-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Booking Code</span>
                      <p className="font-mono text-base font-bold text-primary">
                        {result.booking?.bookingCode}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Status</span>
                      <p className="font-bold text-emerald-400">CONFIRMED (PAID)</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Movie</span>
                      <p className="font-bold text-foreground">{result.booking?.movieTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Showtime</span>
                      <p className="font-bold text-foreground">
                        {result.booking?.showTime} • {result.booking?.screenType}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Seats</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(Array.isArray(result.booking?.seats)
                          ? result.booking.seats
                          : [result.booking?.seats]
                        ).map((s) => (
                          <span
                            key={s}
                            className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-bold text-emerald-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Customer</span>
                      <p className="font-bold text-foreground">{result.booking?.userName}</p>
                      <p className="text-[10px] text-muted-foreground">{result.booking?.userEmail}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md bg-emerald-500/20 p-2.5 text-center text-xs font-bold text-emerald-300">
                    🎟️ ADMIT GUEST TO AUDITORIUM
                  </div>
                </div>
              )}

              {/* CASE 3: INVALID / NOT FOUND */}
              {!result.valid && result.status !== "CANCELLED" && (
                <div className="rounded-xl border-2 border-amber-500 bg-amber-950/30 p-5 shadow-lg">
                  <div className="flex items-center gap-3 text-amber-400">
                    <AlertTriangle className="h-8 w-8 shrink-0 text-amber-400" />
                    <div>
                      <h3 className="font-display text-2xl font-bold tracking-wide text-amber-400">
                        ❌ INVALID TICKET CODE
                      </h3>
                      <p className="text-xs text-amber-300/80">
                        {result.message || "No booking record found for this ticket code."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-md bg-amber-500/20 p-2.5 text-center text-xs font-bold text-amber-300">
                    ⚠️ DO NOT ADMIT — PLEASE ASK GUEST FOR VALID PROOF OF BOOKING
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-[#10121a] px-5 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Verified by LUMIÈRE Gate Security
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline !px-4 !py-1.5 !text-xs font-bold"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}

