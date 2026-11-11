const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database connection
const databaseConnection = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.listen(PORT, function () {
  console.log("Server is running on port " + PORT);
});
