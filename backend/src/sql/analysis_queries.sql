-- ===========================================================================
-- Cine Truth - Registro de consultas analizadas (historico confiable)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS analysis_queries (
  id SERIAL PRIMARY KEY,

  -- Usuario que hizo la consulta. NULL = consulta anonima (sin login).
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Datos de entrada de la consulta
  "inputType"     VARCHAR(10)  NOT NULL,
  "inputText"     TEXT,
  "fileName"      VARCHAR(255),
  "mimeType"      VARCHAR(50),
  "fileSizeBytes" INTEGER,

  -- Resultado devuelto por la IA
  verdict          VARCHAR(20) NOT NULL,
  "suspicionScore" SMALLINT    NOT NULL,
  "semaphoreColor" VARCHAR(10),
  summary          TEXT        NOT NULL,
  "resultData"     JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- Revision administrativa
  "reviewStatus" VARCHAR(15) NOT NULL DEFAULT 'SIN_REVISAR',
  "reviewNote"   TEXT,

  -- Fechas
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_aq_input_type
    CHECK ("inputType" IN ('text', 'image')),

  CONSTRAINT chk_aq_verdict
    CHECK (verdict IN ('VERIFICADO', 'SOSPECHOSO', 'FABRICADO')),

  CONSTRAINT chk_aq_score
    CHECK ("suspicionScore" BETWEEN 0 AND 100),

  CONSTRAINT chk_aq_semaphore
    CHECK ("semaphoreColor" IN ('GREEN', 'YELLOW', 'RED')),

  CONSTRAINT chk_aq_summary_required
    CHECK (char_length(btrim(summary)) > 0),

  CONSTRAINT chk_aq_review_status
    CHECK ("reviewStatus" IN ('SIN_REVISAR', 'REVISADO', 'DESCARTADO')),

  CONSTRAINT chk_aq_text_payload CHECK (
    "inputType" <> 'text'
    OR (
      "inputText" IS NOT NULL
      AND char_length(btrim("inputText")) BETWEEN 1 AND 5000
    )
  ),

  CONSTRAINT chk_aq_image_payload CHECK (
    "inputType" <> 'image'
    OR (
      "fileName" IS NOT NULL
      AND "mimeType" IN ('image/jpeg', 'image/jpg', 'image/png')
      AND "fileSizeBytes" BETWEEN 1 AND 5242880
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_aq_user_created
  ON analysis_queries ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_aq_created
  ON analysis_queries ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_aq_verdict
  ON analysis_queries (verdict);

-- ---------------------------------------------------------------------------
-- Trigger 1: normaliza los datos y completa el semaforo antes de guardar
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_analysis_queries_normalize()
RETURNS TRIGGER AS $$
BEGIN
  NEW."inputType"    := lower(btrim(NEW."inputType"));
  NEW.verdict        := upper(btrim(NEW.verdict));
  NEW."reviewStatus" := upper(btrim(NEW."reviewStatus"));
  NEW.summary        := btrim(NEW.summary);
  NEW."mimeType"     := lower(btrim(NEW."mimeType"));

  IF NEW."inputText" IS NOT NULL THEN
    NEW."inputText" := btrim(NEW."inputText");
  END IF;

  IF NEW."semaphoreColor" IS NULL THEN
    IF NEW."suspicionScore" <= 25 THEN
      NEW."semaphoreColor" := 'GREEN';
    ELSIF NEW."suspicionScore" <= 60 THEN
      NEW."semaphoreColor" := 'YELLOW';
    ELSE
      NEW."semaphoreColor" := 'RED';
    END IF;
  ELSE
    NEW."semaphoreColor" := upper(btrim(NEW."semaphoreColor"));
  END IF;

  IF NEW."inputType" = 'text' THEN
    NEW."fileName"      := NULL;
    NEW."mimeType"      := NULL;
    NEW."fileSizeBytes" := NULL;
  ELSIF NEW."inputType" = 'image' THEN
    NEW."inputText" := NULL;
  END IF;

  NEW."updatedAt" := CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analysis_queries_normalize ON analysis_queries;
CREATE TRIGGER trg_analysis_queries_normalize
BEFORE INSERT OR UPDATE ON analysis_queries
FOR EACH ROW
EXECUTE FUNCTION fn_analysis_queries_normalize();

-- ---------------------------------------------------------------------------
-- Trigger 2: el historico es inmutable, solo se puede editar la revision
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_analysis_queries_protect()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."userId"         IS DISTINCT FROM OLD."userId"
     OR NEW."inputType"      <> OLD."inputType"
     OR NEW.verdict          <> OLD.verdict
     OR NEW."suspicionScore" <> OLD."suspicionScore"
     OR NEW.summary          <> OLD.summary
     OR NEW."resultData"     <> OLD."resultData"
     OR NEW."createdAt"      <> OLD."createdAt" THEN
    RAISE EXCEPTION
      'El historico es inmutable: solo se pueden actualizar reviewStatus y reviewNote.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analysis_queries_protect ON analysis_queries;
CREATE TRIGGER trg_analysis_queries_protect
BEFORE UPDATE ON analysis_queries
FOR EACH ROW
EXECUTE FUNCTION fn_analysis_queries_protect();

-- ---------------------------------------------------------------------------
-- Permisos para el usuario de la aplicacion (mismo criterio de roles.sql)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON analysis_queries TO cinetruth_app;
GRANT USAGE, SELECT ON SEQUENCE analysis_queries_id_seq TO cinetruth_app;