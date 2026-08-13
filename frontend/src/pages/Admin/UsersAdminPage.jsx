import { useEffect, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import { getUsersRequest } from "../../api/usersApi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import UsersTable from "../../components/Admin/UsersTable";
import { Button, Card, Container, TEXT, TextField } from "../../ui";

const ROLE_OPTIONS = [
  { value: "", label: "Todos los roles" },
  { value: "user", label: "Usuario" },
  { value: "admin", label: "Admin" },
];

/** Espera a que la persona deje de escribir antes de disparar la busqueda. */
const SEARCH_DEBOUNCE_MS = 400;

const UsersAdminPage = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [hasAnyUser, setHasAnyUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const loadUsers = async (filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await getUsersRequest(token, filters);
      setUsers(response.data);

      const noFiltersApplied = !filters.search && !filters.role;
      if (noFiltersApplied) {
        setHasAnyUser(response.data.length > 0);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial.
  useEffect(() => {
    loadUsers({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Busqueda/filtro reactivos, con un pequeño debounce en el texto para
  // no disparar una peticion por cada tecla.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers({ search, role });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  const handleClearFilters = () => {
    setSearch("");
    setRole("");
  };

  const filtersApplied = Boolean(search || role);

  return (
    <div className="min-h-screen bg-cream text-ink paper-noise">
      <Header />

      <main className="py-14">
        <Container width="medium">
          <div className="mb-8">
            <h1 className="font-display text-4xl leading-none md:text-5xl">
              USUARIOS REGISTRADOS
            </h1>
            <p className="mt-2 font-semibold text-ink/70">
              Quién tiene acceso a la redacción y con qué rol.
            </p>
          </div>

          <Card
            tone="paper"
            shadow="sm"
            shape="irregularAlt"
            padding="md"
            className="mb-8 flex flex-wrap items-end gap-4"
          >
            <TextField
              id="search"
              label="Buscar por nombre o correo"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ej: maria@correo.com"
              className="flex flex-1 min-w-[220px] flex-col gap-1"
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="role" className={TEXT.micro}>
                Rol
              </label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="border-3 border-ink px-3 py-2 font-mono text-xs"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {filtersApplied && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </Card>

          {loading && (
            <p className="text-center font-comic text-2xl">Pasando lista...</p>
          )}

          {!loading && error && (
            <Card
              tone="paper"
              shadow="sm"
              shape="irregular"
              padding="lg"
              className="text-center"
            >
              <p className="font-comic text-2xl">😵 No se pudo cargar</p>
              <p className="mt-2 font-semibold text-ink/70">{error}</p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => loadUsers({ search, role })}
              >
                Reintentar
              </Button>
            </Card>
          )}

          {!loading && !error && !hasAnyUser && (
            <Card
              tone="paper"
              shadow="sm"
              shape="irregular"
              padding="lg"
              className="text-center"
            >
              <p className="font-comic text-2xl">Todavía no hay nadie 🕸️</p>
              <p className="mt-2 font-semibold text-ink/70">
                Cuando alguien se registre en Cine Truth, va a aparecer aquí.
              </p>
            </Card>
          )}

          {!loading && !error && hasAnyUser && users.length === 0 && (
            <Card
              tone="paper"
              shadow="sm"
              shape="irregular"
              padding="lg"
              className="text-center"
            >
              <p className="font-comic text-2xl">Nadie coincide 🔍</p>
              <p className="mt-2 font-semibold text-ink/70">
                No hay usuarios que coincidan con esa búsqueda o ese rol.
              </p>
            </Card>
          )}

          {!loading && !error && users.length > 0 && (
            <>
              <p className={`${TEXT.micro} mb-3 text-ink/60`}>
                {users.length}{" "}
                {users.length === 1
                  ? "usuario encontrado"
                  : "usuarios encontrados"}
              </p>
              <UsersTable
                users={users}
                onUserUpdated={(updatedUser) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === updatedUser.id ? updatedUser : u,
                    ),
                  )
                }
              />
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default UsersAdminPage;
