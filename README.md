<div align="center">

  <h1>🏛️ LUMIÈRE — PREMIER LUXURY CINEMAS</h1>
  <p><b>Enterprise Full-Stack Cinema Ticket Booking, Real-Time QR Gatekeeper & Administration Engine</b></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
    <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/License-MIT-d9a441?style=for-the-badge" alt="License" />
  </p>

  <p>
    <a href="#-project-overview">Project Overview</a> •
    <a href="#-role-based-features">Role Architecture</a> •
    <a href="#-technical-highlights">Key Highlights</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-database-schema">Database Schema</a> •
    <a href="#-api-reference">API Endpoints</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-author">Author</a>
  </p>

</div>

<hr />

## 🌟 Project Overview

**LUMIÈRE** is a production-ready, full-stack luxury cinema reservation and theater management platform. Designed with an ultra-premium obsidian-black, Cinema Crimson Red, and Emerald Green aesthetic (*Cinzel* Roman serif & *Plus Jakarta Sans* typography), it delivers a seamless end-to-end experience for moviegoers, gatekeeper cinema staff, and system administrators.

From interactive SVG/2D seat selection and instant PDF pass generation with cryptographic QR codes to real-time gate admission scanning and automated audit logging, LUMIÈRE demonstrates enterprise-grade software architecture, secure database transactions, and scalable frontend engineering.

<hr />

## 🎭 Role-Based Architecture & Capabilities

<table>
  <thead>
    <tr>
      <th width="33%" align="center">🎟️ Customer Portal</th>
      <th width="33%" align="center">🛡️ Staff Gatekeeper Portal</th>
      <th width="33%" align="center">👑 Admin Control Center</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">
        <ul>
          <li><b>Dynamic Hero Showcase</b>: Curated IMAX, VIP Lounge, and Dolby Atmos featured releases.</li>
          <li><b>Smart Search & Filtering</b>: Instant title, genre, language, status, and sorting filters.</li>
          <li><b>Interactive 2D Seat Map</b>: Real-time row tiering (Royale VIP, Prime Balcony, Classic Lounges).</li>
          <li><b>Gourmet Add-ons</b>: Confectionery & beverage selection (Artisanal Popcorn, Nachos, Cold Brew).</li>
          <li><b>Automated Digital Pass</b>: Instant downloadable PDF ticket with high-density QR code.</li>
          <li><b>Email Confirmation</b>: Automated transactional HTML receipts dispatched via Nodemailer SMTP.</li>
          <li><b>My Bookings Hub</b>: Live ticket passbook with real-time admission status tracking.</li>
        </ul>
      </td>
      <td valign="top">
        <ul>
          <li><b>Live Optical QR Scanner</b>: Direct camera feed scanning for high-throughput guest admission.</li>
          <li><b>File Upload Scanning</b>: Drag-and-drop digital ticket image/PDF QR decoding.</li>
          <li><b>Manual Ticket Lookup</b>: Instant fallback search by 8-character booking reference code.</li>
          <li><b>Admittance Verification</b>: Prevents double-entry with instant timestamped check-in flags.</li>
          <li><b>Live Hall Occupancy</b>: Real-time visual tracking of admitted vs. pending guests per screen.</li>
        </ul>
      </td>
      <td valign="top">
        <ul>
          <li><b>Complete Movie CRUD</b>: Create, update, or remove movies with multipart image uploads.</li>
          <li><b>Disk Garbage Collection</b>: Deleting a movie safely purges records and deletes poster/banner files from disk.</li>
          <li><b>User & Staff RBAC</b>: Search users, assign staff gatekeeper privileges, or grant admin roles.</li>
          <li><b>Box Office Analytics</b>: Financial summaries, gross revenue, occupancy rates, and date filtering.</li>
          <li><b>Audit & Deletion History</b>: Comprehensive activity ledger tracking administrator actions with signatures.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<hr />

## 🚀 Technical Highlights & Engineering Decisions

