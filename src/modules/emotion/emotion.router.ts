import express from "express";
import {
  createEmotion,
  updateEmotion,
  getHistory,
  getTodayEmotions,
  getEmotionChart,
} from "./emotion.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/emotions", getTodayEmotions);
router.post("/emotions", createEmotion);
router.put("/emotions", updateEmotion);


router.get("/moodChart", getEmotionChart);
router.get("/history", getHistory);

export default router;
