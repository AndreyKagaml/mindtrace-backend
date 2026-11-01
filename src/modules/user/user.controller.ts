import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../shared/types.js";

import { comparePassword } from "../../shared/utils.js";
import * as userService from "./user.service.js";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get user",
    });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { name, email } = req.body;

    const user = await userService.updateUserById(userId, name, email);

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Update error",
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { oldPassword, newPassword } = req.body;

    const passwordHash = await userService.getUserPasswordHash(userId);

    if (!passwordHash) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const isMatch = await comparePassword(oldPassword, passwordHash);

    if (!isMatch) {
      res.status(400).json({
        message: "Wrong old password",
      });
      return;
    }

    await userService.updateUserPassword(userId, newPassword);

    res.json({
      message: "Password updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Password update error",
    });
  }
};