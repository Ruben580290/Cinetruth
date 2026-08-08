# ADR 0002: Funciones flecha como estándar de sintaxis

## Fecha

2026-07-20

## Participantes

- Gabriel Rivera
- Rubén Verdesoto
- David Hurtado

## Contexto

El código mezclaba `function nombre() {}` con `const nombre = () => {}`,
lo que rompía la consistencia del estilo.

## Decisión

Usar siempre `const nombre = () => {}` en lugar de `function nombre() {}`,
tanto en componentes React como en funciones del backend (controllers,
middlewares, rutas).

## Consecuencias

- Estilo uniforme en todo el proyecto.
- `this` no cambia de contexto dentro de callbacks.
- ESLint (`eslint.config.js`) ya valida JS/JSX, se puede sumar la regla
  `prefer-arrow-callback` para forzar esto automáticamente.
