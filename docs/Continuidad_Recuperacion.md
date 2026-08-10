# Continuidad del negocio y estrategia de recuperación — CineTruth

Documentación del RPO/RTO definidos, el job de respaldo automatizado, 
y la verificación real de una restauración exitosa.

## 1. RPO y RTO — definición y justificación 

| Métrica | Valor definido | Significa |
|---|---|---|
| **RPO** (Recovery Point Objective) | **24 horas** | Ante una falla, se acepta perder como máximo el último día de datos. |
| **RTO** (Recovery Time Objective) | **4 horas** | El sistema debe quedar operativo de nuevo dentro de 4 horas desde detectada la falla. |

### Por qué estos valores, y no más estrictos

CineTruth es un proyecto académico sin SLA comercial ni
datos financieros o transaccionales de alto valor. Un RPO/RTO de nivel
bancario sería sobre-ingeniería para este alcance. Los valores elegidos se justifican por:

- **Frecuencia de escritura baja.** Los datos cambian solo cuando un usuario
  se registra o ejecuta un análisis — no hay transacciones continuas de alto
  volumen que un respaldo diario deje en riesgo significativo.
- **Los datos no son irrecuperables por naturaleza.** A diferencia de una
  transacción bancaria, un análisis perdido se puede volver a ejecutar
  (el usuario puede re-analizar la misma imagen o titular). El "dato" en
  riesgo es el *historial*, no la capacidad del sistema de operar.
- **Sin equipo de operaciones 24/7.** El equipo es pequeño y no monitorea el
  sistema de forma continua; un RTO de 4 horas es realista para que alguien
  del equipo detecte la falla y ejecute el procedimiento de restauración ya
  documentado (sección 3), sin necesitar guardia nocturna.
- **Procedimiento de recuperación simple.** La base es una sola instancia de
  PostgreSQL con un procedimiento de restauración de un solo comando
  (`restore.sh`) — no es un sistema distribuido donde recuperarse tome
  naturalmente más tiempo.

Si el proyecto evolucionara hacia un despliegue con usuarios reales y
continuos, estos valores deberían reducirse (por ejemplo, RPO de 1 hora con
respaldos incrementales más frecuentes).

### Supuesto importante: estos valores asumen detección manual

El RTO de 4 horas se cuenta **desde que la falla se detecta**, no desde que
ocurre. El proyecto no cuenta con monitoreo ni alertas automatizadas,
la única forma de enterarse de que la base de datos falló es que alguien
del equipo intente usar la aplicación y note el error. De la misma forma,
`backup.sh` registra sus fallas en `backups/backup.log`, pero nadie revisa
ese archivo de forma proactiva: si el job empezara a fallar en silencio
(credencial expirada, disco lleno), el RPO real dejaría de ser 24h y pasaría
a ser "desde el último respaldo que sí funcionó", sin que nadie lo note de
inmediato.

Mitigación mínima adoptada para este alcance: revisión manual periódica
(semanal) de `backup.log` por parte del equipo. No se implementó monitoreo
automatizado por considerarse fuera del alcance de un proyecto académico sin
SLA — ver limitación explícita en la sección 4.

## 2. Job automatizado de respaldo 

`database/backup.sh` — corre `pg_dump` en formato comprimido (`-F c`), con
un rol dedicado de solo lectura (`cinetruth_backup`, ver
`backend/src/sql/roles_backup.sql`) que **no** puede escribir ni modificar
nada — si el proceso de backup se ve comprometido, el atacante solo puede
leer, nunca borrar o alterar datos.

**Estado actual:** el script se probó manualmente con éxito el 9 de agosto
de 2026 (ver evidencia en la sección 3). La tarea programada de Windows
(que lo convierte en automático de verdad, no solo "ejecutable a mano") se
configura siguiendo los pasos de abajo.

### Configurar la tarea programada en Windows (paso a paso)

1. Copia `database/run_backup_task.example.sh` como
   `database/run_backup_task.sh` (sin `.example`), y reemplaza
   `TU_CLAVE_REAL_AQUI` por la contraseña real de `cinetruth_backup`. Este
   archivo queda fuera de Git a propósito.
2. Abre **Programador de tareas** (búscalo en el menú de inicio de Windows).
3. Panel derecho → **Crear tarea básica...**
4. Nombre: `CineTruth - Respaldo diario de base de datos`.
5. Desencadenador: **Diariamente**, a una hora de bajo uso (ej. 3:00 a.m.).
6. Acción: **Iniciar un programa**.
   - Programa o script: la ruta a `bash.exe` de Git, normalmente
     `C:\Program Files\Git\bin\bash.exe`.
   - Agregar argumentos: `-c "/c/Users/ASUS/Cinetruth/database/run_backup_task.sh"`
     (ajusta la ruta a como se llame tu carpeta real).
7. Finalizar. Click derecho sobre la tarea recién creada → **Ejecutar**,
   para probarla una vez de inmediato sin esperar a las 3 a.m.
8. Confirma que funcionó revisando `database/backups/backup.log` — debe
   aparecer una entrada nueva con la hora en que la corriste manualmente
   desde el Programador de Tareas (no desde Git Bash).

**Retención:** 14 días — los respaldos más viejos se eliminan automáticamente
en cada corrida (evita llenar el disco indefinidamente).

