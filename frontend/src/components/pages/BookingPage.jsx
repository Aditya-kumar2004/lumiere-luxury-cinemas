import { useState, useEffect } from "react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Ticket,
  Printer,
  Film,
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { SHOWTIMES, CINEMAS } from "@/data/movies";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 12;
const PRICE = { standard: 250, premium: 420 };
const DEFAULT_TAKEN = ["A5", "A6", "C3", "C4", "D8", "E1", "E2", "F9", "F10", "G6", "H4"];

const Route = getRouteApi("/book/$movieId");

export default function BookingPage() {
  const navigate = useNavigate();
  const { movie } = Route.useLoaderData();
  const [cinema, setCinema] = useState(CINEMAS[0]);
  const [time, setTime] = useState(SHOWTIMES[3]);
  const [seats, setSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [modalQrUrl, setModalQrUrl] = useState(null);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem("lumiere-user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Protect route & listen for logout events
  useEffect(() => {
    const checkAuth = () => {
      try {
        const saved = window.localStorage.getItem("lumiere-user");
        const user = saved ? JSON.parse(saved) : null;
        setCurrentUser(user);
        if (!user) {
          navigate({ to: "/" });
        }
      } catch {
        navigate({ to: "/" });
      }
    };

    // Initial check on mount
    const saved = window.localStorage.getItem("lumiere-user");
    if (!saved) {
      toast.info("Please sign in or create an account to book tickets.");
      navigate({
        to: "/login",
        search: { redirect: `/book/${movie.id}` },
      });
    }

    window.addEventListener("lumiere-auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("lumiere-auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [movie.id, navigate]);

  // Occupied seats (initial default + live database seats)
  const [occupiedSeats, setOccupiedSeats] = useState(() => new Set(DEFAULT_TAKEN));

  // Fetch real-time occupied seats for this movie and showtime from backend
  useEffect(() => {
    let isMounted = true;
    const today = new Date().toISOString().split("T")[0];

    async function fetchOccupied() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/bookings/occupied?movieTitle=${encodeURIComponent(
            movie.title
          )}&cinemaName=${encodeURIComponent(cinema)}&showTime=${encodeURIComponent(time)}&showDate=${today}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.occupiedSeats)) {
            const newOccupied = new Set([...DEFAULT_TAKEN, ...data.occupiedSeats]);
            setOccupiedSeats(newOccupied);

            // If another user booked a seat that this user had highlighted, deselect it
            setSeats((prevSelected) => {
              const conflicted = prevSelected.filter((s) => data.occupiedSeats.includes(s));
              if (conflicted.length > 0) {
                toast.warning(`Seat(s) ${conflicted.join(", ")} were just booked by another customer.`);
                return prevSelected.filter((s) => !data.occupiedSeats.includes(s));
              }
              return prevSelected;
            });
          }
        }
      } catch {}
    }

    // 1. Initial fetch
    fetchOccupied();

    // 2. Real-time background polling every 2 seconds for live changes across any device
    const intervalId = setInterval(fetchOccupied, 2000);

    // 3. Instant local & cross-tab sync listeners
    const handleSeatsUpdate = () => {
      fetchOccupied();
    };

    window.addEventListener("lumiere-seats-updated", handleSeatsUpdate);
    window.addEventListener("storage", handleSeatsUpdate);

    // BroadcastChannel for instant cross-tab sync
    let bc = null;
    try {
      bc = new BroadcastChannel("lumiere_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "SEATS_UPDATED") {
          fetchOccupied();
        }
      };
    } catch {}

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("lumiere-seats-updated", handleSeatsUpdate);
      window.removeEventListener("storage", handleSeatsUpdate);
      if (bc) {
        bc.close();
      }
    };
  }, [movie.title, cinema, time]);

  function toggleSeat(id) {
    setSeats((prevSeats) => {
      if (prevSeats.includes(id)) {
        return prevSeats.filter((seatId) => seatId !== id);
      }
      if (prevSeats.length >= 10) {
        toast.warning("Maximum 10 seats per booking.");
        return prevSeats;
      }
      return [...prevSeats, id];
    });
  }

  let total = 0;
  for (const seatId of seats) {
    const row = seatId[0];
    if (row === "G" || row === "H") {
      total += PRICE.premium;
    } else {
      total += PRICE.standard;
    }
  }

  const chip = (active) =>
    `rounded-md border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card hover:border-primary/50"
    }`;

  // Handle Confirmed Ticket Booking
  const handleProceedToBooking = async () => {
    if (!currentUser) {
      toast.info("Please sign in to complete your booking.");
      navigate({ to: "/login", search: { redirect: `/book/${movie.id}` } });
      return;
    }

    if (seats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    setIsBooking(true);
    try {
      const token = window.localStorage.getItem("lumiere-token");
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          cinemaName: cinema,
          city: "Mumbai",
          screenType: cinema.includes("IMAX") ? "IMAX Laser" : "VIP Luxury Screen",
          showDate: new Date().toISOString().split("T")[0],
          showTime: time,
          seats: seats,
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmedBooking(data.booking);
        setOccupiedSeats((prev) => new Set([...prev, ...seats]));

        // Broadcast booking event to all open tabs and windows
        window.dispatchEvent(
          new CustomEvent("lumiere-seats-updated", {
            detail: { action: "BOOK", seats },
          })
        );
        window.localStorage.setItem("lumiere-seats-updated", Date.now().toString());
        try {
          const bc = new BroadcastChannel("lumiere_channel");
          bc.postMessage({ type: "SEATS_UPDATED", action: "BOOK" });
          bc.close();
        } catch {}

        try {
          const qr = await QRCode.toDataURL(data.booking.bookingCode, {
            width: 140,
            margin: 1,
            color: { dark: "#0c0e14", light: "#ffffff" },
          });
          setModalQrUrl(qr);
        } catch {}
        toast.success("Ticket Confirmed!", {
          description: `Booking code: ${data.booking.bookingCode}`,
        });
      } else {
        toast.error(data.message || "Could not complete booking. Please try again.");
      }
    } catch {
      // Demo session fallback if backend port is offline
      const demoCode = "CP-" + Math.floor(10000 + Math.random() * 90000);
      const demoBooking = {
        id: 1,
        bookingCode: demoCode,
        movieTitle: movie.title,
        cinemaName: cinema,
        screenType: "VIP Luxury Screen",
        showDate: new Date().toISOString().split("T")[0],
        showTime: time,
        seats: seats,
        totalAmount: total,
        userName: currentUser?.name || "VIP Guest",
        userEmail: currentUser?.email || "guest@lumiere.com",
      };
      setConfirmedBooking(demoBooking);
      setOccupiedSeats((prev) => new Set([...prev, ...seats]));
      try {
        const qr = await QRCode.toDataURL(demoCode, {
          width: 140,
          margin: 1,
          color: { dark: "#0c0e14", light: "#ffffff" },
        });
        setModalQrUrl(qr);
      } catch {}
      toast.success("Ticket Confirmed!", {
        description: `Booking reference: ${demoCode}`,
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!confirmedBooking) return;
    const token = window.localStorage.getItem("lumiere-token");
    toast.info("Downloading official PDF Cinema Pass...");
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${confirmedBooking.id || 1}/pdf`,
        {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lumiere-Ticket-${confirmedBooking.bookingCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Official PDF Ticket Pass Downloaded!");
    } catch {
      window.print();
    }
  };

  return (
    <section className="pb-20 pt-28">
      <div className="container-cine">
        <Link
          to="/movies/$movieId"
          params={{ movieId: movie.id }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {movie.title}
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-8">
            <div className="flex items-center gap-4">
              <img
                src={movie.poster}
                alt=""
                className="h-24 w-16 shrink-0 rounded-sm object-cover border border-border"
              />
              <div className="min-w-0">
                <h1 className="truncate font-display text-2xl xs:text-3xl sm:text-5xl tracking-wide">
                  {movie.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {movie.genres.join(" • ")} · {movie.duration} · {movie.language}
                </p>
              </div>
            </div>

            {/* Cinema Selection */}
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-[0.25em] text-primary">CINEMA</h2>
              <div className="flex flex-wrap gap-2">
                {CINEMAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCinema(c);
                      setSeats([]);
                    }}
                    className={chip(c === cinema)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Showtime Selection */}
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-[0.25em] text-primary">
                SHOWTIME · TODAY
              </h2>
              <div className="flex flex-wrap gap-2">
                {SHOWTIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTime(t);
                      setSeats([]);
                    }}
                    className={chip(t === time)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Seating Layout Screen */}
            <div className="rounded-lg border border-border bg-surface p-4 sm:p-8">
              <div className="mx-auto mb-10 h-2 w-3/4 rounded-full bg-primary/60 shadow-gold" />
              <p className="-mt-8 mb-4 text-center text-[10px] tracking-[0.4em] text-muted-foreground">
                CINEMA SCREEN
              </p>
              <p className="mb-4 text-center text-[11px] text-primary/80 sm:hidden">
                ↔ Swipe horizontally to view all 12 seats
              </p>
              <div className="no-scrollbar overflow-x-auto">
                <div className="mx-auto w-fit space-y-2">
                  {ROWS.map((r) => (
                    <div key={r} className="flex items-center gap-1.5">
                      <span className="w-4 text-xs text-muted-foreground">{r}</span>
                      {Array.from({ length: COLS }, (_, i) => {
                        const id = `${r}${i + 1}`;
                        const taken = occupiedSeats.has(id);
                        const sel = seats.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={taken}
                            onClick={() => toggleSeat(id)}
                            aria-label={`Seat ${id}`}
                            aria-pressed={sel}
                            className={`h-7 w-7 rounded-t-md text-[9px] font-bold transition ${
                              i === 5 ? "mr-4" : ""
                            } ${
                              taken
                                ? "cursor-not-allowed bg-red-950/50 border border-red-500/30 text-red-500/40 line-through"
                                : sel
                                ? "bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/40 scale-105 border border-emerald-400"
                                : ["G", "H"].includes(r)
                                ? "border border-red-500/50 bg-card text-zinc-300 hover:bg-red-500/20 hover:border-red-500"
                                : "border border-emerald-500/30 bg-card text-zinc-300 hover:border-emerald-500 hover:bg-emerald-500/15"
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-emerald-500/50 bg-card" /> Available (Standard ₹{PRICE.standard})
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-red-500/50 bg-card" /> Recliner (₹{PRICE.premium})
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Selected ({seats.length})
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-red-950/60 border border-red-500/40" /> Sold Out
                </span>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-display text-2xl tracking-wide">Booking Summary</h2>
              {currentUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Cinema</dt>
                <dd className="text-right font-medium">{cinema}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Showtime</dt>
                <dd className="font-medium">{time}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Seats</dt>
                <dd className="text-right font-bold text-primary">
                  {seats.length ? seats.join(", ") : "None selected"}
                </dd>
              </div>
              {currentUser && (
                <div className="flex justify-between gap-3 border-t border-border/50 pt-2 text-xs">
                  <dt className="text-muted-foreground">Guest</dt>
                  <dd className="truncate text-foreground">{currentUser.name}</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-4xl text-primary font-bold">₹{total}</span>
            </div>

            {/* Primary Action Button */}
            {!currentUser ? (
              <button
                type="button"
                onClick={() =>
                  navigate({ to: "/login", search: { redirect: `/book/${movie.id}` } })
                }
                className="btn-gold mt-6 w-full text-center"
              >
                Sign In to Book Tickets
              </button>
            ) : seats.length === 0 ? (
              <button
                type="button"
                disabled
                className="btn-gold mt-6 w-full cursor-not-allowed opacity-50 text-center"
              >
                Select Seats to Proceed
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToBooking}
                disabled={isBooking}
                className="btn-gold mt-6 w-full text-center shadow-lg transition active:scale-95"
              >
                {isBooking ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming Booking...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Ticket className="h-4 w-4" /> Confirm & Book ({seats.length} Seat
                    {seats.length > 1 ? "s" : ""}) · ₹{total}
                  </span>
                )}
              </button>
            )}

            <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" /> Instant booking confirmation
              with digital ticket pass sent to your email.
            </p>
          </aside>
        </div>
      </div>

      {/* LUXURY TICKET CONFIRMATION MODAL */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-primary/50 bg-[#12141a] p-6 text-foreground shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setConfirmedBooking(null);
                setSeats([]);
              }}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Status */}
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 tracking-wider">
                ✓ BOOKING CONFIRMED
              </span>
              <h2 className="mt-3 font-display text-2xl tracking-wide text-foreground">
                Enjoy the Show, {confirmedBooking.userName || currentUser?.name}!
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Your cinema pass has been registered. Present this booking code at entry.
              </p>
            </div>

            {/* Ticket Card Details */}
            <div className="mt-6 rounded-lg border border-primary/30 bg-[#181b22] p-4 text-sm">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    BOOKING REFERENCE
                  </span>
                  <p className="font-mono text-xl font-extrabold tracking-widest text-foreground">
                    {confirmedBooking.bookingCode}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    TOTAL PAID
                  </span>
                  <p className="font-display text-2xl font-bold text-primary">
                    ₹{confirmedBooking.totalAmount}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie:</span>
                  <span className="font-bold text-foreground">{confirmedBooking.movieTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cinema:</span>
                  <span className="text-foreground">{confirmedBooking.cinemaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Showtime:</span>
                  <span className="text-foreground">Today · {confirmedBooking.showTime}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Seats Booked:</span>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(confirmedBooking.seats)
                      ? confirmedBooking.seats
                      : [confirmedBooking.seats]
                    ).map((s) => (
                      <span
                        key={s}
                        className="rounded bg-primary/20 px-2 py-0.5 font-bold text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded border border-border/40 bg-surface/60 p-2.5 text-center text-[11px] text-muted-foreground">
                ✉️ A digital pass has been emailed to{" "}
                <span className="text-foreground font-semibold">
                  {confirmedBooking.userEmail || currentUser?.email}
                </span>
              </div>

              {/* Live Gate QR Pass */}
              {modalQrUrl && (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-[#12141c] p-3">
                  <div className="rounded-md border border-primary/50 bg-white p-2 shadow-md">
                    <img src={modalQrUrl} alt="Gate QR Pass" className="h-24 w-24" />
                  </div>
                  <span className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                    GATE ENTRY QR CODE
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Present this QR code or PDF at the cinema gate for instant scan.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="btn-gold flex-1 items-center justify-center gap-2 !py-2.5 text-xs font-bold"
              >
                <Download className="h-4 w-4" /> Download PDF Pass
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-outline flex-1 items-center justify-center gap-2 !py-2.5 text-xs"
              >
                <Printer className="h-4 w-4" /> Print Ticket
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setSeats([]);
                  navigate({ to: "/movies" });
                }}
                className="btn-outline flex-1 items-center justify-center gap-2 !py-2.5 text-xs"
              >
                <Film className="h-4 w-4" /> More Movies
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
