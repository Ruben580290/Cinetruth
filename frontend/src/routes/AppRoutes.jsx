import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext.jsx";
import App from "../App.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import RegisterPage from "../pages/Auth/RegisterPage.jsx";
import ProfilePage from "../pages/Auth/ProfilePage.jsx";
import HistoryPage from "../pages/History/HistoryPage.jsx";
import UsersAdminPage from "../pages/Admin/UsersAdminPage.jsx";
import ProtectedRoute, { RoleProtectedRoute } from "./protectedRoute.jsx";
import routePaths from "./routePaths.js";

const AppRoutes = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path={routePaths.home} element={<App />} />
        <Route path={routePaths.login} element={<LoginPage />} />
        <Route path={routePaths.register} element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={routePaths.profile} element={<ProfilePage />} />
          <Route path={routePaths.history} element={<HistoryPage />} />
        </Route>

        <Route element={<RoleProtectedRoute role="admin" />}>
          <Route path={routePaths.adminUsers} element={<UsersAdminPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRoutes;
