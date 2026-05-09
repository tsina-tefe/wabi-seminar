import dotenv from "dotenv";

dotenv.config();

/**
 * Browsers require Access-Control-Allow-Origin to be a full origin (e.g. https://app.vercel.app).
 * Hosting env vars often omit the scheme; fix that without breaking explicit http://localhost.
 */
function normalizeClientUrl(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "http://localhost:5173";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      return `${u.protocol}//${u.host}`;
    } catch {
      return trimmed;
    }
  }

  const hostPart = trimmed.replace(/\/+$/, "");
  const isLocal =
    /^localhost\b/i.test(hostPart) ||
    /^127\.0\.0\.1\b/.test(hostPart) ||
    /^\[::1\]/.test(hostPart);
  const scheme = isLocal ? "http" : "https";
  try {
    const u = new URL(`${scheme}://${hostPart}`);
    return `${u.protocol}//${u.host}`;
  } catch {
    return `${scheme}://${hostPart}`;
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  clientUrl: normalizeClientUrl(process.env.CLIENT_URL),
  mongoUri: process.env.MONGODB_URI || "",
};
