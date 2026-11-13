const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const databaseConnection = require("./db");
const verifyToken = require("./authMiddleware");

// Helper to save Base64 image payload as a physical file on the server
function processImagePayload(imageStr, prefix = "poster") {
  if (!imageStr || typeof imageStr !== "string") return null;
  const trimmed = imageStr.trim();
  if (!trimmed) return null;

  // If already an HTTP/HTTPS URL, return as is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If Base64 data URL
  const matches = trimmed.match(/^data:image\/([A-Za-z0-9-+]+);base64,(.+)$/);
  if (matches) {
    let extension = matches[1].toLowerCase();
    if (extension === "jpeg") extension = "jpg";
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) extension = "jpg";
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${prefix}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `http://localhost:5000/uploads/${filename}`;
  }

  return trimmed;
}

// Helper to safely delete an uploaded file from backend/uploads/
function deleteLocalFileFromUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") return null;
  try {
    const trimmed = fileUrl.trim();
    // match /uploads/<filename> or just filename
    const match = trimmed.match(/\/uploads\/([^/?#]+)/i);
    let filename = match ? match[1] : null;
    if (!filename && (trimmed.startsWith("poster-") || trimmed.startsWith("banner-"))) {
      filename = path.basename(trimmed);
    }
    if (filename) {
      // Security sanitize: prevent directory traversal
      const safeFilename = path.basename(filename);
      const filePath = path.join(__dirname, "uploads", safeFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted local image file from server: ${safeFilename}`);
        return safeFilename;
      }
    }
  } catch (err) {
    console.warn(`Failed to delete local file for ${fileUrl}:`, err.message);
  }
  return null;
}

// Middleware to verify Admin role only
function requireAdmin(req, res, next) {
  const role = req.user?.role?.toLowerCase();
  if (role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied: Master Administrator privileges required.",
  });
}

// 1. GET ADMIN OVERVIEW KPIS
router.get("/overview", verifyToken, requireAdmin, async function (req, res) {
  try {
    // Total users breakdown
    const usersResult = await databaseConnection.query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(CASE WHEN LOWER(role) = 'admin' THEN 1 END) AS total_admins,
        COUNT(CASE WHEN LOWER(role) = 'staff' THEN 1 END) AS total_staff,
        COUNT(CASE WHEN LOWER(role) NOT IN ('admin', 'staff') OR role IS NULL THEN 1 END) AS total_customers
      FROM users
    `);

    // Total bookings & revenue
    const bookingsResult = await databaseConnection.query(`
      SELECT 
        COUNT(*) AS total_bookings,
        COUNT(CASE WHEN payment_status = 'CONFIRMED' THEN 1 END) AS confirmed_bookings,
        COUNT(CASE WHEN payment_status = 'CANCELLED' THEN 1 END) AS cancelled_bookings,
        COALESCE(SUM(CASE WHEN payment_status = 'CONFIRMED' THEN total_amount ELSE 0 END), 0) AS total_revenue
      FROM bookings
    `);

    // Total movies in catalogue
    const moviesResult = await databaseConnection.query(`
      SELECT COUNT(*) AS total_movies FROM movies
    `);

    const userStats = usersResult.rows[0];
    const bookingStats = bookingsResult.rows[0];
    const movieStats = moviesResult.rows[0];

    return res.json({
      success: true,
      stats: {
        totalUsers: Number(userStats.total_users || 0),
        totalAdmins: Number(userStats.total_admins || 0),
        totalStaff: Number(userStats.total_staff || 0),
        totalCustomers: Number(userStats.total_customers || 0),
        totalBookings: Number(bookingStats.total_bookings || 0),
        confirmedBookings: Number(bookingStats.confirmed_bookings || 0),
        cancelledBookings: Number(bookingStats.cancelled_bookings || 0),
        totalRevenue: Number(bookingStats.total_revenue || 0),
        totalMovies: Number(movieStats.total_movies || 0),
      },
    });
  } catch (err) {
    console.error("Admin Overview Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching admin overview." });
  }
});

// 2. GET ALL USERS (With booking counts, total spent, search & role filters)
router.get("/users", verifyToken, requireAdmin, async function (req, res) {
  try {
    const { search = "", role = "ALL" } = req.query;

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.city, 
        u.dob, 
        COALESCE(u.role, 'customer') AS role, 
        u.is_verified, 
        u.created_at,
        COUNT(b.id) AS bookings_count,
        COALESCE(SUM(CASE WHEN b.payment_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS total_spent
      FROM users u
      LEFT JOIN bookings b ON LOWER(u.email) = LOWER(b.user_email)
      WHERE 1=1
    `;

    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const idx = params.length;
      query += ` AND (LOWER(u.name) LIKE $${idx} OR LOWER(u.email) LIKE $${idx} OR LOWER(COALESCE(u.phone, '')) LIKE $${idx})`;
    }

    if (role !== "ALL" && role.trim()) {
      params.push(role.trim().toLowerCase());
      const idx = params.length;
      if (role.toLowerCase() === "customer") {
        query += ` AND (LOWER(u.role) = $${idx} OR LOWER(u.role) = 'user' OR u.role IS NULL)`;
      } else {
        query += ` AND LOWER(u.role) = $${idx}`;
      }
    }

    query += `
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const result = await databaseConnection.query(query, params);

    return res.json({
      success: true,
      count: result.rows.length,
      users: result.rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        city: u.city,
        dob: u.dob,
        role: (u.role === "user" || !u.role) ? "customer" : u.role.toLowerCase(),
        isVerified: u.is_verified,
        createdAt: u.created_at,
        bookingsCount: Number(u.bookings_count || 0),
        totalSpent: Number(u.total_spent || 0),
      })),
    });
  } catch (err) {
    console.error("Admin Users List Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching user list." });
  }
});

