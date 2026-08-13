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

export const RoleProtectedRoute = ({ role }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={routePaths.login}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (user?.role !== role) {
    return (
      <Navigate
        to={routePaths.home}
        state={{ accessDeniedFrom: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
