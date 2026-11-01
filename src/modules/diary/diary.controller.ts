import type { Response, Request } from "express";
import { getTodayDate, isValidDate } from "../../shared/utils.js";

import type { AuthenticatedRequest } from "../../shared/types.js";
import * as diaryService from "./diary.service.js";
import { parseEntryId } from "./utils.js";

// GET /diary?date=YYYY-MM-DD
export const getDiaryEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const date = req.query.date as string;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "A valid date in YYYY-MM-DD format is required.",
      });
    }

    if (date > getTodayDate()) {
      return res.status(400).json({
        message: "Future dates are not allowed.",
      });
    }

    const entries = await diaryService.getDiaryEntriesByDate(userId, date);

    return res.json({ entries });
  } catch (error) {
    console.error("getDiaryEntries error:", error);

    return res.status(500).json({
      message: "Failed to load diary entries.",
    });
  }
};

// POST /diary
export const createDiaryEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { date, text } = req.body ?? {};

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "A valid date in YYYY-MM-DD format is required.",
      });
    }

    if (date !== getTodayDate()) {
      return res.status(409).json({
        message: "Entries can only be created for today.",
      });
    }

    if (typeof text !== "string" || text.length > 10000) {
      return res.status(400).json({
        message: "Text must be a string of at most 10000 characters.",
      });
    }

    // Пустая строка разрешена.
    const entry = await diaryService.createDiaryEntry(userId, date, text);

    return res.status(201).json({ entry });
  } catch (error) {
    console.error("createDiaryEntry error:", error);

    return res.status(500).json({
      message: "Failed to create diary entry.",
    });
  }
};

// PUT /diary/:id
export const updateDiaryEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const entryId = parseEntryId(req.params.id as string);
    const { text } = req.body ?? {};

    if (!entryId) {
      return res.status(400).json({
        message: "Invalid diary entry ID.",
      });
    }

    if (
      typeof text !== "string" ||
      text.trim().length === 0 ||
      text.length > 10000
    ) {
      return res.status(400).json({
        message: "Text must be a non-empty string of at most 10000 characters.",
      });
    }

    const entry = await diaryService.updateDiaryEntry(userId, entryId, text);

    if (!entry) {
      return res.status(404).json({
        message: "Diary entry not found or cannot be edited.",
      });
    }

    return res.json({ entry });
  } catch (error) {
    console.error("updateDiaryEntry error:", error);

    return res.status(500).json({
      message: "Failed to update diary entry.",
    });
  }
};

// DELETE /diary/:id
export const deleteDiaryEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const entryId = parseEntryId(req.params.id as string);

    if (!entryId) {
      return res.status(400).json({
        message: "Invalid diary entry ID.",
      });
    }

    const deleted = await diaryService.deleteDiaryEntry(userId, entryId);

    if (!deleted) {
      return res.status(404).json({
        message: "Diary entry not found or cannot be deleted.",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("deleteDiaryEntry error:", error);

    return res.status(500).json({
      message: "Failed to delete diary entry.",
    });
  }
};
