import { apiRequest } from "./client.js";

export function createRoomApi() {
  return apiRequest("/api/rooms", { method: "POST" });
}

export function joinRoomApi(roomId) {
  return apiRequest("/api/rooms/join", {
    method: "POST",
    body: JSON.stringify({ roomId }),
  });
}
