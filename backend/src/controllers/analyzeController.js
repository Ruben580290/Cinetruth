import OpenAI from "openai";
import {
  TEXT_SYSTEM_INSTRUCTIONS,
  IMAGE_SYSTEM_INSTRUCTIONS,
  SIMILAR_CASES_SYSTEM_INSTRUCTIONS,
  OPENAI_JSON_SCHEMA_RESPONSE_FORMAT,
} from "../config/aiPromptConfig.js";
import { insertAnalysisQuery } from "../repositories/analysisQueryRepository.js";

/**
 * ---------------------------------------------------------------------
 * INTERRUPTOR DE "CASOS SIMILARES"
 * ---------------------------------------------------------------------
 * Por ahora esta funcion queda DESACTIVADA (decision tomada: cuidar el
 * consumo de la cuenta de OpenAI de $5 y no depender de otra llamada
 * extra con web search por cada analisis).
 *
 * Para reactivarla en el futuro:
 *   1. Cambia SIMILAR_CASES_ENABLED a true.
 *   2. Usa un modelo que soporte la tool "web_search" en la Responses API
 *      (gpt-4o-mini NO la soporta). Puedes fijarlo con la variable de
 *      entorno OPENAI_SIMILAR_CASES_MODEL, por ejemplo "gpt-4.1-mini".
 *   3. Ya esta implementada mas abajo (findSimilarCases) y conectada en
 *      analyzeText/analyzeImage: solo se llama si SIMILAR_CASES_ENABLED
 *      es true.
 */
const SIMILAR_CASES_ENABLED = false;

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

/** Modelo usado para el analisis principal (texto e imagen). */
const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Modelo usado solo para casos similares (necesita soportar web_search). */
const SIMILAR_CASES_MODEL = () =>
  process.env.OPENAI_SIMILAR_CASES_MODEL || "gpt-4.1-mini";

/** Mismo limite que el textarea del frontend y que el CHECK de la base. */
const MAX_TEXT_LENGTH = 5000;

/**
 * Extrae el primer objeto JSON valido de un texto, por si el modelo
 * agrego backticks o texto extra a pesar de las instrucciones.
 * (Se usa solo para casos similares; el analisis principal ya viene
 * garantizado en JSON gracias a Structured Outputs).
 */
const extractJsonObject = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

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
 * Llama al modelo principal y devuelve el objeto ya parseado, validando
 * que no haya venido un "refusal" (rechazo del modelo) en su lugar.
 * @param {Array<object>} messages - mensajes estilo chat.completions
 */
const runStructuredAnalysis = async (messages) => {
  const openai = getOpenAIClient();

  const completion = await withRetry(() =>
    openai.chat.completions.create({
      model: MODEL(),
      messages,
      response_format: OPENAI_JSON_SCHEMA_RESPONSE_FORMAT,
    }),
  );

  const choice = completion.choices?.[0];
  const message = choice?.message;

  if (message?.refusal) {
    throw new Error(`El modelo rechazo el analisis: ${message.refusal}`);
  }

  if (!message?.content) {
    throw new Error("El modelo no devolvio contenido para analizar.");
  }

  return JSON.parse(message.content);
};

/**
 * Busca en internet, via el web search de OpenAI (Responses API), casos
 * parecidos al analisis principal (mismo patron de rumor/imagen fabricada
 * con IA). No debe romper el analisis principal si falla: siempre se llama
 * dentro de un try/catch en analyzeText/analyzeImage, y solo si
 * SIMILAR_CASES_ENABLED es true.
 *
 * @param {string} caseBasis - resumen en texto plano del caso ya analizado
 */
const findSimilarCases = async (caseBasis) => {
  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: SIMILAR_CASES_MODEL(),
    instructions: SIMILAR_CASES_SYSTEM_INSTRUCTIONS,
    input: `Caso ya analizado por Cine Truth:\n"""${caseBasis}"""\n\nBusca casos parecidos en internet siguiendo tus instrucciones.`,
    tools: [{ type: "web_search" }],
  });

  const parsed = extractJsonObject(response.output_text);
  const rawCases = Array.isArray(parsed?.cases) ? parsed.cases : [];

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

  return { cases };
};

/**
 * Registra la consulta analizada en la tabla analysis_queries (la que
 * lee /api/history). Se guarda SIEMPRE, con o sin usuario autenticado
 * (userId puede ser null: consulta anonima). Si falla el guardado no se
 * interrumpe la respuesta al usuario.
 *
 * @param {number|null} userId - id del usuario o null si es anonimo
 * @param {"text"|"image"} inputType
 * @param {object} inputInfo - { inputText } para texto, o
 *   { fileName, mimeType, fileSizeBytes } para imagen
 * @param {object} result - resultado completo devuelto al frontend
 */
const saveAnalysisQuery = async (userId, inputType, inputInfo, result) => {
  try {
    await insertAnalysisQuery({
      userId: userId ?? null,
      inputType,
      inputText: inputInfo.inputText ?? null,
      fileName: inputInfo.fileName ?? null,
      mimeType: inputInfo.mimeType ?? null,
      fileSizeBytes: inputInfo.fileSizeBytes ?? null,
      verdict: result.verdict,
      suspicionScore: result.suspicionScore,
      semaphoreColor: result.semaphore?.color,
      summary: result.summary,
      resultData: result,
    });
  } catch (saveError) {
    console.error(
      "Error al guardar la consulta en el historial (analysis_queries):",
      saveError,
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

    const result = await runStructuredAnalysis([
      { role: "system", content: TEXT_SYSTEM_INSTRUCTIONS },
      { role: "user", content: `Texto a analizar:\n"""${text.trim()}"""` },
    ]);

    let similarCases = [];
    if (SIMILAR_CASES_ENABLED) {
      try {
        const caseBasis = `Texto original: "${text.trim()}"\nVeredicto: ${result.verdict}\nResumen: ${result.summary}`;
        const similar = await findSimilarCases(caseBasis);
        similarCases = similar.cases;
      } catch (similarError) {
        console.error("Error al buscar casos similares (texto):", similarError);
      }
    }

    const fullResult = {
      type: "text",
      input: text.trim(),
      ...result,
      similarCases,
    };

    await saveAnalysisQuery(
      req.user?.sub ?? null,
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

    const base64Data = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    const result = await runStructuredAnalysis([
      { role: "system", content: IMAGE_SYSTEM_INSTRUCTIONS },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analiza esta imagen en busca de senales tecnicas de manipulacion o generacion por IA.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      },
    ]);

    let similarCases = [];
    if (SIMILAR_CASES_ENABLED) {
      try {
        const flagsText = Array.isArray(result.flags)
          ? result.flags.map((f) => `${f.label}: ${f.detail}`).join("; ")
          : "";
        const caseBasis = `Analisis de imagen de farandula.\nVeredicto: ${result.verdict}\nResumen: ${result.summary}\nSenales detectadas: ${flagsText}`;
        const similar = await findSimilarCases(caseBasis);
        similarCases = similar.cases;
      } catch (similarError) {
        console.error(
          "Error al buscar casos similares (imagen):",
          similarError,
        );
      }
    }

    const fullResult = {
      type: "image",
      fileName: req.file.originalname,
      ...result,
      similarCases,
    };

    await saveAnalysisQuery(
      req.user?.sub ?? null,
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
