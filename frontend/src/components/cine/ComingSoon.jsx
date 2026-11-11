import { useEffect, useState } from "react";
import { toast } from "sonner";
import MovieCarousel from "./MovieCarousel";
import MovieCard from "./MovieCard";

export default function ComingSoon({ movies }) {
  const [reminders, setReminders] = useState([]);
  useEffect(() => {
    setReminders(JSON.parse(window.localStorage.getItem("lumiere-reminders") || "[]"));
  }, []);
  function toggleReminder(movie) {
    const hasReminder = reminders.includes(movie.id);
    let nextReminders;
    if (hasReminder) {
      nextReminders = reminders.filter((id) => id !== movie.id);
    } else {
      nextReminders = [...reminders, movie.id];
    }
    setReminders(nextReminders);
    try {
      window.localStorage.setItem("lumiere-reminders", JSON.stringify(nextReminders));
    } catch {
      // ignore storage error
    }

    if (hasReminder) {
      toast.success(`Reminder removed for ${movie.title}`);
    } else {
      toast.success(`We'll remind you when ${movie.title} opens`);
    }
  }
  return (
    <MovieCarousel
      id="coming-soon"
      eyebrow="UPCOMING RELEASES"
      title="Coming Soon"
      subtitle="Be first in line for the year's most anticipated premieres."
      items={movies}
      renderItem={(m) => (
        <div>
          <MovieCard
            movie={m}
            variant="soon"
            onRemind={toggleReminder}
            reminded={reminders.includes(m.id)}
          />
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
          <button
            type="button"
            onClick={() => toggleReminder(m)}
            className={`mt-3 w-full rounded-md border py-2 text-xs font-bold transition active:scale-95 ${reminders.includes(m.id) ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 text-primary hover:bg-primary/10"}`}
          >
            {reminders.includes(m.id) ? "✓ Reminder Set" : "Remind Me"}
          </button>
        </div>
      )}
    />
  );
}
