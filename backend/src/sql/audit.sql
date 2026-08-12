CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  "entityName" VARCHAR(20) NOT NULL,
  "tableName" VARCHAR(50) NOT NULL,
  "recordId" INTEGER,
  operation VARCHAR(10) NOT NULL,
  "performedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  "performedByEmail" VARCHAR(200),
  "oldData" JSONB,
  "newData" JSONB,
  "occurredAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_audit_entity_name
    CHECK ("entityName" IN ('usuarios', 'roles', 'consultas')),
    
  CONSTRAINT chk_audit_operation
    CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX IF NOT EXISTS idx_audit_entity_occurred
  ON audit_log ("entityName", "occurredAt" DESC);

CREATE INDEX IF NOT EXISTS idx_audit_record
  ON audit_log ("tableName", "recordId");

CREATE INDEX IF NOT EXISTS idx_audit_performed_by
  ON audit_log ("performedBy");

CREATE OR REPLACE FUNCTION set_audit_user(
  p_user_id INTEGER,
  p_user_email VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('audit.user_id', COALESCE(p_user_id::TEXT, ''), true);
  PERFORM set_config('audit.user_email', COALESCE(p_user_email, ''), true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_audit_user_id() RETURNS INTEGER AS $$
DECLARE
  raw_value TEXT;
BEGIN
  raw_value := current_setting('audit.user_id', true);
  IF raw_value IS NULL OR raw_value = '' THEN
    RETURN NULL;
  END IF;
  RETURN raw_value::INTEGER;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_audit_user_email() RETURNS VARCHAR AS $$
DECLARE
  raw_value TEXT;
BEGIN
  raw_value := current_setting('audit.user_email', true);
  IF raw_value IS NULL OR raw_value = '' THEN
    RETURN NULL;
  END IF;
  RETURN raw_value;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_audit_users() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'usuarios', 'users', NEW.id, 'INSERT',
      current_audit_user_id(), current_audit_user_email(),
      NULL, to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'usuarios', 'users', NEW.id, 'UPDATE',
      current_audit_user_id(), current_audit_user_email(),
      to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'usuarios', 'users', OLD.id, 'DELETE',
      current_audit_user_id(), current_audit_user_email(),
      to_jsonb(OLD), NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_audit_users();

CREATE OR REPLACE FUNCTION fn_audit_role_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'roles', 'users', NEW.id, 'UPDATE',
      current_audit_user_id(), current_audit_user_email(),
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_role_change ON users;
CREATE TRIGGER trg_audit_role_change
AFTER UPDATE OF role ON users
FOR EACH ROW
EXECUTE FUNCTION fn_audit_role_change();

CREATE OR REPLACE FUNCTION fn_audit_analysis_queries() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'consultas', 'analysis_queries', NEW.id, 'INSERT',
      current_audit_user_id(), current_audit_user_email(),
      NULL, to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'consultas', 'analysis_queries', NEW.id, 'UPDATE',
      current_audit_user_id(), current_audit_user_email(),
      to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (
      "entityName", "tableName", "recordId", operation,
      "performedBy", "performedByEmail", "oldData", "newData"
    ) VALUES (
      'consultas', 'analysis_queries', OLD.id, 'DELETE',
      current_audit_user_id(), current_audit_user_email(),
      to_jsonb(OLD), NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_analysis_queries ON analysis_queries;
CREATE TRIGGER trg_audit_analysis_queries
AFTER INSERT OR UPDATE OR DELETE ON analysis_queries
FOR EACH ROW
EXECUTE FUNCTION fn_audit_analysis_queries();

CREATE OR REPLACE FUNCTION fn_audit_log_protect() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'audit_log es de solo lectura: no se pueden editar ni borrar registros de auditoria.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_protect ON audit_log;
CREATE TRIGGER trg_audit_log_protect
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log_protect();

GRANT SELECT, INSERT ON audit_log TO cinetruth_app;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq TO cinetruth_app;

GRANT EXECUTE ON FUNCTION set_audit_user(INTEGER, VARCHAR) TO cinetruth_app;
GRANT EXECUTE ON FUNCTION current_audit_user_id() TO cinetruth_app;
GRANT EXECUTE ON FUNCTION current_audit_user_email() TO cinetruth_app;
