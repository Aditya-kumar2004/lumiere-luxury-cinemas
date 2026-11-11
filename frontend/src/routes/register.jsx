import { createFileRoute } from "@tanstack/react-router";
import AuthForm from "@/components/cine/AuthForm";
export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Sign Up — LUMIÈRE Cinemas" },
      {
        name: "description",
        content:
          "Join LUMIÈRE Cinemas to book premier tickets, choose VIP seats, and unlock member rewards.",
      },
      { property: "og:title", content: "Sign Up — LUMIÈRE Cinemas" },
      {
        property: "og:description",
        content: "Join LUMIÈRE Cinemas to book premier movie tickets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
