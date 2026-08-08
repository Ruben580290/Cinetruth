import express from "express";
const analyzeRouter = express.Router();

import { analyzeText, analyzeImage } from "../controllers/analyzeController.js";
import upload from "../middleware/uploadMiddleware.js";
import { optionalAuthMiddleware } from "../middleware/authMiddleware.js";

// POST /api/analyze/text
analyzeRouter.post("/text", optionalAuthMiddleware, analyzeText);

// POST /api/analyze/image
analyzeRouter.post(
  "/image",
  optionalAuthMiddleware,
  upload.single("image"),
  analyzeImage,
);

export default analyzeRouter;
