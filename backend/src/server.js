import express from "express";
import cors from "cors";
import "dotenv/config";

import analyzeRouter from "./routes/analyzeRoutes.js";
import logger from "./middleware/loggerMiddleware.js";
import authRouter from "./routes/authRoutes.js";
import AppDataSource from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/api/auth", authRouter);

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

AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos conectada");
  })
  .catch((error) => {
    console.error("No se pudo conectar a la base de datos:", error.message);
    console.error(
      "El servidor sigue arrancando: /api/analyze funciona igual, /api/auth respondera error hasta que la base de datos este disponible.",
    );
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Cine Truth backend corriendo en http://localhost:${PORT}`);
    });
  });
