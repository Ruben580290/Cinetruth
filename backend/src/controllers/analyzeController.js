import OpenAI from "openai";
import {
  TEXT_SYSTEM_INSTRUCTIONS,
  IMAGE_SYSTEM_INSTRUCTIONS,
  SIMILAR_CASES_SYSTEM_INSTRUCTIONS,
  OPENAI_JSON_SCHEMA_RESPONSE_FORMAT,
} from "../config/aiPromptConfig.js";
import { insertAnalysisQuery } from "../repositories/analysisQueryRepository.js";

/**

 * INTERRUPTOR DE "CASOS SIMILARES"
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
const