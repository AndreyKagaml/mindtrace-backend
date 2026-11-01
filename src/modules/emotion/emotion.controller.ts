import type { Request, Response } from "express";
import * as emotionService from "./emotion.service.js";
import type { AuthenticatedRequest } from "../../shared/types.js";
import { isValidEmotionData } from "./utils.js";


export const getTodayEmotions = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const emotion = await emotionService.getTodayEmotionByUserId(userId);

    return res.status(200).json(emotion);
  } catch (error) {
    console.error("Error fetching today's emotions:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const createEmotion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidEmotionData(req.body)) {
      res.status(400).json({
        message: "Emotion values must be integers from 0 to 5",
      });
      return;
    }

    const result = await emotionService.createEmotionForUser(userId, req.body);

    if (result === null) {
      res.status(204).send();
      return;
    }

    res.status(201).json({
      message: "Emotion record created",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateEmotion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidEmotionData(req.body)) {
      res.status(400).json({
        message: "Emotion values must be integers from 0 to 5",
      });
      return;
    }

    const result = await emotionService.updateEmotionByUserId(userId, req.body);

    if (result.affectedRows === 0) {
      res.status(404).json({
        message: "Emotion record for today not found",
      });
      return;
    }

    res.status(200).json({
      message: "Emotion record updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const { year, month } = req.query;

    if (
      Number(year) < 1000 ||
      Number(year) > 9999 ||
      Number(month) < 1 ||
      Number(month) > 12
    ) {
      res.status(400).json({
        message: "Invalid year or month",
      });
      return;
    }

    const rows = await emotionService.getEmotionHistoryByUserId(userId, year, month);

    return res.json(rows);
  } catch (error) {
    console.error("Error fetching emotion history:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getEmotionChart = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const rawLimit = req.query.limit ?? "30";
    const limit = Number(rawLimit);

    if (
      !["10", "30"].includes(String(rawLimit)) ||
      !Number.isInteger(limit)
    ) {
      return res.status(400).json({
        message: "Limit must be either 10 or 30.",
      });
    }

    const records = await emotionService.getEmotionChartData(userId, limit);

    return res.json({ records });
  } catch (error) {
    console.error("getEmotionChart error:", error);

    return res.status(500).json({
      message: "Failed to load emotion statistics.",
    });
  }
};