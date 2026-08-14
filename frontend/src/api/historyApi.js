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

/**
 * Elimina un analisis del historial del usuario autenticado.
 * @param {string} token
 * @param {number} id
 */
export const deleteHistoryItemRequest = (token, id) =>
  request(
    `/history/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
    "No se pudo eliminar la consulta.",
  );

/**
 * Marca o desmarca un caso similar como revisado.
 * @param {string} token
 * @param {number} id - id del registro de historial
 * @param {number} caseIndex - indice del caso dentro de resultData.similarCases
 * @param {boolean} reviewed
 */
export const toggleSimilarCaseReviewRequest = (
  token,
  id,
  caseIndex,
  reviewed,
) =>
  request(
    `/history/${id}/similar-cases/${caseIndex}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reviewed }),
    },
    "No se pudo actualizar el caso similar.",
  );
