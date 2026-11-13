import { useEffect, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  ChevronDown,
  Menu,
  X,
  Ticket,
  User,
  Sun,
  Moon,
  LogOut,
  ScanLine,
  LayoutDashboard,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "./Logo";
import LocationDialog from "./LocationDialog";
import MyBookingsDialog from "./MyBookingsDialog";
import StaffScannerDialog from "./StaffScannerDialog";
import { useTheme } from "@/hooks/useTheme";
import { API_BASE_URL } from "@/config";

const NAV = [
  { label: "Home", to: "/", key: "home" },
  { label: "Now Showing", to: "/", hash: "now-showing", key: "now-showing" },
  { label: "Coming Soon", to: "/", hash: "coming-soon", key: "coming-soon" },
  { label: "Cinemas", to: "/", hash: "cinemas", key: "cinemas" },
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
      className={`relative flex ${sizeClasses} shrink-0 items-center justify-center rounded-full border-2 border-primary/70 bg-gradient-to-tr from-red-600 via-primary to-rose-400 font-extrabold text-white shadow-md overflow-hidden`}
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
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);

  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname, hash } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, hash: s.location.hash }),
  });

  const isOverHero = pathname === "/" && !scrolled && !mobileOpen;
  const isStaffRoute = pathname.startsWith("/staff");
  const isAdminRoute = pathname.startsWith("/admin");
  const isInternalRoute = isStaffRoute || isAdminRoute;

  const handleBookTicketsNav = (e) => {
    if (!user) {
      if (e) e.preventDefault();
      toast.info("Please sign in or create an account to book tickets.");
      navigate({ to: "/login", search: { redirect: "/movies" } });
    } else {
      navigate({ to: "/movies" });
    }
  };

  // Sync Logged-In User from LocalStorage and backend
  useEffect(() => {
    const checkUser = () => {
      try {
        const saved = window.localStorage.getItem("lumiere-user");
        const parsed = saved ? JSON.parse(saved) : null;
        setUser(parsed);

        const token = window.localStorage.getItem("lumiere-token");
        if (token) {
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.user) {
                window.localStorage.setItem("lumiere-user", JSON.stringify(data.user));
                setUser(data.user);
              }
            })
            .catch(() => { });
        }
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

  // Fetch user's booking count
  useEffect(() => {
    if (!user) {
      setTicketCount(0);
      return;
    }
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTicketCount(data.totalBookings || 0);
        }
      })
      .catch(() => { });
  }, [user, bookingsOpen]);

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
    navigate({ to: "/" });
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
          className={`block rounded-md px-3 py-3 text-base font-semibold transition ${active ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent"
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
        className={`relative py-2 text-sm font-semibold transition-colors ${colorClass} after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:bg-primary after:transition-all ${active ? "after:w-full" : "after:w-0 hover:after:w-full"
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isOverHero
            ? "bg-gradient-to-b from-black/85 via-black/45 to-transparent"
            : scrolled || mobileOpen
              ? "border-b border-border bg-nav/95 backdrop-blur-md shadow-md"
              : "border-b border-border/40 bg-transparent backdrop-blur-xs"
          }`}
      >
        <div className="container-cine flex h-20 items-center justify-between gap-4">
          {/* Logo (Already contains its own Link to="/" inside Logo.jsx) */}
          <Logo contrast={isOverHero ? "light" : undefined} />

          {/* Desktop Nav Links (Hidden on Admin & Staff Dashboards) */}
          {!isInternalRoute ? (
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
              {NAV.map((n) => navLink(n))}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider border ${isAdminRoute
                    ? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  }`}
              >
                {isAdminRoute ? "ADMIN CONTROL CENTER" : "STAFF CONTROL CENTER"}
              </span>
            </div>
          )}

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`hidden h-9 w-9 items-center justify-center rounded-md transition sm:inline-flex ${isOverHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
                }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-emerald-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </button>

            {/* Location Selector */}
            <button
              type="button"
              onClick={() => setLocOpen(true)}
              className={`hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm transition md:flex ${isOverHero
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
                    className={`flex items-center gap-2 rounded-full border border-primary/30 bg-card/85 py-1 pl-1 pr-3 text-xs font-semibold shadow-sm transition hover:border-primary hover:bg-card ${isOverHero ? "text-white" : "text-foreground"
                      }`}
                    aria-expanded={profileOpen}
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="font-bold text-primary">{firstName}</span>
                    <ChevronDown
                      className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                  </button>

                  {/* Luxury Profile Dropdown Menu */}
                  {profileOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-primary/40 bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
                    >
                      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                        <UserAvatar user={user} size="lg" />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              VIP Member
                            </span>
                            <span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              {ticketCount} {ticketCount === 1 ? "Ticket" : "Tickets"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            if (pathname === "/staff") {
                              window.dispatchEvent(
                                new CustomEvent("lumiere-switch-staff-tab", { detail: "passes" })
                              );
                            } else {
                              setBookingsOpen(true);
                            }
                          }}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-primary/15 hover:text-primary"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-primary" /> My Cinema Passes
                          </span>
                          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            {ticketCount}
                          </span>
                        </button>

                        {/* Staff Gate Scanner (Staff Only) */}
                        {user.role === "staff" && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              setScannerOpen(true);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-emerald-500/15 hover:text-emerald-400"
                          >
                            <span className="inline-flex items-center gap-2">
                              <ScanLine className="h-4 w-4 text-emerald-400" /> Staff Gate Scanner
                            </span>
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                              SCAN
                            </span>
                          </button>
                        )}

                        {/* Admin Dashboard Access (Admin Only) */}
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-purple-500/15 hover:text-purple-600 dark:hover:text-purple-400"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Crown className="h-4 w-4 text-purple-500" /> Admin Dashboard
                            </span>
                            <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                              ADMIN
                            </span>
                          </Link>
                        )}

                        {/* Staff Dashboard Access (Staff Only) */}
                        {user.role === "staff" && (
                          <Link
                            to="/staff"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-emerald-500/15 hover:text-emerald-400"
                          >
                            <span className="inline-flex items-center gap-2">
                              <LayoutDashboard className="h-4 w-4 text-emerald-400" /> Staff Operations
                            </span>
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                              STAFF
                            </span>
                          </Link>
                        )}

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

                {/* Admin / Staff Desktop Quick Button */}
                {!isInternalRoute && user.role === "admin" ? (
                  <Link
                    to="/admin"
                    className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition shadow-sm"
                  >
                    <Crown className="h-3.5 w-3.5" /> Admin Dashboard
                  </Link>
                ) : !isInternalRoute && user.role === "staff" ? (
                  <Link
                    to="/staff"
                    className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition shadow-sm"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" /> Staff Dashboard
                  </Link>
                ) : isInternalRoute ? (
                  <Link
                    to="/"
                    className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary transition"
                  >
                    Exit to Cinema Site
                  </Link>
                ) : null}

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
                className={`hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold transition hover:text-primary lg:flex ${isOverHero ? "text-white/90" : "text-foreground"
                  }`}
              >
                <User className="h-4 w-4 text-primary" /> Login / Sign Up
              </Link>
            )}

            {/* Book Tickets CTA */}
            <Link to="/movies" onClick={handleBookTicketsNav} className="btn-gold hidden !py-2.5 sm:inline-flex">
              <Ticket className="h-4 w-4" /> Book Tickets
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className={`grid h-10 w-10 place-items-center rounded-md transition lg:hidden ${isOverHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
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
              {!isInternalRoute ? (
                NAV.map((n) => navLink(n, true))
              ) : (
                <div className="py-2 space-y-2">
                  <span
                    className={`inline-block rounded px-2.5 py-1 text-xs font-bold border ${isAdminRoute
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      }`}
                  >
                    {isAdminRoute ? "ADMIN CONTROL CENTER" : "STAFF CONTROL CENTER"}
                  </span>
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-semibold text-primary hover:underline"
                  >
                    ← Exit to Cinema Website
                  </Link>
                </div>
              )}
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
                      <Sun className="h-4 w-4 text-emerald-400" /> Light Mode
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
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            ⭐ VIP Member
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400">
                            • {ticketCount} {ticketCount === 1 ? "Pass" : "Passes"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        if (pathname === "/staff") {
                          window.dispatchEvent(
                            new CustomEvent("lumiere-switch-staff-tab", { detail: "passes" })
                          );
                        } else {
                          setBookingsOpen(true);
                        }
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/10 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      <Ticket className="h-3.5 w-3.5" /> View My Cinema Passes ({ticketCount})
                    </button>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-md border border-purple-500/40 bg-purple-500/20 py-2 text-xs font-bold text-purple-300 transition hover:bg-purple-500 hover:text-white"
                      >
                        <Crown className="h-3.5 w-3.5" /> Admin Dashboard
                      </Link>
                    )}
                    {user.role === "staff" && (
                      <>
                        <Link
                          to="/staff"
                          onClick={() => setMobileOpen(false)}
                          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/20 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" /> Staff Operations
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileOpen(false);
                            setScannerOpen(true);
                          }}
                          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
                        >
                          <ScanLine className="h-3.5 w-3.5" /> Staff Gate Scanner
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1.5 flex items-center justify-center gap-2 rounded-md border border-destructive/40 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-outline col-span-2 !py-2.5">
                    <User className="h-4 w-4" /> Login / Sign Up
                  </Link>
                )}

                <Link
                  to="/movies"
                  onClick={(e) => {
                    setMobileOpen(false);
                    handleBookTicketsNav(e);
                  }}
                  className="btn-gold col-span-2"
                >
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
      <MyBookingsDialog
        open={bookingsOpen}
        onClose={() => setBookingsOpen(false)}
      />
      <StaffScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </>
  );
}
