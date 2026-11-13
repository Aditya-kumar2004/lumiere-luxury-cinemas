const express = require("express");
const router = express.Router();
const databaseConnection = require("./db");
const verifyToken = require("./authMiddleware");
const { sendBookingEmail } = require("./emailService");
const { generateTicketPdf } = require("./ticketPdfService");

// Helper to generate a clean, luxury booking code (e.g. CP-94821)
function generateBookingCode() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CP-${num}`;
}

// 1. CREATE BOOKING (Only authenticated users can book)
router.post("/", verifyToken, async function (req, res) {
  try {
    const user = req.user; // from verifyToken (id, name, email, role)
    const {
      movieId,
      movieTitle,
      cinemaName,
      city,
      screenType,
      showDate,
      showTime,
      seats,
      totalAmount,
    } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one seat to proceed.",
      });
    }

    if (!movieTitle) {
      return res.status(400).json({
        success: false,
        message: "Movie title is required.",
      });
    }

    const bookingCode = generateBookingCode();
    const formattedDate = showDate || new Date().toISOString().split("T")[0];
    const formattedCinema = cinemaName || "LUMIÈRE Royale";
    const formattedCity = city || "Mumbai";
    const formattedScreen = screenType || "IMAX Laser";
    const formattedTime = showTime || "7:00 PM";
    const amount = Number(totalAmount) || 0;

    // Check if any of these seats are already booked for this movie, cinema & showtime
    const occupiedCheck = await databaseConnection.query(
      `SELECT seats FROM bookings
       WHERE movie_title = $1 AND cinema_name = $2 AND show_time = $3 AND show_date::date = $4::date AND payment_status = 'CONFIRMED'`,
      [movieTitle, formattedCinema, formattedTime, formattedDate]
    );

    const alreadyTaken = new Set();
    for (const row of occupiedCheck.rows) {
      if (Array.isArray(row.seats)) {
        row.seats.forEach((s) => alreadyTaken.add(s));
      }
    }

    const conflicts = seats.filter((s) => alreadyTaken.has(s));
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${conflicts.join(", ")} were just booked by someone else. Please choose other seats.`,
      });
    }

    // Insert into bookings table
    const insertResult = await databaseConnection.query(
      `INSERT INTO bookings (
        booking_code, user_email, user_name, user_phone,
        movie_id, movie_title, cinema_name, city, screen_type,
        show_date, show_time, seats, total_amount, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'CONFIRMED')
      RETURNING *`,
      [
        bookingCode,
        user.email,
        user.name,
        user.phone || "",
        movieId || null,
        movieTitle,
        formattedCinema,
        formattedCity,
        formattedScreen,
        formattedDate,
        formattedTime,
        seats,
        amount,
      ]
    );

    const booking = insertResult.rows[0];

    // Trigger luxury confirmation email with PDF pass asynchronously
    sendBookingEmail(booking).catch((emailErr) => {
      console.error("Booking email async notification failed:", emailErr.message);
    });

    return res.status(201).json({
      success: true,
      message: "Ticket booking confirmed successfully!",
      booking: {
        id: booking.id,
        bookingCode: booking.booking_code,
        movieTitle: booking.movie_title,
        cinemaName: booking.cinema_name,
        city: booking.city,
        screenType: booking.screen_type,
        showDate: booking.show_date,
        showTime: booking.show_time,
        seats: booking.seats,
        totalAmount: booking.total_amount,
        paymentStatus: booking.payment_status,
        createdAt: booking.created_at,
        userName: booking.user_name,
        userEmail: booking.user_email,
      },
    });
  } catch (err) {
    console.error("Create Booking Error:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while confirming your booking. Please try again.",
    });
  }
});

// 2. GET CURRENT USER'S BOOKINGS & STATS
router.get("/my-bookings", verifyToken, async function (req, res) {
  try {
    const userEmail = req.user.email;
    const result = await databaseConnection.query(
      `SELECT * FROM bookings WHERE LOWER(user_email) = LOWER($1) ORDER BY created_at DESC`,
      [userEmail]
    );

    const totalBookings = result.rows.length;
    const confirmedCount = result.rows.filter((b) => b.payment_status === "CONFIRMED").length;
    const totalSpent = result.rows
      .filter((b) => b.payment_status === "CONFIRMED")
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

    return res.json({
      success: true,
      totalBookings,
      confirmedCount,
      totalSpent,
      bookings: result.rows,
    });
  } catch (err) {
    console.error("Get My Bookings Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your bookings.",
    });
  }
});

