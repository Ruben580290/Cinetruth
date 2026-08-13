import OpenAI from "openai";
import {
  TEXT_SYSTEM_INSTRUCTIONS,
  IMAGE_SYSTEM_INSTRUCTIONS,
  RESPONSE_SCHEMA,
} from "../config/aiPromptConfig.js";
import AppDataSource from "../config/database.js";
import AnalysisSchema from "../models/AnalysisSchema.js";

let openaiClient = null;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no esta configurada en el .env");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Reintenta una llamada a OpenAI cuando falla por un error temporal
 * (rafaga de peticiones, servidor ocupado). NO reintenta si el error
 * es por cuota agotada u otro error permanente.
 */
const withRetry = async (fn, { retries = 3, baseDelayMs = 1500 } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const status = error?.status;
      const isRetryable = status === 429 || status === 503 || status === 500;

      if (!isRetryable || attempt === retries) {
        throw error;
      }

      const delay = baseDelayMs * 2 ** attempt;
      console.warn(
        `OpenAI fallo (intento ${attempt + 1}/${retries + 1}), reintentando en ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Guarda el analisis en el historial, asociado al usuario autenticado.
 * Si no hay usuario (peticion sin token), no guarda nada y no interrumpe
 * la respuesta del analisis.
 */
const saveAnalysis = async (userId, type, result) => {
  if (!userId) return;
  try {
    const analysisRepository = AppDataSource.getRepository(AnalysisSchema);
    const analysis = analysisRepository.create({
      type,
      verdict: result.verdict,
      suspicionScore: result.suspicionScore,
      summary: result.summary,
      resultData: result,
      user: { id: userId },
    });
    await analysisRepository.save(analysis);
  } catch (saveError) {
    console.error("Error al guardar el analisis en el historial:", saveError);
  }
};

/**
 * POST /api/analyze/text
 * body: { text: string }
 */
const analyzeText = async (req, res) => {
  try {
    const { text } = req.body || {};

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "Debes enviar el campo 'text' con contenido a analizar.",
      });
    }

    const openai = getOpenAIClient();

    const completion = await withRetry(() =>
      openai.chat.completions.create({
        model: MODEL(),
        messages: [
          { role: "system", content: TEXT_SYSTEM_INSTRUCTIONS },
          { role: "user", content: `Texto a analizar:\n"""${text.trim()}"""` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cine_truth_analysis",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    );

    const result = JSON.parse(completion.choices[0].message.content);

    const fullResult = {
      type: "text",
      input: text.trim(),
      ...result,
      similarCases: [],
    };
    await saveAnalysis(req.user?.sub, "text", fullResult);

    return res.json(fullResult);
  } catch (error) {
    console.error("Error al analizar texto:", error);
    return res.status(500).json({
      error: "No se pudo completar el analisis de texto.",
      details: error.message,
    });
  }
};

/**
 * POST /api/analyze/image
 * multipart/form-data con campo "image"
 */
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Debes subir una imagen en el campo 'image'.",
      });
    }

    const openai = getOpenAIClient();
    const base64Data = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    const completion = await withRetry(() =>
      openai.chat.completions.create({
        model: MODEL(),
        messages: [
          { role: "system", content: IMAGE_SYSTEM_INSTRUCTIONS },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analiza esta imagen en busca de señales tecnicas de manipulacion o generacion por IA.",
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cine_truth_analysis",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    );

    const result = JSON.parse(completion.choices[0].message.content);

    const fullResult = {
      type: "image",
      fileName: req.file.originalname,
      ...result,
      similarCases: [],
    };
    await saveAnalysis(req.user?.sub, "image", fullResult);

    return res.json(fullResult);
  } catch (error) {
    console.error("Error al analizar imagen:", error);
    return res.status(500).json({
      error: "No se pudo completar el analisis de imagen.",
      details: error.message,
    });
  }
};

export { analyzeText, analyzeImage };
