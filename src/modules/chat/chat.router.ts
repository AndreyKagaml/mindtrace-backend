import express from "express";

import {
  getChatByDate,
  getTodaySession,
  sendMessage,
  closeChat,
} from "./chat.controller.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware)

router.get("/", getChatByDate);
router.post("/today", getTodaySession);
router.post("/:id/messages", sendMessage);
router.post("/:id/close", closeChat);

export default router;
