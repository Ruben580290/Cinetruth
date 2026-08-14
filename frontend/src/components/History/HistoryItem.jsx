import { useState } from "react";
import { Badge, Card, TEXT, TONE, cx } from "../../ui";

const VERDICTS = {
  VERIFICADO: { label: "PARECE LEGÍTIMO, MI CIELA", tone: "lime", emoji: "😌" },
  SOSPECHOSO: {
    label: "AQUÍ HAY GATO ENCERRADO",
    tone: "electric",
    emoji: "👀",
  },
  FABRICADO: { label: "PURO CUENTO CON PELUCA", tone: "hotpink", emoji: "🤡" },
};

const formatDate = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
};

/**
 * item.resultData.similarCases -> [{ title, sourceUrl, ... }]
 * item.reviewedSimilarCases -> [0, 2, ...] (indices ya revisados)
 */
const HistoryItem = ({ item, onDelete, onToggleSimilarCase }) => {
  const verdict = VERDICTS[item.verdict] || VERDICTS.SOSPECHOSO;
  const similarCases = item.resultData?.similarCases || [];
  const reviewedSet = new Set(item.reviewedSimilarCases || []);

  const [deleting, setDeleting] = useState(false);
  const [togglingIndex, setTogglingIndex] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleDelete = async () => {
    if (
      !window.confirm(
        "¿Seguro que quieres eliminar este análisis de tu historial? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setActionError("");
    setDeleting(true);
    try {
      await onDelete(item.id);
      // Si onDelete tiene éxito, el padre quita el item de la lista;
      // este componente se desmonta y no hace falta setDeleting(false).
    } catch (error) {
      setActionError(error.message);
      setDeleting(false);
    }
  };

  const handleToggleCase = async (caseIndex, nextReviewed) => {
    setActionError("");
    setTogglingIndex(caseIndex);
    try {
      await onToggleSimilarCase(item.id, caseIndex, nextReviewed);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setTogglingIndex(null);
    }
  };

  return (
    <Card as="li" tone="paper" shadow="sm" shape="irregular" padding="md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={cx(
            "inline-flex items-center gap-2 border-3 border-ink px-3 py-1",
            TEXT.micro,
            TONE[verdict.tone],
          )}
        >
          <span>{verdict.emoji}</span> {verdict.label}
        </div>

        <div className="flex items-center gap-3">
          <span className={cx(TEXT.micro, "text-ink/60")}>
            {formatDate(item.createdAt)}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="border-3 border-ink px-2 py-1 font-mono text-xs font-bold hover:bg-hotpink hover:text-white disabled:opacity-50"
          >
            {deleting ? "Eliminando..." : "🗑️ Eliminar"}
          </button>
        </div>
      </div>

      <p className="mt-4 font-semibold leading-relaxed">{item.summary}</p>

      <Badge tone="violet" size="xs" className="mt-4">
        {item.inputType === "image"
          ? "📷 Análisis de imagen"
          : "📰 Análisis de texto"}
      </Badge>

      {actionError && (
        <p
          role="alert"
          className="mt-3 font-mono text-xs font-semibold text-hotpink"
        >
          😵 {actionError}
        </p>
      )}

      {similarCases.length > 0 && (
        <div className="mt-4 border-t-3 border-ink/20 pt-4">
          <p className={TEXT.micro}>Casos similares</p>
          <ul className="mt-2 flex flex-col gap-2">
            {similarCases.map((similarCase, index) => {
              const isReviewed = reviewedSet.has(index);
              const isToggling = togglingIndex === index;

              return (
                <li
                  key={`${similarCase.sourceUrl}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-3 border-ink/30 px-3 py-2"
                >
                  <a
                    href={similarCase.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-2"
                  >
                    {similarCase.title}
                  </a>

                  <label className="flex items-center gap-2 font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={isReviewed}
                      disabled={isToggling}
                      onChange={(event) =>
                        handleToggleCase(index, event.target.checked)
                      }
                    />
                    {isToggling
                      ? "Guardando..."
                      : isReviewed
                        ? "Revisado ✅"
                        : "Marcar como revisado"}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default HistoryItem;
