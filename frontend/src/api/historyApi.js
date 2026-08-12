import { API_BASE_URL } from "./apiConfig";

const request = async (path, options = {}, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.details || fallbackMessage);
  }

  return data;
};

/**
 * Obtiene el historial de analisis del usuario autenticado.
 * @param {string} token
 * @param {{ from?: string, to?: string, verdict?: string }} filters
 */
export const getHistoryRequest = (token, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.verdict) params.append("verdict", filters.verdict);

  const query = params.toString();

  return request(
    `/history${query ? `?${query}` : ""}`,
    { headers: { Authorization: `Bearer ${token}` } },
    "No se pudo obtener el historial.",
  );
};
