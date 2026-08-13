-- 1. v_actividad_por_fecha 
CREATE OR REPLACE VIEW v_actividad_por_fecha AS
SELECT
  q."createdAt"::date AS fecha,

  count(*) AS "totalConsultas",
  count(*) FILTER (WHERE q."inputType" = 'text') AS "consultasTexto",
  count(*) FILTER (WHERE q."inputType" = 'image') AS "consultasImagen",

  count(DISTINCT q."userId") AS "usuariosDistintos",
  count(DISTINCT u.id) FILTER (WHERE u.role = 'admin') AS "adminsActivos",
  count(*) FILTER (WHERE u.role = 'admin') AS "consultasDeAdmins",
  count(*) FILTER (WHERE q."userId" IS NULL) AS "consultasAnonimas",

  count(*) FILTER (WHERE q.verdict = 'VERIFICADO') AS "totalVerificado",
  count(*) FILTER (WHERE q.verdict = 'SOSPECHOSO') AS "totalSospechoso",
  count(*) FILTER (WHERE q.verdict = 'FABRICADO') AS "totalFabricado",

  round(avg(q."suspicionScore"), 2) AS "promedioSuspicionScore",

  -- Cuanto de esa actividad ya paso revision administrativa
  count(*) FILTER (WHERE q."reviewStatus" = 'REVISADO') AS "totalRevisado",
  count(*) FILTER (WHERE q."reviewStatus" = 'SIN_REVISAR') AS "totalSinRevisar"

FROM analysis_queries q
LEFT JOIN users u ON u.id = q."userId"
GROUP BY q."createdAt"::date
ORDER BY fecha DESC;

-- 2. v_temas_mas_consultados 
CREATE OR REPLACE VIEW v_temas_mas_consultados AS
SELECT
  q.verdict AS veredicto,
  flag_item.value ->> 'label' AS tema,

  count(*) AS "vecesDetectada",
  count(DISTINCT q.id) AS "consultasDistintas",
  count(DISTINCT q."userId") AS "usuariosDistintos",
  count(*) FILTER (WHERE q."userId" IS NULL) AS "vecesEnConsultaAnonima",

  round(avg(q."suspicionScore"), 2) AS "promedioSuspicionScore",
  max(q."createdAt") AS "ultimaDeteccion"

FROM analysis_queries q
LEFT JOIN users u
  ON u.id = q."userId"
CROSS JOIN LATERAL jsonb_array_elements(q."resultData" -> 'flags') AS flag_item(value)
WHERE flag_item.value ->> 'label' IS NOT NULL
  AND btrim(flag_item.value ->> 'label') <> ''
GROUP BY q.verdict, flag_item.value ->> 'label'
ORDER BY q.verdict, "vecesDetectada" DESC;

-- 3. Permisos: las vistas solo se leen, nunca se escribe a traves de ellas.
GRANT SELECT ON v_actividad_por_fecha TO cinetruth_app;
GRANT SELECT ON v_temas_mas_consultados TO cinetruth_app;