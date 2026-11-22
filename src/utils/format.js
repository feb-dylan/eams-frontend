// Shared display formatting, so no page shows raw ISO dates or enum names.

const dateFormatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
});
const moneyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

function toDate(value) {
  if (!value) return null;
  // "2026-01-15" (date only) must be read as a local date, not UTC midnight
  const d = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value, empty = "-") {
  const d = toDate(value);
  return d ? dateFormatter.format(d) : empty;
}

export function formatDateTime(value, empty = "-") {
  const d = toDate(value);
  return d ? dateTimeFormatter.format(d) : empty;
}

/** "3 days ago", "in 5 days", "just now" */
export function formatRelative(value, empty = "-") {
  const d = toDate(value);
  if (!d) return empty;
  const seconds = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "just now";
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of units) {
    if (abs >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

export function formatMoney(value, empty = "-") {
  if (value === null || value === undefined || value === "") return empty;
  const n = Number(value);
  return Number.isFinite(n) ? moneyFormatter.format(n) : empty;
}

/** "RETURN_REQUESTED" -> "Return requested" */
export function formatEnum(value, empty = "-") {
  if (!value) return empty;
  const s = String(value).replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Days from today until a date (negative = in the past). */
export function daysUntil(value) {
  const d = toDate(value);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
