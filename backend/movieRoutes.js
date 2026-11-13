const express = require("express");
const router = express.Router();
const databaseConnection = require("./db");

// 1. GET ALL MOVIES (Public endpoint used by user dashboard and catalog)
router.get("/", async function (req, res) {
  try {
    const { status, genre, search } = req.query;
    let query = `SELECT * FROM movies WHERE 1=1`;
    const params = [];

    if (status && status !== "all") {
      const normalizedStatus =
        status === "soon" || status === "coming-soon" ? "coming-soon" : "now-showing";
      params.push(normalizedStatus);
      query += ` AND status = $${params.length}`;
    }

    if (genre && genre !== "All Movies") {
      params.push(`%${genre}%`);
      query += ` AND genre ILIKE $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (title ILIKE $${params.length} OR synopsis ILIKE $${params.length})`;
    }

    query += ` ORDER BY created_at DESC, id ASC`;

    const result = await databaseConnection.query(query, params);
    return res.json({
      success: true,
      count: result.rows.length,
      movies: result.rows,
    });
  } catch (err) {
    console.error("Public Movies API Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching movies from database." });
  }
});

// 2. GET FEATURED MOVIE (Public)
router.get("/featured", async function (req, res) {
  try {
    const result = await databaseConnection.query(
      `SELECT * FROM movies WHERE status = 'now-showing' ORDER BY rating DESC, created_at DESC LIMIT 1`
    );
    if (result.rows.length > 0) {
      return res.json({ success: true, movie: result.rows[0] });
    }
    return res.status(404).json({ success: false, message: "No featured movie found." });
  } catch (err) {
    console.error("Featured Movie API Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching featured movie." });
  }
});

// 3. GET SINGLE MOVIE BY ID (Public)
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const result = await databaseConnection.query(
      `SELECT * FROM movies WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    return res.json({
      success: true,
      movie: result.rows[0],
    });
  } catch (err) {
    console.error("Single Movie API Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching movie." });
  }
});

module.exports = router;

