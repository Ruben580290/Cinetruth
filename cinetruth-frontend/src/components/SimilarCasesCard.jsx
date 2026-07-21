const LABELS = {
  SI: { text: "ESTO YA OLÍA A QUEMADO", bg: "bg-hotpink text-white", emoji: "🔥" },
  PROBABLE: { text: "PRIMO CERCANO DEL HUMO", bg: "bg-electric", emoji: "🤥" },
  INCIERTO: { text: "TODAVÍA EN EL CAMERINO", bg: "bg-cyan", emoji: "👀" },
};

const SimilarCasesCard = ({ cases }) => {
  if (!Array.isArray(cases) || cases.length === 0) return null;
  return (
    <section className="mt-8 border-4 border-ink bg-violet p-5 shadow-brutal irregular md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 text-white">
        <div><p className="font-mono text-xs font-bold uppercase tracking-[.2em]">El archivo del bochorno</p><h3 className="mt-2 font-display text-3xl md:text-4xl">OTROS CHISMES CON EL MISMO PERFUME</h3></div>
        <span className="rotate-2 border-3 border-ink bg-lime px-3 py-2 font-comic text-xl text-ink shadow-brutal-sm">PARA SEGUIR HUSMEANDO</span>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {cases.map((item, index) => {
          const style = LABELS[item.likelyFake] || LABELS.INCIERTO;
          return (
            <article key={`${item.sourceUrl}-${index}`} className="border-4 border-ink bg-paper p-5 shadow-brutal-sm irregular-alt">
              <span className={`inline-block border-3 border-ink px-3 py-1 font-mono text-[10px] font-bold uppercase ${style.bg}`}>{style.emoji} {style.text}</span>
              <h4 className="mt-4 font-comic text-2xl leading-tight">{item.title}</h4>
              {item.whyRelevant && <p className="mt-3 font-semibold leading-relaxed">{item.whyRelevant}</p>}
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex border-b-4 border-hotpink font-mono text-xs font-bold uppercase">Abrir el recibo: {item.sourceName || "fuente"} ↗</a>
            </article>
          );
        })}
      </div>
    </section>
  );
};
export default SimilarCasesCard;
