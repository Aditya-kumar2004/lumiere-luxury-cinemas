const { Pool } = require("pg");
require("dotenv").config();

// Create database connection (Supports both Cloud DATABASE_URL like Neon/Supabase, and local PostgreSQL)
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      user: process.env.PG_USER || "postgres",
      host: process.env.PG_HOST || "localhost",
      database: process.env.PG_DATABASE || "lumiere_db",
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT || 5432,
    };

const databaseConnection = new Pool(connectionConfig);

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
