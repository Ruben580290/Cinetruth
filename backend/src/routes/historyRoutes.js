import express from "express";
const historyRouter = express.Router();

import {
  getHistory,
  getAllHistory,
  getHistoryById,
  updateHistoryReview,
  deleteHistoryItem,
  toggleSimilarCaseReview,
} from "../controllers/historyController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

// GET /api/history?from=&to=&verdict=&inputType=&reviewStatus=&limit=&offset=
historyRouter.get("/", authMiddleware, getHistory);

// GET /api/history/admin  (historial completo, solo admin)
historyRouter.get("/admin", authMiddleware, adminMiddleware, getAllHistory);

// PATCH /api/history/:id/similar-cases/:caseIndex  (marcar/desmarcar caso similar)
historyRouter.patch(
  "/:id/similar-cases/:caseIndex",
  authMiddleware,
  toggleSimilarCaseReview,
);

// GET /api/history/:id
historyRouter.get("/:id", authMiddleware, getHistoryById);

// DELETE /api/history/:id  (solo el dueño del registro)
historyRouter.delete("/:id", authMiddleware, deleteHistoryItem);

// PATCH /api/history/:id/review  (solo admin)
historyRouter.patch(
  "/:id/review",
  authMiddleware,
  adminMiddleware,
  updateHistoryReview,
);

export default historyRouter;
