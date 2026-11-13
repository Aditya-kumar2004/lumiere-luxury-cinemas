const express = require("express");
const router = express.Router();
const databaseConnection = require("./db");
const verifyToken = require("./authMiddleware");

// Middleware to verify staff role only
function requireStaff(req, res, next) {
  const role = req.user?.role?.toLowerCase();
  if (role === "staff") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied: Staff role required.",
  });
}

// 1. GET DASHBOARD OVERVIEW METRICS
router.get("/overview", verifyToken, requireStaff, async function (req, res) {
  try {
    // Fetch all bookings
    const bookingsResult = await databaseConnection.query(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    );
    const allBookings = bookingsResult.rows;

    const totalBookings = allBookings.length;
    const confirmedList = allBookings.filter((b) => b.payment_status === "CONFIRMED");
    const cancelledList = allBookings.filter((b) => b.payment_status === "CANCELLED");
    const admittedList = allBookings.filter((b) => b.is_admitted === true);

    const totalRevenue = confirmedList.reduce(
      (sum, b) => sum + Number(b.total_amount || 0),
      0
    );

    const totalCancelledValue = cancelledList.reduce(
      (sum, b) => sum + Number(b.total_amount || 0),
      0
    );

    // Total tickets/seats booked
    const totalSeatsBooked = confirmedList.reduce((sum, b) => {
      const count = Array.isArray(b.seats) ? b.seats.length : 1;
      return sum + count;
    }, 0);

    // Fetch active movies from catalogue to provide complete auditorium map
    let allMovies = [];
    try {
      const moviesResult = await databaseConnection.query(
        `SELECT * FROM movies WHERE status = 'now-showing' ORDER BY rating DESC`
      );
      allMovies = moviesResult.rows;
    } catch {
      // fallback if table query fails
    }

    const movieMap = {};

    // Initialize all catalog movies
    for (const m of allMovies) {
      movieMap[m.title] = {
        title: m.title,
        movieId: m.id,
        genre: m.genre || "Action",
        cinema: "LUMIÈRE Grand",
        screenType: "IMAX Laser",
        showTime: "7:30 PM",
        totalCapacity: 96, // 8 rows (A-H) * 12 cols
        seatsBooked: 0,
        occupiedSeats: [],
        cancelledSeats: [],
        revenue: 0,
        cancelledAmount: 0,
      };
    }

    // Fold in real bookings data
    for (const b of allBookings) {
      const title = b.movie_title;
      const isConfirmed = b.payment_status === "CONFIRMED";
      const isCancelled = b.payment_status === "CANCELLED";
      const amount = Number(b.total_amount || 0);
      const seatCount = Array.isArray(b.seats) ? b.seats.length : 1;

      if (!movieMap[title]) {
        movieMap[title] = {
          title,
          movieId: b.movie_id,
          genre: "Feature Film",
          cinema: b.cinema_name || "LUMIÈRE Grand",
          screenType: b.screen_type || "IMAX Laser",
          showTime: b.show_time || "7:30 PM",
          totalCapacity: 96,
          seatsBooked: 0,
          occupiedSeats: [],
          cancelledSeats: [],
          revenue: 0,
          cancelledAmount: 0,
        };
      }

      if (isConfirmed) {
        movieMap[title].seatsBooked += seatCount;
        if (Array.isArray(b.seats)) {
          // avoid duplicates
          for (const s of b.seats) {
            if (!movieMap[title].occupiedSeats.includes(s)) {
              movieMap[title].occupiedSeats.push(s);
            }
          }
        }
        movieMap[title].revenue += amount;
      } else if (isCancelled) {
        movieMap[title].cancelledAmount += amount;
        if (Array.isArray(b.seats)) {
          for (const s of b.seats) {
            if (!movieMap[title].cancelledSeats.includes(s)) {
              movieMap[title].cancelledSeats.push(s);
            }
          }
        }
      }
    }

    const moviesSummary = Object.values(movieMap).map((m) => {
      const occupied = m.occupiedSeats.length > 0 ? m.occupiedSeats.length : m.seatsBooked;
      return {
        ...m,
        seatsBooked: occupied,
        availableSeats: Math.max(0, m.totalCapacity - occupied),
        occupancyPercent: Math.min(100, Math.round((occupied / m.totalCapacity) * 100)),
      };
    }).sort((a, b) => b.revenue - a.revenue || b.seatsBooked - a.seatsBooked);

    // Recent 10 activity log
    const recentActivity = allBookings.slice(0, 10).map((b) => ({
      id: b.id,
      code: b.booking_code,
      guest: b.user_name,
      movie: b.movie_title,
      seats: b.seats,
      amount: b.total_amount,
      status: b.payment_status,
      isAdmitted: b.is_admitted,
      admittedAt: b.admitted_at,
      createdAt: b.created_at,
    }));

    return res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedCount: confirmedList.length,
        cancelledCount: cancelledList.length,
        admittedCount: admittedList.length,
        totalSeatsBooked,
        totalRevenue,
        totalCancelledValue,
        netRevenue: totalRevenue,
        avgTicketPrice: totalSeatsBooked > 0 ? Math.round(totalRevenue / totalSeatsBooked) : 0,
      },
      moviesSummary,
      recentActivity,
    });
  } catch (err) {
    console.error("Staff Overview Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching overview." });
  }
});

