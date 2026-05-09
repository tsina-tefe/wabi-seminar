import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use("/api", apiRoutes);

  return app;
}
