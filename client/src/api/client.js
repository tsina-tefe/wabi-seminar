import { getApiBaseUrl } from "../utils/env.js";

/**
 * Typed-ish fetch wrapper with JSON + auth header for REST endpoints.
 */
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}
