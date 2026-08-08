# Política de acceso y uso de roles — CineTruth

Documentación de los roles definidos
a nivel de motor de base de datos, sus privilegios, y la verificación de que
esos límites se cumplen de verdad.

## 1. Roles definidos

| Rol | Uso | Cuándo se usa |
|---|---|---|
| `cinetruth_admin` | Dueño del esquema (tablas, futuras vistas). Puede crear, alterar y borrar estructura. | Solo para correr migraciones a mano: `table_creation.sql`, `roles.sql`, futuros `views.sql`. **Nunca** es la credencial del backend en ejecución. |
| `cinetruth_app` | Rol de mínimo privilegio. Solo puede leer y escribir **filas** en las tablas existentes. | Es la credencial que usa el backend en todo momento (`.env` de la app). |

Ninguno de los dos roles tiene el atributo `SUPERUSER` — ambos son roles
acotados dentro de la base `cine_truth-integrador`, no administradores del
servidor de Postgres completo.

## 2. Privilegios de `cinetruth_app` (mínimo privilegio)

**Sí puede:**
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` sobre las tablas existentes (`users`,
  y automáticamente cualquier tabla nueva que cree `cinetruth_admin` en el
  futuro, vía `ALTER DEFAULT PRIVILEGES`).
- Usar las secuencias asociadas (necesario para los `id` autoincrementales).

**No puede (verificado, no solo declarado — ver sección 4):**
- Crear, alterar o borrar tablas (`CREATE`/`ALTER`/`DROP TABLE`).
- Crear ni administrar roles.
- Conectarse a otras bases de datos del servidor.

## 3. Separación de credenciales 

Las credenciales de `cinetruth_admin` **nunca** se guardan en ningún `.env`
que la aplicación lea en tiempo de ejecución — solo se usan manualmente por
línea de comandos al correr una migración:

```
psql -U cinetruth_admin -d "cine_truth-integrador" -f src/sql/table_creation.sql
psql -U cinetruth_admin -d "cine_truth-integrador" -f src/sql/roles.sql
```

El `.env` del backend solo contiene las credenciales de
`cinetruth_app`.

## 4. Verificación real

Las siguientes pruebas se corrieron contra una base real, conectando por
TCP con cada rol, para confirmar que el límite de privilegios no es solo
una declaración en este documento sino un comportamiento real del motor:

| Prueba | Rol usado | Resultado esperado | Resultado real |
|---|---|---|---|
| `CREATE TABLE hackeo_test (...)` | `cinetruth_app` | Denegado | `ERROR: permission denied for schema public`  |
| `DROP TABLE users;` | `cinetruth_app` | Denegado | `ERROR: must be owner of table users`  |
| `CREATE ROLE otro_hacker LOGIN;` | `cinetruth_app` | Denegado | `ERROR: permission denied to create role`  |
| `SELECT count(*) FROM users;` | `cinetruth_app` | Permitido | Devuelve el conteo correctamente  |
| `CREATE TABLE` / `DROP TABLE` de prueba | `cinetruth_admin` | Permitido | Ambas operaciones se ejecutan sin error  |

También se confirmó el flujo completo de la aplicación (registro, login,
`/api/auth/me`) conectando el backend real con `cinetruth_app` — el rol de
mínimo privilegio es suficiente para el funcionamiento normal de la app.

## 5. Extender esto a tablas nuevas

Cuando aterricen nuevas tablas (por ejemplo `analyses` en CTH-62, o
`audit_log` en CTH-67), **no hace falta editar `roles.sql` ni correr un
`GRANT` nuevo a mano** — el `ALTER DEFAULT PRIVILEGES` ya definido las cubre
automáticamente, siempre y cuando esas tablas se creen conectado como
`cinetruth_admin` (no como `postgres`).
