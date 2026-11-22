/** Turns a scanned QR text into an asset code: ".../a/LAP-0042" -> "LAP-0042". */
export function assetCodeFromScan(text) {
  const value = String(text || "").trim();
  const match = value.match(/\/a\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : value;
}
