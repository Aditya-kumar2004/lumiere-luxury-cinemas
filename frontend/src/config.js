// Centralized API configuration supporting both local dev and production deployment
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:5000";
