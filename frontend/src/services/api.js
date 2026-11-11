import axios from "axios";

// Set VITE_API_URL to your backend base URL to switch from mock data to live data.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const hasBackend = () => Boolean(API_BASE_URL);
