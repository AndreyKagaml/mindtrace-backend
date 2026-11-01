import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { registerUser, verifyUser } from "./auth.service.js";
import type { RegisterBody, LoginBody } from "./types.js";

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const userId = await registerUser(email, password, name);

    res.json({
      message: "User created",
      userId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration error",
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await verifyUser(email, password);

    if (!user) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
    //     res.json({
    //       token,
    //       user,
    //     });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login error",
    });
  }
};