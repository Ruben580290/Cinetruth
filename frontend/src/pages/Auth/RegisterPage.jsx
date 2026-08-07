import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import routePaths from "../../routes/routePaths";
import Button from "../../components/common/Button";

const API_BASE_URL = "http://localhost:5006/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routePaths.profile, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo crear la cuenta");
      }

      setSuccessMessage(
        `Cuenta creada para ${data.user.email}. Ya puedes iniciar sesión.`,
      );
      setFormData(initialForm);
      setTimeout(() => navigate(routePaths.login), 1500);
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
        className="irregular-alt w-full max-w-md border-4 border-ink bg-paper p-8 shadow-brutal"
      >
        <span className="starburst mx-auto flex h-14 w-14 items-center justify-center bg-lime text-2xl">
          📝
        </span>
        <h1 className="mt-6 text-center font-display text-3xl leading-tight">
          ÚNETE A LA <span className="text-hotpink">REDACCIÓN</span>
        </h1>
        <p className="mt-2 text-center font-mono text-[11px] font-bold uppercase tracking-wide text-ink/70">
          Crea tu credencial de reportero
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="block font-mono text-xs font-bold uppercase"
            >
              Nombre
            </label>
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="mt-2 w-full border-3 border-ink bg-white px-3 py-2 font-semibold outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block font-mono text-xs font-bold uppercase"
            >
              Apellido
            </label>
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
              required
              className="mt-2 w-full border-3 border-ink bg-white px-3 py-2 font-semibold outline-none"
            />
          </div>
        </div>

        <label
          htmlFor="email"
          className="mt-4 block font-mono text-xs font-bold uppercase"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
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
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
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
        {successMessage && (
          <p
            role="status"
            className="mt-4 border-3 border-ink bg-lime px-3 py-2 text-center font-bold"
          >
            🎉 {successMessage}
          </p>
        )}

        <Button
          type="submit"
          variant="accent"
          size="md"
          fullWidth
          disabled={isLoading}
          className="mt-6"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <p className="mt-4 text-center font-mono text-xs font-bold uppercase">
          ¿Ya tienes cuenta?{" "}
          <Link to={routePaths.login} className="text-hotpink underline">
            Inicia sesión
          </Link>
        </p>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleContinue}
          className="mt-8"
        >
          Volver
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
