import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.router.js";
import emotionRoutes from "./modules/emotion/emotion.router.js";
import userRoutes from "./modules/user/user.router.js";
import chatRoutes from "./modules/chat/chat.router.js";
import diaryRoutes from "./modules/diary/diary.router.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());

  // API endpoints
  app.use("/auth", authRoutes);
  app.use("/", emotionRoutes);
  app.use("/chat", chatRoutes);
  app.use("/diary", diaryRoutes);
  app.use("/me", userRoutes);

  return app;
}