// 3. METHOD 4: UPDATE USER ROLE (Promote to Staff / Demote / Make Admin)
router.put("/users/:id/role", verifyToken, requireAdmin, async function (req, res) {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    const normalizedRole = role?.toLowerCase()?.trim();
    if (!["customer", "staff", "admin", "user"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'customer', 'staff', or 'admin'.",
      });
    }

    // Check if target user exists
    const userCheck = await databaseConnection.query(
      `SELECT id, name, email, role FROM users WHERE id = $1`,
      [targetUserId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const targetUser = userCheck.rows[0];

    // Prevent Admin from accidentally removing their own Admin role if they are the only admin
    if (Number(req.user.id) === Number(targetUserId) && normalizedRole !== "admin") {
      const adminCountRes = await databaseConnection.query(
        `SELECT COUNT(*) AS admin_count FROM users WHERE LOWER(role) = 'admin'`
      );
      if (Number(adminCountRes.rows[0].admin_count) <= 1) {
        return res.status(400).json({
          success: false,
          message: "Action blocked: You cannot demote yourself as the only remaining Administrator.",
        });
      }
    }

    const finalRole = normalizedRole === "user" ? "customer" : normalizedRole;

    const updateResult = await databaseConnection.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [finalRole, targetUserId]
    );

    const updatedUser = updateResult.rows[0];

    return res.json({
      success: true,
      message: `Role for ${updatedUser.name} (${updatedUser.email}) updated to ${finalRole.toUpperCase()}.`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update User Role Error:", err);
    return res.status(500).json({ success: false, message: "Server error updating user role." });
  }
});

// 4. GET ALL MOVIES (Admin view with booking metrics & revenue)
router.get("/movies", verifyToken, requireAdmin, async function (req, res) {
  try {
    const { search = "", status = "ALL" } = req.query;

    let query = `
      SELECT 
        m.id,
        m.title,
        m.synopsis,
        m.genre,
        m.duration,
        m.rating,
        m.status,
        m.poster_url,
        m.banner_url,
        m.created_at,
        COUNT(b.id) AS bookings_count,
        COALESCE(SUM(CASE WHEN b.payment_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS total_revenue
      FROM movies m
      LEFT JOIN bookings b ON (m.id = b.movie_id OR LOWER(m.title) = LOWER(b.movie_title))
      WHERE 1=1
    `;

    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const idx = params.length;
      query += ` AND (LOWER(m.title) LIKE $${idx} OR LOWER(COALESCE(m.genre, '')) LIKE $${idx} OR LOWER(COALESCE(m.synopsis, '')) LIKE $${idx})`;
    }

    if (status !== "ALL" && status.trim()) {
      const normalizedStatus = (status === "soon" || status === "coming-soon") ? "coming-soon" : "now-showing";
      params.push(normalizedStatus);
      const idx = params.length;
      query += ` AND m.status = $${idx}`;
    }

    query += `
      GROUP BY m.id
      ORDER BY m.created_at DESC, m.id ASC
    `;

    const result = await databaseConnection.query(query, params);

    return res.json({
      success: true,
      count: result.rows.length,
      movies: result.rows.map((m) => ({
        id: m.id,
        title: m.title,
        synopsis: m.synopsis || "",
        genre: m.genre || "Action",
        duration: m.duration || "2h 00m",
        rating: Number(m.rating || 8.0),
        status: m.status || "now-showing",
        posterUrl: m.poster_url,
        bannerUrl: m.banner_url,
        createdAt: m.created_at,
        bookingsCount: Number(m.bookings_count || 0),
        totalRevenue: Number(m.total_revenue || 0),
      })),
    });
  } catch (err) {
    console.error("Admin Movies List Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching movies list." });
  }
});

