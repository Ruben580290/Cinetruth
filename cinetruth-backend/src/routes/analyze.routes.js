import express from "express";
const analyzeRouter = express.Router();

import { analyzeText, analyzeImage } from "../controllers/analyze.controller.js";
import upload from "../middleware/upload.middleware.js";

// POST /api/analyze/text
analyzeRouter.post("/text", analyzeText);

// POST /api/analyze/image
analyzeRouter.post("/image", upload.single("image"), analyzeImage);

export default analyzeRouter;
