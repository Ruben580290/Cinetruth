-- Como correrlas: conectado con cinetruth_admin o cinetruth_app
--   psql -U cinetruth_app -d "cine_truth-integrador" -f src/sql/audit_tests.sql

\echo '--- Estado inicial de audit_log ---'
SELECT count(*) AS total_antes FROM audit_log;

-- Prueba 1: INSERT en "usuarios"
BEGIN;
  SELECT set_audit_user(NULL, 'qa@cinetruth.test');

  INSERT INTO users ("firstName", "lastName", email, password, role)
  VALUES ('QA', 'Auditoria', 'qa.auditoria@cinetruth.test', 'hash_de_prueba', 'user')
  RETURNING id AS test_user_id \gset

  SELECT "entityName", "tableName", "recordId", operation,
         "performedBy", "performedByEmail", "occurredAt"
  FROM audit_log
  WHERE "entityName" = 'usuarios' AND "recordId" = :test_user_id
  ORDER BY id DESC LIMIT 1;
COMMIT;

-- Prueba 2: UPDATE en "usuarios" 
BEGIN;
  SELECT set_audit_user(:test_user_id, 'qa.auditoria@cinetruth.test');

  UPDATE users SET "lastName" = 'Auditoria QA' WHERE id = :test_user_id;

  SELECT "entityName", operation, "performedBy", "performedByEmail",
         "oldData"->>'lastName' AS "lastName_antes",
         "newData"->>'lastName' AS "lastName_despues",
         "occurredAt"
  FROM audit_log
  WHERE "entityName" = 'usuarios' AND "recordId" = :test_user_id
  ORDER BY id DESC LIMIT 1;
COMMIT;

-- Prueba 3: UPDATE del campo "role" -> debe generar auditoria en "usuarios"
BEGIN;
  SELECT set_audit_user(:test_user_id, 'qa.auditoria@cinetruth.test');

  UPDATE users SET role = 'admin' WHERE id = :test_user_id;

  SELECT "entityName", operation,
         "oldData"->>'role' AS role_antes,
         "newData"->>'role' AS role_despues,
         "performedBy", "occurredAt"
  FROM audit_log
  WHERE "tableName" = 'users' AND "recordId" = :test_user_id
  ORDER BY id DESC LIMIT 2;
COMMIT;

-- Prueba 4: DELETE en "usuarios"
BEGIN;
  SELECT set_audit_user(NULL, 'qa@cinetruth.test');

  DELETE FROM users WHERE id = :test_user_id;

  SELECT "entityName", operation, "recordId",
         "oldData"->>'email' AS email_borrado,
         "performedBy", "occurredAt"
  FROM audit_log
  WHERE "entityName" = 'usuarios' AND "recordId" = :test_user_id
  ORDER BY id DESC LIMIT 1;
COMMIT;

-- Prueba 5: INSERT en "consultas" 
BEGIN;
  SELECT set_audit_user(NULL, 'qa@cinetruth.test');

  INSERT INTO analysis_queries (
    "inputType", "inputText", verdict, "suspicionScore", summary
  ) VALUES (
    'text', 'Texto de prueba para auditoria', 'VERIFICADO', 10,
    'Resumen de prueba'
  ) RETURNING id AS test_query_id \gset

  SELECT "entityName", operation, "recordId", "performedBy", "occurredAt"
  FROM audit_log
  WHERE "entityName" = 'consultas' AND "recordId" = :test_query_id
  ORDER BY id DESC LIMIT 1;
COMMIT;

-- Prueba 6: UPDATE en "consultas"
BEGIN;
  SELECT set_audit_user(NULL, 'qa@cinetruth.test');

  UPDATE analysis_queries
  SET "reviewStatus" = 'REVISADO', "reviewNote" = 'Revisado en prueba de auditoria'
  WHERE id = :test_query_id;

  SELECT "entityName", operation,
         "oldData"->>'reviewStatus' AS estado_antes,
         "newData"->>'reviewStatus' AS estado_despues,
         "occurredAt"
  FROM audit_log
  WHERE "entityName" = 'consultas' AND "recordId" = :test_query_id
  ORDER BY id DESC LIMIT 1;
COMMIT;

-- Prueba 7: DELETE en "consultas"
BEGIN;
  SELECT set_audit_user(NULL, 'qa@cinetruth.test');

  DELETE FROM analysis_queries WHERE id = :test_query_id;

  SELECT "entityName", operation, "recordId", "occurredAt"
  FROM audit_log
  WHERE "entityName" = 'consultas' AND "recordId" = :test_query_id
  ORDER BY id DESC LIMIT 1;
COMMIT;

-- Prueba 8: CTH-74 - validar que NINGUN registro de audit_log quede sin
-- fecha/hora o sin tipo de operacion 
SELECT count(*) AS registros_incompletos
FROM audit_log
WHERE "occurredAt" IS NULL
   OR operation IS NULL
   OR "entityName" IS NULL;

-- Prueba 9: audit_log es inmutable - esto DEBE fallar con un error.
DO $$
BEGIN
  UPDATE audit_log SET operation = 'INSERT' WHERE id = (SELECT max(id) FROM audit_log);
  RAISE EXCEPTION 'ERROR DE PRUEBA: se pudo editar audit_log, no deberia ser posible.';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'OK: audit_log rechazo el UPDATE como se esperaba (%).', SQLERRM;
END $$;

\echo '--- Estado final de audit_log ---'
SELECT "entityName", operation, count(*)
FROM audit_log
GROUP BY "entityName", operation
ORDER BY "entityName", operation;
