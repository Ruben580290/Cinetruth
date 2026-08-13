import { Link, useNavigate } from "react-router-dom";

import routePaths from "../routes/routePaths";
import { useAuth } from "../auth/AuthContext";
import { Button, Container, Starburst, TEXT } from "../ui";

const NAV_LINKS = [
  { href: "/#analizar", label: "Destapar chisme" },
  { href: "/#como-funciona", label: "La receta" },
  { href: "/#equipo", label: "La redacción" },
];

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(routePaths.home);
  };

  return (
    <header className="sticky top-0 z-50 border-b-4 border-ink bg-paper/95 backdrop-blur-sm">
      <Container className="flex items-center justify-between gap-4 py-3">
        <a href="#top" className="group flex items-center gap-3">
          <Starburst tone="electric" size="sm">
            💥
          </Starburst>
          <div>
            <span className="block font-display text-lg leading-none md:text-2xl">
              CINE<span className="text-hotpink">TRUTH</span>
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[.22em]">
              Chisme bajo sospecha
            </span>
          </div>
        </a>

        <nav className={`hidden items-center gap-7 ${TEXT.label} lg:flex`}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}

          {isAuthenticated ? (
            <>
              <Link to={routePaths.history}>Mi historial</Link>
              {user?.role === "admin" && (
                <Link to={routePaths.adminUsers}>🗂️ Usuarios</Link>
              )}
              <Link to={routePaths.profile}>
                👋 Hola, {user?.name?.split(" ")[0] || "reportero"}
              </Link>
              <Button variant="ghost" size="none" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to={routePaths.login}>Iniciar sesión</Link>
              <Link to={routePaths.register}>Crear cuenta</Link>
            </>
          )}
        </nav>

        <Button
          as="a"
          href="/#analizar"
          variant="success"
          size="sm"
          shape="irregular"
        >
          🕵️ Chismógrafo listo
        </Button>
      </Container>
    </header>
  );
};

export default Header;
