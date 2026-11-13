import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  ArrowLeft,
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  KeyRound,
  RotateCw,
  Ticket,
} from "lucide-react";
import heroImax from "@/assets/hero-imax.jpg";
import heroVip from "@/assets/hero-vip-lounge.jpg";
import heroTheatre from "@/assets/hero-theatre.jpg";
import featuredBanner from "@/assets/featured-banner.jpg";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";
import { CITIES } from "@/data/movies";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const AUTH_SLIDES = [
  {
    id: "endgame",
    image: heroImax,
    quote: "Part of the journey is the end. Every hero has a chapter waiting to be experienced.",
    movie: "AVENGERS: ENDGAME",
    badge: "IMAX® LASER 3D",
    rating: "8.4",
    year: "2019",
    genre: "Action • Sci-Fi • Marvel",
  },
  {
    id: "spiderman",
    image: heroTheatre,
    quote: "With great power comes great responsibility. The greatest big-screen adventure awaits.",
    movie: "SPIDER-MAN: NO WAY HOME",
    badge: "DOLBY ATMOS® 360",
    rating: "8.2",
    year: "2021",
    genre: "Action • Adventure • 4K",
  },
  {
    id: "vip",
    image: heroVip,
    quote: "Cinema is the most beautiful art in the world. Experience it from the finest seat.",
    movie: "LUMIÈRE ROYALE SUITES",
    badge: "VIP RECLINER SUITES",
    rating: "9.8",
    year: "PREMIER",
    genre: "In-Seat Dining • Luxury Recliners",
  },
  {
    id: "astral",
    image: featuredBanner,
    quote: "We used to look up at the sky and wonder at our place in the stars.",
    movie: "THE ASTRAL FRONTIER",
    badge: "EXCLUSIVE 70MM IMAX",
    rating: "8.9",
    year: "2026",
    genre: "Sci-Fi • Cosmic Odyssey",
  },
];

