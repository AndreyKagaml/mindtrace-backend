import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getMe, updateMe, changePassword } from "./user.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMe);
router.patch("/", updateMe);
router.patch("/password", changePassword);

export default router;