/**
 * Reads the payload of a JWT WITHOUT verifying it.
 * Only for UI decisions (is it expired? which role?) - the server always verifies.
 */
export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/** True when the token is missing, unreadable or past its "exp" time. */
export function isTokenExpired(token, skewSeconds = 30) {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
