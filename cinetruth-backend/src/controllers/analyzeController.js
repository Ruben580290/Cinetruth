import { GoogleGenAI } from "@google/genai";
import {
  TEXT_SYSTEM_INSTRUCTIONS,
  IMAGE_SYSTEM_INSTRUCTIONS,
  SIMILAR_CASES_SYSTEM_INSTRUCTIONS,
  RESPONSE_SCHEMA,
} from "../config/aiPromptConfig.js";

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
      sourceName: item.sourceName ? String(item.sourceName).trim() : "Fuente web",
      sourceUrl: String(item.sourceUrl).trim(),
      likelyFake: ["SI", "PROBABLE", "INCIERTO"].includes(item.likelyFake)
        ? item.likelyFake
        : "INCIERTO",
      whyRelevant: item.whyRelevant ? String(item.whyRelevant).trim() : "",
    }));

  return { cases, groundedSources };
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

    return res.json({ type: "text", input: text.trim(), ...result, similarCases });
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
              text: "Analiza esta imagen en busca de señales tecnicas de manipulacion o generacion por IA.",
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
      const caseBasis = `Analisis de imagen de farandula.\nVeredicto: ${result.verdict}\nResumen: ${result.summary}\nSeñales detectadas: ${flagsText}`;
      const similar = await findSimilarCases(caseBasis);
      similarCases = similar.cases;
    } catch (similarError) {
      console.error("Error al buscar casos similares (imagen):", similarError);
    }

    return res.json({
      type: "image",
      fileName: req.file.originalname,
      ...result,
      similarCases,
    });
  } catch (error) {
    console.error("Error al analizar imagen:", error);
    return res.status(500).json({
      error: "No se pudo completar el analisis de imagen.",
      details: error.message,
    });
  }
};

export { analyzeText, analyzeImage };
