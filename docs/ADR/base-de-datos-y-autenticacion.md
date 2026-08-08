# ADR 0003: Base de datos y autenticación

## Fecha

07-08-2026

## Participantes

- Gabriel Rivera
- Rubén Verdesoto
- David Hurtado

## Contexto

CineTruth necesita guardar usuarios y proteger ciertas rutas del backend.

## Decisión

- PostgreSQL como base de datos, con `synchronize: false` en TypeORM:
  los cambios de esquema se manejan manualmente, no de forma automática.
- Contraseñas guardadas con `bcryptjs` (hash, nunca texto plano).
- Autenticación con JWT (`jsonwebtoken`), token válido por 2 horas.
- Rutas protegidas usan un middleware (`authMiddleware`) que valida el
  token antes de dejar pasar la petición.

## Consecuencias

- Ningún cambio de tabla se aplica solo; hay que migrarlo a mano.
- El backend no guarda sesiones: cada petición se valida con el token.
- Si el token expira, el usuario debe volver a iniciar sesión.
