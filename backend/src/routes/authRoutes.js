import express from "express";

import authController from "../controllers/authController.js";
import usersController from "../controllers/usersController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/register", usersController.create);
authRouter.get("/me", authMiddleware, authController.getProfile);

export default authRouter;