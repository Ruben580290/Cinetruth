import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import routePaths from "../../routes/routePaths";

const API_BASE_URL = "http://localhost:5006/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Si ya hay sesion activa, no tiene sentido mostrar el formulario
  // de login otra vez -> se manda directo a su perfil.
  useEffect(() => {
    if (isAuthenticated) {
      navigate(routePaths.profile, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No fue posible iniciar sesión");
      }

      login(data);
      navigate(location.state?.from || routePaths.profile, {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(routePaths.home);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 paper-noise">
      <form
        onSubmit={handleSubmit}
        className="irregular w-full max-w-md border-4 border-ink bg-paper p-8 shadow-brutal"
      >
        <span className="starburst mx-auto flex h-14 w-14 items-center justify-center bg-electric text-2xl">
          🔐
        </span>
        <h1 className="mt-6 text-center font-display text-3xl leading-tight">
          ENTRA A LA <span className="text-hotpink">REDACCIÓN</span>
        </h1>
        <p className="mt-2 text-center font-mono text-[11px] font-bold uppercase tracking-wide text-ink/70">
          Solo para reporteros acreditados
        </p>

        <label
          htmlFor="email"
          className="mt-6 block font-mono text-xs font-bold uppercase"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={credentials.email}
          onChange={handleChange}
          required
          className="mt-2 w-full border-3 border-ink bg-white px-3 py-2 font-semibold outline-none"
        />

        <label
          htmlFor="password"
          className="mt-4 block font-mono text-xs font-bold uppercase"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          minLength={6}
          required
          className="mt-2 w-full border-3 border-ink bg-white px-3 py-2 font-semibold outline-none"
        />

        {error && (
          <p
            role="alert"
            className="mt-4 border-3 border-ink bg-hotpink px-3 py-2 text-center font-bold text-white"
          >
            😵 {error}
          </p>
        )}

        <button
          disabled={isLoading}
          className="mt-6 w-full border-3 border-ink bg-lime px-4 py-3 font-mono text-xs font-bold uppercase shadow-brutal-sm disabled:opacity-50"
        >
          {isLoading ? "Verificando..." : "Ingresar"}
        </button>

        <p className="mt-4 text-center font-mono text-xs font-bold uppercase">
          ¿Aún no tienes cuenta?{" "}
          <Link to={routePaths.register} className="text-hotpink underline">
            Regístrate
          </Link>
        </p>

        <button
          type="button"
          onClick={handleContinue}
          className="mt-8 w-full border-3 border-ink bg-cyan px-4 py-3 font-mono text-xs font-bold uppercase text-black shadow-brutal-sm"
        >
          Volver
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
