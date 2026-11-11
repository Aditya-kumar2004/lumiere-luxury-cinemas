import { createFileRoute } from "@tanstack/react-router";
import AuthForm from "@/components/cine/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — LUMIÈRE Cinemas" },
      {
        name: "description",
        content:
          "Sign in to LUMIÈRE to book tickets faster and unlock exclusive member privileges.",
      },
      { property: "og:title", content: "Login — LUMIÈRE Cinemas" },
      { property: "og:description", content: "Sign in to LUMIÈRE to book premier movie tickets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
