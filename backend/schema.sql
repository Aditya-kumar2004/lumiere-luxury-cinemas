-- LUMIÈRE CINEMAS DATABASE SCHEMA

-- 1. USERS TABLE (Matches Frontend Registration Form + 8-Digit OTP Verification)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(60),
    dob DATE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    otp VARCHAR(10),
    otp_expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist if table was already created
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. MOVIES TABLE
CREATE TABLE IF NOT EXISTS movies (
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

-- 3. SHOWTIMES TABLE
CREATE TABLE IF NOT EXISTS showtimes (
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

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure foreign key constraint is removed so bookings never fail due to movie id variations
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_movie_id_fkey;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_admitted BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admitted_at TIMESTAMP;

-- 5. NEWSLETTER SUBSCRIBERS TABLE (Only registered/authenticated users can subscribe)
CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(180) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ADMIN ACTIVITY LOGS TABLE (Movie Deletion & Catalog History)
CREATE TABLE IF NOT EXISTS admin_logs (
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

