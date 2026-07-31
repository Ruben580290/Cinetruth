import express from "express";

import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.get("/me", authMiddleware, authController.getProfile);

export default authRouter;