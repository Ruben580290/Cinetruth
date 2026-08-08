# ADR 0001: Stack tecnológico

## Fecha

2026-07-15

## Participantes

- Gabriel Rivera
- Rubén Verdesoto
- David Hurtado

## Contexto

CineTruth necesita un frontend rápido de construir, un backend simple de mantener,
y una forma de generar análisis de contenido con IA.

## Decisión

- **Frontend:** React + Vite + Tailwind CSS.
- **Backend:** Node.js + Express.
- **Base de datos:** PostgreSQL, gestionada con TypeORM.
- **IA:** Gemini API (`@google/genai`), modelo configurable vía `GEMINI_MODEL`.

## Consecuencias

- Un solo lenguaje (JavaScript) en todo el proyecto.
- Vite da recarga rápida en desarrollo.
- TypeORM permite definir entidades sin escribir SQL a mano.
