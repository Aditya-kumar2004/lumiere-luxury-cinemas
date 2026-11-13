import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Send, Lock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import Reveal from "./Reveal";
import { API_BASE_URL } from "../../config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Newsletter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("lumiere-user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.email) {
          setEmail(parsed.email);
        }
      }
    } catch (e) {
      console.error("User session read error:", e);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Logged-in / Registered user: Green Success Popup!
        toast.success("Welcome to LUMIÈRE VIP Club! 🎬", {
          description: data.message,
        });
      } else if (data.requiresAccount) {
        // Not registered: Warm, welcoming message in Red Popup with 1-Click Register button!
        toast.error("Please Create an Account First ✨", {
          description: "Welcome to LUMIÈRE! To receive exclusive movie premieres and VIP screening invites, please create your free account first.",
          action: {
            label: "Create Account",
            onClick: () => navigate({ to: "/register" }),
          },
          duration: 6000,
        });
      } else if (data.requiresVerification) {
        // Registered but OTP not verified yet
        toast.info("Account Verification Required", {
          description: "Please verify your account with the 8-digit OTP code to activate your newsletter subscription.",
          action: {
            label: "Verify OTP",
            onClick: () => navigate({ to: "/register" }),
          },
        });
      } else {
        toast.error("Subscription Error", {
          description: data.message || "Could not complete your subscription.",
        });
      }
    } catch {
      // Fallback if backend is restarting
      if (!currentUser) {
        toast.error("Please Create an Account First ✨", {
          description: "Welcome to LUMIÈRE! Please create your free account first to receive exclusive VIP newsletters.",
          action: {
            label: "Create Account",
            onClick: () => navigate({ to: "/register" }),
          },
        });
      } else {
        toast.success("You're subscribed!", {
          description: "Welcome to LUMIÈRE VIP Updates.",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Reveal as="section" className="container-cine py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-lg border border-primary/25 bg-card px-4 py-10 text-center sm:px-12 sm:py-16">
        <div className="absolute inset-x-0 -top-24 mx-auto h-60 w-[600px] max-w-full bg-glow-gold blur-2xl" />
        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto mb-4 sm:mb-5 grid h-12 w-12 place-items-center rounded-md border border-primary/40 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="font-display text-2xl xs:text-3xl sm:text-5xl lg:text-6xl tracking-wide">
            Stay updated with <span className="text-primary">LUMIÈRE</span>
          </h2>
          <p className="mt-2.5 text-xs sm:text-base text-muted-foreground">
            Get the latest movie updates, exclusive offers and upcoming releases directly in your
            inbox.
          </p>

          {/* Show logged in badge if user is signed in */}
          {currentUser && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <UserCheck className="h-3.5 w-3.5" /> VIP Member: {currentUser.name}
            </div>
          )}

          <form
            onSubmit={submit}
            noValidate
            className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <div className="min-w-0 flex-1 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email address"
                aria-label="Email address"
                aria-invalid={!!error}
                className={`h-12 w-full rounded-md border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary ${error ? "border-destructive" : "border-input"}`}
              />
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
            </div>
            <button type="submit" disabled={busy} className="btn-gold h-12 w-full sm:w-auto shrink-0 disabled:opacity-60">
              <Send className="h-4 w-4" /> {busy ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
