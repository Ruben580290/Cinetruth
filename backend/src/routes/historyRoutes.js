import express from "express";
const historyRouter = express.Router();

import { getHistory } from "../controllers/historyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// GET /api/history?from=&to=&verdict=
historyRouter.get("/", authMiddleware, getHistory);

export default historyRouter;
