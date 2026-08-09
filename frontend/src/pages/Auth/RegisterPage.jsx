import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import routePaths from "../../routes/routePaths";
import { registerRequest } from "../../api/authApi";
import { Alert, AuthLayout, Button, TextField, TEXT } from "../../ui";

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
      const data = await registerRequest(formData);
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

  return (
    <AuthLayout
      icon="📝"
      iconTone="lime"
      shape="irregularAlt"
      onSubmit={handleSubmit}
      title={
        <>
          ÚNETE A LA <span className="text-hotpink">REDACCIÓN</span>
        </>
      }
      subtitle="Crea tu credencial de reportero"
    >
      <div className="mt-6 grid grid-cols-2 gap-3">
        <TextField
          id="firstName"
          name="firstName"
          label="Nombre"
          autoComplete="given-name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <TextField
          id="lastName"
          name="lastName"
          label="Apellido"
          autoComplete="family-name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <TextField
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        autoComplete="off"
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        required
        className="mt-4"
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="new-password"
        placeholder="Mínimo 6 caracteres"
        value={formData.password}
        onChange={handleChange}
        disabled={isLoading}
        minLength={6}
        required
        className="mt-4"
      />

      {error && (
        <Alert tone="hotpink" className="mt-4">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert tone="lime" role="status" className="mt-4">
          {successMessage}
        </Alert>
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

      <p className={`mt-4 text-center ${TEXT.label}`}>
        ¿Ya tienes cuenta?{" "}
        <Link to={routePaths.login} className="text-hotpink underline">
          Inicia sesión
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

export default RegisterPage;