const fs = require("fs");
const path = require("path");
const databaseConnection = require("./db");

async function initializeDatabase() {
  try {
    console.log("🚀 Initializing LUMIÈRE Cinema database tables...");

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await databaseConnection.query(schemaSql);
    console.log("✅ Tables created: users, movies, showtimes, bookings");

    // Seed Movies if not already present
    const moviesCheck = await databaseConnection.query("SELECT COUNT(*) FROM movies");
    if (parseInt(moviesCheck.rows[0].count, 10) === 0) {
      console.log("🎬 Inserting blockbuster movies catalogue...");
      const insertMoviesSql = `
        INSERT INTO movies (id, title, synopsis, genre, duration, rating, status) VALUES
        ('avengers-endgame', 'AVENGERS: ENDGAME', 'After devastating cosmic events, the universe lies in ruins. The remaining Avengers assemble for the ultimate sacrifice.', 'Action', '3h 02m', 8.4, 'now-showing'),
        ('spider-man-no-way-home', 'SPIDER-MAN: NO WAY HOME', 'Peter Parker seeks Doctor Strange help after his identity is revealed, tearing open the multiverse.', 'Action', '2h 28m', 8.2, 'now-showing'),
        ('event-horizon-zero', 'EVENT HORIZON ZERO', 'An astronaut drifts toward a supermassive black hole carrying the only signal that can save humanity.', 'Sci-Fi', '2h 44m', 9.1, 'now-showing'),
        ('iron-dominion', 'IRON DOMINION', 'Cybernetic warlords clash in neo-tokyo as rogue synthetic operatives infiltrate the high citadel.', 'Action', '2h 21m', 8.4, 'now-showing'),
        ('lost-kingdom', 'LOST KINGDOM', 'Explorers penetrate deep into an uncharted subterranean world guarding ancient elemental relics.', 'Adventure', '2h 12m', 7.9, 'now-showing'),
        ('sky-pals', 'SKY PALS', 'A whimsical crew of flying animals embarks on a floating balloon race across skyward cloud castles.', 'Animation', '1h 58m', 8.2, 'now-showing')
        ON CONFLICT (id) DO NOTHING;
      `;
      await databaseConnection.query(insertMoviesSql);
      console.log("✅ Sample movies seeded successfully!");
    } else {
      console.log("ℹ️ Movies already exist in database, skipping seed.");
    }

    console.log("\n🎉 Database setup complete! You are ready to build API routes.");
  } catch (err) {
    console.error("❌ Database initialization error:", err.message);
  } finally {
    // End connection process
    process.exit(0);
  }
}

initializeDatabase();

