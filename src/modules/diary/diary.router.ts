import { Router } from "express";
import {
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "./diary.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getDiaryEntries);
router.post("/", createDiaryEntry);
router.put("/:id", updateDiaryEntry);
router.delete("/:id", deleteDiaryEntry);

export default router;
