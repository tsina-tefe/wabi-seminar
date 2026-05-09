import { Router } from "express";
import * as healthController from "../controllers/health.controller.js";
import authRoutes from "./auth.routes.js";
import roomRoutes from "./room.routes.js";

const router = Router();

router.get("/health", healthController.health);
router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);

export default router;
