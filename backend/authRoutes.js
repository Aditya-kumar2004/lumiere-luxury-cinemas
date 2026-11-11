const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const databaseConnection = require("./db");
const { generate8DigitOtp, sendOtpEmail } = require("./emailService");
const verifyToken = require("./authMiddleware");

// Simple function to hash password
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Simple function to generate JWT Token
function createJwtToken(user) {
  const secret = process.env.JWT_SECRET || "lumiere_secret_key_jwt_2026";
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: "7d" } // Token expires in 7 days
  );
}

// 1. REGISTER: Create account and send 8-digit OTP
router.post("/register", async function (req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const city = req.body.city;
    const dob = req.body.dob;
    const password = req.body.password;

    // Validate inputs
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Please enter your full name." });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is already verified
    const checkUser = await databaseConnection.query(
      "SELECT id, is_verified FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (checkUser.rows.length > 0 && checkUser.rows[0].is_verified) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please login instead.",
      });
    }

    // Generate 8-digit OTP and 10-minute expiry
    const otp = generate8DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = hashPassword(password);

    if (checkUser.rows.length > 0) {
      // User registered before but did not verify OTP -> update OTP
      await databaseConnection.query(
        "UPDATE users SET name = $1, phone = $2, city = $3, dob = $4, password = $5, otp = $6, otp_expires_at = $7 WHERE LOWER(email) = $8",
        [name.trim(), phone || "", city || "Mumbai", dob || null, hashedPassword, otp, expiresAt, cleanEmail]
      );
    } else {
      // New user registration
      await databaseConnection.query(
        "INSERT INTO users (name, email, phone, city, dob, password, otp, otp_expires_at, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)",
        [name.trim(), cleanEmail, phone || "", city || "Mumbai", dob || null, hashedPassword, otp, expiresAt]
      );
    }

    // Send the luxury 8-digit OTP email
    await sendOtpEmail(cleanEmail, name.trim(), otp);

    return res.status(201).json({
      success: true,
      message: "An 8-digit verification code has been sent to your email.",
      email: cleanEmail,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// 2. VERIFY OTP: Enter 8-digit code to activate account and receive JWT
router.post("/verify-otp", async function (req, res) {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and 8-digit code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const result = await databaseConnection.query(
      "SELECT id, name, email, city, role, otp, otp_expires_at FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No registration found for this email." });
    }

    const user = result.rows[0];

    // Check if code matches
    if (user.otp !== cleanOtp) {
      return res.status(400).json({ success: false, message: "Invalid 8-digit code. Please check your email." });
    }

    // Check if code expired
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: "Verification code expired. Please click Resend Code." });
    }

    // Activate the account
    await databaseConnection.query(
      "UPDATE users SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE id = $1",
      [user.id]
    );

    // Create JWT Token
    const token = createJwtToken(user);

    return res.json({
      success: true,
      message: "Account verified successfully! Welcome to LUMIÈRE Cinemas.",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error during OTP verification." });
  }
});

// 3. RESEND OTP: Send a fresh 8-digit code
router.post("/resend-otp", async function (req, res) {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await databaseConnection.query(
      "SELECT id, name FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No account found with this email." });
    }

    const user = result.rows[0];
    const newOtp = generate8DigitOtp();
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await databaseConnection.query(
      "UPDATE users SET otp = $1, otp_expires_at = $2 WHERE id = $3",
      [newOtp, newExpiresAt, user.id]
    );

    await sendOtpEmail(cleanEmail, user.name, newOtp);

    return res.json({
      success: true,
      message: "A new 8-digit verification code has been sent to your email.",
    });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error resending code." });
  }
});

// 4. LOGIN: Verify email and password, then return JWT token
router.post("/login", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter your email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    const result = await databaseConnection.query(
      "SELECT id, name, email, city, role, is_verified, password FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    // 1. Check if user exists
    if (result.rows.length === 0) {
      console.log("❌ Login failed: User not found for email:", cleanEmail);
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please register first.",
      });
    }

    const user = result.rows[0];

    // 2. Check if password matches
    if (user.password !== hashedPassword) {
      console.log("❌ Login failed: Incorrect password for email:", cleanEmail);
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please check your password and try again.",
      });
    }

    // 3. Check if account is verified
    if (!user.is_verified) {
      console.log("⚠️ Login requires verification for email:", cleanEmail);
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Please verify your account with the 8-digit code first.",
        email: user.email,
      });
    }

    // Create JWT Token
    const token = createJwtToken(user);
    console.log("✅ User logged in successfully:", user.email);

    return res.json({
      success: true,
      message: "Welcome back to LUMIÈRE Cinemas!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// 5. CURRENT USER (PROTECTED BY JWT): Verify token and return user profile
router.get("/me", verifyToken, async function (req, res) {
  try {
    const result = await databaseConnection.query(
      "SELECT id, name, email, phone, city, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// 6. DEVELOPMENT HELPER: Check registered users
router.get("/users-list", async function (req, res) {
  try {
    const result = await databaseConnection.query(
      "SELECT id, name, email, phone, city, is_verified, created_at FROM users ORDER BY id DESC"
    );
    return res.json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
