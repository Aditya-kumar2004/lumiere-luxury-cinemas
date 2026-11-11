import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/components/pages/HomePage";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LUMIÈRE — Premier Luxury Cinemas & Ticket Booking" },
      {
        name: "description",
        content:
          "Book tickets for the latest blockbusters in IMAX Laser, Dolby Atmos and luxury VIP recliners. Now showing, coming soon and exclusive offers at LUMIÈRE.",
      },
      {
        property: "og:title",
        content: "LUMIÈRE — Premier Luxury Cinemas & Ticket Booking",
      },
      {
        property: "og:description",
        content:
          "Discover blockbusters, upcoming releases and reserve your premier seats at LUMIÈRE Cinemas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
