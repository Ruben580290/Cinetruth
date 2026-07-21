const express = require("express");
const cors = require("cors");
require("dotenv").config();

const analyzeRouter = require("./routes/analyze.routes");
const logger = require("./middleware/logger.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

const PORT = process.env.PORT || 5006;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "cinetruth-backend" });
});

app.use("/api/analyze", analyzeRouter);

// Manejo de errores de multer (ej: imagen muy pesada o tipo invalido)
app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Cine Truth backend corriendo en http://localhost:${PORT}`);
});
