import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    socket.data.user = payload;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}
