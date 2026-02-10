/**
 * Base URL for the Calma API. In dev, frontend (5173) talks to backend (5001).
 * Optional: set VITE_API_URL in client/.env for production.
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
