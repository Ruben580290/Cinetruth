import {
  findAnalysisQueries,
  countAnalysisQueries,
  findAnalysisQueryById,
  updateAnalysisQueryReview,
} from "../repositories/analysisQueryRepository.js";

const VALID_VERDICTS = ["VERIFICADO", "SOSPECHOSO", "FABRICADO"];
const VALID_INPUT_TYPES = ["text", "image"];
const VALID_REVIEW_STATUS = ["SIN_REVISAR", "REVISADO", "DESCARTADO"];

/** Si el usuario manda solo la fecha (YYYY-MM-DD), incluimos todo el dia. */
const normalizeToDate = (value) => {
  if (!value) return null;
  return value.length === 10 ? `${value} 23:59:59` : value;
};

/**
 * Valida los filtros que llegan por query string.
 * Devuelve { error } si algo esta mal, o { filters } si todo esta bien.
 */
const readFilters = (query) => {
  const { from, to, verdict, inputType, reviewStatus, limit, offset } = query;

  if (verdict && !VALID_VERDICTS.includes(verdict)) {
    return {
      error: `El filtro 'verdict' debe ser: ${VALID_VERDICTS.join(", ")}`,
    };
  }

  if (inputType && !VALID_INPUT_TYPES.includes(inputType)) {
    return {
      error: `El filtro 'inputType' debe ser: ${VALID_INPUT_TYPES.join(", ")}`,
    };
  }

  if (reviewStatus && !VALID_REVIEW_STATUS.includes(reviewStatus)) {
    return {
      error: `El filtro 'reviewStatus' debe ser: ${VALID_REVIEW_STATUS.join(", ")}`,
    };
  }

  const parsedLimit = limit ? Number(limit) : 50;
  const parsedOffset = offset ? Number(offset) : 0;

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return { error: "El parametro 'limit' debe ser un entero entre 1 y 100." };
  }

  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    return {
      error: "El parametro 'offset' debe ser un entero mayor o igual a 0.",
    };
  }

  return {
    filters: {
      from: from || null,
      to: normalizeToDate(to),
      verdict: verdict || null,
      inputType: inputType || null,
      reviewStatus: reviewStatus || null,
      limit: parsedLimit,
      offset: parsedOffset,
    },
  };
};

/**
 * GET /api/history
 * Historial del usuario autenticado.
 */
const getHistory = async (req, res) => {
  try {
    const { error, filters } = readFilters(req.query);
    if (error) return res.status(400).json({ error });

    filters.userId = req.user.sub;

    const data = await findAnalysisQueries(filters);
    const total = await countAnalysisQueries(filters);

    return res.json({ data, count: data.length, total });
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    return res.status(500).json({
      error: "No se pudo obtener el historial de analisis.",
      details: error.message,
    });
  }
};

/**
 * GET /api/history/admin
 * Historial completo de la aplicacion. Solo administradores.
 */
const getAllHistory = async (req, res) => {
  try {
    const { error, filters } = readFilters(req.query);
    if (error) return res.status(400).json({ error });

    if (req.query.userId) {
      const userId = Number(req.query.userId);
      if (!Number.isInteger(userId) || userId < 1) {
        return res
          .status(400)
          .json({ error: "El parametro 'userId' no es valido." });
      }
      filters.userId = userId;
    }

    const data = await findAnalysisQueries(filters);
    const total = await countAnalysisQueries(filters);

    return res.json({ data, count: data.length, total });
  } catch (error) {
    console.error("Error al obtener el historial completo:", error);
    return res.status(500).json({
      error: "No se pudo obtener el historial de analisis.",
      details: error.message,
    });
  }
};

/**
 * GET /api/history/:id
 * Un registro puntual. El usuario solo ve los suyos, el admin ve todos.
 */
const getHistoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res
        .status(400)
        .json({ error: "El id debe ser un numero entero valido." });
    }

    const record = await findAnalysisQueryById(id);
    if (!record) {
      return res
        .status(404)
        .json({ error: "No existe esa consulta en el historial." });
    }

    const isOwner = record.userId === req.user.sub;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para ver esta consulta." });
    }

    return res.json({ data: record });
  } catch (error) {
    console.error("Error al obtener la consulta:", error);
    return res.status(500).json({
      error: "No se pudo obtener la consulta.",
      details: error.message,
    });
  }
};

/**
 * PATCH /api/history/:id/review
 * Marca una consulta como revisada o descartada. Solo administradores.
 * body: { reviewStatus: "REVISADO", reviewNote: "texto opcional" }
 */
const updateHistoryReview = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res
        .status(400)
        .json({ error: "El id debe ser un numero entero valido." });
    }

    const { reviewStatus, reviewNote } = req.body || {};

    if (!reviewStatus || !VALID_REVIEW_STATUS.includes(reviewStatus)) {
      return res.status(400).json({
        error: `El campo 'reviewStatus' es obligatorio y debe ser: ${VALID_REVIEW_STATUS.join(", ")}`,
      });
    }

    if (reviewNote !== undefined && reviewNote !== null) {
      if (typeof reviewNote !== "string" || reviewNote.length > 500) {
        return res.status(400).json({
          error:
            "El campo 'reviewNote' debe ser texto de maximo 500 caracteres.",
        });
      }
    }

    const updated = await updateAnalysisQueryReview(
      id,
      reviewStatus,
      reviewNote ? reviewNote.trim() : null,
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: "No existe esa consulta en el historial." });
    }

    return res.json({ data: updated, message: "Registro actualizado." });
  } catch (error) {
    console.error("Error al actualizar la consulta:", error);
    return res.status(500).json({
      error: "No se pudo actualizar la consulta.",
      details: error.message,
    });
  }
};

export { getHistory, getAllHistory, getHistoryById, updateHistoryReview };
