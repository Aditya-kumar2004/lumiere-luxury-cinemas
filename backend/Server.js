const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import database connection
const databaseConnection = require("./db");

// Import Routes
const authRoutes = require("./authRoutes");
const newsletterRoutes = require("./newsletterRoutes");
const bookingRoutes = require("./bookingRoutes");
const staffRoutes = require("./staffRoutes");
const adminRoutes = require("./adminRoutes");
const movieRoutes = require("./movieRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads directory for locally uploaded movie posters & banners
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Automatically create tables if they do not exist yet
async function setupTables() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await databaseConnection.query(schemaSql);
    console.log("✅ PostgreSQL tables (users, movies, showtimes, bookings, subscribers) are ready!");
  } catch (err) {
    console.error("❌ Error setting up tables:", err.message);
  }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/movies", movieRoutes);

// Basic test route
app.get("/", function (req, res) {
  res.send("Cinema Hall Booking Backend API is running!");
});

// Database health check route
app.get("/api/db-test", async function (req, res) {
  try {
    const result = await databaseConnection.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connection working!",
      currentTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async function () {
  console.log("Server is running on port " + PORT);
  // Auto-check tables on server start
  await setupTables();
});
