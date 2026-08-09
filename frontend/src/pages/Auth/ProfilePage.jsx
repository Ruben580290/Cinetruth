import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import routePaths from "../../routes/routePaths";
import { getProfileRequest } from "../../api/authApi";
import { AuthLayout, Button } from "../../ui";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfileRequest(token);
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

  return (
    <AuthLayout icon="🕵️" iconTone="electric" shape="irregular">
      {error && (
        <>
          <p role="alert" className="mt-6 text-center font-semibold">
            😵 {error}
          </p>
          <Button
            as={Link}
            to={routePaths.login}
            variant="success"
            size="md"
            className="mt-6 block text-center"
          >
            Volver a iniciar sesión
          </Button>
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

          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleLogout}
            className="mt-8"
          >
            Cerrar sesión
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigate(routePaths.home)}
            className="mt-8"
          >
            Continuar
          </Button>
        </>
      )}
    </AuthLayout>
  );
};

export default ProfilePage;
