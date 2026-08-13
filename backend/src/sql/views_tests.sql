BEGIN;

-- Un admin y un usuario normal, para poder ver la separacion por rol en
-- v_actividad_por_fecha.
INSERT INTO users ("firstName", "lastName", email, password, role)
VALUES
  ('Admin', 'Reporteria', 'admin.reporteria@cinetruth.test', 'hash_de_prueba', 'admin'),
  ('User',  'Reporteria', 'user.reporteria@cinetruth.test',  'hash_de_prueba', 'user');

INSERT INTO analysis_queries (
  "userId", "inputType", "inputText", "fileName", "mimeType", "fileSizeBytes",
  verdict, "suspicionScore", summary, "resultData"
) VALUES
  (
    (SELECT id FROM users WHERE email = 'admin.reporteria@cinetruth.test'),
    'text', 'Actor X fue visto saliendo de un evento', NULL, NULL, NULL,
    'SOSPECHOSO', 55, 'Resumen de prueba 1',
    '{"flags": [{"label": "Titular sensacionalista", "detail": "..."}, {"label": "Falta de fuentes", "detail": "..."}]}'::jsonb
  ),
  (
    (SELECT id FROM users WHERE email = 'user.reporteria@cinetruth.test'),
    'text', 'Actriz Y anuncio algo importante', NULL, NULL, NULL,
    'FABRICADO', 88, 'Resumen de prueba 2',
    '{"flags": [{"label": "Titular sensacionalista", "detail": "..."}, {"label": "Lenguaje absoluto", "detail": "..."}]}'::jsonb
  ),
  (
    NULL, 'image', NULL, 'imagen-prueba.jpg', 'image/jpeg', 204800,
    'FABRICADO', 92, 'Resumen de prueba 3 (anonima)',
    '{"flags": [{"label": "Piel demasiado uniforme", "detail": "..."}]}'::jsonb
  ),
  (
    (SELECT id FROM users WHERE email = 'user.reporteria@cinetruth.test'),
    'text', 'Cantante Z confirma gira', NULL, NULL, NULL,
    'VERIFICADO', 12, 'Resumen de prueba 4',
    '{"flags": [{"label": "Fuentes citadas", "detail": "..."}]}'::jsonb
  ),
  (
    (SELECT id FROM users WHERE email = 'admin.reporteria@cinetruth.test'),
    'text', 'Otro titular sobre Actor X', NULL, NULL, NULL,
    'SOSPECHOSO', 60, 'Resumen de prueba 5',
    '{"flags": [{"label": "Titular sensacionalista", "detail": "..."}]}'::jsonb
  );

SELECT * FROM v_actividad_por_fecha WHERE fecha = CURRENT_DATE;

SELECT
  "totalConsultas" >= 5 AS ok_total_consultas,
  "consultasAnonimas" >= 1 AS ok_anonimas,
  "consultasDeAdmins" >= 1 AS ok_admins,
  "totalFabricado" >= 2 AS ok_fabricado
FROM v_actividad_por_fecha
WHERE fecha = CURRENT_DATE;

SELECT * FROM v_temas_mas_consultados
WHERE tema = 'Titular sensacionalista';

SELECT
  count(*) FILTER (
    WHERE tema = 'Titular sensacionalista'
      AND veredicto = 'SOSPECHOSO'
      AND "vecesDetectada" = 2
      AND "consultasDistintas" = 2
  ) = 1 AS ok_tema_repetido_agrupa_bien,
  count(*) FILTER (WHERE veredicto = 'FABRICADO') >= 2
    AS ok_hay_temas_de_fabricado
FROM v_temas_mas_consultados;

ROLLBACK;
