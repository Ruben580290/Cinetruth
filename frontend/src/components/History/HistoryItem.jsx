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

const HistoryItem = ({ item }) => {
  const verdict = VERDICTS[item.verdict] || VERDICTS.SOSPECHOSO;

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
        <span className={cx(TEXT.micro, "text-ink/60")}>
          {formatDate(item.createdAt)}
        </span>
      </div>

      <p className="mt-4 font-semibold leading-relaxed">{item.summary}</p>

      <Badge tone="violet" size="xs" className="mt-4">
        {item.type === "image"
          ? "📷 Análisis de imagen"
          : "📰 Análisis de texto"}
      </Badge>
    </Card>
  );
};

export default HistoryItem;
