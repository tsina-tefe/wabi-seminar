import { randomUUID } from "crypto";
import * as roomService from "../services/room.service.js";

export function registerRoomSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("room:join", ({ roomId }) => {
      const result = roomService.joinRoomSocket(roomId, socket.data.user.id);
      if (result.error) {
        socket.emit("room:error", { message: result.error });
        return;
      }

      socket.join(roomId);
      socket.emit("room:joined", {
        roomId,
        peers: result.peers,
        selfId: socket.data.user.id,
        user: socket.data.user,
      });

      socket.to(roomId).emit("room:user-joined", {
        peerId: socket.data.user.id,
        user: socket.data.user,
      });

      socket.data.roomId = roomId;
    });

    socket.on("signal:offer", ({ targetPeerId, sdp }) => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit("signal:offer", {
        fromPeerId: socket.data.user.id,
        targetPeerId,
        sdp,
      });
    });

    socket.on("signal:answer", ({ targetPeerId, sdp }) => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit("signal:answer", {
        fromPeerId: socket.data.user.id,
        targetPeerId,
        sdp,
      });
    });

    socket.on("signal:ice", ({ targetPeerId, candidate }) => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit("signal:ice", {
        fromPeerId: socket.data.user.id,
        targetPeerId,
        candidate,
      });
    });

    socket.on("chat:send", ({ message }) => {
      const roomId = socket.data.roomId;
      if (!roomId || !message) return;
      io.to(roomId).emit("chat:message", {
        id: randomUUID(),
        user: socket.data.user,
        message: String(message),
        createdAt: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      roomService.leaveRoomSocket(roomId, socket.data.user.id);
      socket.to(roomId).emit("room:user-left", { peerId: socket.data.user.id });
    });
  });
}
