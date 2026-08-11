import { Badge, Card, TEXT } from "../ui";

const LABELS = {
  SI: { text: "ESTO YA OLÍA A QUEMADO", tone: "hotpink", emoji: "🔥" },
  PROBABLE: { text: "PRIMO CERCANO DEL HUMO", tone: "electric", emoji: "🤥" },
  INCIERTO: { text: "TODAVÍA EN EL CAMERINO", tone: "cyan", emoji: "👀" },
};

const SimilarCasesCard = ({ cases }) => {
  if (!Array.isArray(cases) || cases.length === 0) return null;

  return (
    <Card
      as="section"
      tone="violet"
      shadow="md"
      shape="irregular"
      padding="card"
      className="mt-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 text-white">
        <div>
          <p className={TEXT.kicker}>El archivo del bochorno</p>
          <h3 className="mt-2 font-display text-3xl md:text-4xl">
            OTROS CHISMES CON EL MISMO PERFUME
          </h3>
        </div>
        <Badge tone="lime" size="comicMd" className="rotate-2">
          PARA SEGUIR HUSMEANDO
        </Badge>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {cases.map((item, index) => {
          const style = LABELS[item.likelyFake] || LABELS.INCIERTO;

          return (
            <Card
              key={`${item.sourceUrl}-${index}`}
              as="article"
              tone="paper"
              shadow="sm"
              shape="irregularAlt"
            >
              <Badge tone={style.tone} size="xs" shadow="none">
                {style.emoji} {style.text}
              </Badge>
              <h4 className="mt-4 font-comic text-2xl leading-tight">
                {item.title}
              </h4>
              {item.whyRelevant && (
                <p className="mt-3 font-semibold leading-relaxed">
                  {item.whyRelevant}
                </p>
              )}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 inline-flex border-b-4 border-hotpink ${TEXT.label}`}
              >
                Abrir el recibo: {item.sourceName || "fuente"} &#8599;
              </a>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

export default SimilarCasesCard;