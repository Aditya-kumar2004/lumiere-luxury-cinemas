# LUMIÈRE — Premier Luxury Cinemas & Ticket Booking

> An ultra-modern, high-performance luxury cinema booking platform built with **React 19**, **TanStack Start (SSR)**, and **Tailwind CSS**. Experience blockbuster movies across IMAX® Laser, Dolby Atmos® 360, and Royale VIP Recliner Suites.

---

## 🌟 Features Built So Far

### 1. 🎬 Cinematic Hero Showcase
- **8K Multi-Slide Carousel**: Auto-advancing visual showcases featuring *IMAX® Laser Dome*, *Royale VIP Recliner Suites*, and *Dolby Atmos® 360 Panoramic Theatre*.
- **Interactive Trailer Modal**: Watch high-definition movie trailers on demand.
- **Dynamic Contrast Header**: Flawless brand legibility with ambient top-vignette over dark stage photos.

### 2. 🍿 Movie Catalogue & Smart Filters
- **Live Search & Filtering**: Real-time search by movie title and instant filtering across 8+ genres (Action, Sci-Fi, Adventure, Comedy, Drama, Thriller, Animation, Horror).
- **Status Tabs**: Seamless switching between **Now Showing** and **Coming Soon** releases with live movie counts.
- **Rich Movie Cards**: Hover animations, IMDb ratings, age classification tags, duration, and direct booking shortcuts.

### 3. 💺 Interactive Seat Selection & Booking Engine
- **Visual Auditorium Map**: Interactive seat selection with categorized seating tiers (Standard, Prime, VIP Recliner).
- **Showtime & Cinema Selection**: Choose preferred cinema locations across major cities (Mumbai, Delhi NCR, Bengaluru, etc.) and convenient showtimes.
- **Dynamic Price Calculation**: Real-time breakdown of ticket totals, seat numbers, convenience fees, and instant checkout.

### 4. 🔐 1-Page Split Auth (`/login` & `/register`)
- **Left Half (8K Movie Carousel)**: Visual slider cycling through iconic movies (*Avengers: Endgame*, *Spider-Man: No Way Home*, *Royale VIP*, *The Astral Frontier*) with memorable quotes, IMDb ratings, and format tags.
- **Right Half (Form)**:
  - **Login**: Fast email & password authentication with "Remember Me" and password recovery prompts.
  - **Register**: Comprehensive registration collecting Full Name, 10-digit Mobile Number, Email, City dropdown, Date of Birth (for birthday VIP privileges), Password, Confirm Password, and Terms agreement.
  - **100vh Single-Page Layout**: Strictly contained in one desktop viewport without vertical scroll bars.

### 5. 🏛️ The Cinema Experience Showcase
- Dedicated showcase of LUMIÈRE premium standards:
  - `01` **Premium Screens** (4K Laser Projection)
  - `02` **Dolby Atmos Sound** (128-Channel 360° Audio)
  - `03` **Luxury Seating** (Full Motorized Recline)
  - `04` **Delicious Food** (In-Seat Gourmet Dining Service)
- Set over a high-resolution, warm golden Royale VIP auditorium background with floating dark-glass cards.

### 6. 🌓 True OLED Black & Light Themes
- **Pure Black Dark Mode**: Uses true `#000000` with subtle `#0a0a0a` surfaces and `#d9a441` cinematic gold accents.
- **Crisp Light Mode**: High-contrast, clean modern aesthetic with smooth transitions and persistent theme state.

### 7. ⚡ 100% Plain JavaScript Architecture
- Written entirely in standard JavaScript and JSX (`.js` and `.jsx`) with basic, maintainable syntax and zero TypeScript compile overhead.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack SSR with Vite & Nitro)
- **Routing**: [TanStack Router](https://tanstack.com/router) (File-based, type-safe routing)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Testing**: [Vitest](https://vitest.dev/) + React Testing Library

---

## 📁 Project Structure

```text
CINE HALL/
├── src/
│   ├── assets/              # 8K banners, hero backgrounds, movie posters
│   ├── components/
│   │   ├── cine/            # Cinema UI components (Navbar, Hero, AuthForm, CinemaExperience, Footer...)
│   │   └── pages/           # Page components (HomePage, MoviesPage, BookingPage...)
│   ├── data/                # Movie catalogues, showtimes, seats, cities
│   ├── hooks/               # Custom hooks (useTheme, useMovies)
│   ├── routes/              # TanStack file-based routes (index, movies, book, login, register)
│   ├── styles.css           # Tailwind CSS v4 variables & theme palette
│   └── test/                # Unit & routing tests
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm (or pnpm / yarn)

### Installation & Run

```bash
# 1. Clone your repository
git clone https://github.com/Aditya-kumar2004/lumiere-cinemas.git
cd lumiere-cinemas

# 2. Install dependencies
npm install

# 3. Start development server (runs at http://localhost:8080)
npm run dev

# 4. Run tests
npm test

# 5. Build for production
npm run build
```

---

## 🔮 Upcoming Roadmap

- [ ] Connect live backend API endpoints (`/api/auth`, `/api/movies`, `/api/bookings`)
- [ ] Real-time seat reservation locking via WebSockets
- [ ] Payment gateway integration (Stripe / Razorpay)
- [ ] User profile dashboard with booking history & downloadable QR e-tickets

---

## 📄 License

MIT License — Feel free to use and customize for your own cinema and entertainment projects.
