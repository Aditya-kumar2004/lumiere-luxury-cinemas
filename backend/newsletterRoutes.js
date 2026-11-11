const express = require("express");
const router = express.Router();
const databaseConnection = require("./db");

// SUBSCRIBE TO NEWSLETTER
// Only registered/verified accounts can subscribe!
router.post("/subscribe", async function (req, res) {
  try {
    const email = req.body.email;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user has an account in the users table
    const userResult = await databaseConnection.query(
      "SELECT id, name, email, is_verified FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    // If user does not exist in database:
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        requiresAccount: true,
        message: "Welcome to LUMIÈRE! Please create your free account first to unlock VIP newsletter perks and premiere invitations.",
      });
    }

    const user = userResult.rows[0];

    // If account is not verified yet:
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Please verify your account with the 8-digit code first to activate your newsletter subscription.",
      });
    }

    // 2. Check if already subscribed
    const subCheck = await databaseConnection.query(
      "SELECT id FROM subscribers WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (subCheck.rows.length > 0) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: `Welcome back, ${user.name}! You are already on the LUMIÈRE VIP guest list.`,
      });
    }

    // 3. Save subscriber into database
    await databaseConnection.query(
      "INSERT INTO subscribers (user_id, email) VALUES ($1, $2)",
      [user.id, cleanEmail]
    );

    console.log(`🎬 New VIP Newsletter subscriber: ${user.name} (${cleanEmail})`);

    return res.status(201).json({
      success: true,
      message: `Welcome to the LUMIÈRE VIP Club, ${user.name}! You are now subscribed to premiere movie releases and secret screenings.`,
    });
  } catch (err) {
    console.error("Newsletter Subscription Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error subscribing to newsletter.",
    });
  }
});

module.exports = router;