// 2. GET ALL BOOKINGS (With search, filter, pagination)
router.get("/bookings", verifyToken, requireStaff, async function (req, res) {
  try {
    const { search = "", status = "ALL", movie = "ALL" } = req.query;

    let query = `SELECT * FROM bookings WHERE 1=1`;
    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const idx = params.length;
      query += ` AND (
        LOWER(booking_code) LIKE $${idx} OR
        LOWER(user_name) LIKE $${idx} OR
        LOWER(user_email) LIKE $${idx} OR
        LOWER(movie_title) LIKE $${idx}
      )`;
    }

    if (status === "CONFIRMED") {
      query += ` AND payment_status = 'CONFIRMED'`;
    } else if (status === "CANCELLED") {
      query += ` AND payment_status = 'CANCELLED'`;
    } else if (status === "ADMITTED") {
      query += ` AND is_admitted = TRUE`;
    } else if (status === "PENDING_ENTRY") {
      query += ` AND payment_status = 'CONFIRMED' AND (is_admitted = FALSE OR is_admitted IS NULL)`;
    }

    if (movie !== "ALL" && movie.trim()) {
      params.push(movie.trim());
      query += ` AND movie_title = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await databaseConnection.query(query, params);

    return res.json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (err) {
    console.error("Staff Bookings List Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching bookings." });
  }
});

// 3. ADMIT GUEST (Check-in gate verification)
router.put("/admit/:code", verifyToken, requireStaff, async function (req, res) {
  try {
    const code = req.params.code.trim().toUpperCase();

    const check = await databaseConnection.query(
      `SELECT * FROM bookings WHERE UPPER(booking_code) = $1`,
      [code]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Ticket "${code}" not found.`,
      });
    }

    const b = check.rows[0];

    // Cannot admit cancelled ticket
    if (b.payment_status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        valid: false,
        status: "CANCELLED",
        message: `🚫 ENTRY DENIED: Ticket ${b.booking_code} was CANCELLED and is VOID.`,
        booking: b,
      });
    }

    // Check if already admitted
    if (b.is_admitted) {
      return res.json({
        success: true,
        alreadyAdmitted: true,
        message: `⚠️ NOTICE: Guest ${b.user_name} was ALREADY admitted at ${new Date(
          b.admitted_at
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        booking: b,
      });
    }

    // Mark as admitted
    const updateResult = await databaseConnection.query(
      `UPDATE bookings SET is_admitted = TRUE, admitted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [b.id]
    );

    const admittedBooking = updateResult.rows[0];

    return res.json({
      success: true,
      valid: true,
      alreadyAdmitted: false,
      message: `✅ ADMISSION APPROVED: Welcome ${b.user_name}! Seats ${b.seats.join(
        ", "
      )} admitted to auditorium.`,
      booking: admittedBooking,
    });
  } catch (err) {
    console.error("Admit Guest Error:", err);
    return res.status(500).json({ success: false, message: "Server error admitting guest." });
  }
});

// 4. CANCEL BOOKING AT COUNTER
router.put("/cancel/:id", verifyToken, requireStaff, async function (req, res) {
  try {
    const bookingId = req.params.id;

    const check = await databaseConnection.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const b = check.rows[0];
    if (b.payment_status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled." });
    }

    const update = await databaseConnection.query(
      `UPDATE bookings SET payment_status = 'CANCELLED' WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    return res.json({
      success: true,
      message: `Booking ${b.booking_code} cancelled by staff. Seats ${b.seats.join(
        ", "
      )} released immediately.`,
      booking: update.rows[0],
    });
  } catch (err) {
    console.error("Staff Cancel Error:", err);
    return res.status(500).json({ success: false, message: "Server error cancelling booking." });
  }
});

module.exports = router;
