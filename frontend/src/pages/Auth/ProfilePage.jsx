import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import routePaths from "../../routes/routePaths";

const API_BASE_URL = "http://localhost:5006/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "La sesión ya no es válida");
        }

        setUser(data.user);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadProfile();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate(routePaths.login);
  };

  const handleContinue = () => {
    navigate(routePaths.home);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 paper-noise">
      <div className="irregular w-full max-w-md border-4 border-ink bg-paper p-8 shadow-brutal">
        <span className="starburst mx-auto flex h-14 w-14 items-center justify-center bg-electric text-2xl">
          🕵️
        </span>

        {error && (
          <>
            <p role="alert" className="mt-6 text-center font-semibold">
              😵 {error}
            </p>
            <Link
              to={routePaths.login}
              className="mt-6 block border-3 border-ink bg-lime px-4 py-3 text-center font-mono text-xs font-bold uppercase shadow-brutal-sm"
            >
              Volver a iniciar sesión
            </Link>
          </>
        )}

        {!error && !user && (
          <p className="mt-6 text-center font-comic text-2xl">
            Comprobando la sesión...
          </p>
        )}

        {!error && user && (
          <>
            <h1 className="mt-6 text-center font-display text-3xl leading-tight">
              Bienvenido, {user.name}
            </h1>
            <p className="mt-3 text-center font-semibold text-ink/70">
              {user.email}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 w-full border-3 border-ink bg-hotpink px-4 py-3 font-mono text-xs font-bold uppercase text-white shadow-brutal-sm"
            >
              Cerrar sesión
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="mt-8 w-full border-3 border-ink bg-cyan px-4 py-3 font-mono text-xs font-bold uppercase text-black shadow-brutal-sm"
            >
              Continuar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