// 5. CREATE NEW MOVIE (Admin CRUD: Add Movie)
router.post("/movies", verifyToken, requireAdmin, async function (req, res) {
  try {
    const {
      title,
      synopsis = "",
      genre = "Action",
      duration = "2h 15m",
      rating = 8.0,
      status = "now-showing",
      poster_url = null,
      banner_url = null,
      id: customId,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Movie title is required.",
      });
    }

    // Generate clean slug ID from title
    let slugId = customId?.trim()?.toLowerCase() ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!slugId) {
      slugId = `movie-${Date.now().toString(36)}`;
    }

    // Ensure slug uniqueness
    const existingCheck = await databaseConnection.query(
      `SELECT id FROM movies WHERE id = $1`,
      [slugId]
    );

    if (existingCheck.rows.length > 0) {
      slugId = `${slugId}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const normalizedStatus =
      status === "soon" || status === "coming-soon" ? "coming-soon" : "now-showing";

    const savedPosterUrl = processImagePayload(poster_url, "poster");
    const savedBannerUrl = processImagePayload(banner_url, "banner");

    const insertRes = await databaseConnection.query(
      `INSERT INTO movies (id, title, synopsis, genre, duration, rating, status, poster_url, banner_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        slugId,
        title.trim(),
        synopsis.trim(),
        genre.trim(),
        duration.trim(),
        Number(rating) || 8.0,
        normalizedStatus,
        savedPosterUrl,
        savedBannerUrl,
      ]
    );

    const movie = insertRes.rows[0];
    const adminEmail = req.user?.email || "admin@lumiere.com";
    const adminName = req.user?.name || "Cinema Admin";

    // Write audit log entry
    try {
      await databaseConnection.query(
        `INSERT INTO admin_logs (action, movie_id, movie_title, details, poster_deleted, performed_by, performed_by_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          "MOVIE_ADDED",
          slugId,
          movie.title,
          `Movie added to cinema catalog (Genre: ${movie.genre}, Duration: ${movie.duration}, Rating: ${movie.rating}, Status: ${movie.status}).`,
          false,
          adminEmail,
          adminName,
        ]
      );
    } catch (logErr) {
      console.warn("Failed to write admin log:", logErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `"${movie.title}" added to the cinema catalog successfully!`,
      movie: {
        id: movie.id,
        title: movie.title,
        synopsis: movie.synopsis,
        genre: movie.genre,
        duration: movie.duration,
        rating: Number(movie.rating),
        status: movie.status,
        posterUrl: movie.poster_url,
        bannerUrl: movie.banner_url,
        createdAt: movie.created_at,
        bookingsCount: 0,
        totalRevenue: 0,
      },
    });
  } catch (err) {
    console.error("Admin Create Movie Error:", err);
    return res.status(500).json({ success: false, message: "Server error creating movie." });
  }
});

// 6. UPDATE EXISTING MOVIE (Admin CRUD: Edit Movie)
router.put("/movies/:id", verifyToken, requireAdmin, async function (req, res) {
  try {
    const movieId = req.params.id;
    const {
      title,
      synopsis,
      genre,
      duration,
      rating,
      status,
      poster_url,
      banner_url,
    } = req.body;

    // Check movie exists
    const checkRes = await databaseConnection.query(
      `SELECT * FROM movies WHERE id = $1`,
      [movieId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Movie not found in catalog." });
    }

    const current = checkRes.rows[0];

    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedSynopsis = synopsis !== undefined ? synopsis.trim() : current.synopsis;
    const updatedGenre = genre !== undefined ? genre.trim() : current.genre;
    const updatedDuration = duration !== undefined ? duration.trim() : current.duration;
    const updatedRating = rating !== undefined ? Number(rating) : current.rating;
    let updatedStatus = current.status;
    if (status !== undefined) {
      updatedStatus =
        status === "soon" || status === "coming-soon" ? "coming-soon" : "now-showing";
    }
    let updatedPoster = current.poster_url;
    if (poster_url !== undefined) {
      updatedPoster = processImagePayload(poster_url, "poster");
    }

    let updatedBanner = current.banner_url;
    if (banner_url !== undefined) {
      updatedBanner = processImagePayload(banner_url, "banner");
    }

    const updateRes = await databaseConnection.query(
      `UPDATE movies
       SET title = $1, synopsis = $2, genre = $3, duration = $4, rating = $5, status = $6, poster_url = $7, banner_url = $8
       WHERE id = $9
       RETURNING *`,
      [
        updatedTitle,
        updatedSynopsis,
        updatedGenre,
        updatedDuration,
        updatedRating,
        updatedStatus,
        updatedPoster,
        updatedBanner,
        movieId,
      ]
    );

    const movie = updateRes.rows[0];
    const adminEmail = req.user?.email || "admin@lumiere.com";
    const adminName = req.user?.name || "Cinema Admin";

    // Clean up old media files if they were replaced with new uploads
    if (current.poster_url && updatedPoster && current.poster_url !== updatedPoster) {
      deleteLocalFileFromUrl(current.poster_url);
    }
    if (current.banner_url && updatedBanner && current.banner_url !== updatedBanner) {
      deleteLocalFileFromUrl(current.banner_url);
    }

    // Write audit log entry
    try {
      await databaseConnection.query(
        `INSERT INTO admin_logs (action, movie_id, movie_title, details, poster_deleted, performed_by, performed_by_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          "MOVIE_UPDATED",
          movieId,
          movie.title,
          `Movie details updated (Status: ${movie.status}, Rating: ${movie.rating}, Genre: ${movie.genre}, Duration: ${movie.duration}).`,
          false,
          adminEmail,
          adminName,
        ]
      );
    } catch (logErr) {
      console.warn("Failed to write update admin log:", logErr.message);
    }

    return res.json({
      success: true,
      message: `"${movie.title}" updated successfully!`,
      movie: {
        id: movie.id,
        title: movie.title,
        synopsis: movie.synopsis,
        genre: movie.genre,
        duration: movie.duration,
        rating: Number(movie.rating),
        status: movie.status,
        posterUrl: movie.poster_url,
        bannerUrl: movie.banner_url,
        createdAt: movie.created_at,
      },
    });
  } catch (err) {
    console.error("Admin Update Movie Error:", err);
    return res.status(500).json({ success: false, message: "Server error updating movie." });
  }
});

