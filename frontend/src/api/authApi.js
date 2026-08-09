import { API_BASE_URL } from "./apiConfig";

const request = async (path, options = {}, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const jsonPost = (path, body, fallbackMessage) =>
  request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    fallbackMessage,
  );

export const loginRequest = (credentials) =>
  jsonPost("/auth/login", credentials, "No fue posible iniciar sesión");

export const registerRequest = (formData) =>
  jsonPost("/auth/register", formData, "No se pudo crear la cuenta");

export const getProfileRequest = (token) =>
  request(
    "/auth/me",
    { headers: { Authorization: `Bearer ${token}` } },
    "La sesión ya no es válida",
  );
