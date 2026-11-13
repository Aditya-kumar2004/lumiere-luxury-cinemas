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
    console.log("✅ Tables verified: users, movies, showtimes, bookings, subscribers");

    // Drop rigid foreign key constraint on bookings if it still exists
    await databaseConnection.query(
      "ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_movie_id_fkey;"
    );
    console.log("✅ Bookings table foreign key constraint safely removed");

    console.log("🎬 Seeding full movie catalogue with posters and backdrops...");
    const movies = [
      ["avengers-endgame", "AVENGERS: ENDGAME", "After devastating events of Infinity War, the remaining Avengers assemble once more.", "Action", "3h 02m", 8.4, "now-showing", "http://localhost:5000/uploads/avengers-endgame.jpg", "http://localhost:5000/uploads/avengers-endgame.jpg"],
      ["spider-man", "Spider-Man: No Way Home", "Peter Parker seeks Doctor Strange help, tearing open the multiverse.", "Action", "2h 28m", 8.2, "now-showing", "http://localhost:5000/uploads/spider-man.jpg", "http://localhost:5000/uploads/spider-man.jpg"],
      ["iron-dominion", "IRON DOMINION", "Cybernetic warlords clash in neo-tokyo as rogue operatives infiltrate the citadel.", "Action", "2h 21m", 8.4, "now-showing", "http://localhost:5000/uploads/iron-dominion.jpg", "http://localhost:5000/uploads/iron-dominion.jpg"],
      ["event-horizon-zero", "EVENT HORIZON ZERO", "An astronaut drifts toward a black hole carrying the signal that saves humanity.", "Sci-Fi", "2h 44m", 9.1, "now-showing", "http://localhost:5000/uploads/event-horizon.jpg", "http://localhost:5000/uploads/event-horizon.jpg"],
      ["lost-kingdom", "LOST KINGDOM", "Explorers penetrate deep into an uncharted subterranean world guarding ancient relics.", "Adventure", "2h 12m", 7.9, "now-showing", "http://localhost:5000/uploads/lost-kingdom.jpg", "http://localhost:5000/uploads/lost-kingdom.jpg"],
      ["the-hollow-house", "The Hollow House", "A family moves into a Victorian home where one window never goes dark.", "Horror", "1h 52m", 7.6, "now-showing", "http://localhost:5000/uploads/hollow-house.jpg", "http://localhost:5000/uploads/hollow-house.jpg"],
      ["road-tripped", "Road Tripped", "Three friends, one tiny car and zero plans on a chaotic trip.", "Comedy", "1h 46m", 7.4, "now-showing", "http://localhost:5000/uploads/road-tripped.jpg", "http://localhost:5000/uploads/road-tripped.jpg"],
      ["last-nocturne", "Last Nocturne", "A legendary pianist prepares one final concert while confronting the memories he composed to forget.", "Drama", "2h 05m", 8.8, "now-showing", "http://localhost:5000/uploads/last-nocturne.jpg", "http://localhost:5000/uploads/last-nocturne.jpg"],
      ["silent-witness", "Silent Witness", "A detective realises the only witness to a murder might be himself.", "Thriller", "2h 02m", 8.5, "now-showing", "http://localhost:5000/uploads/silent-witness.jpg", "http://localhost:5000/uploads/silent-witness.jpg"],
      ["the-deep", "The Deep", "A free diver forms an unlikely bond with a glowing humpback whale.", "Adventure", "1h 58m", 8.7, "now-showing", "http://localhost:5000/uploads/the-deep.jpg", "http://localhost:5000/uploads/the-deep.jpg"],
      ["midnight-heist", "Midnight Heist", "Four strangers, one impossible vault and a single night to pull off the greatest casino robbery.", "Action", "2h 09m", 8.0, "now-showing", "http://localhost:5000/uploads/midnight-heist.jpg", "http://localhost:5000/uploads/midnight-heist.jpg"],
      ["neon-protocol", "Neon Protocol", "When a city-sized mech wakes up without orders, one engineer must decide who it should obey.", "Sci-Fi", "2h 15m", 8.0, "coming-soon", "http://localhost:5000/uploads/neon-protocol.jpg", "http://localhost:5000/uploads/neon-protocol.jpg"],
      ["stormblade", "Stormblade", "A masterless samurai wields a blade forged from lightning to defend the castle.", "Action", "2h 10m", 8.1, "coming-soon", "http://localhost:5000/uploads/stormblade.jpg", "http://localhost:5000/uploads/stormblade.jpg"],
      ["crown-of-ash", "Crown of Ash", "A young queen rides against a dragon-backed empire to reclaim a kingdom.", "Adventure", "2h 20m", 8.3, "coming-soon", "http://localhost:5000/uploads/crown-of-ash.jpg", "http://localhost:5000/uploads/crown-of-ash.jpg"],
      ["ghost-signal", "Ghost Signal", "An arctic radio station receives a broadcast from a team that vanished 40 years ago.", "Horror", "1h 45m", 7.8, "coming-soon", "http://localhost:5000/uploads/ghost-signal.jpg", "http://localhost:5000/uploads/ghost-signal.jpg"],
      ["summer-of-us", "Summer of Us", "Two strangers share one golden summer on the Mediterranean coast.", "Drama", "1h 55m", 7.9, "coming-soon", "http://localhost:5000/uploads/summer-of-us.jpg", "http://localhost:5000/uploads/summer-of-us.jpg"]
    ];

    for (const m of movies) {
      await databaseConnection.query(
        `INSERT INTO movies (id, title, synopsis, genre, duration, rating, status, poster_url, banner_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           poster_url = COALESCE(movies.poster_url, EXCLUDED.poster_url),
           banner_url = COALESCE(movies.banner_url, EXCLUDED.banner_url)`,
        m
      );
    }

    // Ensure adityakuma876@gmail.com has admin role
    await databaseConnection.query(
      "UPDATE users SET role = 'admin' WHERE LOWER(email) = 'adityakuma876@gmail.com'"
    );
    console.log("✅ Admin role granted to adityakuma876@gmail.com");

    console.log(`✅ All ${movies.length} movies seeded into database!`);
    console.log("\n🎉 Database setup complete! You are ready to book any movie without foreign key errors.");
  } catch (err) {
    console.error("❌ Database initialization error:", err.message);
  } finally {
    process.exit(0);
  }
}

initializeDatabase();
