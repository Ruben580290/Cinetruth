import AppDataSource from "../config/database.js";
import AnalysisSchema from "../models/AnalysisSchema.js";

const VALID_VERDICTS = ["VERIFICADO", "SOSPECHOSO", "FABRICADO"];

/**
 * GET /api/history
 * query: ?from=YYYY-MM-DD&to=YYYY-MM-DD&verdict=VERIFICADO|SOSPECHOSO|FABRICADO
 * Requiere usuario autenticado (authMiddleware).
 */
const getHistory = async (req, res) => {
  try {
    const { from, to, verdict } = req.query;

    if (verdict && !VALID_VERDICTS.includes(verdict)) {
      return res.status(400).json({
        error: `El filtro 'verdict' debe ser uno de: ${VALID_VERDICTS.join(", ")}`,
      });
    }

    const analysisRepository = AppDataSource.getRepository(AnalysisSchema);
    const query = analysisRepository
      .createQueryBuilder("analysis")
      .where("analysis.userId = :userId", { userId: req.user.sub })
      .orderBy("analysis.createdAt", "DESC");

    if (from) {
      query.andWhere("analysis.createdAt >= :from", { from });
    }

    if (to) {
      query.andWhere("analysis.createdAt <= :to", { to });
    }

    if (verdict) {
      query.andWhere("analysis.verdict = :verdict", { verdict });
    }

    const history = await query.getMany();

    return res.json({ data: history, count: history.length });
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    return res.status(500).json({
      error: "No se pudo obtener el historial de analisis.",
      details: error.message,
    });
  }
};

export { getHistory };
