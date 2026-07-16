# Proyecto_Dev_Challenge
# CineTruth: Verificador de Rumores de Farándula

## Contexto del Proyecto
CineTruth es una herramienta de alfabetización mediática centrada en la farándula cinematográfica. Su objetivo es combatir la desinformación digital permitiendo que los usuarios verifiquen titulares o capturas de pantalla de rumores sobre actores de cine. El sistema no solo determina si una noticia es falsa, sino que educa al usuario sobre cómo identificar patrones de engaño.

## Alcance y Objetivos
- **Enfoque:** Rumores de farándula y cine.
- **Funcionalidad principal:** Análisis de veracidad mediante la Google Fact Check Tools API.
- **Educación:** Proporcionar explicaciones detalladas y recomendaciones personalizadas para identificar noticias falsas.
- **Entradas permitidas:** Texto plano, imágenes (capturas de pantalla) y, próximamente, documentos (.txt, .docx).
- **Plazo:** Proyecto de desarrollo rápido (7 días).

## Stack Tecnológico
- **Lenguaje:** Python.
- **Framework Web:** Streamlit (para interfaz rápida y reactiva).
- **IA/Procesamiento:** Google Gemini (generación de explicaciones y recomendaciones).
- **OCR:** Pytesseract (extracción de texto de imágenes).
- **Base de Datos:** Supabase (PostgreSQL para historial de consultas y logs).
- **Gestión:** Scrum (equipo de 3 personas).

## Estructura de Base de Datos (Supabase)
1. **`verified_claims`**: Almacena el `original_text`, `verdict_explanation`, `literacy_recommendations`, `fact_check_source`, `source_url` y `created_at`.
2. **`admin_logs`**: Almacena logs de errores (`error_message`, `input_snippet`, `created_at`).

## Lógica de Procesamiento
1. **Ingesta:** El usuario carga un texto o archivo mediante la interfaz.
2. **Normalización:** Si es imagen, se aplica OCR; si es documento, se extrae el texto.
3. **Validación:** Se consulta la API de Fact Check.
4. **Análisis:** El texto + resultado de la API se envían a Gemini con un *System Prompt* definido para generar el veredicto y consejos educativos.
5. **Persistencia:** Se guarda el resultado en Supabase para futuras consultas.

## Estructura de Administración
- Interfaz para visualizar, editar o eliminar registros de noticias falsas.
- Capacidad de ajustar las recomendaciones de seguridad según la categoría de la noticia.

## Instrucciones para la IA colaboradora
- Siempre mantener un tono educativo, imparcial y profesional.
- Basar toda explicación de veracidad en la evidencia de la API de Fact Check.
- Seguir la estructura de respuesta: "Análisis del Veredicto" y "Recomendaciones de Alfabetización".