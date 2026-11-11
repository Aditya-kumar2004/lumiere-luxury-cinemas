import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import popcorn from "@/assets/offer-popcorn.jpg";
import students from "@/assets/offer-students.jpg";
import family from "@/assets/offer-family.jpg";

const OFFERS = [
  {
    id: "20off",
    tag: "LIMITED TIME",
    title: "20% OFF",
    sub: "On selected movie tickets",
    text: "Enjoy exclusive discounts on selected movie tickets, Monday to Thursday.",
    img: popcorn,
    big: true,
  },
  {
    id: "student",
    tag: "EVERY TUESDAY",
    title: "Student Discount",
    sub: "15% off with valid ID",
    text: "Special offers for students.",
    img: students,
  },
  {
    id: "family",
    tag: "WEEKENDS",
    title: "Family Movie Night",
    sub: "2 adults + 2 kids",
    text: "Enjoy special family ticket packages.",
    img: family,
  },
];

export default function OffersSection() {
  return (
    <Reveal as="section" id="offers" className="container-cine scroll-mt-24 py-14">
      <SectionHeading
        eyebrow="SPECIAL OFFERS"
        title="Deals & Promotions"
        subtitle="More movies, elevated luxury — exclusive LUMIÈRE privileges."
      />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr_1fr]">
        {OFFERS.map((o) => (
          <article
            key={o.id}
            className={`group relative isolate flex min-h-[280px] flex-col justify-end overflow-hidden rounded-xl border border-border/80 bg-zinc-950 p-6 shadow-card transition-all duration-300 hover:border-primary/50 sm:p-8 ${o.big ? "lg:min-h-[340px]" : ""}`}
          >
            <img
              src={o.img}
              alt=""
              loading="lazy"
              className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Rich dark luxury vignette over offer photo */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/75 to-black/25" />
            <span className="mb-3 w-fit rounded-full border border-primary/40 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.25em] text-primary backdrop-blur">
              {o.tag}
            </span>
            <h3
              className={`font-display tracking-wide text-amber-400 ${o.big ? "text-4xl xs:text-5xl sm:text-7xl" : "text-3xl sm:text-4xl"}`}
            >
              {o.title}
            </h3>
            <p className="font-semibold text-white">{o.sub}</p>
            <p className="mt-1 max-w-xs text-sm text-zinc-300">{o.text}</p>
            <button
              type="button"
              onClick={() =>
                toast(`${o.title}`, {
                  description: "Offer applied automatically at checkout when eligible.",
                })
              }
              className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-amber-400 transition group-hover:gap-3 hover:text-amber-300"
            >
              Explore Offer <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </Reveal>
  );
}
