const { Pool } = require("pg");
require("dotenv").config();

// Create database connection
const databaseConnection = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "cinema_db",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
  // If using Neon or Supabase cloud, uncomment line below:
  // ssl: { rejectUnauthorized: false }
});

// Test connection on startup
databaseConnection.connect(function (err, client, release) {
  if (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
  } else {
    console.log("✅ Successfully connected to PostgreSQL database!");
    release();
  }
});

module.exports = databaseConnection;
