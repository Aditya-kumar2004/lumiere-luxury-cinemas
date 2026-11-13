import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert,
  Users,
  UserCheck,
  UserPlus,
  Crown,
  Search,
  RefreshCw,
  Ticket,
  DollarSign,
  Film,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Eye,
  Star,
  Check,
  Layers,
  Image as ImageIcon,
  UploadCloud,
  Upload,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Active view tab: "movies" | "users" | "financials"
  const [activeTab, setActiveTab] = useState("movies");

  // Overview Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalStaff: 0,
    totalCustomers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalMovies: 0,
  });

  // User Directory State
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Movie Catalog State
  const [movies, setMovies] = useState([]);
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [movieStatusFilter, setMovieStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Catalog Activity & Deletion History State
  const [auditLogs, setAuditLogs] = useState([]);
  const [logActionFilter, setLogActionFilter] = useState("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deletingMovie, setDeletingMovie] = useState(null);
  const [submittingMovie, setSubmittingMovie] = useState(false);

  // Image Upload / Preview States
  const [posterMode, setPosterMode] = useState("file"); // "file" | "url"
  const [bannerMode, setBannerMode] = useState("file"); // "file" | "url"
  const [posterPreview, setPosterPreview] = useState(null); // { name, size, dataUrl }
  const [bannerPreview, setBannerPreview] = useState(null); // { name, size, dataUrl }

  // Form state for Add/Edit Movie
  const initialMovieForm = {
    title: "",
    customId: "",
    genre: "",
    duration: "",
    rating: "",
    status: "now-showing",
    poster_url: "",
    banner_url: "",
    synopsis: "",
  };
  const [movieForm, setMovieForm] = useState(initialMovieForm);

  // 1. Authenticate user & check Admin role
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lumiere-user");
      if (!saved) {
        toast.error("Please log in with Administrator credentials.");
        navigate({ to: "/login", search: { redirect: "/admin" } });
        return;
      }
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setAuthChecked(true);

      const role = user?.role?.toLowerCase();
      if (role !== "admin") {
        toast.error("Access Restricted: Master Administrator role required.");
      }
    } catch {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  // 2. Fetch Admin Overview KPIs & Users List
  const fetchOverviewAndUsers = async () => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    try {
      // 1. Overview KPIs
      const overviewRes = await fetch(`${API_BASE_URL}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const overviewData = await overviewRes.json();
      if (overviewRes.ok && overviewData.success) {
        setStats(overviewData.stats || {});
      }

      // 2. Users directory
      const usersRes = await fetch(
        `${API_BASE_URL}/api/admin/users?search=${encodeURIComponent(
          userSearchQuery
        )}&role=${encodeURIComponent(roleFilter)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsers(usersData.users || []);
      }
    } catch {
      console.warn("Error fetching admin overview/users");
    }
  };

  // 3. Fetch Admin Movies List (with booking counts and revenue)
  const fetchAdminMovies = async () => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    try {
      const moviesRes = await fetch(
        `${API_BASE_URL}/api/admin/movies?search=${encodeURIComponent(
          movieSearchQuery
        )}&status=${encodeURIComponent(movieStatusFilter)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const moviesData = await moviesRes.json();
      if (moviesRes.ok && moviesData.success) {
        setMovies(moviesData.movies || []);
      }
    } catch {
      console.warn("Error fetching admin movies list");
    }
  };

  // 4. Fetch Admin Activity & Deletion Audit Logs
  const fetchAuditLogs = async () => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/logs?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch {
      console.warn("Error fetching admin activity logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all activity and deletion audit logs?")) {
      return;
    }
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Activity history logs cleared.");
        setAuditLogs([]);
      } else {
        toast.error("Failed to clear logs.");
      }
    } catch {
      toast.error("Network error while clearing logs.");
    }
  };

  // Initial load
  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([fetchOverviewAndUsers(), fetchAdminMovies(), fetchAuditLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    if (authChecked && currentUser?.role === "admin") {
      reloadAll();
    }
  }, [authChecked, currentUser, roleFilter, movieStatusFilter]);

  // Debounced search for Users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authChecked && currentUser?.role === "admin") {
        fetchOverviewAndUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  // Filtered Activity & Deletion Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (logActionFilter !== "ALL" && log.action !== logActionFilter) {
        return false;
      }
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.trim().toLowerCase();
        const matchTitle = log.movie_title?.toLowerCase().includes(q);
        const matchId = log.movie_id?.toLowerCase().includes(q);
        const matchAdmin = (log.performed_by || log.performed_by_name)?.toLowerCase().includes(q);
        const matchDetails = log.details?.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchAdmin && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, logActionFilter, logSearchQuery]);

  const logStats = useMemo(() => {
    const added = auditLogs.filter((l) => l.action === "MOVIE_ADDED").length;
    const updated = auditLogs.filter((l) => l.action === "MOVIE_UPDATED").length;
    const deleted = auditLogs.filter((l) => l.action === "MOVIE_DELETED").length;
    const purged = auditLogs.filter((l) => l.poster_deleted).length;
    return { added, updated, deleted, purged, total: auditLogs.length };
  }, [auditLogs]);

  // Debounced search for Movies
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authChecked && currentUser?.role === "admin") {
        fetchAdminMovies();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [movieSearchQuery]);

  // 4. METHOD 4: Update User Role (Promote to Staff / Demote / Make Admin)
  const handleUpdateRole = async (userId, newRole, userName) => {
    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setUpdatingUserId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Role updated: ${userName} is now ${newRole.toUpperCase()}!`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        fetchOverviewAndUsers();
      } else {
        toast.error(data.message || "Failed to update role.");
      }
    } catch {
      toast.error("Network error while updating role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // 5. File upload handlers
  const handlePosterFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image file is too large (max 20MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPosterPreview({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        dataUrl: reader.result,
      });
      setMovieForm((prev) => ({ ...prev, poster_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image file is too large (max 20MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBannerPreview({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        dataUrl: reader.result,
      });
      setMovieForm((prev) => ({ ...prev, banner_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // 6. CRUD: Open Add Movie Modal
  const openAddMovieModal = () => {
    setMovieForm(initialMovieForm);
    setPosterPreview(null);
    setBannerPreview(null);
    setPosterMode("file");
    setBannerMode("file");
    setIsAddModalOpen(true);
  };

  // 7. CRUD: Open Edit Movie Modal
  const openEditMovieModal = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      customId: movie.id,
      genre: movie.genre || "Action",
      duration: movie.duration || "2h 15m",
      rating: String(movie.rating || "8.0"),
      status: movie.status || "now-showing",
      poster_url: movie.posterUrl || "",
      banner_url: movie.bannerUrl || "",
      synopsis: movie.synopsis || "",
    });
    setPosterPreview(
      movie.posterUrl
        ? {
            name: "Current Poster",
            size: "",
            dataUrl: movie.posterUrl,
          }
        : null
    );
    setBannerPreview(
      movie.bannerUrl
        ? {
            name: "Current Banner",
            size: "",
            dataUrl: movie.bannerUrl,
          }
        : null
    );
    setPosterMode(movie.posterUrl ? "file" : "file");
    setBannerMode(movie.bannerUrl ? "file" : "file");
  };

  // 8. CRUD: Handle Add Movie Submission
  const handleAddMovieSubmit = async (e) => {
    e.preventDefault();
    if (!movieForm.title.trim()) {
      toast.error("Please enter a movie title.");
      return;
    }

    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setSubmittingMovie(true);
    try {
      let finalPosterUrl = movieForm.poster_url;
      if (posterPreview?.dataUrl && posterPreview.dataUrl.startsWith("data:image/")) {
        try {
          const uploadRes = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: posterPreview.dataUrl,
              filename: posterPreview.name || "poster.jpg",
              type: "poster",
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success) {
            finalPosterUrl = uploadData.url;
          }
        } catch (err) {
          console.warn("Upload fallback to inline handler:", err);
        }
      }

      let finalBannerUrl = movieForm.banner_url;
      if (bannerPreview?.dataUrl && bannerPreview.dataUrl.startsWith("data:image/")) {
        try {
          const uploadRes = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: bannerPreview.dataUrl,
              filename: bannerPreview.name || "banner.jpg",
              type: "banner",
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success) {
            finalBannerUrl = uploadData.url;
          }
        } catch (err) {
          console.warn("Upload banner fallback:", err);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: movieForm.title,
          id: movieForm.customId || undefined,
          genre: movieForm.genre,
          duration: movieForm.duration,
          rating: Number(movieForm.rating) || 8.0,
          status: movieForm.status,
          poster_url: finalPosterUrl || null,
          banner_url: finalBannerUrl || null,
          synopsis: movieForm.synopsis,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Movie added successfully!");
        setIsAddModalOpen(false);
        setMovieForm(initialMovieForm);
        setPosterPreview(null);
        setBannerPreview(null);
        // Invalidate public movie queries so /movies and / immediately show the new movie!
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        // Refresh admin lists & counts
        reloadAll();
      } else {
        toast.error(data.message || "Failed to add movie.");
      }
    } catch {
      toast.error("Network error while creating movie.");
    } finally {
      setSubmittingMovie(false);
    }
  };

  // 9. CRUD: Handle Edit Movie Submission
  const handleEditMovieSubmit = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;
    if (!movieForm.title.trim()) {
      toast.error("Movie title cannot be empty.");
      return;
    }

    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setSubmittingMovie(true);
    try {
      let finalPosterUrl = movieForm.poster_url;
      if (posterPreview?.dataUrl && posterPreview.dataUrl.startsWith("data:image/")) {
        try {
          const uploadRes = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: posterPreview.dataUrl,
              filename: posterPreview.name || "poster.jpg",
              type: "poster",
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success) {
            finalPosterUrl = uploadData.url;
          }
        } catch (err) {
          console.warn("Upload fallback:", err);
        }
      }

      let finalBannerUrl = movieForm.banner_url;
      if (bannerPreview?.dataUrl && bannerPreview.dataUrl.startsWith("data:image/")) {
        try {
          const uploadRes = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: bannerPreview.dataUrl,
              filename: bannerPreview.name || "banner.jpg",
              type: "banner",
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success) {
            finalBannerUrl = uploadData.url;
          }
        } catch (err) {
          console.warn("Upload banner fallback:", err);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/movies/${editingMovie.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: movieForm.title,
          genre: movieForm.genre,
          duration: movieForm.duration,
          rating: Number(movieForm.rating) || 8.0,
          status: movieForm.status,
          poster_url: finalPosterUrl || null,
          banner_url: finalBannerUrl || null,
          synopsis: movieForm.synopsis,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Movie updated successfully!");
        setEditingMovie(null);
        setPosterPreview(null);
        setBannerPreview(null);
        // Invalidate cache so public pages update instantly
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        reloadAll();
      } else {
        toast.error(data.message || "Failed to update movie.");
      }
    } catch {
      toast.error("Network error while updating movie.");
    } finally {
      setSubmittingMovie(false);
    }
  };

  // 10. CRUD: Handle Delete Movie
  const handleDeleteMovie = async () => {
    if (!deletingMovie) return;

    const token = window.localStorage.getItem("lumiere-token");
    if (!token) return;

    setSubmittingMovie(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/movies/${deletingMovie.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Movie deleted from catalog.");
        setDeletingMovie(null);
        // Invalidate cache so it immediately disappears from /movies and /
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        reloadAll();
      } else {
        toast.error(data.message || "Failed to delete movie.");
      }
    } catch {
      toast.error("Network error while deleting movie.");
    } finally {
      setSubmittingMovie(false);
    }
  };

  // If user is not admin
  const isAuthorized = currentUser?.role === "admin";
  if (authChecked && !isAuthorized) {
    return (
      <div className="container-cine min-h-[70vh] flex items-center justify-center pt-28 pb-16">
        <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Administrator Access Required
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your account ({currentUser?.email}) is registered as a{" "}
            <span className="font-bold text-primary capitalize">{currentUser?.role || "Customer"}</span>.
            The Master Admin Control Center is reserved exclusively for cinema administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link to="/" className="btn-gold !py-2.5 text-xs font-bold text-center">
              Return to Movie Catalog
            </Link>
            <Link to="/login" className="btn-outline !py-2.5 text-xs text-center">
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 transition-colors">
      <div className="container-cine space-y-6">
        {/* TOP HEADER STRIP */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/15 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <Crown className="h-3 w-3" /> Master Admin Portal
              </span>
              <span className="text-xs text-muted-foreground">
                Signed in as <strong className="text-foreground">{currentUser?.name}</strong> (ADMIN)
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              LUMIÈRE Cinema Master Administration
            </h1>
          </div>

          {/* Quick Action Buttons for Admin */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddMovieModal}
              className="btn-gold inline-flex items-center gap-1.5 !py-2 text-xs font-bold shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New Movie
            </button>

            <Link
              to="/movies"
              target="_blank"
              className="btn-outline inline-flex items-center gap-1.5 !py-2 text-xs font-semibold"
              title="Open public movie catalog in a new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Public Site
            </Link>

            <button
              type="button"
              onClick={reloadAll}
              disabled={loading}
              className="btn-outline inline-flex items-center gap-1.5 !py-2 text-xs"
              title="Refresh data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
        {/* 5 KPI OVERVIEW STRIP */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* 1. Total Movies in Catalog */}
          <div
            onClick={() => setActiveTab("movies")}
            className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:border-primary ${
              activeTab === "movies"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Movies in Catalog</span>
              <Film className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {stats.totalMovies || movies.length}
            </p>
            <span className="text-xs text-muted-foreground">
              Full CRUD management
            </span>
          </div>

          {/* 2. Total Registered Users */}
          <div
            onClick={() => setActiveTab("users")}
            className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:border-primary ${
              activeTab === "users"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">User Directory</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {stats.totalUsers}
            </p>
            <span className="text-xs text-muted-foreground">
              {stats.totalCustomers} regular customers
            </span>
          </div>

          {/* 3. Staff Members */}
          <div
            onClick={() => {
              setActiveTab("users");
              setRoleFilter("staff");
            }}
            className="cursor-pointer rounded-xl border border-emerald-500/30 bg-card p-4 shadow-sm transition hover:border-emerald-500"
          >
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Staff Team</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.totalStaff}
            </p>
            <span className="text-xs text-muted-foreground">Gate & hall operators</span>
          </div>

          {/* 4. Total Bookings */}
          <div
            onClick={() => setActiveTab("financials")}
            className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:border-primary ${
              activeTab === "financials"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {stats.totalBookings}
            </p>
            <span className="text-xs text-muted-foreground">
              {stats.confirmedBookings} confirmed passes
            </span>
          </div>

          {/* 5. Gross Collection */}
          <div
            onClick={() => setActiveTab("financials")}
            className="col-span-2 sm:col-span-1 cursor-pointer rounded-xl border border-primary/30 bg-card p-4 shadow-sm transition hover:border-primary"
          >
            <div className="flex items-center justify-between text-primary">
              <span className="text-xs font-semibold uppercase tracking-wider">Box Office Gross</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              ₹{(stats.totalRevenue || 0).toLocaleString()}
            </p>
            <span className="text-xs text-muted-foreground">
              Active confirmed sales
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* NAVIGATION TABS SELECTOR                                       */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("movies")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "movies"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Film className="h-4 w-4" /> Movie Catalog CRUD ({movies.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" /> User & Staff Directory (Method 4)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("financials")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "financials"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" /> Box Office Revenue & Analytics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" /> Activity & Deletion History ({auditLogs.length})
          </button>
        </div>

        {/* TAB 1: MOVIE CATALOG MANAGEMENT (CRUD) */}
        {activeTab === "movies" && (
          <div className="space-y-4">
            {/* Header with Search and "+ Add Movie" */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" /> Cinema Movie Catalog
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {movies.length} Total Films
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add new blockbusters with uploaded posters, edit show details, or remove movies. All changes immediately sync with customer pages.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openAddMovieModal}
                  className="btn-gold inline-flex items-center gap-1.5 !py-2 text-xs font-bold shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add New Movie
                </button>
              </div>
            </div>

            {/* Movie Filters Strip */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-3.5 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movie by title, genre, or synopsis..."
                  value={movieSearchQuery}
                  onChange={(e) => setMovieSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { key: "ALL", label: `All Movies (${stats.totalMovies || movies.length})` },
                  {
                    key: "now-showing",
                    label: `Now Showing (${
                      movies.filter((m) => m.status === "now-showing" || m.status === "now").length
                    })`,
                  },
                  {
                    key: "coming-soon",
                    label: `Coming Soon (${
                      movies.filter((m) => m.status === "coming-soon" || m.status === "soon").length
                    })`,
                  },
                ].map((sf) => (
                  <button
                    key={sf.key}
                    type="button"
                    onClick={() => setMovieStatusFilter(sf.key)}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                      movieStatusFilter === sf.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Movies Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/60 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3">Movie Details</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Genre & Duration</th>
                      <th className="py-3.5 px-3">Rating</th>
                      <th className="py-3.5 px-3">Bookings</th>
                      <th className="py-3.5 px-3">Gross Revenue</th>
                      <th className="py-3.5 pl-3 pr-4 text-right">CRUD Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {movies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          {loading ? (
                            <div className="inline-flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading catalog...
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Film className="h-8 w-8 mx-auto text-muted-foreground/50" />
                              <p className="font-semibold">No movies found matching your filters.</p>
                              <button
                                type="button"
                                onClick={openAddMovieModal}
                                className="btn-gold !py-1.5 !px-3 text-xs"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add First Movie
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      movies.map((m) => {
                        const isNow = m.status === "now-showing" || m.status === "now";
                        return (
                          <tr key={m.id} className="transition hover:bg-muted/30">
                            {/* Movie Poster & Title */}
                            <td className="py-3 pl-4 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted border border-border shadow-xs">
                                  {m.posterUrl ? (
                                    <img
                                      src={m.posterUrl}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";
                                      }}
                                    />
                                  ) : (
                                    <div className="h-full w-full grid place-items-center bg-primary/10 text-primary">
                                      <Film className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground text-sm truncate max-w-xs sm:max-w-sm">
                                    {m.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate font-mono">
                                    ID: {m.id}
                                  </p>
                                  {m.synopsis && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs sm:max-w-md">
                                      {m.synopsis}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3 px-3">
                              {isNow ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  NOW SHOWING
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  COMING SOON
                                </span>
                              )}
                            </td>

                            {/* Genre & Duration */}
                            <td className="py-3 px-3">
                              <p className="font-medium text-foreground">{m.genre || "Action"}</p>
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" /> {m.duration || "2h 15m"}
                              </span>
                            </td>

                            {/* Rating */}
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 font-bold text-rose-600 dark:text-rose-400">
                                <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
                                {Number(m.rating || 8.0).toFixed(1)}
                              </span>
                            </td>

                            {/* Bookings Count */}
                            <td className="py-3 px-3 font-semibold text-foreground">
                              {m.bookingsCount > 0 ? (
                                <span className="text-primary font-bold">
                                  {m.bookingsCount} {m.bookingsCount === 1 ? "booking" : "bookings"}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </td>

                            {/* Gross Revenue */}
                            <td className="py-3 px-3 font-semibold text-foreground">
                              {m.totalRevenue > 0 ? (
                                <span className="text-emerald-500 font-bold">
                                  ₹{m.totalRevenue.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">₹0</span>
                              )}
                            </td>

                            {/* CRUD Action Buttons */}
                            <td className="py-3 pl-3 pr-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {/* Preview on live site */}
                                <Link
                                  to="/movies/$movieId"
                                  params={{ movieId: m.id }}
                                  target="_blank"
                                  className="rounded-md border border-border p-1.5 text-muted-foreground transition hover:border-primary hover:text-primary"
                                  title="View on public site"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Link>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => openEditMovieModal(m)}
                                  className="rounded-md border border-border p-1.5 text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                                  title="Edit movie"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => setDeletingMovie(m)}
                                  className="rounded-md border border-border p-1.5 text-destructive transition hover:border-destructive hover:bg-destructive/10"
                                  title="Delete movie"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
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
        {/* TAB 2: USER & STAFF DIRECTORY (METHOD 4)                       */}
        {/* ============================================================== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Method 4 Info Banner */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    Method 4 Active: Instant Staff Role Promotion
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Employees can create an account normally on the website with their email. As Administrator, find their name in the directory below and click <strong className="text-foreground">"Promote to Staff"</strong>. Their account will immediately gain staff privileges. Next time they sign in, they will automatically be routed to the <strong>Staff Control Center</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-3.5 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { key: "ALL", label: `All Users (${stats.totalUsers})` },
                  { key: "customer", label: `Customers (${stats.totalCustomers})` },
                  { key: "staff", label: `Staff (${stats.totalStaff})` },
                  { key: "admin", label: `Admins (${stats.totalAdmins})` },
                ].map((rf) => (
                  <button
                    key={rf.key}
                    type="button"
                    onClick={() => setRoleFilter(rf.key)}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                      roleFilter === rf.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/60 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3">User Details</th>
                      <th className="py-3.5 px-3">Phone / City</th>
                      <th className="py-3.5 px-3">Bookings</th>
                      <th className="py-3.5 px-3">Total Spent</th>
                      <th className="py-3.5 px-3">Joined Date</th>
                      <th className="py-3.5 px-3">Current Role</th>
                      <th className="py-3.5 pl-3 pr-4 text-right">Role Management (Method 4)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          {loading ? (
                            <div className="inline-flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading users...
                            </div>
                          ) : (
                            "No users found matching your search."
                          )}
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        const role = u.role?.toLowerCase();

                        return (
                          <tr key={u.id} className="transition hover:bg-muted/30">
                            {/* User details */}
                            <td className="py-3 pl-4 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                                  {u.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground truncate">{u.name}</span>
                                    {isSelf && (
                                      <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Phone / City */}
                            <td className="py-3 px-3">
                              <p className="text-foreground">{u.phone || "—"}</p>
                              <p className="text-[11px] text-muted-foreground">{u.city || "—"}</p>
                            </td>

                            {/* Bookings Count */}
                            <td className="py-3 px-3 font-semibold text-foreground">
                              {u.bookingsCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-primary">
                                  <Ticket className="h-3 w-3" /> {u.bookingsCount}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </td>

                            {/* Total Spent */}
                            <td className="py-3 px-3 font-semibold text-foreground">
                              ₹{(u.totalSpent || 0).toLocaleString()}
                            </td>

                            {/* Joined Date */}
                            <td className="py-3 px-3 text-muted-foreground">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                            </td>

                            {/* Role Badge */}
                            <td className="py-3 px-3">
                              {role === "admin" && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                  <Crown className="h-3 w-3 text-purple-500" /> Admin
                                </span>
                              )}
                              {role === "staff" && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <UserCheck className="h-3 w-3 text-emerald-500" /> Staff
                                </span>
                              )}
                              {role !== "admin" && role !== "staff" && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  Customer
                                </span>
                              )}
                            </td>

                            {/* Role Management Dropdown / Buttons */}
                            <td className="py-3 pl-3 pr-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {role === "customer" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRole(u.id, "staff", u.name)}
                                    disabled={updatingUserId === u.id}
                                    className="btn-gold inline-flex items-center gap-1 !py-1 !px-2.5 text-[11px] font-bold shadow-xs"
                                  >
                                    <UserPlus className="h-3 w-3" />
                                    Promote to Staff
                                  </button>
                                )}

                                {role === "staff" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRole(u.id, "customer", u.name)}
                                    disabled={updatingUserId === u.id}
                                    className="rounded-lg border border-border bg-muted/80 px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    Demote to Customer
                                  </button>
                                )}

                                {/* Role Selector Dropdown */}
                                <select
                                  value={role === "user" ? "customer" : role}
                                  onChange={(e) => handleUpdateRole(u.id, e.target.value, u.name)}
                                  disabled={updatingUserId === u.id || (isSelf && stats.totalAdmins <= 1)}
                                  className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground focus:border-primary focus:outline-none"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="staff">Staff</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
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
        {/* TAB 3: BOX OFFICE REVENUE & ANALYTICS                          */}
        {/* ============================================================== */}
        {activeTab === "financials" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Cinema Box Office Revenue Summary
                </h3>
                <p className="text-xs text-muted-foreground">
                  Financial performance, gross ticketing revenue, and movie performance breakdown.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total Net Collections</span>
                  <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(stats.totalRevenue || 0).toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">From confirmed bookings</span>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <span className="text-xs font-semibold text-primary">Confirmed Tickets</span>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {stats.confirmedBookings || 0}
                  </p>
                  <span className="text-xs text-muted-foreground">Active cinema admissions</span>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <span className="text-xs font-semibold text-muted-foreground">Average Spend Per Booking</span>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    ₹{stats.confirmedBookings > 0
                      ? Math.round(stats.totalRevenue / stats.confirmedBookings).toLocaleString()
                      : 0}
                  </p>
                  <span className="text-xs text-muted-foreground">Across all ticket tiers</span>
                </div>
              </div>
            </div>

            {/* Movie Collection Performance Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="p-4 border-b border-border">
                <h4 className="font-bold text-sm text-foreground">Film Collection Breakdown</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/60 text-muted-foreground uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 pl-4 pr-3">Movie</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Total Bookings</th>
                      <th className="py-3 pr-4 text-right">Gross Box Office Collection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {movies
                      .filter((m) => m.bookingsCount > 0 || m.totalRevenue > 0)
                      .length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No booking collections recorded yet.
                        </td>
                      </tr>
                    ) : (
                      movies
                        .filter((m) => m.bookingsCount > 0 || m.totalRevenue > 0)
                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                        .map((m) => (
                          <tr key={m.id} className="hover:bg-muted/30">
                            <td className="py-3 pl-4 pr-3 font-bold text-foreground">
                              {m.title}
                            </td>
                            <td className="py-3 px-3">
                              <span className="capitalize text-muted-foreground">{m.status}</span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-foreground">
                              {m.bookingsCount}
                            </td>
                            <td className="py-3 pr-4 text-right font-bold text-emerald-500">
                              ₹{m.totalRevenue.toLocaleString()}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVITY & DELETION HISTORY AUDIT LOG */}
        {activeTab === "history" && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Header with Search and Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" /> Cinema Activity & Deletion History
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {auditLogs.length} Total Audit Records
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Complete audit log of movie additions, modifications, and permanent database & image file deletions with administrator signatures.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  disabled={loadingLogs}
                  className="btn-outline inline-flex items-center gap-1.5 !py-2 text-xs font-semibold"
                  title="Reload audit logs from server"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? "animate-spin text-primary" : ""}`} />
                  Refresh History
                </button>
                {auditLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition"
                    title="Clear history logs"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear History
                  </button>
                )}
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
                  <History className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{logStats.total}</p>
                <span className="text-[11px] text-muted-foreground">Logged actions</span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-card p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Movies Added</span>
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{logStats.added}</p>
                <span className="text-[11px] text-muted-foreground">Catalog additions</span>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-card p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Movies Updated</span>
                  <Edit2 className="h-4 w-4 text-sky-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">{logStats.updated}</p>
                <span className="text-[11px] text-muted-foreground">Information revisions</span>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-card p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Movies Deleted</span>
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{logStats.deleted}</p>
                <span className="text-[11px] text-muted-foreground">Purged from DB & disk</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-3.5 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search history by movie title, slug ID, or admin..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Action Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { key: "ALL", label: `All (${logStats.total})` },
                  { key: "MOVIE_ADDED", label: `Added (${logStats.added})` },
                  { key: "MOVIE_UPDATED", label: `Updated (${logStats.updated})` },
                  { key: "MOVIE_DELETED", label: `Deleted (${logStats.deleted})` },
                ].map(({ key, label }) => {
                  const active = logActionFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLogActionFilter(key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audit Log Table / Cards List */}
            {filteredLogs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <History className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                <h4 className="text-sm font-bold text-foreground">No History Records Found</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {logSearchQuery || logActionFilter !== "ALL"
                    ? "Try adjusting your search terms or action filters."
                    : "No catalog activity records have been logged yet."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const isAdded = log.action === "MOVIE_ADDED";
                    const isUpdated = log.action === "MOVIE_UPDATED";
                    const isDeleted = log.action === "MOVIE_DELETED";

                    return (
                      <div
                        key={log.id}
                        className="p-4 sm:p-5 transition hover:bg-muted/30 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-2">
                            {isAdded && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Movie Added
                              </span>
                            )}
                            {isUpdated && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                                <Edit2 className="h-3 w-3" /> Movie Updated
                              </span>
                            )}
                            {isDeleted && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                <Trash2 className="h-3 w-3" /> Movie Deleted
                              </span>
                            )}

                            {log.poster_deleted && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                                🗑️ Disk Image Files Purged
                              </span>
                            )}

                            <span className="font-mono text-[10px] rounded bg-muted px-2 py-0.5 text-muted-foreground border border-border/70">
                              ID: {log.movie_id || "N/A"}
                            </span>
                          </div>

                          {/* Movie Title */}
                          <h4 className="text-base font-bold text-foreground">
                            {log.movie_title}
                          </h4>

                          {/* Event Details */}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {log.details}
                          </p>
                        </div>

                        {/* Right: Timestamp and Admin Details */}
                        <div className="md:text-right shrink-0 space-y-1 text-xs border-t md:border-t-0 pt-2 md:pt-0 border-border/60">
                          <div className="flex items-center md:justify-end gap-1.5 text-foreground font-semibold">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {new Date(log.created_at).toLocaleString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            By:{" "}
                            <strong className="text-foreground">
                              {log.performed_by_name || "Admin"}
                            </strong>{" "}
                            ({log.performed_by})
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADD MOVIE MODAL (WITH DIRECT FILE UPLOAD) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
            <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Add New Movie</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload poster from your computer or provide details. The film will immediately show on the live site.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddMovieSubmit} className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Movie Title */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-foreground">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the movie title (e.g. Inception)"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Slug / Movie ID */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Custom ID / Slug <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter custom slug ID (optional, auto-generated if empty)"
                      value={movieForm.customId}
                      onChange={(e) => setMovieForm({ ...movieForm, customId: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Release Status *</label>
                    <select
                      value={movieForm.status}
                      onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="now-showing">Now Showing (Bookable immediately)</option>
                      <option value="coming-soon">Coming Soon (Upcoming in catalog)</option>
                    </select>
                  </div>

                  {/* Genre */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Genre(s) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the movie genre (e.g. Action, Sci-Fi, Adventure)"
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the movie duration (e.g. 2h 28m)"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-foreground">IMDb / Critic Rating (1.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="10.0"
                      placeholder="Enter the rating from 1.0 to 10.0 (e.g. 8.6)"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* ============================================================ */}
                  {/* POSTER IMAGE UPLOAD COMPONENT (DIRECT COMPUTER UPLOAD)       */}
                  {/* ============================================================ */}
                  <div className="space-y-2 sm:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <ImageIcon className="h-4 w-4 text-primary" /> Movie Poster Image
                      </label>
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPosterMode("file")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            posterMode === "file"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosterMode("url")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            posterMode === "url"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Enter URL
                        </button>
                      </div>
                    </div>

                    {posterMode === "file" ? (
                      <div>
                        {posterPreview?.dataUrl ? (
                          <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-card p-3 shadow-xs">
                            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-xs">
                              <img
                                src={posterPreview.dataUrl}
                                alt="Poster Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <Check className="h-3 w-3" /> Image Selected
                                </span>
                                {posterPreview.size && (
                                  <span className="text-[11px] text-muted-foreground">({posterPreview.size})</span>
                                )}
                              </div>
                              <p className="font-bold text-foreground text-xs truncate">
                                {posterPreview.name || "Movie Poster"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Uploaded directly from computer to cinema local server storage.
                              </p>
                              <div className="pt-1 flex items-center gap-2">
                                <label className="cursor-pointer text-[11px] font-bold text-primary hover:underline">
                                  Change Image
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handlePosterFileChange}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-muted-foreground">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPosterPreview(null);
                                    setMovieForm((prev) => ({ ...prev, poster_url: "" }));
                                  }}
                                  className="text-[11px] font-bold text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-6 text-center cursor-pointer transition hover:border-primary hover:bg-primary/5">
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handlePosterFileChange}
                              className="hidden"
                            />
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                Click to upload downloaded poster image
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Select PNG, JPG, or WebP from your computer (up to 20MB)
                              </p>
                            </div>
                            <span className="btn-gold !py-1 !px-3 text-[11px] font-bold shadow-xs">
                              Choose Image from Computer
                            </span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="Enter the poster image URL (e.g. https://...)"
                          value={movieForm.poster_url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMovieForm((prev) => ({ ...prev, poster_url: val }));
                            setPosterPreview(val ? { name: "External Image URL", size: "", dataUrl: val } : null);
                          }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                        {movieForm.poster_url && (
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 text-xs">
                            <img
                              src={movieForm.poster_url}
                              alt="Preview"
                              className="h-12 w-9 rounded object-cover border border-border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <span className="text-[11px] text-muted-foreground truncate">
                              Previewing: {movieForm.poster_url}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ============================================================ */}
                  {/* BANNER IMAGE UPLOAD COMPONENT (OPTIONAL BACKDROP)            */}
                  {/* ============================================================ */}
                  <div className="space-y-2 sm:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <Layers className="h-4 w-4 text-primary" /> Widescreen Banner / Backdrop{" "}
                        <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setBannerMode("file")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            bannerMode === "file"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerMode("url")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            bannerMode === "url"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Enter URL
                        </button>
                      </div>
                    </div>

                    {bannerMode === "file" ? (
                      <div>
                        {bannerPreview?.dataUrl ? (
                          <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-card p-3 shadow-xs">
                            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-xs">
                              <img
                                src={bannerPreview.dataUrl}
                                alt="Banner Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <Check className="h-3 w-3" /> Banner Selected
                                </span>
                                {bannerPreview.size && (
                                  <span className="text-[11px] text-muted-foreground">({bannerPreview.size})</span>
                                )}
                              </div>
                              <p className="font-bold text-foreground text-xs truncate">
                                {bannerPreview.name || "Widescreen Backdrop"}
                              </p>
                              <div className="pt-1 flex items-center gap-2">
                                <label className="cursor-pointer text-[11px] font-bold text-primary hover:underline">
                                  Change Image
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handleBannerFileChange}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-muted-foreground">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBannerPreview(null);
                                    setMovieForm((prev) => ({ ...prev, banner_url: "" }));
                                  }}
                                  className="text-[11px] font-bold text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-5 text-center cursor-pointer transition hover:border-primary hover:bg-primary/5">
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handleBannerFileChange}
                              className="hidden"
                            />
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                Upload optional wide backdrop banner
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Appears behind movie hero banner on details page
                              </p>
                            </div>
                            <span className="btn-outline !py-1 !px-3 text-[11px] font-bold shadow-xs">
                              Choose Banner from Computer
                            </span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="Enter the widescreen banner URL (optional, e.g. https://...)"
                        value={movieForm.banner_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMovieForm((prev) => ({ ...prev, banner_url: val }));
                          setBannerPreview(val ? { name: "External Banner URL", size: "", dataUrl: val } : null);
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-foreground">Plot Synopsis / Storyline</label>
                    <textarea
                      rows={3}
                      placeholder="Enter the movie storyline / synopsis for cinema patrons..."
                      value={movieForm.synopsis}
                      onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={submittingMovie}
                    className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMovie}
                    className="btn-gold inline-flex items-center gap-1.5 !py-2 !px-5 font-bold shadow-sm"
                  >
                    {submittingMovie ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Movie...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Add Movie to Catalog
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT MOVIE MODAL (WITH DIRECT FILE UPLOAD)                     */}
        {/* ============================================================== */}
        {editingMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
            <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Edit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Edit Movie Details</h3>
                    <p className="text-xs text-muted-foreground">
                      Editing <strong className="text-foreground">{editingMovie.title}</strong> (ID: {editingMovie.id})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditMovieSubmit} className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Movie Title */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-foreground">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the movie title (e.g. Inception)"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Release Status *</label>
                    <select
                      value={movieForm.status}
                      onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="now-showing">Now Showing (Bookable immediately)</option>
                      <option value="coming-soon">Coming Soon (Upcoming in catalog)</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">IMDb / Critic Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="10.0"
                      placeholder="Enter the rating (1.0 - 10.0)"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Genre */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Genre(s) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the movie genre (e.g. Action, Sci-Fi)"
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the movie duration (e.g. 2h 28m)"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Poster Image Component */}
                  <div className="space-y-2 sm:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <ImageIcon className="h-4 w-4 text-primary" /> Movie Poster Image
                      </label>
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPosterMode("file")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            posterMode === "file"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosterMode("url")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            posterMode === "url"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Enter URL
                        </button>
                      </div>
                    </div>

                    {posterMode === "file" ? (
                      <div>
                        {posterPreview?.dataUrl ? (
                          <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-card p-3 shadow-xs">
                            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-xs">
                              <img
                                src={posterPreview.dataUrl}
                                alt="Poster Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <Check className="h-3 w-3" /> Image Selected
                                </span>
                              </div>
                              <p className="font-bold text-foreground text-xs truncate">
                                {posterPreview.name || "Movie Poster"}
                              </p>
                              <div className="pt-1 flex items-center gap-2">
                                <label className="cursor-pointer text-[11px] font-bold text-primary hover:underline">
                                  Change Image
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handlePosterFileChange}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-muted-foreground">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPosterPreview(null);
                                    setMovieForm((prev) => ({ ...prev, poster_url: "" }));
                                  }}
                                  className="text-[11px] font-bold text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-6 text-center cursor-pointer transition hover:border-primary hover:bg-primary/5">
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handlePosterFileChange}
                              className="hidden"
                            />
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                Click to upload a new poster from your computer
                              </p>
                            </div>
                            <span className="btn-gold !py-1 !px-3 text-[11px] font-bold shadow-xs">
                              Browse New Image
                            </span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="Enter the poster image URL (e.g. https://...)"
                        value={movieForm.poster_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMovieForm((prev) => ({ ...prev, poster_url: val }));
                          setPosterPreview(val ? { name: "External Image URL", size: "", dataUrl: val } : null);
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Banner Image Component */}
                  <div className="space-y-2 sm:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <Layers className="h-4 w-4 text-primary" /> Widescreen Banner URL
                      </label>
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setBannerMode("file")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            bannerMode === "file"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerMode("url")}
                          className={`rounded px-2.5 py-0.5 font-semibold transition ${
                            bannerMode === "url"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Enter URL
                        </button>
                      </div>
                    </div>

                    {bannerMode === "file" ? (
                      <div>
                        {bannerPreview?.dataUrl ? (
                          <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-card p-3 shadow-xs">
                            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-xs">
                              <img
                                src={bannerPreview.dataUrl}
                                alt="Banner Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-bold text-foreground text-xs truncate">
                                {bannerPreview.name || "Widescreen Backdrop"}
                              </p>
                              <div className="pt-1 flex items-center gap-2">
                                <label className="cursor-pointer text-[11px] font-bold text-primary hover:underline">
                                  Change Image
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handleBannerFileChange}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-muted-foreground">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBannerPreview(null);
                                    setMovieForm((prev) => ({ ...prev, banner_url: "" }));
                                  }}
                                  className="text-[11px] font-bold text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-5 text-center cursor-pointer transition hover:border-primary hover:bg-primary/5">
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handleBannerFileChange}
                              className="hidden"
                            />
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
                              <Upload className="h-5 w-5" />
                            </div>
                            <span className="btn-outline !py-1 !px-3 text-[11px] font-bold shadow-xs">
                              Upload New Banner from Computer
                            </span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="Enter the widescreen banner URL (optional, e.g. https://...)"
                        value={movieForm.banner_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMovieForm((prev) => ({ ...prev, banner_url: val }));
                          setBannerPreview(val ? { name: "External Banner URL", size: "", dataUrl: val } : null);
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-foreground">Plot Synopsis / Storyline</label>
                    <textarea
                      rows={3}
                      placeholder="Enter the movie storyline / synopsis..."
                      value={movieForm.synopsis}
                      onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingMovie(null)}
                    disabled={submittingMovie}
                    className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMovie}
                    className="btn-gold inline-flex items-center gap-1.5 !py-2 !px-5 font-bold shadow-sm"
                  >
                    {submittingMovie ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DELETE MOVIE CONFIRMATION MODAL                                */}
        {/* ============================================================== */}
        {deletingMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
            <div className="relative w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Delete Movie from Catalog?</h3>
                  <p className="text-xs text-muted-foreground">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-xs">
                <p className="font-bold text-foreground text-sm">{deletingMovie.title}</p>
                <p className="text-muted-foreground font-mono mt-0.5">ID: {deletingMovie.id}</p>
                <div className="mt-3 space-y-1.5 text-foreground leading-relaxed">
                  <p className="font-semibold text-destructive flex items-center gap-1.5">
                    <span>⚠️ Complete System & Disk Purge:</span>
                  </p>
                  <p className="text-muted-foreground">
                    1. <strong>Database:</strong> Movie details and all linked showtimes will be erased completely.
                  </p>
                  <p className="text-muted-foreground">
                    2. <strong>Disk Storage:</strong> All uploaded poster and banner image files will be physically deleted from server storage.
                  </p>
                  <p className="text-muted-foreground">
                    3. <strong>Audit Log:</strong> A permanent deletion timestamp record will be added to your <strong>Activity History</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingMovie(null)}
                  disabled={submittingMovie}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMovie}
                  disabled={submittingMovie}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground shadow-sm hover:bg-destructive/90"
                >
                  {submittingMovie ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" /> Delete Movie
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
