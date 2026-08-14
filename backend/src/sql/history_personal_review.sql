-- ===========================================================================
-- Gestión del historial personal
-- - Columna para llevar el estado de revisión de "casos similares"
--   (se guarda aparte de resultData para no violar el trigger de
--   inmutabilidad fn_analysis_queries_protect, que protege el resultado
--   original de la IA).
-- - Permiso DELETE para que el usuario pueda borrar sus propios registros.
-- ===========================================================================

ALTER TABLE analysis_queries
  ADD COLUMN IF NOT EXISTS "reviewedSimilarCases" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE analysis_queries
  ADD CONSTRAINT chk_aq_reviewed_similar_cases
    CHECK (jsonb_typeof("reviewedSimilarCases") = 'array');

GRANT DELETE ON analysis_queries TO cinetruth_app;