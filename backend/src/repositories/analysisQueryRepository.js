import AppDataSource from "../config/database.js";

/**
 * Repositorio de la tabla analysis_queries.
 * Todas las consultas usan queries parametrizadas ($1, $2, ...),
 * nunca se concatenan valores dentro del SQL.
 */

/** Columnas que devolvemos siempre, para no repetirlas en cada query. */
const SELECT_COLUMNS = `
  q.id,
  q."userId",
  u.email AS "userEmail",
  q."inputType",
  q."inputText",
  q."fileName",
  q."mimeType",
  q."fileSizeBytes",
  q.verdict,
  q."suspicionScore",
  q."semaphoreColor",
  q.summary,
  q."resultData",
  q."reviewStatus",
  q."reviewNote",
  q."reviewedSimilarCases",
  q."createdAt",
  q."updatedAt"
`;

/** Convierte el puntaje de la IA en un entero seguro entre 0 y 100. */
const toScore = (value) => {
  const number = Math.round(Number(value));
  if (Number.isNaN(number)) return 0;
  if (number < 0) return 0;
  if (number > 100) return 100;
  return number;
};

/**
 * Arma la clausula WHERE y el arreglo de parametros segun los filtros
 * recibidos. Cada valor entra como parametro numerado, nunca como texto.
 */
const buildFilters = (filters) => {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`q."userId" = $${params.length}`);
  }

  if (filters.verdict) {
    params.push(filters.verdict);
    conditions.push(`q.verdict = $${params.length}`);
  }

  if (filters.inputType) {
    params.push(filters.inputType);
    conditions.push(`q."inputType" = $${params.length}`);
  }

  if (filters.reviewStatus) {
    params.push(filters.reviewStatus);
    conditions.push(`q."reviewStatus" = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`q."createdAt" >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`q."createdAt" <= $${params.length}`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { where, params };
};

/**
 * Inserta una consulta analizada en el historico.
 * @param {object} data - datos de la consulta y su resultado
 */
const insertAnalysisQuery = async (data) => {
  const sql = `
    INSERT INTO analysis_queries (
      "userId", "inputType", "inputText", "fileName", "mimeType", "fileSizeBytes",
      verdict, "suspicionScore", "semaphoreColor", summary, "resultData"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, "userId", "inputType", verdict, "suspicionScore",
              "semaphoreColor", "reviewStatus", "createdAt";
  `;

  const params = [
    data.userId ?? null,
    data.inputType,
    data.inputText ?? null,
    data.fileName ?? null,
    data.mimeType ?? null,
    data.fileSizeBytes ?? null,
    data.verdict,
    toScore(data.suspicionScore),
    data.semaphoreColor ?? null,
    data.summary,
    JSON.stringify(data.resultData ?? {}),
  ];

  const rows = await AppDataSource.query(sql, params);
  return rows[0];
};

/**
 * Lista consultas analizadas segun los filtros recibidos.
 * @param {object} filters - userId, verdict, inputType, reviewStatus, from, to, limit, offset
 */
const findAnalysisQueries = async (filters = {}) => {
  const { where, params } = buildFilters(filters);

  params.push(filters.limit ?? 50);
  const limitIndex = params.length;

  params.push(filters.offset ?? 0);
  const offsetIndex = params.length;

  const sql = `
    SELECT ${SELECT_COLUMNS}
    FROM analysis_queries q
    LEFT JOIN users u ON u.id = q."userId"
    ${where}
    ORDER BY q."createdAt" DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  return AppDataSource.query(sql, params);
};

/** Cuenta el total de consultas que cumplen los mismos filtros. */
const countAnalysisQueries = async (filters = {}) => {
  const { where, params } = buildFilters(filters);

  const sql = `
    SELECT COUNT(*)::int AS total
    FROM analysis_queries q
    ${where};
  `;

  const rows = await AppDataSource.query(sql, params);
  return rows[0].total;
};

/** Devuelve una consulta por su id, o null si no existe. */
const findAnalysisQueryById = async (id) => {
  const sql = `
    SELECT ${SELECT_COLUMNS}
    FROM analysis_queries q
    LEFT JOIN users u ON u.id = q."userId"
    WHERE q.id = $1;
  `;

  const rows = await AppDataSource.query(sql, [id]);
  return rows[0] || null;
};

/**
 * Actualiza solo el estado de revision y la nota del administrador.
 * El resto de campos son inmutables (lo protege un trigger en la base).
 */
const updateAnalysisQueryReview = async (id, reviewStatus, reviewNote) => {
  const sql = `
    UPDATE analysis_queries
    SET "reviewStatus" = $1,
        "reviewNote" = $2
    WHERE id = $3
    RETURNING id, "reviewStatus", "reviewNote", "updatedAt";
  `;

  const rows = await AppDataSource.query(sql, [
    reviewStatus,
    reviewNote ?? null,
    id,
  ]);

  return rows[0] || null;
};

/**
 * Elimina un analisis del historial. Solo borra si el registro
 * pertenece al usuario indicado (la comparacion de dueño va en el WHERE,
 * ademas de la validacion previa en el controlador).
 */
const deleteAnalysisQuery = async (id, userId) => {
  const sql = `
    DELETE FROM analysis_queries
    WHERE id = $1 AND "userId" = $2
    RETURNING id;
  `;

  const rows = await AppDataSource.query(sql, [id, userId]);
  return rows[0] || null;
};

/**
 * Marca o desmarca un caso similar (por su indice dentro de
 * resultData.similarCases) como revisado. Solo actua si el registro
 * pertenece al usuario indicado. Es atomico: no hay lectura+escritura
 * separadas, todo pasa en un solo UPDATE.
 */
const updateSimilarCaseReview = async (id, userId, caseIndex, reviewed) => {
  const sql = reviewed
    ? `
      UPDATE analysis_queries
      SET "reviewedSimilarCases" = (
        SELECT jsonb_agg(DISTINCT elem)
        FROM jsonb_array_elements(
          "reviewedSimilarCases" || to_jsonb($3::int)
        ) AS elem
      )
      WHERE id = $1 AND "userId" = $2
      RETURNING id, "reviewedSimilarCases";
    `
    : `
      UPDATE analysis_queries
      SET "reviewedSimilarCases" = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements("reviewedSimilarCases") AS elem
        WHERE elem <> to_jsonb($3::int)
      )
      WHERE id = $1 AND "userId" = $2
      RETURNING id, "reviewedSimilarCases";
    `;

  const rows = await AppDataSource.query(sql, [id, userId, caseIndex]);
  return rows[0] || null;
};

export {
  insertAnalysisQuery,
  findAnalysisQueries,
  countAnalysisQueries,
  findAnalysisQueryById,
  updateAnalysisQueryReview,
  deleteAnalysisQuery,
  updateSimilarCaseReview,
};
