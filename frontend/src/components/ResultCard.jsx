import ScoreGauge from "./ScoreGauge";
import { Badge, Card, TEXT, TONE, cx } from "../ui";

const VERDICTS = {
  VERIFICADO: { label: "PARECE LEGÍTIMO, MI CIELA", tone: "lime", emoji: "😌" },
  SOSPECHOSO: {
    label: "AQUÍ HAY GATO ENCERRADO",
    tone: "electric",
    emoji: "👀",
  },
  FABRICADO: { label: "PURO CUENTO CON PELUCA", tone: "hotpink", emoji: "🤡" },
};

/** Colores rotativos de las tarjetas de "flags". */
const FLAG_TONES = ["pink", "electric", "lime"];

const fallbackAdvice = (score, type) => {
  if (score >= 65)
    return type === "image"
      ? "La próxima, mira manos, letras y fondos. Si todo parece derretido o alguien tiene dedos de colección, no compartas todavía."
      : "Antes de reenviar, busca quién lo dijo, dónde lo dijo y cuándo. Si el titular grita pero no cuenta nada, te están vendiendo humo premium.";
  if (score >= 30)
    return "No te cases con el primer pantallazo. Busca otra fuente seria y revisa si todos cuentan la misma historia, no una novela distinta.";
  return "Va bastante bien, pero igual revisa la fecha y la fuente. Hasta el chisme más decente puede venir reciclado de 2017.";
};

const ResultCard = ({ result }) => {
  if (!result) return null;

  const verdict = VERDICTS[result.verdict] || VERDICTS.SOSPECHOSO;
  const explanation =
    result.summary ||
    result.semaphore?.explanation ||
    "La evidencia vino con misterio incluido.";
  const recommendation =
    result.recommendation || fallbackAdvice(result.suspicionScore, result.type);
  const fileNumber = String(
    Math.round(Number(result.suspicionScore) || 0),
  ).padStart(3, "0");

  return (
    <Card
      as="article"
      tone="paper"
      shadow="pink"
      shape="irregular"
      padding="card"
      className="relative"
    >
      <Badge
        tone="violet"
        size="comicLg"
        border="thick"
        className="absolute -right-3 -top-5 rotate-3 md:text-2xl"
      >
        EL VEREDICTO
      </Badge>

      <p className={TEXT.kicker}>
        Expediente #{fileNumber} ·{" "}
        {result.type === "image"
          ? "foto con actitud sospechosa"
          : "titular con drama"}
      </p>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[300px_1fr]">
        <ScoreGauge score={result.suspicionScore} />

        <div>
          <div
            className={cx(
              "inline-flex -rotate-1 items-center gap-3 border-4 border-ink px-5 py-3 shadow-brutal-sm",
              TONE[verdict.tone],
            )}
          >
            <span className="text-3xl">{verdict.emoji}</span>
            <h3 className="font-comic text-3xl leading-none md:text-4xl">
              {verdict.label}
            </h3>
          </div>

          <section className="mt-7 border-l-8 border-hotpink pl-5">
            <p className="mt-2 text-lg font-semibold leading-relaxed">
              {explanation}
            </p>
          </section>

          <Card
            as="section"
            tone="cyan"
            shadow="sm"
            shape="irregularAlt"
            className="mt-6 rotate-[.4deg]"
          >
            <p className="font-comic text-2xl">
              💅 CONSEJO DE AMIGA QUE YA CAYÓ UNA VEZ
            </p>
            <p className="mt-2 font-semibold leading-relaxed">
              {recommendation}
            </p>
          </Card>
        </div>
      </div>

      {Array.isArray(result.flags) && result.flags.length > 0 && (
        <section className="mt-10 border-t-4 border-ink pt-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-display text-2xl md:text-3xl">
              LAS COSAS QUE NO CUADRAN
            </h4>
            <Badge tone="electric" size="sm" shadow="none">
              Recibos del chisme
            </Badge>
          </div>

          <ul className="grid gap-5 md:grid-cols-2">
            {result.flags.map((flag, index) => (
              <Card
                key={index}
                as="li"
                tone={FLAG_TONES[index % FLAG_TONES.length]}
                shadow="sm"
                shape="irregular"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-paper font-comic text-xl">
                    {index + 1}
                  </span>
                  <p className="font-comic text-2xl leading-none">
                    {flag.label}
                  </p>
                </div>
                <p className="font-semibold leading-relaxed">{flag.detail}</p>
              </Card>
            ))}
          </ul>
        </section>
      )}
    </Card>
  );
};

export default ResultCard;
