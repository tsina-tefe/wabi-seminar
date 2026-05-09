import { randomUUID } from "crypto";

export const MAX_ROOM_MEMBERS = 4;

const rooms = new Map();

export function createRoom() {
  const roomId = randomUUID().split("-")[0];
  rooms.set(roomId, new Set());
  return roomId;
}

export function hasRoom(roomId) {
  return rooms.has(roomId);
}

/**
 * @returns {{ ok: true, peers: string[] } | { error: string }}
 */
export function joinRoomSocket(roomId, userId) {
  if (!roomId || !rooms.has(roomId)) {
    return { error: "Room not found" };
  }

  const members = rooms.get(roomId);
  if (members.size >= MAX_ROOM_MEMBERS) {
    return { error: "Room is full (max 4 users)" };
  }

  members.add(userId);
  const peers = [...members].filter((id) => id !== userId);
  return { ok: true, peers };
}

export function leaveRoomSocket(roomId, userId) {
  if (!roomId || !rooms.has(roomId)) return;

  const members = rooms.get(roomId);
  members.delete(userId);
  if (members.size === 0) {
    rooms.delete(roomId);
  }
}
