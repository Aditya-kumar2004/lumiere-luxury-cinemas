import { createFileRoute } from "@tanstack/react-router";
import AdminDashboardPage from "@/components/pages/AdminDashboardPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — LUMIÈRE Cinemas" },
      {
        name: "description",
        content: "Master administrative control center for user roles, staff permissions, and cinema management.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

