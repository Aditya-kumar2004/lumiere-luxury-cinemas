import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function MovieCarousel({ id, eyebrow, title, subtitle, items, renderItem }) {
  const track = useRef(null);
  const scroll = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  const arrow =
    "grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary active:scale-95";
  return (
    <Reveal as="section" id={id} className="container-cine scroll-mt-24 py-14">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scroll(-1)}
              className={arrow}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scroll(1)}
              className={arrow}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        }
      />
      <div
        ref={track}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="w-[68%] xs:w-[46%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%] shrink-0 snap-start"
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    </Reveal>
  );
}
