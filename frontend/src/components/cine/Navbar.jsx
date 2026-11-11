import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, ChevronDown, Menu, X, Ticket, User, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import LocationDialog from "./LocationDialog";
import { useTheme } from "@/hooks/useTheme";

const NAV = [
  { label: "Home", to: "/", key: "home" },
  { label: "Movies", to: "/movies", key: "movies" },
  { label: "Now Showing", to: "/", hash: "now-showing", key: "now-showing" },
  { label: "Coming Soon", to: "/", hash: "coming-soon", key: "coming-soon" },
  { label: "Cinemas", to: "/", hash: "cinemas", key: "cinemas" },
  { label: "Offers", to: "/", hash: "offers", key: "offers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [city, setCity] = useState("Mumbai");

  const { isDark, toggleTheme } = useTheme();
  const { pathname, hash } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, hash: s.location.hash }),
  });

  const isOverHero = pathname === "/" && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const saved = window.localStorage.getItem("lumiere-city");
    if (saved) setCity(saved);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, hash]);

  const activeKey = pathname.startsWith("/movies")
    ? "movies"
    : pathname === "/"
      ? hash || "home"
      : "";

  const chooseCity = (c) => {
    setCity(c);
    window.localStorage.setItem("lumiere-city", c);
    setLocOpen(false);
  };

  const navLink = (item, mobile = false) => {
    const active = activeKey === item.key;
    if (mobile) {
      return (
        <Link
          key={item.key}
          to={item.to}
          hash={item.hash}
          className={`block rounded-md px-3 py-3 text-base font-semibold transition ${
            active ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent"
          }`}
        >
          {item.label}
        </Link>
      );
    }

    const colorClass = isOverHero
      ? active
        ? "text-primary font-bold"
        : "text-white/85 hover:text-white"
      : active
        ? "text-primary font-bold"
        : "text-muted-foreground hover:text-foreground";

    return (
      <Link
        key={item.key}
        to={item.to}
        hash={item.hash}
        className={`relative py-2 text-sm font-semibold transition-colors ${colorClass} after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:bg-primary after:transition-all ${
          active ? "after:w-full" : "after:w-0 hover:after:w-full"
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isOverHero
            ? "border-b border-transparent bg-gradient-to-b from-black/85 via-black/45 to-transparent"
            : scrolled || mobileOpen
              ? "border-b border-border bg-nav/95 shadow-md backdrop-blur-xl"
              : "border-b border-border/50 bg-nav/90 backdrop-blur-md"
        }`}
      >
        <div className="container-cine flex h-[72px] items-center justify-between gap-4">
          <Logo contrast={isOverHero ? "light" : "auto"} />

          <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
            {NAV.map((n) => navLink(n))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border transition-all duration-300 active:scale-95 ${
                isOverHero
                  ? "border-white/20 bg-black/50 text-white hover:border-primary hover:bg-black/80 hover:text-primary"
                  : "border-border/80 bg-card/80 text-foreground hover:border-primary hover:bg-accent hover:text-primary"
              }`}
            >
              {isDark ? (
                <Sun className="h-[18px] w-[18px] text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon
                  className={`h-[18px] w-[18px] transition-transform duration-300 hover:-rotate-12 ${
                    isOverHero ? "text-amber-300" : "text-primary"
                  }`}
                />
              )}
            </button>

            {/* Location Selector */}
            <button
              type="button"
              onClick={() => setLocOpen(true)}
              className={`hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm transition md:flex ${
                isOverHero
                  ? "text-white/85 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="h-4 w-4 text-primary" /> {city}{" "}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Login / Sign Up */}
            <Link
              to="/login"
              className={`hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold transition hover:text-primary lg:flex ${
                isOverHero ? "text-white/90" : "text-foreground"
              }`}
            >
              <User className="h-4 w-4 text-primary" /> Login / Sign Up
            </Link>

            {/* Book Tickets CTA */}
            <Link to="/movies" className="btn-gold hidden !py-2.5 sm:inline-flex">
              <Ticket className="h-4 w-4" /> Book Tickets
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className={`grid h-10 w-10 place-items-center rounded-md transition xl:hidden ${
                isOverHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
              }`}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="border-t border-border bg-nav xl:hidden animate-in slide-in-from-top-2">
            <nav className="container-cine flex flex-col gap-1 py-4" aria-label="Mobile">
              {NAV.map((n) => navLink(n, true))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setLocOpen(true)}
                  className="btn-outline !py-2.5"
                >
                  <MapPin className="h-4 w-4 text-primary" /> {city}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn-outline !py-2.5"
                  aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                >
                  {isDark ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-400" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-primary" /> Dark Mode
                    </>
                  )}
                </button>
                <Link to="/login" className="btn-outline col-span-2 !py-2.5">
                  <User className="h-4 w-4" /> Login / Sign Up
                </Link>
                <Link to="/movies" className="btn-gold col-span-2">
                  <Ticket className="h-4 w-4" /> Book Tickets
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      <LocationDialog
        open={locOpen}
        current={city}
        onSelect={chooseCity}
        onClose={() => setLocOpen(false)}
      />
    </>
  );
}
