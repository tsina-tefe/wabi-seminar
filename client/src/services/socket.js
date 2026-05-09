import { io } from "socket.io-client";
import { getApiBaseUrl } from "../utils/env.js";

/**
 * Socket.IO client authenticated with the same JWT as REST calls.
 */
export function createAuthenticatedSocket() {
  const url = getApiBaseUrl() || "http://localhost:5000";
  return io(url, {
    auth: { token: localStorage.getItem("token") },
  });
}
