# Cine Truth

Verificador de imágenes y textos/titulares de farándula que podrían 
estar fabricados o alterados con IA, usando una API de Gemini.

Estructura:

```
Cinetruth/
  backend/    -> API en Express (Node.js) + Gemini AI
  frontend/   -> Interfaz en React + Vite + Tailwind
```

## 1. Backend

Abre una terminal en `backend`:

```
cd backend
npm install
npm run dev
```

Debe salir en consola: `Cine Truth backend corriendo en http://localhost:5006`

## 2. Frontend

Abre OTRA terminal (deja la del backend corriendo) en `frontend`:

```
cd frontend
npm install
npm run dev
```

Te va a dar un link, normalmente `http://localhost:5173`. Ábrelo en el
navegador y ya deberías ver la página funcionando, conectada al backend.

## 3. Probar que funciona

- Pestaña "Texto / Titular": pega un titular de farándula cualquiera y dale
  "Analizar ahora".
- Pestaña "Imagen": sube una foto (JPEG o PNG, máx. 5MB) y dale "Analizar
  ahora".

Si ves un error de conexión, revisa que el backend siga corriendo en el
puerto 5006 y que la clave de Gemini esté bien puesta en el `.env`.

## Notas técnicas

- El backend no usa base de datos: todo el análisis pasa por Gemini en cada
  petición, así el proyecto corre sin instalar Postgres.
- El endpoint `/api/analyze/text` recibe `{ text }` y el endpoint
  `/api/analyze/image` recibe un `multipart/form-data` con el campo `image`.
- Ambos devuelven la misma forma de respuesta: `verdict`, `suspicionScore`,
  `semaphore`, `flags` y `summary`.

## Diseño Pop-Art / Neo-Brutalista

El frontend fue renovado con una estética de revista de chismes, microinteracciones, copy satírico y un Chismómetro Explosivo. Para ejecutar el backend, configura el `.env` y configura una clave nueva de Gemini.
