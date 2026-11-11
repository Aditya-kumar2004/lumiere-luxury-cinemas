import { MonitorPlay, AudioLines, Armchair, Smartphone, Popcorn, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: MonitorPlay, title: "Premium Screens", text: "IMAX & 4K laser projection" },
  { icon: AudioLines, title: "Dolby Atmos", text: "Sound that moves around you" },
  { icon: Armchair, title: "Comfortable Recliners", text: "Extra legroom, every row" },
  { icon: Smartphone, title: "Online Booking", text: "Pick seats in seconds" },
  { icon: Popcorn, title: "Food & Beverages", text: "Gourmet snacks to your seat" },
  { icon: ShieldCheck, title: "Secure Payments", text: "Encrypted, trusted checkout" },
];

export default function FeatureStrip() {
  return (
    <section className="container-cine relative z-10 -mt-10">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border shadow-card md:grid-cols-3 xl:grid-cols-6">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="group flex items-center gap-3 bg-surface/95 p-4 backdrop-blur transition hover:bg-card sm:p-5"
          >
            <Icon
              className="h-7 w-7 shrink-0 text-primary transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