* **⚡ Modern React 19 & TanStack Router**: Type-safe client-side routing, route loaders, and SSR-ready code splitting for lightning-fast page transitions without full-page reloads.
* **🎨 Custom Luxury Design System**: Engineered with Tailwind CSS v4, featuring glassmorphism surfaces (`backdrop-blur`), vibrant Crimson & Emerald glowing accents, and responsive typography (*Cinzel* Roman display serif + *Plus Jakarta Sans* UI body).
* **🪑 Dynamic Seat Collision & Matrix Engine**: Responsive 2D grid that renders reserved, available, and selected states dynamically, enforcing multi-seat reservation limits and tier-based pricing.
* **📷 Integrated QR Code Ecosystem**: Dual-sided QR implementation — generated client-side upon reservation confirmation, and parsed via staff webcams using high-performance optical decoding algorithms.
* **📧 Automated Transactional Email Dispatcher**: Integrated Nodemailer engine delivering custom-styled HTML luxury boarding passes straight to customer inboxes upon booking confirmation.
* **🧹 Resilient Resource Teardown**: Built-in physical storage cleanup (`fs.unlinkSync`) preventing orphaned image assets whenever catalog items are permanently purged.
* **🛡️ Security Hardened**: Parameterized PostgreSQL queries preventing SQL injection, strict CORS policies, structured API error boundaries, and environment-isolated credentials.

<hr />

## 💻 Tech Stack

<table width="100%">
  <tr>
    <td width="20%"><b>Frontend Core</b></td>
    <td>React 19, TanStack Router, TanStack Start, TanStack Query, Vite 8</td>
  </tr>
  <tr>
    <td><b>Styling & Icons</b></td>
    <td>Tailwind CSS v4, Lucide React, TW Animate CSS, Sonner Toasts, Canvas Confetti</td>
  </tr>
  <tr>
    <td><b>Typography</b></td>
    <td>Google Fonts (Cinzel Display Serif & Plus Jakarta Sans UI)</td>
  </tr>
  <tr>
    <td><b>Backend Runtime</b></td>
    <td>Node.js (LTS), Express 5, CORS, Dotenv</td>
  </tr>
  <tr>
    <td><b>Database</b></td>
    <td>PostgreSQL 16+ with Node `pg` Connection Pooling</td>
  </tr>
  <tr>
    <td><b>Email & Documents</b></td>
    <td>Nodemailer (Gmail SMTP Engine), PDFKit, QRCode, jsPDF</td>
  </tr>
  <tr>
    <td><b>Quality & Testing</b></td>
    <td>ESLint 9 (Flat Config), Prettier, Vitest, Testing Library</td>
  </tr>
</table>

<hr />

## 🗄️ Database Schema Architecture

The relational database is orchestrated in **PostgreSQL** with foreign key constraints, cascading deletes, and strict typing:

