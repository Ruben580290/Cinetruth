# Plan de Políticas de Seguridad - CineTruth

## 1. Introducción y Alcance

### 1.1 Introducción y Contexto del Negocio

CineTruth es una aplicación web desarrollada, cuyo objetivo es detectar contenido de farándula (imágenes y titulares) fabricado o alterado con inteligencia artificial. El sistema gestiona datos que incluyen:

- **Datos Personales de Usuarios:** nombre, apellido, correo electrónico y contraseña (hasheada) de las personas registradas en la plataforma.
- **Historial de Consultas:** cada análisis realizado (texto o imagen enviada), el veredicto de la IA (VERIFICADO / SOSPECHOSO / FABRICADO), el puntaje de sospecha y el estado de revisión administrativa.
- **Registro de Auditoría:** histórico inmutable de cambios sobre usuarios, roles y consultas.

CineTruth no maneja datos financieros ni de pagos; el dato más sensible del sistema es la identidad de los usuarios registrados y su rol de acceso (user / admin).

### 1.2 Alcance del Plan

Este plan se enfoca en proteger la capa de base de datos PostgreSQL 17 y su interacción con el backend en Node.js/Express que consume esos datos. El entorno actual del proyecto es un entorno de desarrollo académico: backend y base de datos corren en la misma máquina (localhost), sin despliegue en servidores separados ni exposición pública.

Se asume que, al tratarse de un proyecto integrador académico y no de un sistema en producción, ciertos controles de nivel empresarial (segmentación de red, cifrado de disco, monitoreo 24/7) están fuera del alcance real implementado. Donde esto aplica, el plan lo documenta explícitamente como pendiente y describe el paso a seguir si el proyecto escalara a un entorno productivo real.

---

## 2. Definición del Escenario Técnico

### 2.1 Infraestructura y Arquitectura de Red

- **Tipo de Despliegue:** entorno de desarrollo local (laptop personal, Windows), no un data center institucional.
- **Arquitectura real:** el backend (Node.js/Express) y la base de datos (PostgreSQL) corren en la misma máquina. La conexión se hace por `localhost`, definida en `backend/.env`. No existe segmentación de red (VLAN) ni firewall perimetral configurado, ya que no hay una red institucional real detrás del proyecto en esta etapa.
- **Control de acceso a la base de datos:** en lugar de una segmentación de red, el control de acceso se logra a nivel de credenciales y roles de PostgreSQL: el backend solo puede autenticarse con el usuario `cinetruth_app`, de privilegios mínimos, nunca con `cinetruth_admin`, a menos que se le asigne el rol de admin manualmente a un usuario específico desde PostgreSQL.
- **Pendiente si el proyecto escalara a producción:** separar el servidor de base de datos del servidor de aplicación, restringir las conexiones entrantes por IP/firewall, y colocar la base de datos en una subred privada sin acceso directo desde internet.

### 2.2 Stack Tecnológico Detallado

| Componente | Versión/Especificación | Configuración de Seguridad Relevante |
|---|---|---|
| Sistema Operativo (dev) | Windows (entorno local del desarrollador) | Acceso restringido a la cuenta del desarrollador; sin exposición pública en esta etapa. |
| Motor de Base de Datos (DBMS) | PostgreSQL 17 | Roles de mínimo privilegio nativos (`cinetruth_admin` / `cinetruth_app` / `cinetruth_backup`). Ningún rol con SUPERUSER. |
| Backend / Runtime | Node.js + Express 5 | Acceso a la BD exclusivamente vía TypeORM 1.1.0 con `synchronize:false` (no altera el esquema en caliente). |
| Autenticación | JWT (jsonwebtoken) + bcryptjs | Tokens firmados con expiración de 2h; contraseñas hasheadas con bcrypt (10 rounds), nunca en texto plano. |
| Esquema de Datos | Base de datos: `cine_truth-integrador` | Tablas identificadas como sensibles: `users` (credenciales/roles), `analysis_queries` (historial de uso), `audit_log` (trazabilidad). |

---

## 3. Política de Gestión de Identidades y Accesos (RBAC)

### 3.1 Roles Funcionales de la Aplicación

La aplicación web define dos roles de usuario final, que se traducen en permisos de aplicación y, en última instancia, en el uso de uno de los dos roles de base de datos definidos a continuación:

