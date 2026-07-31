import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getAuthToken } from "../auth/auth.storage";
import routePaths from "./route.paths";

const ProtectedRoute = () => {
  const location = useLocation();

  if (!getAuthToken()) {
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