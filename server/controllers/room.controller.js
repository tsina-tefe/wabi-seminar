import * as roomService from "../services/room.service.js";

export function createRoom(_req, res) {
  const roomId = roomService.createRoom();
  res.status(201).json({ roomId });
}

export function joinRoom(req, res) {
  const { roomId } = req.body ?? {};
  if (!roomId || !roomService.hasRoom(roomId)) {
    return res.status(404).json({ message: "Room not found" });
  }
  return res.json({ roomId });
}
