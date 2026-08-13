import express from "express";

import usersController from "../controllers/usersController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const usersRouter = express.Router();

// GET /api/users?search=&role=  (listado de usuarios, solo admin)
usersRouter.get("/", authMiddleware, adminMiddleware, usersController.getAll);

export default usersRouter;
