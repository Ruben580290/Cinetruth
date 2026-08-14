import { API_BASE_URL } from "./apiConfig";

const request = async (path, options = {}, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || fallbackMessage);
  }

  return data;
};

export const getUsersRequest = (token, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.role) params.append("role", filters.role);

  const query = params.toString();

  return request(
    `/users${query ? `?${query}` : ""}`,
    { headers: { Authorization: `Bearer ${token}` } },
    "No se pudo obtener el listado de usuarios.",
  );
};

export const updateUserRoleRequest = (token, userId, role) =>
  request(
    `/users/${userId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    },
    "No se pudo cambiar el rol del usuario.",
  );

export const deactivateUserRequest = (token, userId) =>
  request(
    `/users/${userId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: false }),
    },
    "No se pudo desactivar la cuenta.",
  );

export const activateUserRequest = (token, userId) =>
  request(
    `/users/${userId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: true }),
    },
    "No se pudo activar la cuenta.",
  );