| Rol | Descripción | Acción Permitida |
|---|---|---|
| `cinetruth_admin` | Dueño del esquema | Puede crear, alterar y borrar estructura |
| `cinetruth_app` | Rol de mínimo privilegio | Solo puede leer y escribir filas en las tablas existentes |

### 3.2 Roles Técnicos en PostgreSQL y Creación de Usuarios

```sql
CREATE ROLE cinetruth_admin WITH LOGIN PASSWORD 'AdminP1456';

GRANT ALL PRIVILEGES ON DATABASE "cine_truth-integrador" TO cinetruth_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO cinetruth_admin;

ALTER TABLE users OWNER TO cinetruth_admin;
---------------------------------------------------------------------
CREATE ROLE cinetruth_app WITH LOGIN PASSWORD 'apPc1456';

GRANT CONNECT ON DATABASE "cine_truth-integrador" TO cinetruth_app;
GRANT USAGE ON SCHEMA public TO cinetruth_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO cinetruth_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cinetruth_app;
---------------------------------------------------------------------
CREATE ROLE cinetruth_backup WITH LOGIN PASSWORD 'rBackcup123';

GRANT CONNECT ON DATABASE "cine_truth-integrador" TO cinetruth_backup;
GRANT USAGE ON SCHEMA public TO cinetruth_backup;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO cinetruth_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO cinetruth_backup;
---------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cinetruth_app;

ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO cinetruth_app;

ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT SELECT ON TABLES TO cinetruth_backup;

ALTER DEFAULT PRIVILEGES FOR ROLE cinetruth_admin IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO cinetruth_backup;
---------------------------------------------------------------------
ALTER TABLE analysis_history OWNER TO cinetruth_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_history TO cinetruth_app;
GRANT USAGE, SELECT ON SEQUENCE analysis_history_id_seq TO cinetruth_app;
```

### 3.3 Principio de Menor Privilegio Aplicado

La aplicación web nunca usa el usuario `cinetruth_admin`. Usa exclusivamente `cinetruth_app`, que tiene privilegios limitados (SELECT, INSERT, UPDATE, DELETE) solo sobre tablas existentes. También presenta limitaciones en cuanto a: crear, alterar o borrar tablas (CREATE, ALTER, DROP TABLE); crear o administrar roles; y, conectarse a otras bases de datos del servidor.

---

## 4. Seguridad de los Datos

### 4.1 Datos en Reposo (At Rest)

- **Problema:** proteger los archivos físicos de datos de PostgreSQL en disco.
- **Estado actual:** NO implementado.

No se ha configurado cifrado de disco completo (BitLocker/LUKS) sobre la partición donde reside la base, ni cifrado a nivel de columna con la extensión pgcrypto. PostgreSQL no trae Transparent Data Encryption (TDE) nativo, así que esta capa dependería de una extensión o del cifrado del sistema operativo. Se documenta como una limitación reconocida del alcance académico del proyecto, no como un descuido no evaluado.

- **Mitigación parcial ya existente:** aunque no hay cifrado en reposo a nivel de disco, el dato más sensible en reposo (la contraseña de cada usuario) ya está protegido mediante hash con bcrypt (10 rounds) antes de guardarse, nunca se almacena en texto plano, independientemente de si el disco está o no cifrado.
- **Plan a futuro:** si el proyecto pasara a un entorno productivo real, se planea habilitar cifrado de disco a nivel de sistema operativo (BitLocker en Windows Server, LUKS en Linux) para la partición de datos de PostgreSQL, y evaluar pgcrypto para cifrar columnas adicionales que pudieran incorporarse en el futuro.

### 4.2 Datos en Tránsito (In Transit)

- **Estado actual:** NO implementado.

La configuración de conexión del backend a PostgreSQL (vía TypeORM) no incluye la opción `ssl`, por lo que la conexión entre el backend y la base de datos viaja sin cifrar. Esto es consistente con que, en el entorno actual del proyecto, backend y base de datos corren en la misma máquina (localhost), no hay tráfico de red externa que interceptar en esta etapa. De la misma forma, el backend se sirve en desarrollo sobre HTTP (`http://localhost:5006`), no HTTPS.

- **Plan a futuro:** si backend y base de datos llegaran a desplegarse en servidores distintos, se debe: activar `sslmode=require` (o `verify-full`) en la configuración de TypeORM; habilitar `ssl=on` en `postgresql.conf` con un certificado válido; y, servir tanto el backend como el frontend sobre HTTPS, con certificados gestionados en lugar de HTTP plano.

