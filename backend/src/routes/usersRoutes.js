import express from "express";

import usersController from "../controllers/usersController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const usersRouter = express.Router();

// GET /api/users?search=&role=  (listado de usuarios, solo admin)
usersRouter.get("/", authMiddleware, adminMiddleware, usersController.getAll);

// PATCH /api/users/:id/role  (cambiar rol, solo admin)
usersRouter.patch(
  "/:id/role",
  authMiddleware,
  adminMiddleware,
  usersController.updateRole,
);

// PATCH /api/users/:id/status  (activar/desactivar cuenta, solo admin)
usersRouter.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  usersController.toggleStatus,
);

export default usersRouter;
