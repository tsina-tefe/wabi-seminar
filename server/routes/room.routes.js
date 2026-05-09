import { Router } from "express";
import * as roomController from "../controllers/room.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, roomController.createRoom);
router.post("/join", authMiddleware, roomController.joinRoom);

export default router;
