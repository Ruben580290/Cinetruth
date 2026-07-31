import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "../App.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import ProfilePage from "../pages/Auth/ProfilePage.jsx";
import ProtectedRoute from "./protected.route.jsx";
import routePaths from "./route.paths.js";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path={routePaths.home} element={<App />} />
      <Route path={routePaths.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path={routePaths.profile} element={<ProfilePage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
