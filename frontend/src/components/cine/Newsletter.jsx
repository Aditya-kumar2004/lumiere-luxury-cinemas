import { useState } from "react";
import { Mail, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import Reveal from "./Reveal";
import { movieService } from "@/services/movieService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await movieService.subscribe(email.trim());
      toast.success("You're subscribed!", {
        description: "Watch your inbox for premieres and offers.",
      });
      setEmail("");
    } catch {
      toast.error("Couldn't subscribe right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Reveal as="section" className="container-cine py-20">
      <div className="relative overflow-hidden rounded-lg border border-primary/25 bg-card px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="absolute inset-x-0 -top-24 mx-auto h-60 w-[600px] max-w-full bg-glow-gold blur-2xl" />
        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-md border border-primary/40 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="font-display text-4xl tracking-wide sm:text-6xl">
            Stay updated with <span className="text-primary">LUMIÈRE</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Get the latest movie updates, exclusive offers and upcoming releases directly in your
            inbox.
          </p>
          <form
            onSubmit={submit}
            noValidate
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
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
            <button type="submit" disabled={busy} className="btn-gold h-12 disabled:opacity-60">
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
