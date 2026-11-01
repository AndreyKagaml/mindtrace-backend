import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../shared/types.js";
import {
  getTodayDate,
  isValidDate,
  getErrorStatus,
  getErrorMessage,
} from "../../shared/utils.js";
import * as chatService from "./chat.service.js";

// GET /chat/sessions?date=YYYY-MM-DD
export const getChatByDate = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const today = getTodayDate();
    const date = String(req.query.date ?? today);

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Invalid date. Expected YYYY-MM-DD.",
      });
    }

    if (date > today) {
      return res.status(400).json({
        message: "Cannot open a chat for a future date.",
      });
    }

    const result = await chatService.getChatByDate(userId, date);

    return res.json(result);
  } catch (error) {
    console.error("getChatByDate error:", error);

    return res.status(500).json({
      message: "Failed to load chat.",
    });
  }
};

// POST /chat/sessions/today
export const getTodaySession = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { created, ...result } =
      await chatService.getOrCreateTodaySession(userId);

    return res.status(created ? 201 : 200).json(result);
  } catch (error) {
    console.error("getTodaySession error:", error);

    return res.status(500).json({
      message: "Failed to get today's chat session.",
    });
  }
};

// POST /chat/sessions/:id/messages
export const sendMessage = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const sessionId = Number(req.params.id);
    const message =
      typeof req.body?.message === "string"
        ? req.body.message.trim()
        : "";

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    if (!message || message.length > 10000) {
      return res.status(400).json({
        message: "Message must contain between 1 and 10000 characters.",
      });
    }

    const result = await chatService.sendChatMessage(
      sessionId,
      userId,
      message,
    );

    return res.json(result);
  } catch (error) {
    console.error("sendMessage error:", error);

    const status = getErrorStatus(error);

    return res.status(status).json({
      message:
        status === 500
          ? "Failed to send message."
          : getErrorMessage(error),
    });
  }
};

// POST /chat/sessions/:id/close
export const closeChat = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const sessionId = Number(req.params.id);

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    const result = await chatService.closeChat(sessionId, userId);

    return res.json(result);
  } catch (error) {
    console.error("closeChat error:", error);

    const status = getErrorStatus(error);

    return res.status(status).json({
      message:
        status === 500
          ? "Failed to close chat."
          : getErrorMessage(error),
    });
  }
};
