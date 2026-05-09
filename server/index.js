import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.middleware.js";
import { registerRoomSocketHandlers } from "./sockets/room.socket.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [env.clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  },
});

io.use(socketAuthMiddleware);
registerRoomSocketHandlers(io);

async function start() {
  await connectDatabase();

  server.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${env.port} is already in use. Stop the other process or change PORT in .env.`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

start();
