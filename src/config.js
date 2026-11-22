// All environment-specific settings in one place.
// Set them in a ".env.local" file (see .env.example). Vite exposes only VITE_* variables.

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

/** Show one-click demo logins on the login page (for demos / judges only). */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Password123!";

/** Turns "/uploads/x.png" into a full URL; leaves absolute URLs untouched. */
export function fileUrl(path) {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;
}
