# Auditoría y trazabilidad — CineTruth

Documentación de la tabla centralizada de auditoría, los triggers que la
alimentan, y la verificación de que las tres entidades principales quedan
cubiertas de verdad (no solo declarado en este documento).

## 1. Diseño

| Pieza | Dónde vive | Qué hace |
|---|---|---|
| `audit_log` | `backend/src/sql/audit.sql` | Tabla centralizada. Un registro por cada INSERT/UPDATE/DELETE auditado. |
| `set_audit_user(id, email)` | `backend/src/sql/audit.sql` | El backend la llama antes de escribir, para avisar quién es el usuario responsable. |
| `trg_audit_users` | tabla `users` | Audita la entidad **usuarios**: cualquier INSERT/UPDATE/DELETE. |
| `trg_audit_role_change` | tabla `users`, columna `role` | Audita la entidad **roles**: solo cuando cambia el campo `role` (no existe una tabla `roles` separada, ver sección 2). |
| `trg_audit_analysis_queries` | tabla `analysis_queries` | Audita la entidad **consultas**. |
| `trg_audit_log_protect` | tabla `audit_log` | Bloquea UPDATE/DELETE sobre la propia auditoría (inmutable). |
| `runWithAuditUser` | `backend/src/utils/auditContext.js` | Helper de Node: abre una transacción, llama a `set_audit_user` con `req.user`, y corre la operación dentro de esa misma transacción. |

Cada fila de `audit_log` incluye siempre: `entityName`, `operation`,
`performedBy` / `performedByEmail`, y `occurredAt`.

## 2. Por qué "roles" no es una tabla

En el modelo actual (`backend/src/sql/table_creation.sql`) no existe una
tabla `roles`: el rol de cada usuario es el campo `role` de `users`
(`'user' | 'admin'`), y es el dato más sensible desde el punto de vista de
RBAC (ver `docs/RBAC.md`). Por eso se audita con su propio trigger y su
propio valor de `entityName = 'roles'`, además del registro general que
ya deja `trg_audit_users` en cada UPDATE de `users`. Si en el futuro
aparece una tabla `roles` real, este trigger se reemplaza por uno
estándar sobre esa tabla, igual que `trg_audit_users`.

## 3. Cómo el backend indica el usuario responsable

El backend siempre se conecta con el mismo rol de aplicación
(`cinetruth_app`), así que Postgres no distingue por sí solo qué persona
autenticada hizo el cambio. Por eso cada escritura que se quiera auditar
con responsable debe pasar por `runWithAuditUser(req.user, work)`, que:

1. Abre una transacción.
2. Corre `SELECT set_audit_user($1, $2)` con el `sub` (id) y `email` del
   JWT decodificado por `authMiddleware.js`.
3. Ejecuta la operación real dentro de esa misma transacción.

Si una operación no pasa por este helper (por ejemplo, un script de
mantenimiento corrido a mano), el trigger igual crea el registro de
auditoría, pero con `performedBy = NULL`.

## 4. Verificación real

Pruebas corridas con `backend/src/sql/audit_tests.sql` contra una base de
pruebas, conectando con `cinetruth_app` (el mismo rol que usa el backend):

| Prueba | Entidad | Operación | Resultado esperado | Resultado real |
|---|---|---|---|---|
| Alta de usuario | usuarios | INSERT | 1 fila en `audit_log`, `performedBy`/`performedByEmail` según `set_audit_user`, `occurredAt` con hora actual | ✓ |
| Editar apellido | usuarios | UPDATE | 1 fila, `oldData`/`newData` con el `lastName` antes/después | ✓ |
| Cambiar `role` a `admin` | usuarios **y** roles | UPDATE | 2 filas por el mismo cambio: una en `usuarios` (general) y otra en `roles` (específica) con `role` antes/después | ✓ |
| Borrar usuario | usuarios | DELETE | 1 fila, `oldData` con el email borrado, `newData` NULL | ✓ |
| Alta de consulta | consultas | INSERT | 1 fila en `audit_log` | ✓ |
| Editar `reviewStatus` | consultas | UPDATE | 1 fila, `oldData`/`newData` con el estado antes/después | ✓ |
| Borrar consulta | consultas | DELETE | 1 fila | ✓ |
| Registros sin fecha/hora, sin tipo de operación o sin entidad | (todas) | — | 0 filas (`NOT NULL` en la tabla) | ✓ |
| Intentar editar un registro de `audit_log` ya escrito | audit_log | UPDATE | Rechazado por `trg_audit_log_protect` | ✓ `ERROR: audit_log es de solo lectura...` |

## 5. Cómo correr las pruebas

```
psql -U cinetruth_app -d "cine_truth-integrador" -f backend/src/sql/audit_tests.sql
```

Requiere haber corrido antes, una sola vez, como `cinetruth_admin`:

```
psql -U cinetruth_admin -d "cine_truth-integrador" -f backend/src/sql/audit.sql
```

## 6. Pendiente / siguientes pasos

- Conectar `runWithAuditUser` en los controllers que hoy escriben en
  `users` y `analysis_queries` (por ejemplo, si se agrega un endpoint de
  admin para cambiar el `role` de otro usuario).
- Si se quiere exponer la auditoría en el frontend (por ejemplo, una
  vista de admin), agregar un endpoint de solo lectura sobre
  `audit_log`.