---

## 5. Estrategia de Disponibilidad

### 5.1 Acuerdo de Nivel de Servicio con el Negocio

| RPO = 24 horas | RTO = 4 horas |
|---|---|
| Ante una falla, se acepta perder como máximo el último día de datos. | El sistema debe quedar operativo de nuevo dentro de 4 horas desde que se haya detectado la falla. |

Si el proyecto evolucionara hacia un despliegue con usuarios reales y continuos, estos valores deberían reducirse (por ejemplo, RPO de 1 hora con respaldos incrementales más frecuentes).

- **Supuesto importante:** el RTO de 4 horas se cuenta desde que la falla se detecta, no desde que ocurre. El proyecto no cuenta con monitoreo ni alertas automatizadas, la única forma de enterarse de que la base de datos falló es que alguien del equipo intente usar la aplicación y note el error. De la misma forma, `backup.sh` registra sus fallas en `backup.log`, pero nadie revisa ese archivo de forma proactiva: si el job empezara a fallar en silencio (credencial expirada, disco lleno), el RPO real dejaría de ser 24h y pasaría a ser "desde el último respaldo que sí funcionó", sin que nadie lo note de inmediato.
- **Mitigación mínima adoptada para este alcance:** revisión manual periódica (semanal) de `backup.log` por parte del equipo. No se implementa monitoreo automatizado por considerarse fuera del alcance de un proyecto académico sin SLA.

### 5.2 Estrategia de Backups Implementada

| Tipo | Frecuencia | Retención | Comando | Almacenamiento |
|---|---|---|---|---|
| Completo (lógico) | Diario (08:00 AM) | 14 días | `pg_dump -F c`, usuario dedicado `cinetruth_backup` | Disco local, carpeta `database/backups/` (archivos `.dump`) |

### 5.3 Procedimiento de Recuperación ante Desastre

1. **Detección:** Se identifica la caída o corrupción de la base de datos.
2. **Activación:** Se inicia el procedimiento de restauración documentado.
3. **Recuperación:**
   a. Ubicar el backup más reciente en `database/backups/`
   b. Ejecutar `restore.sh` con ese archivo `.dump`
   c. Esto recupera los datos hasta el estado del último backup diario
4. **Verificación:** Confirmar que las tablas clave cargaron correctamente tras la restauración.
5. **Puesta en línea:** Volver a apuntar el backend a la base restaurada y confirmar que la app responde con normalidad.

---

## 6. Monitoreo, Auditoría y Logging

### 6.1 Auditoría Nativa de PostgreSQL

- **Estado actual:** no se habilitó una extensión de auditoría nativa de PostgreSQL (como pgAudit) por estar fuera del alcance de un proyecto académico. Sí existe registro a nivel de aplicación: el middleware `loggerMiddleware.js` registra en consola cada request que llega al backend (método, URL y timestamp).

La trazabilidad real de cambios sobre los datos sensibles no se resolvió con auditoría nativa del motor, sino con triggers de base de datos hechos a medida, que son más específicos para este proyecto: registran exactamente qué cambió, quién lo hizo y cuándo, sobre las tres entidades que sí importa auditar.

### 6.2 Triggers de Auditoría para Datos Críticos

Se implementó una tabla centralizada `audit_log` que registra cada INSERT, UPDATE o DELETE sobre las tres entidades sensibles del sistema: usuarios, roles y consultas. Cada fila guarda: entidad, tabla, tipo de operación, quién la hizo, los datos antes/después en formato JSONB y la fecha/hora exacta.

```sql
-- Ejemplo real: trigger de auditoría sobre la tabla users
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION fn_audit_users();
```

El "quién" se resuelve con la función `set_audit_user`, que el backend llama a través de `runWithAuditUser()` antes de cada escritura que se quiera auditar, pasando el id y el correo del usuario autenticado que vienen decodificados del JWT.

La propia tabla de auditoría es inmutable: el trigger `trg_audit_log_protect` bloquea cualquier UPDATE o DELETE sobre `audit_log`, incluso si se intenta con el rol de aplicación (`cinetruth_app`), solo permite INSERT, para que el historial no pueda alterarse después de generado.

Esto se probó contra una base real, confirmando 9 casos: alta, edición y borrado de usuarios; cambio de rol (genera doble registro: uno general en 'usuarios' y uno específico en 'roles'); alta, edición y borrado de consultas; y el rechazo del intento de editar un registro ya escrito en `audit_log`.

