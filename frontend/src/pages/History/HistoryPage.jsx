import { useEffect, useState } from "react";

import { useAuth } from "../../auth/AuthContext";
import {
  getHistoryRequest,
  deleteHistoryItemRequest,
  toggleSimilarCaseReviewRequest,
} from "../../api/historyApi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HistoryItem from "../../components/History/HistoryItem";
import { Button, Card, Container, TEXT } from "../../ui";

const VERDICT_OPTIONS = [
  { value: "", label: "Todos los veredictos" },
  { value: "VERIFICADO", label: "Verificado" },
  { value: "SOSPECHOSO", label: "Sospechoso" },
  { value: "FABRICADO", label: "Fabricado" },
];

const HistoryPage = () => {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [hasAnyHistory, setHasAnyHistory] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [verdict, setVerdict] = useState("");

  const loadHistory = async (filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await getHistoryRequest(token, filters);
      setItems(response.data);

      const noFiltersApplied = !filters.from && !filters.to && !filters.verdict;
      if (noFiltersApplied) {
        setHasAnyHistory(response.data.length > 0);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilter = (event) => {
    event.preventDefault();
    loadHistory({ from, to, verdict });
  };

  const handleClearFilters = () => {
    setFrom("");
    setTo("");
    setVerdict("");
    loadHistory({});
  };

  /**
   * Elimina un analisis. Si el backend confirma el borrado, quitamos el
   * item del estado local -> la vista se actualiza sin recargar la pagina.
   */
  const handleDeleteItem = async (id) => {
    await deleteHistoryItemRequest(token, id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Marca/desmarca un caso similar. Actualizamos solo ese item en el
   * estado local con la lista de indices que devuelve el backend.
   */
  const handleToggleSimilarCase = async (id, caseIndex, reviewed) => {
    const response = await toggleSimilarCaseReviewRequest(
      token,
      id,
      caseIndex,
      reviewed,
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reviewedSimilarCases: response.data.reviewedSimilarCases,
            }
          : item,
      ),
    );
  };

  const filtersApplied = Boolean(from || to || verdict);

  return (
    <div className="min-h-screen bg-cream text-ink paper-noise">
      <Header />

      <main className="py-14">
        <Container width="narrow">
          <div className="mb-8">
            <h1 className="font-display text-4xl leading-none md:text-5xl">
              MI HISTORIAL
            </h1>
            <p className="mt-2 font-semibold text-ink/70">
              Todo el chisme que ya destapaste antes.
            </p>
          </div>

          <Card
            as="form"
            onSubmit={handleFilter}
            tone="paper"
            shadow="sm"
            shape="irregularAlt"
            padding="md"
            className="mb-8 flex flex-wrap items-end gap-4"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="from" className={TEXT.micro}>
                Desde
              </label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="border-3 border-ink px-3 py-2 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="to" className={TEXT.micro}>
                Hasta
              </label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="border-3 border-ink px-3 py-2 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="verdict" className={TEXT.micro}>
                Veredicto
              </label>
              <select
                id="verdict"
                value={verdict}
                onChange={(event) => setVerdict(event.target.value)}
                className="border-3 border-ink px-3 py-2 font-mono text-xs"
              >
                {VERDICT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="success" size="sm">
              Filtrar
            </Button>

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
            <p className="text-center font-comic text-2xl">
              Buscando tus chismes...
            </p>
          )}

          {!loading && error && (
            <p role="alert" className="text-center font-semibold">
              😵 {error}
            </p>
          )}

          {!loading && !error && !hasAnyHistory && (
            <Card
              tone="paper"
              shadow="sm"
              shape="irregular"
              padding="lg"
              className="text-center"
            >
              <p className="font-comic text-2xl">Todavía no destapas nada 🕵️</p>
              <p className="mt-2 font-semibold text-ink/70">
                Analiza tu primera noticia o imagen y aquí va a quedar guardada.
              </p>
            </Card>
          )}

          {!loading && !error && hasAnyHistory && items.length === 0 && (
            <Card
              tone="paper"
              shadow="sm"
              shape="irregular"
              padding="lg"
              className="text-center"
            >
              <p className="font-comic text-2xl">Nada por aquí 🔍</p>
              <p className="mt-2 font-semibold text-ink/70">
                No hay análisis que coincidan con esos filtros. Prueba con otras
                fechas o veredicto.
              </p>
            </Card>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                  onToggleSimilarCase={handleToggleSimilarCase}
                />
              ))}
            </ul>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
