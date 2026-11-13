import { createFileRoute } from "@tanstack/react-router";
import StaffDashboardPage from "@/components/pages/StaffDashboardPage";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Control Center — LUMIÈRE Cinemas" },
      {
        name: "description",
        content: "Staff portal for ticket admission, gate verification, and auditorium operations.",
      },
    ],
  }),
  component: StaffDashboardPage,
});