// 7. DELETE MOVIE (Admin CRUD: Complete Deletion - Database + Physical Image Files + Audit Log)
router.delete("/movies/:id", verifyToken, requireAdmin, async function (req, res) {
  try {
    const movieId = req.params.id;
    const adminEmail = req.user?.email || "admin@lumiere.com";
    const adminName = req.user?.name || "Cinema Admin";

    // 1. Fetch full movie details before deletion (including poster_url and banner_url)
    const checkRes = await databaseConnection.query(
      `SELECT * FROM movies WHERE id = $1`,
      [movieId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Movie not found in catalog." });
    }

    const movie = checkRes.rows[0];
    const movieTitle = movie.title;

    // 2. Physical File Deletion: remove poster and banner image files from disk storage
    const deletedFiles = [];
    const delPoster = deleteLocalFileFromUrl(movie.poster_url);
    if (delPoster) deletedFiles.push(delPoster);

    const delBanner = deleteLocalFileFromUrl(movie.banner_url);
    if (delBanner && delBanner !== delPoster) deletedFiles.push(delBanner);

    // Also check if any other files in uploads/ match this movie's slug
    try {
      const uploadsDir = path.join(__dirname, "uploads");
      if (fs.existsSync(uploadsDir)) {
        const allFiles = fs.readdirSync(uploadsDir);
        for (const f of allFiles) {
          if (f.startsWith(`${movieId}.`) || f.startsWith(`${movieId}-`)) {
            const targetPath = path.join(uploadsDir, f);
            if (fs.existsSync(targetPath) && !deletedFiles.includes(f)) {
              fs.unlinkSync(targetPath);
              deletedFiles.push(f);
              console.log(`🗑️ Deleted associated media file: ${f}`);
            }
          }
        }
      }
    } catch (cleanupErr) {
      console.warn("Error cleaning additional movie files:", cleanupErr.message);
    }

    // 3. Delete showtimes from database
    const showtimesRes = await databaseConnection.query(
      `DELETE FROM showtimes WHERE movie_id = $1 RETURNING id`,
      [movieId]
    );
    const removedShowtimesCount = showtimesRes.rowCount || 0;

    // 4. Delete the movie record from movies table
    await databaseConnection.query(`DELETE FROM movies WHERE id = $1`, [movieId]);

    // 5. Insert audit log into admin_logs
    const fileNotice = deletedFiles.length > 0
      ? `Deleted media files from server disk: [${deletedFiles.join(", ")}].`
      : "No physical local files on server.";
    const details = `Movie "${movieTitle}" was permanently deleted. ${removedShowtimesCount} showtimes cleared. ${fileNotice}`;

    try {
      await databaseConnection.query(
        `INSERT INTO admin_logs (action, movie_id, movie_title, details, poster_deleted, performed_by, performed_by_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          "MOVIE_DELETED",
          movieId,
          movieTitle,
          details,
          deletedFiles.length > 0,
          adminEmail,
          adminName,
        ]
      );
    } catch (logErr) {
      console.warn("Failed to write delete audit log:", logErr.message);
    }

    return res.json({
      success: true,
      message: `"${movieTitle}" and all associated data and files were permanently removed from the system.`,
      deletedFiles,
      showtimesRemoved: removedShowtimesCount,
    });
  } catch (err) {
    console.error("Admin Delete Movie Error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting movie." });
  }
});

// 8. UPLOAD IMAGE DIRECTLY (Poster or Banner from Local PC)
router.post("/upload-image", verifyToken, requireAdmin, async function (req, res) {
  try {
    const { image, filename = "poster.jpg", type = "poster" } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: "No image file data provided." });
    }

    const savedUrl = processImagePayload(image, type);
    if (!savedUrl) {
      return res.status(400).json({ success: false, message: "Invalid image format." });
    }

    return res.json({
      success: true,
      message: "Image uploaded and hosted successfully on cinema server!",
      url: savedUrl,
    });
  } catch (err) {
    console.error("Image Upload Error:", err);
    return res.status(500).json({ success: false, message: "Failed to upload image." });
  }
});

// 9. GET ADMIN ACTIVITY & AUDIT LOGS (History of movie additions, edits, deletions)
router.get("/logs", verifyToken, requireAdmin, async function (req, res) {
  try {
    const { action = "ALL", limit = 100 } = req.query;
    let query = `
      SELECT 
        id, 
        action, 
        movie_id, 
        movie_title, 
        details, 
        poster_deleted, 
        performed_by, 
        performed_by_name, 
        created_at
      FROM admin_logs
    `;
    const params = [];

    if (action !== "ALL" && action.trim()) {
      params.push(action.trim().toUpperCase());
      query += ` WHERE action = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(Math.min(Number(limit) || 100, 200));

    const result = await databaseConnection.query(query, params);

    return res.json({
      success: true,
      logs: result.rows,
      totalCount: result.rows.length,
    });
  } catch (err) {
    console.error("Admin Logs Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch activity logs." });
  }
});

// 10. CLEAR LOGS (Master Admin Cleanup)
router.delete("/logs", verifyToken, requireAdmin, async function (req, res) {
  try {
    await databaseConnection.query(`DELETE FROM admin_logs`);
    return res.json({
      success: true,
      message: "Activity log history cleared successfully.",
    });
  } catch (err) {
    console.error("Clear Logs Error:", err);
    return res.status(500).json({ success: false, message: "Failed to clear logs." });
  }
});

module.exports = router;