*Si algún miembro del equipo corre esto en Linux/Mac en vez de Windows,*
`cron` *cumple el mismo rol:*
- 0 3 * * * /ruta/a/database/run_backup_task.sh

## 3. Verificación real de restauración

Se ejecutó una prueba de desastre real (no simulada en papel) contra una
base de datos real, el 9 de agosto de 2026:

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Estado inicial: `SELECT * FROM users` | 3 filas (`rueban@`, `hacker@`, `rolminimo@`) |
| 2 | `./backup.sh` | Respaldo generado correctamente (`cinetruth_20260808_231424.dump`, 8.0K) |
| 3 | **Desastre simulado:** `DROP TABLE users;` | Tabla eliminada por completo (`\dt` → "Did not find any relations") |
| 4 | `./restore.sh cinetruth_20260808_231424.dump` | "Restauracion completada", sin errores |
| 5 | `SELECT * FROM users` después de restaurar | **Las mismas 3 filas, con los mismos `id`, recuperadas exactamente** |
| 6 | Verificación adicional: dueño de la tabla y secuencia de `id` | `users` sigue siendo propiedad de `cinetruth_admin`; la secuencia de `id` se preservó (no se reinició a 1) |

**Conclusión:** el procedimiento de respaldo y restauración funciona de
extremo a extremo contra un escenario de pérdida total de la tabla, no solo
contra datos corruptos parcialmente. Con este job corriendo diariamente, el
RPO de 24h definido en la sección 1 es alcanzable en la práctica.

### Nota sobre un bug encontrado durante esta prueba

La primera corrida de `backup.sh` falló con
`permission denied for sequence users_id_seq` — el rol `cinetruth_backup`
tenía `SELECT` sobre las tablas pero no sobre las secuencias, y `pg_dump`
necesita leer ambas. Se corrigió agregando `GRANT SELECT ON ALL SEQUENCES...`
en `roles_backup.sql`. Se deja documentado como recordatorio: al agregar
tablas nuevas con columnas autoincrementales, confirmar que el rol de
respaldo también tiene acceso a sus secuencias.

### Evidencia adicional: primera corrida real en la máquina de un integrante del equipo

El 9 de agosto de 2026, al ejecutar `backup.sh` por primera vez en Windows
(vía Git Bash), aparecieron dos fallas reales antes de lograr un respaldo
exitoso — quedaron registradas en `backups/backup.log`:

- [2026-08-09 21:06:31] Iniciando respaldo -> .../cinetruth_20260809_210631.dump
- [2026-08-09 21:06:31] ERROR: el respaldo fallo -- revisar conexion/credenciales
- [2026-08-09 21:11:08] Iniciando respaldo -> .../cinetruth_20260809_211108.dump
- [2026-08-09 21:11:08] ERROR: el respaldo fallo -- revisar conexion/credenciales
- [2026-08-09 21:14:10] Iniciando respaldo -> .../cinetruth_20260809_211410.dump
- [2026-08-09 21:14:11] Respaldo completado correctamente (8.0K)
- [2026-08-09 21:14:11] Limpieza: 0 respaldo(s) con mas de 14 dias eliminado(s)

**Causa real:** `pg_dump` no estaba en el `PATH` de Git Bash en esa máquina
(el ejecutable de PostgreSQL vive en
`C:\Program Files\PostgreSQL\17\bin`, y Git Bash no lo encuentra por
defecto). El mensaje de error genérico ("revisar conexión/credenciales") no
lo decía explícitamente — se identificó revisando la salida completa de la
terminal (`./backup.sh: line 24: pg_dump: command not found`), no solo el
log resumido.

**Solución aplicada:** agregar la carpeta `bin` de PostgreSQL al `PATH` de
Git Bash de forma permanente:
```bash
echo 'export PATH="$PATH:/c/Program Files/PostgreSQL/17/bin"' >> ~/.bashrc
```

Se deja documentado porque es un problema esperable en cualquier máquina
nueva del equipo que no haya corrido el script antes — no es un bug del
script en sí, sino de configuración del entorno local.

## 4. Limitaciones conocidas

- **Tarea programada pendiente de confirmar en ejecución real no supervisada.**
  El script se probó manualmente con éxito (sección 3), y los pasos de
  configuración de la tarea de Windows están documentados (sección 2), pero
  todavía no hay evidencia de que haya corrido *sola*, sin que alguien la
  dispare a mano, en el horario programado. Debe confirmarse revisando
  `backup.log` al día siguiente de configurarla, sin haberla ejecutado
  manualmente ese día.
- **Sin monitoreo ni alertas automatizadas.** El RTO de 4h asume que alguien
  del equipo ya detectó la falla; el tiempo real hasta la detección no está
  cubierto por ningún mecanismo automático, solo por el uso normal de la
  aplicación.
- **`backup.log` no se revisa de forma proactiva.** Si el job de respaldo
  falla en silencio (ej. credencial vencida, disco lleno), el RPO real
  puede degradarse sin que nadie se entere hasta que se necesite restaurar.
- **Prueba de restauración única.** Se validó una vez (sección 3), sobre una
  sola tabla (`users`). Cuando aterricen `analyses`, `similar_cases` y
  `audit_log`, conviene repetir la prueba para confirmar que el mismo
  procedimiento sigue funcionando con el esquema completo.

Estas limitaciones se consideran aceptables para el alcance actual del
proyecto (académico, sin SLA), pero deberían resolverse antes de cualquier
despliegue con usuarios reales.