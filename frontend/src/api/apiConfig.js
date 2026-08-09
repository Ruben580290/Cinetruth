/** URL base del backend. Antes estaba escrita a mano en 4 archivos. */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5006";

/** Prefijo de la API REST. */
export const API_BASE_URL = `${API_URL}/api`;
