const express = require("express");
const analyzeRouter = express.Router();

const { analyzeText, analyzeImage } = require("../controllers/analyze.controller");
const upload = require("../middleware/upload.middleware");

// POST /api/analyze/text
analyzeRouter.post("/text", analyzeText);

// POST /api/analyze/image
analyzeRouter.post("/image", upload.single("image"), analyzeImage);

module.exports = analyzeRouter;
