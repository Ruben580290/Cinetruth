import ScoreGauge from "./ScoreGauge";

const VERDICTS = {
  VERIFICADO: { label: "PARECE LEGÍTIMO, MI CIELA", bg: "bg-lime", emoji: "😌" },
  SOSPECHOSO: { label: "AQUÍ HAY GATO ENCERRADO", bg: "bg-electric", emoji: "👀" },
  FABRICADO: { label: "PURO CUENTO CON PELUCA", bg: "bg-hotpink text-white", emoji: "🤡" },
};

const fallbackAdvice = (score, type) => {
  if (score >= 65) return type === "image"
    ? "La próxima, mira manos, letras y fondos. Si todo parece derretido o alguien tiene dedos de colección, no compartas todavía."
    : "Antes de reenviar, busca quién lo dijo, dónde lo dijo y cuándo. Si el titular grita pero no cuenta nada, te están vendiendo humo premium.";
  if (score >= 30) return "No te cases con el primer pantallazo. Busca otra fuente seria y revisa si todos cuentan la misma historia, no una novela distinta.";
  return "Va bastante bien, pero igual revisa la fecha y la fuente. Hasta el chisme más decente puede venir reciclado de 2017.";
};

const ResultCard = ({ result }) => {
  if (!result) return null;
  const verdict = VERDICTS[result.verdict] || VERDICTS.SOSPECHOSO;
  const explanation = result.summary || result.semaphore?.explanation || "La evidencia vino con misterio incluido.";
  const recommendation = result.recommendation || fallbackAdvice(result.suspicionScore, result.type);

  return (
    <article className="relative border-4 border-ink bg-paper p-5 shadow-brutal-pink irregular md:p-8">
      <div className="absolute -right-3 -top-5 rotate-3 border-4 border-ink bg-violet px-4 py-2 font-comic text-xl text-white shadow-brutal-sm md:text-2xl">EL VEREDICTO</div>
      <p className="font-mono text-xs font-bold uppercase tracking-[.2em]">Expediente #{String(Math.round(Number(result.suspicionScore) || 0)).padStart(3, "0")} · {result.type === "image" ? "foto con actitud sospechosa" : "titular con drama"}</p>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[300px_1fr]">
        <ScoreGauge score={result.suspicionScore} />
        <div>
          <div className={`inline-flex -rotate-1 items-center gap-3 border-4 border-ink px-5 py-3 shadow-brutal-sm ${verdict.bg}`}>
            <span className="text-3xl">{verdict.emoji}</span>
            <h3 className="font-comic text-3xl leading-none md:text-4xl">{verdict.label}</h3>
          </div>

          <section className="mt-7 border-l-8 border-hotpink pl-5">
            <p className="mt-2 text-lg font-semibold leading-relaxed">{explanation}</p>
          </section>

          <section className="mt-6 rotate-[.4deg] border-4 border-ink bg-cyan p-5 shadow-brutal-sm irregular-alt">
            <p className="font-comic text-2xl">💅 CONSEJO DE AMIGA QUE YA CAYÓ UNA VEZ</p>
            <p className="mt-2 font-semibold leading-relaxed">{recommendation}</p>
          </section>
        </div>
      </div>

      {Array.isArray(result.flags) && result.flags.length > 0 && (
        <section className="mt-10 border-t-4 border-ink pt-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-display text-2xl md:text-3xl">LAS COSAS QUE NO CUADRAN</h4>
            <span className="border-3 border-ink bg-electric px-3 py-1 font-mono text-xs font-bold uppercase">Recibos del chisme</span>
          </div>
          <ul className="grid gap-5 md:grid-cols-2">
            {result.flags.map((flag, index) => (
              <li key={index} className={`border-4 border-ink p-5 shadow-brutal-sm ${index % 3 === 0 ? "bg-pink" : index % 3 === 1 ? "bg-electric" : "bg-lime"} irregular`}>
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-paper font-comic text-xl">{index + 1}</span>
                  <p className="font-comic text-2xl leading-none">{flag.label}</p>
                </div>
                <p className="font-semibold leading-relaxed">{flag.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};
export default ResultCard;
