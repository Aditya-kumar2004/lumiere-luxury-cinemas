const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  // Read Authorization header
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // Support both "Bearer <token>" and raw "<token>"
  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  token = token.trim();

  try {
    const secret = process.env.JWT_SECRET || "lumiere_secret_key_jwt_2026";
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user info (id, name, email, role) to req.user
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = verifyToken;
