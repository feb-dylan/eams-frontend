/**
 * Turns any error (axios, network, JS) into a string that can be shown to the user.
 *
 * Never render `err.response.data` directly: it can be an object, and React
 * crashes when it tries to render an object ("Objects are not valid as a React child").
 */
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message) return data.message;
    if (data.messages && typeof data.messages === "object") {
      const parts = Object.values(data.messages).filter(Boolean);
      if (parts.length) return parts.join(" · ");
    }
    if (typeof data.detail === "string" && data.detail) return data.detail;
    if (typeof data.error === "string" && data.error) return data.error;
  }

  if (err?.code === "ERR_NETWORK") return "Cannot reach the server. Check your connection.";
  if (typeof err?.message === "string" && err.message && !err.response) return err.message;
  return fallback;
}

/** Field-level validation messages from the backend, e.g. { email: "Invalid email" }. */
export function getFieldErrors(err) {
  const messages = err?.response?.data?.messages;
  return messages && typeof messages === "object" ? messages : {};
}
