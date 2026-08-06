import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import routePaths from "./routePaths";

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={routePaths.login}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
