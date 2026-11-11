import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";
import Logo from "./Logo";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Now Showing", to: "/", hash: "now-showing" },
  { label: "Coming Soon", to: "/", hash: "coming-soon" },
  { label: "Cinemas", to: "/", hash: "cinemas" },
  { label: "Offers", to: "/", hash: "offers" },
];

const SUPPORT = [
  "Help Center",
  "Contact Us",
  "FAQs",
  "Terms and Conditions",
  "Privacy Policy",
];

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.99L4.6 22H1.34l8.02-9.17L1 2h7.02l4.84 6.4L18.244 2Zm-1.2 18h1.9L7.04 3.9H5.0L17.044 20Z" />
    </svg>
  );
}

const SOCIAL = [
  { label: "Instagram", icon: Instagram },
  { label: "Facebook", icon: Facebook },
  { label: "YouTube", icon: Youtube },
  { label: "X", icon: XIcon },
];

export default function Footer() {
  const head = "mb-5 text-xs font-bold tracking-[0.25em] text-primary";
  const link = "text-sm text-zinc-300 font-medium transition hover:text-white";

  return (
    <footer className="border-t border-white/15 bg-black text-white">
      <div className="container-cine grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          {/* Logo with bright white text over black background */}
          <Logo contrast="light" />

          <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-300">
            Ultra-luxury cinemas, immersive acoustic precision and effortless booking — LUMIÈRE
            brings the premier magic of the big screen to you.
          </p>

          <div className="mt-6 flex gap-2">
            {SOCIAL.map(function (item) {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  aria-label={item.label}
                  className="grid h-10 w-10 place-items-center rounded-md border border-white/20 bg-white/5 text-zinc-300 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <p className={head}>NAVIGATION</p>
          <ul className="space-y-3">
            {NAV.map(function (item) {
              return (
                <li key={item.label}>
                  <Link to={item.to} hash={item.hash} className={link}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className={head}>SUPPORT</p>
          <ul className="space-y-3">
            {SUPPORT.map(function (item) {
              return (
                <li key={item}>
                  <a href="#" className={link}>
                    {item}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className={head}>CONTACT</p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-2.5 items-center">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href="tel:+9118002008000" className="hover:text-white transition">
                +91 1800 200 8000
              </a>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href="mailto:concierge@lumierecinemas.com" className="hover:text-white transition">
                concierge@lumierecinemas.com
              </a>
            </li>
            <li className="flex gap-2.5 items-center">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>Bandra West, Mumbai</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-cine flex flex-col items-center justify-between gap-2 py-6 text-xs text-zinc-400 sm:flex-row">
          <p className="text-zinc-300">Copyright © 2026 LUMIÈRE CINEMAS. All rights reserved.</p>
          <p className="text-zinc-300">
            Made for movie lovers <span className="text-primary font-bold">★</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
