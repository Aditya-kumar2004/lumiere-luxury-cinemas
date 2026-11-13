import { useState, useEffect } from "react";
import {
  X,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { API_BASE_URL } from "@/config";

export default function MyBookingsDialog({ open, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalBookings: 0, confirmedCount: 0, totalSpent: 0 });
  const [qrCodes, setQrCodes] = useState({});
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);

  // Fetch current user's bookings from backend
  const fetchBookings = async () => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.bookings || []);
        setStats({
          totalBookings: data.totalBookings || 0,
          confirmedCount: data.confirmedCount || 0,
          totalSpent: data.totalSpent || 0,
        });

        // Generate QR code data URLs for each booking code
        const codes = {};
        for (const b of data.bookings || []) {
          try {
            const url = await QRCode.toDataURL(b.booking_code, {
              width: 130,
              margin: 1,
              color: { dark: "#0c0e14", light: "#ffffff" },
            });
            codes[b.booking_code] = url;
          } catch {}
        }
        setQrCodes(codes);
      }
    } catch {
      toast.error("Could not load your bookings. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBookings();
    }
  }, [open]);

  // Download PDF Ticket Pass
  const handleDownloadPdf = async (booking) => {
    if (booking.payment_status === "CANCELLED") {
      toast.error("This ticket has been cancelled. PDF pass cannot be downloaded.");
      return;
    }

    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    toast.info("Generating your official PDF ticket pass...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to download PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lumiere-Ticket-${booking.booking_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF Pass Downloaded!");
    } catch (err) {
      toast.error(err.message || "Failed to download PDF ticket.");
    }
  };

  // Cancel Booking
  const handleConfirmCancel = async () => {
    if (!confirmCancelBooking) return;
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setCancellingId(confirmCancelBooking.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/${confirmCancelBooking.id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Booking cancelled successfully.");
        setConfirmCancelBooking(null);
        await fetchBookings();

        // Broadcast cancellation event immediately to all components and browser tabs
        window.dispatchEvent(
          new CustomEvent("lumiere-seats-updated", {
            detail: { action: "CANCEL", booking: confirmCancelBooking },
          })
        );
        window.localStorage.setItem("lumiere-seats-updated", Date.now().toString());

        try {
          const bc = new BroadcastChannel("lumiere_channel");
          bc.postMessage({ type: "SEATS_UPDATED", action: "CANCEL" });
          bc.close();
        } catch {}
      } else {
        toast.error(data.message || "Failed to cancel booking.");
      }
    } catch {
      toast.error("Network error while cancelling booking.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-primary/40 bg-[#0e1118] text-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground">
                MY CINEMA PASSES
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              View your booking history, download PDF tickets, or present QR codes at entry.
            </p>
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

        {/* Stats Strip */}
        <div className="grid grid-cols-3 border-b border-border/40 bg-[#131620] px-5 py-3 text-center text-xs">
          <div className="border-r border-border/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </span>
            <p className="font-display text-xl font-bold text-foreground">
              {stats.totalBookings}
            </p>
          </div>
          <div className="border-r border-border/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Active Passes
            </span>
            <p className="font-display text-xl font-bold text-emerald-400">
              {stats.confirmedCount}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Spent
            </span>
            <p className="font-display text-xl font-bold text-primary">
              ₹{stats.totalSpent}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && bookings.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
              Loading your cinema passes...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center">
              <Film className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <h3 className="font-display text-xl text-foreground">No Bookings Yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                You haven't booked any movie tickets yet. Explore our latest blockbusters!
              </p>
            </div>
          ) : (
            bookings.map((b) => {
              const isConfirmed = b.payment_status === "CONFIRMED";
              const showDateStr = new Date(b.show_date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-4 sm:p-5 transition ${
                    isConfirmed
                      ? "border-primary/30 bg-[#141824] hover:border-primary/60"
                      : "border-border/40 bg-[#10121a] opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold tracking-widest text-primary">
                          {b.booking_code}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                            isConfirmed
                              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : "border border-rose-500/40 bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {isConfirmed ? "✓ CONFIRMED" : "✗ CANCELLED"}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-foreground">
                        {b.movie_title}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {b.cinema_name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" /> {showDateStr}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {b.show_time}
                        </span>
                      </div>

                      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Seats:</span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(b.seats) ? b.seats : [b.seats]).map((s) => (
                            <span
                              key={s}
                              className="rounded bg-primary/20 px-2 py-0.5 font-bold text-primary text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <span className="ml-auto font-display text-lg font-bold text-foreground">
                          ₹{b.total_amount}
                        </span>
                      </div>
                    </div>

                    {/* Right: QR Code & Actions */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-border/40 pt-3 sm:pt-0 sm:pl-5">
                      {/* Scannable QR Code or Cancelled Void Stamp */}
                      {isConfirmed && qrCodes[b.booking_code] ? (
                        <div className="flex flex-col items-center">
                          <div className="rounded-md border border-primary/40 bg-white p-1.5 shadow-sm">
                            <img
                              src={qrCodes[b.booking_code]}
                              alt={`QR Code for ${b.booking_code}`}
                              className="h-20 w-20"
                            />
                          </div>
                          <span className="mt-1 text-[9px] font-bold text-primary tracking-wider uppercase">
                            Gate QR Pass
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-20 w-20 rounded-md border border-dashed border-rose-500/40 bg-rose-500/10 text-center p-2">
                          <XCircle className="h-6 w-6 text-rose-400 mb-0.5" />
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                            VOID
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        {isConfirmed ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(b)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground shadow-sm"
                            >
                              <Download className="h-3.5 w-3.5" /> PDF Ticket
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmCancelBooking(b)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500 hover:text-white"
                            >
                              Cancel Ticket
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center">
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> CANCELLED
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Pass Void • No Download
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-[#10121a] px-5 py-3 text-xs text-muted-foreground">
          <span>Tickets are sent to your registered email address with official PDF passes.</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-gold !px-4 !py-1.5 !text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-md rounded-xl border border-rose-500/50 bg-[#161922] p-6 text-foreground shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-display text-xl font-bold">Cancel Ticket Booking?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Are you sure you want to cancel your booking for{" "}
              <strong className="text-foreground">
                {confirmCancelBooking.movie_title} ({confirmCancelBooking.booking_code})
              </strong>
              ?
            </p>
            <div className="mt-3 rounded-md border border-border/50 bg-[#0e1118] p-3 text-xs space-y-1">
              <div>Cinema: {confirmCancelBooking.cinema_name}</div>
              <div>
                Seats:{" "}
                <span className="font-bold text-primary">
                  {(Array.isArray(confirmCancelBooking.seats)
                    ? confirmCancelBooking.seats
                    : [confirmCancelBooking.seats]
                  ).join(", ")}
                </span>
              </div>
              <div>Refund Amount: ₹{confirmCancelBooking.total_amount}</div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Once cancelled, these seats will be immediately released back to other customers.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                className="btn-outline flex-1 !py-2 text-xs"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId !== null}
                onClick={handleConfirmCancel}
                className="flex-1 rounded-md bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

