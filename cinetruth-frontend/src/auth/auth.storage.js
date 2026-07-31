const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const getAuthUser = () => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

const saveAuthSession = ({ token, user }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export { clearAuthSession, getAuthToken, getAuthUser, saveAuthSession };