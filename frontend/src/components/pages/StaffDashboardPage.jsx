import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldAlert,
  ScanLine,
  Ticket,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Film,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  UserCheck,
  ChevronRight,
  Sparkles,
  Printer,
  Grid,
  X,
  Download,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import StaffScannerDialog from "@/components/cine/StaffScannerDialog";

export default function StaffDashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Active Tab: "passes", "roster", "scanner", "auditoriums", "accounting"
  const [activeTab, setActiveTab] = useState("passes");

  // Dashboard Data State
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    admittedCount: 0,
    totalSeatsBooked: 0,
    totalRevenue: 0,
    totalCancelledValue: 0,
    netRevenue: 0,
    avgTicketPrice: 0,
  });
  const [moviesSummary, setMoviesSummary] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roster Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMovie, setSelectedMovie] = useState("ALL");

  // In-Page "My Personal Passes" State
  const [myBookings, setMyBookings] = useState([]);
  const [myStats, setMyStats] = useState({ totalBookings: 0, confirmedCount: 0, totalSpent: 0 });
  const [qrCodes, setQrCodes] = useState({});
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);

  // Scanner State (Tab 3 & popup)
  const [scanCode, setScanCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [admittingCode, setAdmittingCode] = useState(null);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  // 8x12 Hall Matrix Modal
  const [selectedHallMovie, setSelectedHallMovie] = useState(null);

  // 1. Authenticate user & check Staff/Admin role
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lumiere-user");
      if (!saved) {
        toast.error("Please log in to access the Staff Control Center.");
        navigate({ to: "/login", search: { redirect: "/staff" } });
        return;
      }
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setAuthChecked(true);

      const role = user?.role?.toLowerCase();
      if (role !== "staff" && role !== "admin") {
        toast.error("Access Restricted: Staff or Administrator role required.");
      }
    } catch {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  // Listen for tab switch events from Navbar
  useEffect(() => {
    const handleSwitchTab = (e) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("lumiere-switch-staff-tab", handleSwitchTab);
    return () => window.removeEventListener("lumiere-switch-staff-tab", handleSwitchTab);
  }, []);

  // 2. Fetch Personal Passes for "My Cinema Passes" Tab
  const fetchMyBookings = async () => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMyBookings(data.bookings || []);
        setMyStats({
          totalBookings: data.totalBookings || 0,
          confirmedCount: data.confirmedCount || 0,
          totalSpent: data.totalSpent || 0,
        });

        // Generate high-contrast QR codes
        const codes = {};
        for (const b of data.bookings || []) {
          try {
            const url = await QRCode.toDataURL(b.booking_code, {
              width: 140,
              margin: 1,
              color: { dark: "#000000", light: "#ffffff" },
            });
            codes[b.booking_code] = url;
          } catch {}
        }
        setQrCodes(codes);
      }
    } catch {
      // ignore
    }
  };

  // 3. Fetch Staff Dashboard Overview & Bookings
  const fetchDashboardData = async () => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setLoading(true);
    try {
      // 1. Overview metrics
      const overviewRes = await fetch("http://localhost:5000/api/staff/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const overviewData = await overviewRes.json();
      if (overviewRes.ok && overviewData.success) {
        setStats(overviewData.stats || {});
        setMoviesSummary(overviewData.moviesSummary || []);
      }

      // 2. Bookings list
      const bookingsRes = await fetch(
        `http://localhost:5000/api/staff/bookings?search=${encodeURIComponent(
          searchQuery
        )}&status=${encodeURIComponent(statusFilter)}&movie=${encodeURIComponent(selectedMovie)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok && bookingsData.success) {
        setBookings(bookingsData.bookings || []);
      }

      // 3. Also fetch personal bookings
      await fetchMyBookings();
    } catch {
      toast.error("Failed to load staff data. Please ensure backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && (currentUser?.role === "staff" || currentUser?.role === "admin")) {
      fetchDashboardData();
    }
  }, [authChecked, currentUser, statusFilter, selectedMovie]);

  // Debounced search for roster
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authChecked && (currentUser?.role === "staff" || currentUser?.role === "admin")) {
        fetchDashboardData();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 4. Download PDF Pass
  const handleDownloadPdf = async (booking) => {
    if (booking.payment_status === "CANCELLED") {
      toast.error("This ticket has been cancelled. PDF pass is void.");
      return;
    }

    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    toast.info("Generating your official PDF ticket pass...");
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to download PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lumiere-Ticket-${booking.booking_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF Ticket Pass Downloaded!");
    } catch (err) {
      toast.error(err.message || "Failed to download PDF ticket.");
    }
  };

  // 5. Cancel Personal Booking
  const handleConfirmCancel = async () => {
    if (!confirmCancelBooking) return;
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setCancellingBookingId(confirmCancelBooking.id);
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${confirmCancelBooking.id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Ticket cancelled successfully.");
        setConfirmCancelBooking(null);
        await fetchDashboardData();

        // Broadcast cancellation event to immediately free seats
        window.dispatchEvent(
          new CustomEvent("lumiere-seats-updated", {
            detail: { action: "CANCEL", booking: confirmCancelBooking },
          })
        );
        window.localStorage.setItem("lumiere-seats-updated", Date.now().toString());

        try {
          const bc = new BroadcastChannel("lumiere_channel");
          bc.postMessage({ type: "SEATS_UPDATED", action: "CANCEL" });
          bc.close();
        } catch {}
      } else {
        toast.error(data.message || "Failed to cancel booking.");
      }
    } catch {
      toast.error("Network error while cancelling booking.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  // 6. Admit Guest at Gate (Tab 2 & Tab 3)
  const handleAdmitGuest = async (bookingCode) => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setAdmittingCode(bookingCode);
    try {
      const res = await fetch(`http://localhost:5000/api/staff/admit/${bookingCode}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.alreadyAdmitted) {
          toast.warning(data.message);
        } else {
          toast.success(data.message || `Guest for ${bookingCode} admitted!`);
        }
        await fetchDashboardData();
        if (scanResult && scanResult.booking?.bookingCode === bookingCode) {
          setScanResult((prev) => ({
            ...prev,
            booking: { ...prev.booking, is_admitted: true, status: "ADMITTED" },
          }));
        }
      } else {
        toast.error(data.message || "Failed to admit guest.");
      }
    } catch {
      toast.error("Network error admitting guest.");
    } finally {
      setAdmittingCode(null);
    }
  };

  // 7. Verify Ticket Pass Code (Gate Scanner)
  const handleScanTicket = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = scanCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a ticket code (e.g. CP-63552 or CP-73287).");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/verify/${cleanCode}`);
      const data = await res.json();
      setScanResult(data);
      if (data.valid) {
        toast.success("✅ Valid Ticket Pass Found!");
      } else if (data.status === "CANCELLED") {
        toast.error("🚫 TICKET CANCELLED: Entry Denied!");
      } else {
        toast.error("❌ Invalid Ticket: No booking found.");
      }
    } catch {
      toast.error("Error verifying ticket pass.");
    } finally {
      setIsScanning(false);
    }
  };

  // Access check: Staff Only
  const isAuthorized = currentUser?.role === "staff";
  if (authChecked && !isAuthorized) {
    return (
      <div className="container-cine min-h-[70vh] flex items-center justify-center pt-28 pb-16">
        <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Staff Access Required
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {currentUser?.role === "admin" ? (
              <>
                Your account ({currentUser?.email}) is registered as a{" "}
                <strong className="text-purple-600 dark:text-purple-400">Master Administrator</strong>.
                The Staff Control Center is reserved for staff members only. Please use your Admin Dashboard.
              </>
            ) : (
              <>
                Your account ({currentUser?.email}) is registered as a{" "}
                <span className="font-bold text-primary capitalize">{currentUser?.role || "Customer"}</span>.
                The Staff Control Center is reserved for authorized cinema staff members.
              </>
            )}
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            {currentUser?.role === "admin" ? (
              <Link to="/admin" className="btn-gold !py-2.5 text-xs font-bold text-center">
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link to="/" className="btn-gold !py-2.5 text-xs font-bold text-center">
                Return to Movie Catalog
              </Link>
            )}
            <Link to="/login" className="btn-outline !py-2.5 text-xs text-center">
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Rows and Columns for 8x12 Hall Matrix
  const HALL_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const HALL_COLS = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 transition-colors">
      <div className="container-cine space-y-6">
        {/* ============================================================== */}
        {/* TOP HEADER STRIP                                               */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/30">
                Staff Control Center
              </span>
              <span className="text-xs text-muted-foreground">
                Signed in as <strong className="text-foreground">{currentUser?.name}</strong> ({currentUser?.role?.toUpperCase()})
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Operations & Cinema Passes
            </h1>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/movies"
              className="btn-gold inline-flex items-center gap-1.5 !py-2 text-xs font-bold shadow-sm"
              title="Book tickets for self or walk-in customers"
            >
              <Ticket className="h-4 w-4" /> Book Movie Tickets
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab("passes")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                activeTab === "passes"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" /> My Cinema Passes ({myStats.totalBookings})
            </button>

            <button
              type="button"
              onClick={() => setScannerModalOpen(true)}
              className="btn-outline inline-flex items-center gap-1.5 !py-2 text-xs font-semibold"
            >
              <ScanLine className="h-3.5 w-3.5 text-primary" /> Quick Scanner
            </button>

            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="btn-outline inline-flex items-center gap-1.5 !py-2 text-xs"
              title="Refresh data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5 KPI OPERATIONAL METRICS STRIP                                */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {stats.totalBookings}
            </p>
            <span className="text-xs text-muted-foreground">
              {stats.totalSeatsBooked} seats reserved
            </span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Confirmed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.confirmedCount}
            </p>
            <span className="text-xs text-muted-foreground">Valid for hall entry</span>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Admitted In Hall</span>
              <UserCheck className="h-4 w-4 text-sky-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
              {stats.admittedCount}
            </p>
            <span className="text-xs text-muted-foreground">Checked-in at gate</span>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Cancelled / Void</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.cancelledCount}
            </p>
            <span className="text-xs text-muted-foreground">Seats released immediately</span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-primary/30 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-primary">
              <span className="text-xs font-semibold uppercase tracking-wider">Net Collection</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              ₹{(stats.totalRevenue || 0).toLocaleString()}
            </p>
            <span className="text-xs text-muted-foreground">
              Avg ₹{stats.avgTicketPrice || 0}/seat
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CLEAN TAB NAVIGATION                                           */}
        {/* ============================================================== */}
        <div className="flex flex-wrap border-b border-border gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("passes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "passes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" /> My Cinema Passes ({myBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "roster"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" /> Guest Roster & Tickets ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "scanner"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ScanLine className="h-4 w-4" /> Gate Ticket Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("auditoriums")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "auditoriums"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="h-4 w-4" /> Seat Fill Tracker & Halls ({moviesSummary.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accounting")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "accounting"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Box Office Accounting
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: MY CINEMA PASSES (IN-PAGE - NO POPUP)                   */}
        {/* ============================================================== */}
        {activeTab === "passes" && (
          <div className="space-y-6">
            {/* Header and User Pass Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  My Booked Cinema Passes
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your personal movie tickets, download official PDF passes with QR codes, or cancel bookings.
                </p>
              </div>

              <Link
                to="/movies"
                className="btn-gold inline-flex items-center gap-2 !py-2 text-xs font-bold self-start sm:self-auto"
              >
                <Ticket className="h-4 w-4" /> Book New Ticket
              </Link>
            </div>

            {/* 3 Summary Pills */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4 text-center shadow-sm">
              <div>
                <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Total Bookings
                </span>
                <p className="text-2xl font-bold text-foreground">{myStats.totalBookings}</p>
              </div>
              <div className="border-x border-border">
                <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                  Active Passes
                </span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {myStats.confirmedCount}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-primary">
                  Total Spent
                </span>
                <p className="text-2xl font-bold text-primary">₹{myStats.totalSpent}</p>
              </div>
            </div>

            {/* Passes Cards List */}
            {myBookings.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="text-lg font-bold text-foreground">No Cinema Passes Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
                  You haven't booked any movie tickets yet. Browse our current films to reserve your seats.
                </p>
                <Link to="/movies" className="btn-gold !py-2.5 text-xs font-bold inline-block">
                  Browse Now Showing Movies
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b) => {
                  const isCancelled = b.payment_status === "CANCELLED";
                  const seatsList = Array.isArray(b.seats) ? b.seats : [b.seats];
                  const qr = qrCodes[b.booking_code];

                  return (
                    <div
                      key={b.id}
                      className={`rounded-xl border p-5 transition shadow-sm bg-card ${
                        isCancelled
                          ? "border-rose-500/30 opacity-75"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        {/* Left Details */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-base font-bold text-primary">
                              {b.booking_code}
                            </span>
                            {isCancelled ? (
                              <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                                🚫 CANCELLED
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ CONFIRMED
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              {b.movie_title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                {b.cinema_name} • {b.screen_type || "IMAX Laser"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {b.show_time}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                {new Date(b.show_date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                            <div>
                              <span className="text-muted-foreground">Seats: </span>
                              <span
                                className={`font-bold ${
                                  isCancelled
                                    ? "text-rose-500 line-through"
                                    : "text-foreground"
                                }`}
                              >
                                {seatsList.join(", ")}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Paid: </span>
                              <span className="font-bold text-foreground">
                                ₹{Number(b.total_amount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: QR Code & Action Buttons */}
                        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                          {/* QR Code Container (Always crisp on white background) */}
                          <div className="flex flex-col items-center">
                            <div className="rounded-lg bg-white p-2 border border-slate-200 shadow-sm">
                              {qr ? (
                                <img
                                  src={qr}
                                  alt={`QR ${b.booking_code}`}
                                  className="h-24 w-24 object-contain"
                                />
                              ) : (
                                <div className="h-24 w-24 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                  Loading QR...
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground mt-1">
                              GATE PASS
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 min-w-[130px]">
                            {isCancelled ? (
                              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-center text-xs font-semibold text-rose-500">
                                🚫 Pass Void<br />No Download
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(b)}
                                  className="btn-gold !py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                                >
                                  <Download className="h-3.5 w-3.5" /> PDF Ticket
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmCancelBooking(b)}
                                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive hover:text-white"
                                >
                                  Cancel Ticket
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline Cancel Confirmation Dialog */}
            {confirmCancelBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive/15 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Confirm Cancellation
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Booking {confirmCancelBooking.booking_code}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Are you sure you want to cancel your pass for{" "}
                    <strong className="text-foreground">{confirmCancelBooking.movie_title}</strong> (Seats:{" "}
                    <strong>
                      {(Array.isArray(confirmCancelBooking.seats)
                        ? confirmCancelBooking.seats
                        : [confirmCancelBooking.seats]
                      ).join(", ")}
                    </strong>
                    )? Seats will be released immediately back to the cinema hall.
                  </p>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmCancelBooking(null)}
                      className="btn-outline !py-2 text-xs"
                    >
                      Keep Ticket
                    </button>
                    <button
                      type="button"
                      disabled={cancellingBookingId === confirmCancelBooking.id}
                      onClick={handleConfirmCancel}
                      className="rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-white transition hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {cancellingBookingId === confirmCancelBooking.id
                        ? "Cancelling..."
                        : "Yes, Cancel Pass"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: GUEST ROSTER & PASSES                                   */}
        {/* ============================================================== */}
        {activeTab === "roster" && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-3.5 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search ticket code (CP-XXXX), guest name, or movie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["ALL", "CONFIRMED", "PENDING_ENTRY", "ADMITTED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      statusFilter === st
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ticket Code</th>
                      <th className="py-3 px-4">Guest Details</th>
                      <th className="py-3 px-4">Movie & Screen</th>
                      <th className="py-3 px-4">Showtime</th>
                      <th className="py-3 px-4">Seats</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Gate Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
                          Loading guest roster...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <Ticket className="mx-auto mb-2 h-8 w-8 opacity-40" />
                          No bookings found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const isCancelled = b.payment_status === "CANCELLED";
                        const isAdmitted = b.is_admitted;

                        return (
                          <tr
                            key={b.id}
                            className={`transition hover:bg-muted/40 ${
                              isCancelled ? "opacity-60 bg-rose-500/5" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-primary">
                              {b.booking_code}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-foreground">{b.user_name}</p>
                              <p className="text-[11px] text-muted-foreground">{b.user_email}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-foreground">{b.movie_title}</p>
                              <p className="text-[11px] text-muted-foreground">{b.cinema_name}</p>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-medium text-foreground">{b.show_time}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(b.show_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[140px]">
                                {(Array.isArray(b.seats) ? b.seats : [b.seats]).map((s) => (
                                  <span
                                    key={s}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                      isCancelled
                                        ? "bg-rose-500/20 text-rose-500 line-through"
                                        : "bg-primary/15 text-primary"
                                    }`}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-foreground">
                              ₹{b.total_amount}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {isCancelled ? (
                                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                  🚫 CANCELLED
                                </span>
                              ) : isAdmitted ? (
                                <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                                  ✓ IN AUDITORIUM
                                </span>
                              ) : (
                                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ● CONFIRMED
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              {isCancelled ? (
                                <span className="text-[11px] font-semibold text-rose-500">
                                  Pass Void
                                </span>
                              ) : isAdmitted ? (
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  Admitted
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={admittingCode === b.booking_code}
                                  onClick={() => handleAdmitGuest(b.booking_code)}
                                  className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                  {admittingCode === b.booking_code ? "Admitting..." : "Admit Guest"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: LIVE GATE TICKET SCANNER                                */}
        {/* ============================================================== */}
        {activeTab === "scanner" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input & Verify */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  <ScanLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Gate Check-In Terminal
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Scan ticket QR or type booking pass code (e.g. CP-63552 or CP-73287).
                  </p>
                </div>
              </div>

              <form onSubmit={handleScanTicket} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Booking Pass Code
                  </label>
                  <input
                    type="text"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. CP-63552)..."
                    className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-lg font-mono font-bold tracking-widest text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="btn-gold flex-1 !py-3 text-xs font-bold"
                  >
                    {isScanning ? "Verifying..." : "Verify & Check Ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannerModalOpen(true)}
                    className="btn-outline !py-3 text-xs font-bold"
                  >
                    Popup Scanner
                  </button>
                </div>
              </form>

              {/* Sample Test Chips */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Test with recent bookings:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScanCode("CP-63552");
                      handleScanTicket();
                    }}
                    className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  >
                    CP-63552 (Confirmed)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanCode("CP-73287");
                      handleScanTicket();
                    }}
                    className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                  >
                    CP-73287 (Cancelled)
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Admission Verdict Screen */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-center">
              {!scanResult ? (
                <div className="py-16 text-center text-muted-foreground">
                  <ScanLine className="mx-auto mb-3 h-12 w-12 text-primary/40 animate-pulse" />
                  <h4 className="text-base font-semibold text-foreground">Waiting for Ticket Scan</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a ticket code on the left to verify authenticity and admission status.
                  </p>
                </div>
              ) : scanResult.status === "CANCELLED" ? (
                /* CANCELLED VERDICT */
                <div className="rounded-xl border-2 border-rose-500 bg-rose-500/10 p-6 text-center space-y-4">
                  <XCircle className="mx-auto h-14 w-14 text-rose-500" />
                  <div>
                    <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
                      🚫 ENTRY DENIED: TICKET CANCELLED
                    </h3>
                    <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
                      This ticket was cancelled. It is VOID and seats have been released.
                    </p>
                  </div>

                  <div className="rounded-lg border border-rose-500/30 bg-background p-3 text-left text-xs space-y-1">
                    <p>
                      <strong>Booking Code:</strong>{" "}
                      <span className="font-mono text-rose-500 font-bold">
                        {scanResult.booking?.bookingCode}
                      </span>
                    </p>
                    <p>
                      <strong>Movie:</strong> {scanResult.booking?.movieTitle}
                    </p>
                    <p>
                      <strong>Cancelled Seats:</strong>{" "}
                      <span className="text-rose-500 font-bold">
                        {(Array.isArray(scanResult.booking?.seats)
                          ? scanResult.booking.seats
                          : [scanResult.booking?.seats]
                        ).join(", ")}{" "}
                        (Released)
                      </span>
                    </p>
                    <p>
                      <strong>Guest:</strong> {scanResult.booking?.userName} (
                      {scanResult.booking?.userEmail})
                    </p>
                  </div>

                  <div className="rounded bg-rose-600/20 py-2 text-xs font-bold text-rose-600 dark:text-rose-300">
                    DO NOT PERMIT ENTRY INTO AUDITORIUM
                  </div>
                </div>
              ) : scanResult.valid ? (
                /* VALID VERDICT */
                <div className="rounded-xl border-2 border-emerald-500 bg-emerald-500/10 p-6 text-center space-y-4">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                  <div>
                    <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ✅ VALID PASS — ADMISSION PERMITTED
                    </h3>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                      Authentic ticket pass verified in cinema database.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-500/30 bg-background p-3 text-left text-xs space-y-1">
                    <p>
                      <strong>Code:</strong>{" "}
                      <span className="font-mono text-primary font-bold">
                        {scanResult.booking?.bookingCode}
                      </span>
                    </p>
                    <p>
                      <strong>Movie:</strong> {scanResult.booking?.movieTitle}
                    </p>
                    <p>
                      <strong>Hall & Showtime:</strong> {scanResult.booking?.cinemaName} •{" "}
                      {scanResult.booking?.showTime}
                    </p>
                    <p>
                      <strong>Seats:</strong>{" "}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {(Array.isArray(scanResult.booking?.seats)
                          ? scanResult.booking.seats
                          : [scanResult.booking?.seats]
                        ).join(", ")}
                      </span>
                    </p>
                    <p>
                      <strong>Guest Name:</strong> {scanResult.booking?.userName}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={admittingCode === scanResult.booking?.bookingCode}
                    onClick={() => handleAdmitGuest(scanResult.booking?.bookingCode)}
                    className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-95"
                  >
                    {admittingCode === scanResult.booking?.bookingCode
                      ? "Recording Admission..."
                      : "🎟️ ADMIT GUEST NOW (Check In)"}
                  </button>
                </div>
              ) : (
                /* INVALID / NOT FOUND */
                <div className="rounded-xl border-2 border-amber-500 bg-amber-500/10 p-6 text-center space-y-4">
                  <AlertTriangle className="mx-auto h-14 w-14 text-amber-500" />
                  <div>
                    <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      ❌ INVALID TICKET CODE
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scanResult.message || "No record found for this ticket."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SEAT FILL TRACKER & AUDITORIUM CAPACITY                 */}
        {/* ============================================================== */}
        {activeTab === "auditoriums" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Auditorium Seat Fill Tracker
                </h3>
                <p className="text-xs text-muted-foreground">
                  Monitor live seat occupancy, remaining available seats, and inspect visual 8×12 hall matrix.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" /> Occupied
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" /> Void / Cancelled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {moviesSummary.length === 0 ? (
                <div className="col-span-3 py-16 text-center text-muted-foreground">
                  <Film className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No movies currently scheduled.
                </div>
              ) : (
                moviesSummary.map((m) => {
                  const capacity = m.totalCapacity || 96;
                  const occupiedCount = m.seatsBooked || 0;
                  const availableCount = m.availableSeats !== undefined ? m.availableSeats : Math.max(0, capacity - occupiedCount);
                  const occupancyPercent = m.occupancyPercent !== undefined ? m.occupancyPercent : Math.round((occupiedCount / capacity) * 100);

                  return (
                    <div
                      key={m.title}
                      className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-primary/50 transition"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-foreground line-clamp-1">
                            {m.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {m.cinema} • {m.screenType}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-xs font-bold text-primary">
                          {m.showTime}
                        </span>
                      </div>

                      {/* Progress Bar & Seat Counts */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Seat Occupancy:</span>
                          <span className="font-semibold text-foreground">
                            {occupiedCount} / {capacity} Seats ({occupancyPercent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupancyPercent > 80
                                ? "bg-rose-500"
                                : occupancyPercent > 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(4, occupancyPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                        <div className="rounded-lg bg-rose-500/10 p-2.5 border border-rose-500/20">
                          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                            Filled / Booked
                          </span>
                          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                            {occupiedCount} <span className="text-xs font-normal">seats</span>
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                            Available Left
                          </span>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {availableCount} <span className="text-xs font-normal">seats</span>
                          </p>
                        </div>
                      </div>

                      {/* Occupied list tags */}
                      {m.occupiedSeats && m.occupiedSeats.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Occupied Seats:
                          </p>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {m.occupiedSeats.map((s) => (
                              <span
                                key={s}
                                className="rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHallMovie(m)}
                          className="btn-gold !py-2 !px-3 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Grid className="h-3.5 w-3.5" /> View Hall Matrix (8×12)
                        </button>
                        <Link
                          to="/movies"
                          className="btn-outline !py-2 !px-2.5 text-xs inline-flex items-center gap-1"
                        >
                          Book More <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: BOX OFFICE ACCOUNTING                                   */}
        {/* ============================================================== */}
        {activeTab === "accounting" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Box Office Revenue & Reconciliation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Financial overview across all screenings, gross collections, cancellations, and net returns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-outline inline-flex items-center gap-2 !py-2 text-xs font-bold"
              >
                <Printer className="h-4 w-4" /> Print Accounting Summary
              </button>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gross Sales (Confirmed)
                </span>
                <p className="mt-2 text-2xl font-bold text-primary">
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </p>
                <span className="text-xs text-muted-foreground">
                  From {stats.totalSeatsBooked} confirmed seats
                </span>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-card p-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Cancelled / Refunded Value
                </span>
                <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                  ₹{(stats.totalCancelledValue || 0).toLocaleString()}
                </p>
                <span className="text-xs text-muted-foreground">
                  {stats.cancelledCount} passes voided & seats returned
                </span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-card p-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Net Realized Revenue
                </span>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(stats.netRevenue || stats.totalRevenue || 0).toLocaleString()}
                </p>
                <span className="text-xs text-muted-foreground">
                  Total settled funds
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Average Ticket Price
                </span>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  ₹{stats.avgTicketPrice || 0}
                </p>
                <span className="text-xs text-muted-foreground">
                  Per reserved seat
                </span>
              </div>
            </div>

            {/* Movie Financial Breakdown Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="border-b border-border bg-muted/60 p-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">
                  Film Revenue Breakdown
                </h4>
                <span className="text-xs text-muted-foreground">
                  Aggregated per title & format
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">Film Title</th>
                      <th className="py-3 px-4">Format & Hall</th>
                      <th className="py-3 px-4 text-center">Seats Sold</th>
                      <th className="py-3 px-4 text-center">Occupancy</th>
                      <th className="py-3 px-4 text-right">Gross Sales</th>
                      <th className="py-3 px-4 text-right">Cancelled</th>
                      <th className="py-3 px-4 text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {moviesSummary.map((m) => (
                      <tr key={m.title} className="hover:bg-muted/40 transition">
                        <td className="py-3 px-4 font-bold text-foreground">
                          {m.title}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {m.cinema} • {m.screenType}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-foreground">
                          {m.seatsBooked} / 96
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              m.occupancyPercent > 50
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-primary/15 text-primary"
                            }`}
                          >
                            {m.occupancyPercent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                          ₹{(m.revenue || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400 font-semibold">
                          ₹{(m.cancelledAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          ₹{(m.revenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 8x12 HALL SEAT MATRIX MODAL                                    */}
      {/* ============================================================== */}
      {selectedHallMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in-50">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-xs font-bold text-primary">
                  Auditorium Seat Map
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {selectedHallMovie.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedHallMovie.cinema} • {selectedHallMovie.screenType} • {selectedHallMovie.showTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHallMovie(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cinema Screen Indicator */}
            <div className="text-center">
              <div className="mx-auto h-2 w-3/4 rounded-full bg-primary shadow-sm" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1 block">
                AUDITORIUM SCREEN (FRONT)
              </span>
            </div>

            {/* 8 Rows x 12 Columns Seat Matrix */}
            <div className="overflow-x-auto py-2">
              <div className="min-w-[500px] flex flex-col items-center gap-1.5">
                {HALL_ROWS.map((row) => (
                  <div key={row} className="flex items-center gap-1.5">
                    <span className="w-5 text-center text-xs font-mono font-bold text-muted-foreground">
                      {row}
                    </span>
                    <div className="flex gap-1.5">
                      {HALL_COLS.map((col) => {
                        const seatId = `${row}${col}`;
                        const isOccupied = selectedHallMovie.occupiedSeats?.includes(seatId);
                        const isCancelled = selectedHallMovie.cancelledSeats?.includes(seatId);

                        let seatColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25";
                        let statusLabel = "Available";

                        if (isOccupied) {
                          seatColor = "bg-rose-500 border-rose-600 text-white font-bold";
                          statusLabel = "Occupied";
                        } else if (isCancelled) {
                          seatColor = "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 line-through";
                          statusLabel = "Void / Released";
                        }

                        return (
                          <div
                            key={seatId}
                            title={`Seat ${seatId} (${statusLabel})`}
                            className={`h-7 w-7 rounded border text-[10px] font-mono flex items-center justify-center cursor-default transition ${seatColor}`}
                          >
                            {col}
                          </div>
                        );
                      })}
                    </div>
                    <span className="w-5 text-center text-xs font-mono font-bold text-muted-foreground">
                      {row}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend & Stats Summary */}
            <div className="flex flex-wrap items-center justify-between border-t border-border pt-4 text-xs gap-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500 inline-block" /> Available ({selectedHallMovie.availableSeats || 96})
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-3 w-3 rounded bg-rose-500 border border-rose-600 inline-block" /> Occupied ({selectedHallMovie.seatsBooked || 0})
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500 inline-block" /> Void / Freed
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHallMovie(null)}
                className="btn-gold !py-2 !px-4 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SCANNER MODAL */}
      <StaffScannerDialog
        open={scannerModalOpen}
        onClose={() => {
          setScannerModalOpen(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
}
