import { apiRequest } from "./client.js";

export function loginApi({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerApi({ name, email, password }) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function meApi() {
  return apiRequest("/api/auth/me");
}