```sql
-- 1. USERS & RBAC TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(60),
    dob DATE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' | 'staff' | 'admin'
    otp VARCHAR(10),
    otp_expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MOVIE CATALOG TABLE
CREATE TABLE movies (
    id VARCHAR(60) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    synopsis TEXT,
    genre VARCHAR(100),
    duration VARCHAR(30),
    rating NUMERIC(3, 1),
    status VARCHAR(30) DEFAULT 'now-showing',
    poster_url TEXT,
    banner_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. THEATER SHOWTIMES TABLE
CREATE TABLE showtimes (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(60) REFERENCES movies(id) ON DELETE CASCADE,
    cinema_name VARCHAR(120) NOT NULL,
    city VARCHAR(60) NOT NULL,
    screen_type VARCHAR(60) NOT NULL,
    show_date DATE NOT NULL,
    show_time VARCHAR(20) NOT NULL,
    price_standard NUMERIC(8, 2) DEFAULT 250.00,
    price_prime NUMERIC(8, 2) DEFAULT 400.00,
    price_vip NUMERIC(8, 2) DEFAULT 750.00
);

-- 4. RESERVATIONS & BOOKINGS TABLE
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    user_email VARCHAR(180) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    user_phone VARCHAR(20),
    movie_id VARCHAR(60),
    movie_title VARCHAR(200) NOT NULL,
    cinema_name VARCHAR(120) NOT NULL,
    city VARCHAR(60) NOT NULL,
    screen_type VARCHAR(60) NOT NULL,
    show_date DATE NOT NULL,
    show_time VARCHAR(20) NOT NULL,
    seats TEXT[] NOT NULL,
    total_amount NUMERIC(8, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'CONFIRMED',
    is_admitted BOOLEAN DEFAULT FALSE,
    admitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ADMINISTRATIVE AUDIT & ACTIVITY LOGS
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    movie_id VARCHAR(100),
    movie_title VARCHAR(200) NOT NULL,
    details TEXT,
    poster_deleted BOOLEAN DEFAULT FALSE,
    performed_by VARCHAR(180) NOT NULL,
    performed_by_name VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(180) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

<hr />

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account with email validation.
* `POST /api/auth/login` — Authenticate user and return session profile with role.
* `POST /api/auth/send-otp` — Generate and email an 8-digit verification code.
* `POST /api/auth/verify-otp` — Verify customer account status.

### 🎬 Movies Catalog (`/api/movies`)
* `GET /api/movies` — Fetch all movies with optional status (`now-showing`, `coming-soon`) or genre filters.
* `GET /api/movies/:id` — Retrieve comprehensive movie details, synopsis, and showtimes.

### 🎟️ Bookings & Passes (`/api/bookings`)
* `POST /api/bookings` — Reserve seats, generate unique booking reference, and dispatch email ticket.
* `GET /api/bookings/my?email=...` — Retrieve reservation history for authenticated customer.
* `GET /api/bookings/ticket/:code` — Retrieve public pass details for QR scanner verification.
* `GET /api/bookings/download/:code` — Stream server-rendered PDF ticket pass.

### 🛡️ Staff Gatekeeper (`/api/staff`)
* `POST /api/staff/admit` — Scan QR code or verify booking code and admit ticket holder.
* `GET /api/staff/occupancy/:showtimeId` — Real-time screen occupancy counter.

### 👑 Admin Management (`/api/admin`)
* `GET /api/admin/metrics` — Aggregate catalog size, total users, bookings count, and box office revenue.
* `POST /api/admin/movies` — Add new movie with multipart poster/banner file uploads.
* `PUT /api/admin/movies/:id` — Update existing movie title, rating, showtimes, or metadata.
* `DELETE /api/admin/movies/:id` — Purge movie from database and delete physical uploaded image files from disk.
* `GET /api/admin/users` — Browse user directory and modify permissions.
* `PUT /api/admin/users/:id/role` — Update role (`user` ↔ `staff` ↔ `admin`).
* `GET /api/admin/logs` — Fetch administrative audit log history with filter support.
* `DELETE /api/admin/logs` — Clear historical audit records.

<hr />

## 📁 Repository Directory Structure

```text
CINEMA HALL BOOKING/
├── backend/
│   ├── uploads/            # Locally stored poster and backdrop uploads
│   ├── adminRoutes.js      # Admin CRUD, disk image cleanup & audit logging
│   ├── authRoutes.js       # User registration, login, OTP dispatch
│   ├── bookingRoutes.js    # Seat reservation, PDF engine & ticket generation
│   ├── movieRoutes.js      # Public catalog APIs & filtering
│   ├── staffRoutes.js      # Gate admission & QR validation endpoints
│   ├── newsletterRoutes.js # Subscriber management
│   ├── db.js               # PostgreSQL connection pool configuration
│   ├── schema.sql          # Complete DDL database schema definitions
│   ├── emailService.js     # Nodemailer transactional email templates
│   └── Server.js           # Express application initialization & middleware
│
├── frontend/
│   ├── public/             # Static icons, favicons, and manifest files
│   └── src/
│       ├── assets/         # High-resolution backdrops, hall previews & posters
│       ├── components/
│       │   ├── cine/       # Cinema UI components (Hero, Navbar, SeatMap, Scanner)
│       │   ├── pages/      # Route view controllers (HomePage, Booking, Admin, Staff)
│       │   └── ui/         # Base design primitives (Buttons, Dialogs, Sonner)
│       ├── data/           # Default mock catalogs, cities, coupons & formats
│       ├── hooks/          # React custom hooks (useMovies, useTheme, useAuth)
│       ├── routes/         # TanStack file-based routes (__root, index, admin, staff)
│       ├── services/       # Frontend API communication adapters
│       └── styles.css      # Tailwind v4 configuration with custom utilities
│
└── README.md               # Complete system documentation
```

<hr />

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: v14.0 or higher
* **Git**: Installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/Aditya-kumar2004/lumiere-luxury-cinemas.git
cd "CINEMA HALL BOOKING"
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lumiere_db
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm run dev
# Server will initialize PostgreSQL tables and start on http://localhost:5000
```

### 3. Configure Frontend
Open a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

The frontend application will boot on **`http://localhost:8080`**.

---

### 🧪 Verification & Quality Commands

```bash
# Frontend Code Quality & Linting
cd frontend
npm run lint         # 0 errors, 0 warnings

# Frontend Unit & Routing Tests
npm test             # 100% test pass rate

# Production Build
npm run build        # Generates optimized output bundles
```

<hr />

## 👤 Author

* **Developer**: **Aditya Kumar**
* **Project**: LUMIÈRE — Premier Luxury Cinemas
* **GitHub**: [@Aditya-kumar2004](https://github.com/Aditya-kumar2004)
* **Repository**: [lumiere-luxury-cinemas](https://github.com/Aditya-kumar2004/lumiere-luxury-cinemas)

<div align="center">
  <sub>Built with passion for high-performance web architecture and cinematic luxury design.</sub>
</div>

