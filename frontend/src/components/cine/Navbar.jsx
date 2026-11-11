import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, ChevronDown, Menu, X, Ticket, User, Sun, Moon, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
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

// Circular Profile Avatar Component
function UserAvatar({ user, size = "md" }) {
  const [error, setError] = useState(false);
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";
  
  // Unavatar searches Google, Gravatar, and social profiles by email
  const avatarUrl = `https://unavatar.io/${encodeURIComponent(user?.email || "")}?fallback=false`;
  const sizeClasses = size === "lg" ? "h-11 w-11 text-base" : "h-8 w-8 text-xs";

  return (
    <div
      className={`relative flex ${sizeClasses} shrink-0 items-center justify-center rounded-full border-2 border-primary/70 bg-gradient-to-tr from-amber-500 via-primary to-yellow-300 font-extrabold text-black shadow-md overflow-hidden`}
    >
      {!error && user?.email ? (
        <img
          src={avatarUrl}
          alt={user?.name || "Profile"}
          onError={() => setError(true)}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <span className="font-extrabold tracking-tight">{initial}</span>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [city, setCity] = useState("Mumbai");
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { pathname, hash } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, hash: s.location.hash }),
  });

  const isOverHero = pathname === "/" && !scrolled && !mobileOpen;

  // Sync Logged-In User from LocalStorage
  useEffect(() => {
    const checkUser = () => {
      try {
        const saved = window.localStorage.getItem("lumiere-user");
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("lumiere-auth-change", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("lumiere-auth-change", checkUser);
    };
  }, [pathname]);

  // Close profile dropdown on outside click or route change
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const close = () => setProfileOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [profileOpen]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const savedCity = window.localStorage.getItem("lumiere-city");
    if (savedCity) setCity(savedCity);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, hash]);

  // Logout Function
  const handleLogout = () => {
    window.localStorage.removeItem("lumiere-user");
    window.localStorage.removeItem("lumiere-token");
    setUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event("lumiere-auth-change"));
    toast.success("Signed out successfully. See you soon at LUMIÈRE!");
  };

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

  const firstName = user?.name ? user.name.split(" ")[0] : "VIP Member";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isOverHero
            ? "border-b border-transparent bg-gradient-to-b from-black/85 via-black/45 to-transparent"
            : scrolled || mobileOpen
              ? "border-b border-border bg-nav/95 backdrop-blur-md shadow-md"
              : "border-b border-border/40 bg-transparent backdrop-blur-xs"
        }`}
      >
        <div className="container-cine flex h-20 items-center justify-between gap-4">
          {/* Logo (Already contains its own Link to="/" inside Logo.jsx) */}
          <Logo contrast={isOverHero ? "light" : undefined} />

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.map((n) => navLink(n))}
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`hidden h-9 w-9 items-center justify-center rounded-md transition sm:inline-flex ${
                isOverHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
              }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
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

            {/* Authenticated User Circular Avatar & Profile Dropdown */}
            {user ? (
              <>
                {/* Desktop Profile Pill & Dropdown */}
                <div className="relative hidden items-center lg:flex">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen((prev) => !prev);
                    }}
                    className={`flex items-center gap-2 rounded-full border border-primary/30 bg-card/85 py-1 pl-1 pr-3 text-xs font-semibold shadow-sm transition hover:border-primary hover:bg-card ${
                      isOverHero ? "text-white" : "text-foreground"
                    }`}
                    aria-expanded={profileOpen}
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="font-bold text-primary">{firstName}</span>
                    <ChevronDown
                      className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                        profileOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {/* Luxury Profile Dropdown Menu */}
                  {profileOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
                    >
                      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                        <UserAvatar user={user} size="lg" />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            VIP Member
                          </span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" /> Logout from LUMIÈRE
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile / Tablet Avatar Button */}
                <button
                  type="button"
                  onClick={() => setMobileOpen((v) => !v)}
                  className="flex items-center rounded-full border border-primary/40 p-0.5 lg:hidden transition hover:border-primary active:scale-95"
                  aria-label="Open user menu"
                >
                  <UserAvatar user={user} size="sm" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold transition hover:text-primary lg:flex ${
                  isOverHero ? "text-white/90" : "text-foreground"
                }`}
              >
                <User className="h-4 w-4 text-primary" /> Login / Sign Up
              </Link>
            )}

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
              className={`grid h-10 w-10 place-items-center rounded-md transition lg:hidden ${
                isOverHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
              }`}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="border-t border-border bg-nav lg:hidden animate-in slide-in-from-top-2">
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

                {/* Mobile Profile Card */}
                {user ? (
                  <div className="col-span-2 flex flex-col gap-2.5 rounded-lg border border-primary/30 bg-card/70 p-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="lg" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary">
                          ⭐ LUMIÈRE VIP Member
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex items-center justify-center gap-2 rounded-md border border-destructive/40 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-outline col-span-2 !py-2.5">
                    <User className="h-4 w-4" /> Login / Sign Up
                  </Link>
                )}

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