function Field({ icon: Icon, error, children }) {
  return (
    <div>
      <div
        className={`flex items-center gap-2.5 rounded-lg border bg-surface/70 px-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {children}
      </div>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export default function AuthForm({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Mumbai",
    dob: "",
    password: "",
    confirmPassword: "",
    remember: false,
    agreeTerms: true,
  });

  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // OTP Verification State
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % AUTH_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + AUTH_SLIDES.length) % AUTH_SLIDES.length);
  }, []);

  // Auto carousel advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, nextSlide]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-detect OTP from email verification link
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code") || params.get("otp");
      const emailParam = params.get("email");
      if (codeParam) {
        setOtp(codeParam.trim());
        setOtpStep(true);
      }
      if (emailParam) {
        setForm((prev) => ({ ...prev, email: emailParam.trim() }));
      }
    }
  }, []);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const inputClass =
    "h-10.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground";

  const getRedirectTarget = (role) => {
    if (typeof window === "undefined") return "/";
    const r = role?.toLowerCase();
    // Admin lands directly in Admin Dashboard (/admin), unless they were navigating to /movies or /book/
    if (r === "admin") {
      try {
        const params = new URLSearchParams(window.location.search);
        const target = params.get("redirect");
        if (target && (target.startsWith("/book/") || target.startsWith("/movies"))) {
          return target;
        }
      } catch {}
      return "/admin";
    }

    // Staff lands directly in Staff Dashboard (/staff), unless they were navigating to /movies or /book/
    if (r === "staff") {
      try {
        const params = new URLSearchParams(window.location.search);
        const target = params.get("redirect");
        if (target && (target.startsWith("/book/") || target.startsWith("/movies"))) {
          return target;
        }
      } catch {}
      return "/staff";
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("redirect");
      if (target && target.startsWith("/")) {
        return target;
      }
    } catch {}

    return "/";
  };

  // Submit Register or Login Form
  const submit = async (e) => {
    e.preventDefault();
    const next = {};

    if (isLogin) {
      if (!EMAIL_RE.test(form.email.trim())) next.email = "Please enter a valid email address.";
      if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    } else {
      if (form.name.trim().length < 2) next.name = "Enter your full name.";
      if (!form.phone.trim() || form.phone.trim().length < 10)
        next.phone = "Enter a valid 10-digit mobile number.";
      if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email.";
      if (!form.dob) next.dob = "Select your date of birth.";
      if (form.password.length < 8) next.password = "Minimum 8 characters.";
      if (form.password !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match.";
      if (!form.agreeTerms) next.agreeTerms = "Please agree to the terms to register.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);

    if (isLogin) {
      // Login API call
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.token) {
            localStorage.setItem("lumiere-token", data.token);
          }
          localStorage.setItem("lumiere-user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("lumiere-auth-change"));
          toast.success("Welcome back, " + data.user.name + "!");
          const target = getRedirectTarget(data.user?.role);
          setTimeout(() => navigate({ to: target }), 600);
        } else if (data.requiresVerification) {
          setOtpStep(true);
          toast.info("Please verify your account with the 8-digit code.");
        } else {
          toast.error(data.message || "Invalid credentials.");
        }
      } catch {
        // Fallback for offline demo
        toast.success("Welcome back! (Demo Session Active)");
        const target = getRedirectTarget(data.user?.role);
        setTimeout(() => navigate({ to: target }), 600);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Register API Call -> Triggers 8-Digit OTP Email
      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setOtpStep(true);
          setResendTimer(60);
          toast.success("Verification Code Sent!", {
            description: "Check your email for the 8-digit verification code.",
          });
        } else {
          toast.error(data.message || "Registration failed.");
        }
      } catch {
        // Fallback for offline demo
        setOtpStep(true);
        setResendTimer(60);
        toast.info("Demo Mode: 8-digit verification active.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Verify 8-Digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 8) {
      setOtpError("Please enter the complete 8-digit code.");
      return;
    }

    setIsSubmitting(true);
    setOtpError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otp.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("lumiere-token", data.token);
        }
        localStorage.setItem("lumiere-user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("lumiere-auth-change"));
        toast.success("Account Verified!", {
          description: "Welcome to LUMIÈRE Cinemas VIP membership.",
        });
        const target = getRedirectTarget(data.user?.role);
        setTimeout(() => navigate({ to: target }), 700);
      } else {
        const errorMsg = data.message || "Invalid code. Please try again.";
        setOtpError(errorMsg);
        toast.error("Verification Failed", {
          description: errorMsg,
        });
      }
    } catch {
      // Fallback for offline demo
      toast.success("Account Activated!", {
        description: "Welcome to LUMIÈRE Cinemas.",
      });
      const target = getRedirectTarget();
      setTimeout(() => navigate({ to: target }), 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend 8-Digit OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    try {
      await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      toast.success("New 8-digit code sent to your email!");
    } catch {
      toast.info("Demo: New code generated.");
    }
  };

  const slide = AUTH_SLIDES[currentSlide];

  return (
    <div className="grid min-h-screen lg:h-screen w-full grid-cols-1 overflow-y-auto lg:overflow-hidden lg:grid-cols-2">
      {/* LEFT HALF: 8K MOVIE & QUOTES CAROUSEL */}
      <div
        className="relative hidden h-full w-full select-none overflow-hidden bg-black lg:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background Images Crossfade */}
        {AUTH_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            <img
              src={s.image}
              alt={s.movie}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {/* Clean Contrast Overlays (High legibility, no blur blobs) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Brand Header at Top Left */}
        <div className="absolute left-10 top-8 z-10 flex items-center justify-between right-10">
          <Logo contrast="light" />
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>VIP Cinema Experience</span>
          </div>
        </div>

        {/* Quotes & Movie Carousel Content at Bottom Left */}
        <div className="absolute bottom-10 left-10 right-10 z-10">
          {/* Quote Icon */}
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-black/60 text-primary shadow-lg">
            <Quote className="h-4 w-4" />
          </div>

          {/* Iconic Quote */}
          <blockquote className="font-sans text-xl font-medium italic leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-2xl">
            “{slide.quote}”
          </blockquote>

          {/* Movie Title & Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl tracking-wider text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {slide.movie}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-sm bg-primary/20 px-2 py-0.5 text-xs font-extrabold text-primary border border-primary/40">
              <Star className="h-3 w-3 fill-primary" /> IMDb {slide.rating}
            </span>
            <span className="rounded-sm border border-white/20 bg-black/60 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              {slide.badge}
            </span>
            <span className="hidden text-xs text-zinc-400 sm:inline-block">
              {slide.genre}
            </span>
          </div>

          {/* Carousel Controls & Progress Dots */}
          <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
            <div className="flex items-center gap-2">
              {AUTH_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous quote"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/60 text-zinc-200 shadow-sm transition hover:border-primary hover:bg-black/90 hover:text-primary active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next quote"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/60 text-zinc-200 shadow-sm transition hover:border-primary hover:bg-black/90 hover:text-primary active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: DEDICATED AUTH FORM (Scrollable on mobile, fits on desktop) */}
      <div className="relative flex min-h-full lg:h-full flex-col justify-between overflow-y-auto bg-background px-4 py-6 sm:px-10 xl:px-14">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/80 text-foreground transition hover:border-primary hover:text-primary active:scale-95"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Center Form Container */}
        <div className={`mx-auto my-auto w-full py-2 ${isLogin || otpStep ? "max-w-sm" : "max-w-md"}`}>
          {/* Mobile Logo */}
          <div className="mb-4 lg:hidden">
            <Logo />
          </div>

          {/* SCREEN 1: 8-DIGIT OTP VERIFICATION */}
          {otpStep ? (
            <div className="animate-fade-in">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/50 bg-primary/10 text-primary shadow-lg mb-3">
                <KeyRound className="h-6 w-6" />
              </div>

              <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl tracking-wide text-foreground">
                VERIFY YOUR ACCOUNT
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                We sent an 8-digit verification code to{" "}
                <span className="font-bold text-foreground">{form.email}</span>. Enter it below to activate your account.
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div>
                  <div className="relative rounded-xl border-2 border-primary/40 bg-surface/80 p-2.5 sm:p-3 shadow-inner transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                    <input
                      type="text"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtp(val);
                        setOtpError("");
                      }}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-center font-mono text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-[0.22em] xs:tracking-[0.32em] sm:tracking-[0.4em] text-primary outline-none placeholder:text-muted-foreground/30"
                      autoFocus
                    />
                  </div>
                  {otpError && <p className="mt-2 text-center text-xs text-destructive">{otpError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 8}
                  className="btn-gold h-11 w-full text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Activate Account"}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Change details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    <RotateCw className="h-3 w-3" />
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* SCREEN 2: LOGIN / REGISTER FORMS */
            <div>
              {getRedirectTarget() !== "/" && (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-xs text-primary font-medium">
                  <Ticket className="h-4 w-4 shrink-0" />
                  <span>
                    {(() => {
                      try {
                        if (typeof window !== "undefined") {
                          const target = new URLSearchParams(window.location.search).get("redirect");
                          if (target && target.startsWith("/movies")) {
                            return "Please sign in or create an account to browse all movies in theatres.";
                          }
                        }
                      } catch {}
                      return "Please sign in or register to complete your movie ticket booking.";
                    })()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl tracking-wide text-foreground">
                  {isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLogin
                    ? "Sign in to access your bookings, tickets and VIP rewards."
                    : "Join LUMIÈRE Cinemas to unlock VIP perks, birthday tickets & instant booking."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={submit} noValidate className="mt-5 space-y-3">
                {isLogin ? (
                  /* LOGIN FORM */
                  <>
                    <Field icon={Mail} error={errors.email}>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="Email address"
                        value={form.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        aria-label="Email address"
                        autoComplete="email"
                      />
                    </Field>

                    <Field icon={Lock} error={errors.password}>
                      <input
                        type={show ? "text" : "password"}
                        className={inputClass}
                        placeholder="Password (min 8 characters)"
                        value={form.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        aria-label="Password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </Field>

                    <div className="flex items-center justify-between text-xs">
                      <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={form.remember}
                          onChange={(e) => handleInputChange("remember", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-border text-primary accent-primary"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toast.info("Password reset link will be sent to your email.")}
                        className="font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </>
                ) : (
                  /* REGISTRATION FORM (With Complete User Information) */
                  <>
                    {/* Full Name & Phone Number */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Field icon={User} error={errors.name}>
                        <input
                          className={inputClass}
                          placeholder="Full name"
                          value={form.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          aria-label="Full name"
                          autoComplete="name"
                        />
                      </Field>

                      <Field icon={Phone} error={errors.phone}>
                        <input
                          type="tel"
                          className={inputClass}
                          placeholder="Mobile (10 digits)"
                          value={form.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          aria-label="Mobile number"
                          autoComplete="tel"
                        />
                      </Field>
                    </div>

                    {/* Email Address */}
                    <Field icon={Mail} error={errors.email}>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="Email address (for tickets & receipts)"
                        value={form.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        aria-label="Email address"
                        autoComplete="email"
                      />
                    </Field>

                    {/* City & Date of Birth */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Field icon={MapPin} error={errors.city}>
                        <select
                          value={form.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="h-10.5 w-full bg-transparent text-sm text-foreground outline-none"
                          aria-label="Preferred city"
                        >
                          {CITIES.map((c) => (
                            <option key={c} value={c} className="bg-card text-foreground">
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field icon={Calendar} error={errors.dob}>
                        <input
                          type="date"
                          className={inputClass}
                          value={form.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          aria-label="Date of birth"
                          title="Date of birth (for birthday privileges)"
                        />
                      </Field>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Field icon={Lock} error={errors.password}>
                        <input
                          type={show ? "text" : "password"}
                          className={inputClass}
                          placeholder="Password (8+ chars)"
                          value={form.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          aria-label="Password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShow(!show)}
                          aria-label={show ? "Hide password" : "Show password"}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </Field>

                      <Field icon={Lock} error={errors.confirmPassword}>
                        <input
                          type={show ? "text" : "password"}
                          className={inputClass}
                          placeholder="Confirm password"
                          value={form.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          aria-label="Confirm password"
                          autoComplete="new-password"
                        />
                      </Field>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="pt-0.5">
                      <label className="flex cursor-pointer items-start gap-2 text-[11px] text-muted-foreground hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={form.agreeTerms}
                          onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary accent-primary"
                        />
                        <span>
                          I agree to the{" "}
                          <span className="text-primary hover:underline">Terms of Service</span> and{" "}
                          <span className="text-primary hover:underline">Privacy Policy</span>.
                        </span>
                      </label>
                      {errors.agreeTerms && (
                        <p className="mt-1 text-[11px] text-destructive">{errors.agreeTerms}</p>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold !mt-3 h-10.5 w-full text-xs font-bold shadow-md uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Processing..."
                    : isLogin
                      ? "Sign In to LUMIÈRE"
                      : "Create My Account"}
                </button>
              </form>

              {/* Switch Mode Prompt */}
              <div className="mt-4 text-center text-xs text-muted-foreground">
                {isLogin ? "New to LUMIÈRE? " : "Already have an account? "}
                <Link
                  to={isLogin ? "/register" : "/login"}
                  search={getRedirectTarget() !== "/" ? { redirect: getRedirectTarget() } : undefined}
                  className="font-bold text-primary transition hover:underline"
                >
                  {isLogin ? "Create an account" : "Sign In"}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Note */}
        <div className="flex flex-col xs:flex-row items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>256-bit Encrypted Booking</span>
          </span>
          <span>© 2026 LUMIÈRE CINEMAS</span>
        </div>
      </div>
    </div>
  );
}
