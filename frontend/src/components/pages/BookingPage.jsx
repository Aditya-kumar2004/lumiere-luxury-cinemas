import { useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { SHOWTIMES, CINEMAS } from "@/data/movies";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = 12;
const PRICE = { standard: 250, premium: 420 };
// Demo seat availability — replace with live data from your booking API.
const TAKEN = new Set(["A5", "A6", "C3", "C4", "D8", "E1", "E2", "F9", "F10", "G6", "H4"]);

const Route = getRouteApi("/book/$movieId");

export default function BookingPage() {
  const { movie } = Route.useLoaderData();
  const [cinema, setCinema] = useState(CINEMAS[0]);
  const [time, setTime] = useState(SHOWTIMES[3]);
  const [seats, setSeats] = useState([]);
  function toggleSeat(id) {
    setSeats((prevSeats) => {
      if (prevSeats.includes(id)) {
        return prevSeats.filter((seatId) => seatId !== id);
      }
      if (prevSeats.length >= 10) {
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
    `rounded-md border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"}`;

  return (
    <section className="pb-20 pt-28">
      <div className="container-cine">
        <Link
          to="/movies/$movieId"
          params={{ movieId: movie.id }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {movie.title}
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-8">
            <div className="flex items-center gap-4">
              <img
                src={movie.poster}
                alt=""
                className="h-24 w-16 shrink-0 rounded-sm object-cover"
              />
              <div className="min-w-0">
                <h1 className="truncate font-display text-5xl tracking-wide">{movie.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {movie.genres.join(" • ")} · {movie.duration} · {movie.language}
                </p>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-[0.25em] text-primary">CINEMA</h2>
              <div className="flex flex-wrap gap-2">
                {CINEMAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCinema(c)}
                    className={chip(c === cinema)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-[0.25em] text-primary">
                SHOWTIME · TODAY
              </h2>
              <div className="flex flex-wrap gap-2">
                {SHOWTIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={chip(t === time)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 sm:p-8">
              <div className="mx-auto mb-10 h-2 w-3/4 rounded-full bg-primary/60 shadow-gold" />
              <p className="-mt-8 mb-8 text-center text-[10px] tracking-[0.4em] text-muted-foreground">
                SCREEN
              </p>
              <div className="no-scrollbar overflow-x-auto">
                <div className="mx-auto w-fit space-y-2">
                  {ROWS.map((r) => (
                    <div key={r} className="flex items-center gap-1.5">
                      <span className="w-4 text-xs text-muted-foreground">{r}</span>
                      {Array.from({ length: COLS }, (_, i) => {
                        const id = `${r}${i + 1}`;
                        const taken = TAKEN.has(id);
                        const sel = seats.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={taken}
                            onClick={() => toggleSeat(id)}
                            aria-label={`Seat ${id}`}
                            aria-pressed={sel}
                            className={`h-7 w-7 rounded-t-md text-[9px] font-bold transition ${i === 5 ? "mr-4" : ""} ${taken ? "cursor-not-allowed bg-accent/50 text-transparent" : sel ? "bg-primary text-primary-foreground" : ["G", "H"].includes(r) ? "border border-primary/50 bg-card text-muted-foreground hover:bg-primary/30" : "border border-border bg-card text-muted-foreground hover:border-primary"}`}
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
                  <span className="h-3 w-3 rounded-sm border border-border bg-card" /> Standard ₹
                  {PRICE.standard}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-primary/50 bg-card" /> Recliner
                  ₹{PRICE.premium}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-primary" /> Selected
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-accent/50" /> Sold
                </span>
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-3xl tracking-wide">Booking Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Cinema</dt>
                <dd className="text-right">{cinema}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Showtime</dt>
                <dd>{time}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Seats</dt>
                <dd className="text-right">{seats.length ? seats.join(", ") : "—"}</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-4xl text-primary">₹{total}</span>
            </div>
            <button
              type="button"
              disabled
              className="btn-gold mt-6 w-full cursor-not-allowed opacity-50"
            >
              Proceed to Payment
            </button>
            <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary" /> Seat selection is a preview.
              Payments and confirmed bookings will work once a booking service is connected.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
