import { GoogleGenAI } from "@google/genai";
import {
  TEXT_SYSTEM_INSTRUCTIONS,
  IMAGE_SYSTEM_INSTRUCTIONS,
  SIMILAR_CASES_SYSTEM_INSTRUCTIONS,
  RESPONSE_SCHEMA,
} from "../config/aiPromptConfig.js";
import { insertAnalysisQuery } from "../repositories/analysisQueryRepository.js";

let geminiClient = null;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no esta configurada en el .env");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
};

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash";

/** Mismo limite que el textarea del frontend y que el CHECK de la base. */
const MAX_TEXT_LENGTH = 5000;

/**
 * Extrae el primer objeto JSON valido de un texto, por si el modelo
 * agrego backticks o texto extra a pesar de las instrucciones.
 */
const extractJsonObject = (rawText) => {
  const cleaned = (rawText || "").replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("La respuesta de casos similares no trae JSON valido.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

/**
 * Busca en internet, via Google Search grounding, casos parecidos al
 * analisis principal (mismo patron de rumor/imagen fabricada con IA).
 * No debe romper el analisis principal si falla: siempre se llama
 * dentro de un try/catch en analyzeText/analyzeImage.
 *
 * @param {string} caseBasis - resumen en texto plano del caso ya analizado
 */
const findSimilarCases = async (caseBasis) => {
  const gemini = getGeminiClient();

  const response = await gemini.models.generateContent({
    model: MODEL(),
    contents: `Caso ya analizado por Cine Truth:\n"""${caseBasis}"""\n\nBusca casos parecidos en internet siguiendo tus instrucciones.`,
    config: {
      systemInstruction: SIMILAR_CASES_SYSTEM_INSTRUCTIONS,
      tools: [{ googleSearch: {} }],
    },
  });

  const parsed = extractJsonObject(response.text);
  const rawCases = Array.isArray(parsed?.cases) ? parsed.cases : [];

  // Fuentes reales que Google Search efectivamente uso para fundamentar
  // la respuesta (grounding). Sirven para rellenar/verificar URLs.
  const groundedSources = (
    response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  )
    .map((chunk) => chunk?.web)
    .filter((web) => web?.uri);

  const cases = rawCases
    .filter((item) => item && item.title && item.sourceUrl)
    .slice(0, 4)
    .map((item) => ({
      title: String(item.title).trim(),
      sourceName: item.sourceName
        ? String(item.sourceName).trim()
        : "Fuente web",
      sourceUrl: String(item.sourceUrl).trim(),
      likelyFake: ["SI", "PROBABLE", "INCIERTO"].includes(item.likelyFake)
        ? item.likelyFake
        : "INCIERTO",
      whyRelevant: item.whyRelevant ? String(item.whyRelevant).trim() : "",
    }));

  return { cases, groundedSources };
};

/**
 * Registra la consulta analizada en la tabla analysis_queries.
 * Se guarda SIEMPRE, con o sin usuario autenticado (userId puede ser null).
 * Si falla el guardado no se interrumpe la respuesta al usuario.
 *
 * @param {number|null} userId - id del usuario o null si es anonimo
 * @param {string} inputType - "text" o "image"
 * @param {object} inputInfo - datos de entrada (texto o archivo)
 * @param {object} result - resultado completo devuelto al frontend
 */
const saveAnalysisQuery = async (userId, inputType, inputInfo, result) => {
  try {
    await insertAnalysisQuery({
      userId: userId || null,
      inputType,
      inputText: inputInfo.inputText || null,
      fileName: inputInfo.fileName || null,
      mimeType: inputInfo.mimeType || null,
      fileSizeBytes: inputInfo.fileSizeBytes || null,
      verdict: result.verdict,
      suspicionScore: result.suspicionScore,
      semaphoreColor: result.semaphore ? result.semaphore.color : null,
      summary: result.summary,
      resultData: result,
    });
  } catch (saveError) {
    console.error(
      "Error al registrar la consulta analizada:",
      saveError.message,
    );
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

    if (text.trim().length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        error: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres.`,
      });
    }

    const gemini = getGeminiClient();

    const response = await gemini.models.generateContent({
      model: MODEL(),
      contents: `Texto a analizar:\n"""${text.trim()}"""`,
      config: {
        systemInstruction: TEXT_SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });

    const result = JSON.parse(response.text);

    let similarCases = [];
    try {
      const caseBasis = `Texto original: "${text.trim()}"\nVeredicto: ${result.verdict}\nResumen: ${result.summary}`;
      const similar = await findSimilarCases(caseBasis);
      similarCases = similar.cases;
    } catch (similarError) {
      console.error("Error al buscar casos similares (texto):", similarError);
    }

    const fullResult = {
      type: "text",
      input: text.trim(),
      ...result,
      similarCases,
    };
    await saveAnalysisQuery(
      req.user?.sub,
      "text",
      { inputText: text.trim() },
      fullResult,
    );

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

    const gemini = getGeminiClient();
    const base64Data = req.file.buffer.toString("base64");

    const response = await gemini.models.generateContent({
      model: MODEL(),
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Analiza esta imagen en busca de senales tecnicas de manipulacion o generacion por IA.",
            },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: IMAGE_SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });

    const result = JSON.parse(response.text);

    let similarCases = [];
    try {
      const flagsText = Array.isArray(result.flags)
        ? result.flags.map((f) => `${f.label}: ${f.detail}`).join("; ")
        : "";
      const caseBasis = `Analisis de imagen de farandula.\nVeredicto: ${result.verdict}\nResumen: ${result.summary}\nSenales detectadas: ${flagsText}`;
      const similar = await findSimilarCases(caseBasis);
      similarCases = similar.cases;
    } catch (similarError) {
      console.error("Error al buscar casos similares (imagen):", similarError);
    }

    const fullResult = {
      type: "image",
      fileName: req.file.originalname,
      ...result,
      similarCases,
    };
    await saveAnalysisQuery(
      req.user?.sub,
      "image",
      {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSizeBytes: req.file.size,
      },
      fullResult,
    );

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
