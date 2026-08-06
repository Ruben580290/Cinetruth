import express from "express";
const analyzeRouter = express.Router();

import { analyzeText, analyzeImage } from "../controllers/analyzeController.js";
import upload from "../middleware/uploadMiddleware.js";

// POST /api/analyze/text
analyzeRouter.post("/text", analyzeText);

// POST /api/analyze/image
analyzeRouter.post("/image", upload.single("image"), analyzeImage);

export default analyzeRouter;
