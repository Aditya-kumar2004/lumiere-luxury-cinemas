import { useRouterState } from "@tanstack/react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayout({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <main className="min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden bg-background">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
