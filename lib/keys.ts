import crypto from "crypto";
// Key = "CINE" + 20 hex chars (80 bits). Shown once; only the SHA-256 hash is stored.
export function newAccessKey() {
  const raw = crypto.randomBytes(10).toString("hex").toUpperCase();
  const normalized = "CINE" + raw;
  return {
    display: `CINE-${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15, 20)}`,
    hash: crypto.createHash("sha256").update(normalized).digest("hex"),
  };
}
export const hashKeyInput = (input: string) => {
  const normalized = String(input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^CINE[0-9A-F]{20}$/.test(normalized)) return null;
  return crypto.createHash("sha256").update(normalized).digest("hex");
};
