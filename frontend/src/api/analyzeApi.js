import { API_URL } from "./apiConfig";
import { getToken } from "../auth/authStorage";

/** Devuelve el header de autorizacion solo si hay sesion iniciada. */
const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Envia texto/titular al backend para analisis de veracidad.
 * @param {string} text
 */
export const analyzeText = async (text) => {
  const response = await fetch(`${API_URL}/api/analyze/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.details || data.error || "No se pudo analizar el texto.",
    );
  }

  return data;
};

/**
 * Envia una imagen al backend para analisis forense visual.
 * @param {File} file
 */
export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/api/analyze/image`, {
    method: "POST",
    headers: { ...authHeader() },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.details || data.error || "No se pudo analizar la imagen.",
    );
  }

  return data;
};
