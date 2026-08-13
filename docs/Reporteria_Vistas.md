# Reportería con vistas — CineTruth

Documentación de las dos vistas complejas de reportería y cómo validarlas.

> **Validado:** `backend/src/sql/views_tests.sql` se corrió contra una base
> de pruebas real (`psql -U cinetruth_app -d "cine_truth-integrador" -f
> src/sql/views_tests.sql`) y los 6 checks (`ok_total_consultas`,
> `ok_anonimas`, `ok_admins`, `ok_fabricado`, `ok_tema_repetido_agrupa_bien`,
> `ok_hay_temas_de_fabricado`) dieron `t`. El script termina en `ROLLBACK`,
> así que no dejó datos de prueba en la base.

## 1. Vistas

| Vista | Archivo | Integra | Qué responde |
|---|---|---|---|
| `v_actividad_por_fecha` | `backend/src/sql/views.sql` | `analysis_queries` + `users` | "¿Cuánta actividad hubo cada día, y cuánta viene de admins vs usuarios normales vs anónimos?" |
| `v_temas_mas_consultados` | `backend/src/sql/views.sql` | `analysis_queries` + `users` + `resultData.flags` (JSON) | "¿Qué señales/temas se repiten más, agrupadas por veredicto?" |

### 1.1 `v_actividad_por_fecha` 

Una fila por día. Columnas:

- `fecha`
- `totalConsultas`, `consultasTexto`, `consultasImagen`
- `usuariosDistintos`, `adminsActivos`, `consultasDeAdmins`, `consultasAnonimas`
- `totalVerificado`, `totalSospechoso`, `totalFabricado`
- `promedioSuspicionScore`
- `totalRevisado`, `totalSinRevisar`

Usa `FILTER (WHERE ...)` en vez de subconsultas separadas, y un
`LEFT JOIN` con `users` para poder distinguir actividad de admins de la
de usuarios normales y anónimos dentro del mismo `GROUP BY q."createdAt"::date`.

### 1.2 `v_temas_mas_consultados` 

**Sobre qué es "tema/actor" aquí:** el modelo actual (`table_creation.sql`,
`analysis_queries.sql`) no tiene una columna de actor/tema propia. Esta
vista usa como aproximación la señal (`flag.label`) más frecuente que
devolvió la IA (`resultData.flags[]`, definido en `RESPONSE_SCHEMA` de
`aiPromptConfig.js`), agrupada por veredicto. Si en el futuro se agrega
una columna de tema/actor real, se cambia el `jsonb_array_elements` por
esa columna y el resto de la vista queda igual.

Una fila por combinación `(veredicto, tema)`. Columnas:

- `veredicto`, `tema`
- `vecesDetectada` (cuántas veces salió esa señal en total)
- `consultasDistintas` (en cuántas consultas distintas apareció)
- `usuariosDistintos`, `vecesEnConsultaAnonima`
- `promedioSuspicionScore`
- `ultimaDeteccion`

Usa `CROSS JOIN LATERAL jsonb_array_elements(...)` para "desenrollar" el
arreglo `flags` de cada consulta y agregarlo junto con `users` (para
distinguir consultas anónimas de registradas).

## 2. Cómo instalar

```
psql -U cinetruth_admin -d "cine_truth-integrador" -f backend/src/sql/views.sql
```

## 3. Cómo validar 

```
psql -U cinetruth_app -d "cine_truth-integrador" -f backend/src/sql/views_tests.sql
```

El script:

1. Inserta 1 admin, 1 usuario normal y 4 consultas de ejemplo (texto,
   imagen, anónima, con distintos veredictos y flags repetidos a
   propósito).
2. Consulta ambas vistas filtradas a esos datos de prueba.
3. Corre unos `SELECT` de verificación puntual (deben devolver `true` en
   cada columna `ok_*`):
   - `ok_total_consultas`, `ok_anonimas`, `ok_admins`, `ok_fabricado` para
     `v_actividad_por_fecha`.
   - `ok_tema_repetido_agrupa_bien`, `ok_hay_temas_de_fabricado` para
     `v_temas_mas_consultados`.
4. Hace `ROLLBACK` al final — no queda nada insertado.

### Resultados confirmados

| Chequeo | Resultado |
|---|---|
| La fecha agrupa por día, no por timestamp exacto | ✓ las consultas de prueba (insertadas en el mismo `BEGIN`) cayeron en una sola fila de `v_actividad_por_fecha`. |
| `adminsActivos` vs `consultasDeAdmins` se cuentan por separado (personas vs consultas) | ✓ `adminsActivos = 1`, `consultasDeAdmins = 2` en la corrida (el admin de prueba hizo 2 consultas). |
| La vista agrupa por `(veredicto, tema)`, no solo por tema | ✓ "Titular sensacionalista" salió en dos filas distintas (`FABRICADO` y `SOSPECHOSO`), cada una con su propio conteo. |
| Dentro de un mismo veredicto, el mismo tema sí se agrupa en una sola fila | ✓ `SOSPECHOSO / Titular sensacionalista` salió con `vecesDetectada = 2`, `consultasDistintas = 2` (dos consultas de prueba con ese mismo veredicto y flag). |
| Consultas sin `flags` o con `flags` vacío no rompen la vista | ✓ el `CROSS JOIN LATERAL` no generó errores ni filas `NULL` extrañas. |

## 4. Pendiente

- Este script de validación es manual (no hay framework de tests en
  `backend/package.json` todavía). Si en algún momento se agrega uno
  (jest, vitest, etc.), estos mismos checks se pueden portar 1:1.