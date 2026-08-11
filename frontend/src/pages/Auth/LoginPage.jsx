import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import routePaths from "../../routes/routePaths";
import { loginRequest } from "../../api/authApi";
import { Alert, AuthLayout, Button, TextField, TEXT } from "../../ui";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Si ya hay sesion activa, no tiene sentido mostrar el formulario otra vez.
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
      const data = await loginRequest(credentials);
      login(data);
      navigate(location.state?.from || routePaths.profile, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      icon="🔐"
      iconTone="electric"
      shape="irregular"
      onSubmit={handleSubmit}
      title={
        <>
          ENTRA A LA <span className="text-hotpink">REDACCIÓN</span>
        </>
      }
      subtitle="Solo para reporteros acreditados"
    >
      <TextField
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        value={credentials.email}
        onChange={handleChange}
        required
        className="mt-6"
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        value={credentials.password}
        onChange={handleChange}
        minLength={6}
        required
        className="mt-4"
      />

      {error && (
        <Alert tone="hotpink" className="mt-4">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="success"
        size="md"
        fullWidth
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? "Verificando..." : "Ingresar"}
      </Button>

      <p className={`mt-4 text-center ${TEXT.label}`}>
        ¿Aún no tienes cuenta?{" "}
        <Link to={routePaths.register} className="text-hotpink underline">
          Regístrate
        </Link>
      </p>

      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={() => navigate(routePaths.home)}
        className="mt-8"
      >
        Volver
      </Button>
    </AuthLayout>
  );
};

export default LoginPage;