### 6.3 Monitoreo Proactivo

- **Estado actual:** NO implementado.

No hay alertas automatizadas (por ejemplo, ante múltiples intentos fallidos de login) ni dashboards de métricas (conexiones activas, consultas lentas, espacio en disco). Esta limitación ya se reconoce en la sección 5.1: la única forma actual de detectar una falla es que alguien del equipo note el error al usar la aplicación.

- **Mitigación mínima adoptada:** revisión manual periódica de la salida de consola del backend y del archivo `backup.log`.
- **Plan a futuro:** si el proyecto escalara, implementar alertas por fuerza bruta (más de N intentos fallidos de login en pocos minutos) y monitoreo de métricas básicas con herramientas como pgAdmin o la extensión `pg_stat_statements`.

---

## 7. Gestión de Vulnerabilidades y Hardening

### 7.1 Hardening Específico de PostgreSQL 17

- **Separación de credenciales por rol:** `cinetruth_admin` (dueño del esquema, solo para migraciones manuales), `cinetruth_app` (mínimo privilegio, credencial real del backend) y `cinetruth_backup` (solo lectura, para respaldos). Ninguno tiene el atributo SUPERUSER. Las credenciales de `cinetruth_admin` nunca se guardan en el `.env` que lee el backend en tiempo de ejecución.
- **Gestión de secretos:** el archivo `.env` está excluido del repositorio (`.gitignore` incluye `.env`, `database/backups/` y `run_backup_task.sh`, este último porque contiene en texto plano la contraseña del backup automático).
- **Contraseñas de usuarios de la aplicación:** se almacenan con bcrypt (10 rounds) vía bcryptjs, nunca en texto plano; se verifican con `bcrypt.compare` en el login.
- **Pendiente / no implementado:** políticas de complejidad de contraseña a nivel de rol de PostgreSQL y rotación periódica de las credenciales de los roles de base de datos.

### 7.2 Ciclo de Parches

- **Estado actual:** NO implementado formalmente.

Al ser un proyecto académico en un entorno de desarrollo local, no existe un proceso automatizado ni documentado de aplicación de parches para PostgreSQL 17.

- **Plan a futuro:** revisión mensual de los boletines de seguridad de PostgreSQL, aplicar primero las actualizaciones en un entorno de pruebas (no directamente sobre la base con datos reales de usuarios), y definir una ventana de mantenimiento fija si el proyecto llegara a un entorno productivo.

### 7.3 Prevención de SQL Injection (Política de Desarrollo)

El backend usa TypeORM (Query Builder y repositorios estándar como `find` / `findOneBy`) en todas sus consultas, no hay ningún controller que concatene manualmente strings SQL con datos del usuario. Los valores enviados por el cliente siempre se pasan como parámetros enlazados.

```js
// Ejemplo real (login), usando parámetro enlazado en vez de concatenación:
.where("LOWER(user.email) = LOWER(:email)", { email: email.trim() })
```

- **Pendiente / no implementado:** no hay una herramienta SAST corriendo de forma automatizada, ni pruebas de penetración. La política adoptada es mantener el uso exclusivo del ORM/Query Builder para cualquier consulta nueva que se agregue al proyecto, evitando SQL crudo con interpolación de strings.

---

## 8. Conclusiones y Recomendaciones

Este plan documenta el estado real de seguridad de la base de datos de CineTruth, sin inflar lo que aún no está implementado:

- **Fortalezas ya implementadas:** RBAC con tres roles de mínimo privilegio (admin/app/backup) verificados contra la base real; contraseñas hasheadas con bcrypt; consultas siempre parametrizadas vía TypeORM (sin riesgo de SQL injection por concatenación); triggers de auditoría inmutables sobre usuarios, roles y consultas; backups diarios automatizados con retención y procedimiento de restauración probado.
- **Limitaciones reconocidas:** cifrado de datos en reposo y en tránsito, monitoreo/alertas automatizadas, y un ciclo formal de gestión de parches. Todas se documentaron con un plan concreto de qué haría falta si el proyecto pasara de prototipo académico a un entorno productivo real.

En conjunto, CineTruth demuestra que la seguridad de una base de datos se puede abordar por capas incluso en un proyecto académico: donde el alcance no permitió implementar un control (cifrado, monitoreo), se documentó honestamente como pendiente en lugar de asumirlo como resuelto.