// 3. CANCEL A BOOKING (Only booking owner or admin)
router.put("/:id/cancel", verifyToken, async function (req, res) {
  try {
    const bookingId = req.params.id;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // Check booking exists
    const checkResult = await databaseConnection.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const booking = checkResult.rows[0];

    // Check authorization: must be the booking owner or admin
    if (booking.user_email.toLowerCase() !== userEmail.toLowerCase() && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking.",
      });
    }

    if (booking.payment_status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled.",
      });
    }

    // Update status to CANCELLED
    const updateResult = await databaseConnection.query(
      `UPDATE bookings SET payment_status = 'CANCELLED' WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    return res.json({
      success: true,
      message: `Booking ${booking.booking_code} cancelled successfully. Seats ${booking.seats.join(", ")} have been released.`,
      booking: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Cancel Booking Error:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while cancelling your booking.",
    });
  }
});

// 4. DOWNLOAD OFFICIAL PDF TICKET PASS
router.get("/:id/pdf", verifyToken, async function (req, res) {
  try {
    const bookingId = req.params.id;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    const result = await databaseConnection.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const booking = result.rows[0];

    // Ensure authorized access
    if (booking.user_email.toLowerCase() !== userEmail.toLowerCase() && userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Block download if ticket was cancelled
    if (booking.payment_status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "This ticket has been cancelled and is void. PDF pass cannot be downloaded.",
      });
    }

    const pdfBuffer = await generateTicketPdf(booking);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Lumiere-Ticket-${booking.booking_code}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("Download Ticket PDF Error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not generate ticket PDF.",
    });
  }
});

// 5. GET OCCUPIED SEATS FOR A MOVIE & SHOWTIME
router.get("/occupied", async function (req, res) {
  try {
    const { movieTitle, cinemaName, showTime, showDate } = req.query;
    if (!movieTitle) {
      return res.json({ success: true, occupiedSeats: [] });
    }

    const date = showDate || new Date().toISOString().split("T")[0];
    const cinema = cinemaName || "LUMIÈRE Royale";
    const time = showTime || "7:00 PM";

    const result = await databaseConnection.query(
      `SELECT seats FROM bookings
       WHERE movie_title = $1 AND cinema_name = $2 AND show_time = $3 AND show_date::date = $4::date AND payment_status = 'CONFIRMED'`,
      [movieTitle, cinema, time, date]
    );

    const occupied = [];
    result.rows.forEach((r) => {
      if (Array.isArray(r.seats)) {
        occupied.push(...r.seats);
      }
    });

    return res.json({
      success: true,
      occupiedSeats: occupied,
    });
  } catch (err) {
    console.error("Occupied Seats Error:", err);
    return res.json({ success: true, occupiedSeats: [] });
  }
});

// 6. VERIFY TICKET (For gate staff scanner & QR verification)
router.get("/verify/:code", async function (req, res) {
  try {
    const code = req.params.code.trim().toUpperCase();
    const result = await databaseConnection.query(
      `SELECT * FROM bookings WHERE UPPER(booking_code) = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        status: "NOT_FOUND",
        message: `❌ INVALID TICKET: No booking found for code "${code}". Entry Denied.`,
      });
    }

    const b = result.rows[0];
    const isCancelled = b.payment_status === "CANCELLED";
    const isConfirmed = b.payment_status === "CONFIRMED";

    if (isCancelled) {
      return res.json({
        success: true,
        valid: false,
        status: "CANCELLED",
        message: `🚫 ENTRY DENIED: Ticket ${b.booking_code} HAS BEEN CANCELLED. This ticket is VOID.`,
        booking: {
          id: b.id,
          bookingCode: b.booking_code,
          movieTitle: b.movie_title,
          cinemaName: b.cinema_name,
          city: b.city,
          screenType: b.screen_type,
          showDate: b.show_date,
          showTime: b.show_time,
          seats: b.seats,
          totalAmount: b.total_amount,
          userName: b.user_name,
          userEmail: b.user_email,
          status: "CANCELLED",
        },
      });
    }

    return res.json({
      success: true,
      valid: isConfirmed,
      status: b.payment_status,
      message: isConfirmed
        ? `✅ ENTRY APPROVED: Valid Ticket! Welcome ${b.user_name} to LUMIÈRE Cinemas.`
        : `⚠️ TICKET STATUS: ${b.payment_status}. Entry Denied.`,
      booking: {
        id: b.id,
        bookingCode: b.booking_code,
        movieTitle: b.movie_title,
        cinemaName: b.cinema_name,
        city: b.city,
        screenType: b.screen_type,
        showDate: b.show_date,
        showTime: b.show_time,
        seats: b.seats,
        totalAmount: b.total_amount,
        userName: b.user_name,
        userEmail: b.user_email,
        status: b.payment_status,
      },
    });
  } catch (err) {
    console.error("Verify Ticket Error:", err);
    return res.status(500).json({ success: false, message: "Verification failed." });
  }
});

module.exports = router;
