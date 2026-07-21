const getLevel = (score) => {
  if (score < 30) return { label: "POQUITO HUMO", emoji: "😇", color: "bg-lime" };
  if (score < 65) return { label: "HUELE RARO", emoji: "🤥", color: "bg-electric" };
  return { label: "CHISME EN LLAMAS", emoji: "🤡", color: "bg-hotpink" };
};

const ScoreGauge = ({ score = 0 }) => {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const level = getLevel(clamped);
  const sparks = clamped >= 65 ? ["🤡", "🤥", "💅", "💥", "🔥"] : clamped >= 30 ? ["👀", "🤥", "✨"] : ["✨", "😇"];

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="relative">
        {sparks.map((spark, index) => (
          <span key={index} className="spark text-2xl" style={{ left: `${18 + index * 16}%`, top: `${index % 2 ? 14 : 62}%`, "--spark-x": `${(index - 2) * 24}px`, "--spark-y": `${index % 2 ? -70 : 65}px` }}>{spark}</span>
        ))}
        <div className={`starburst mx-auto flex aspect-square w-56 flex-col items-center justify-center border-4 border-ink ${level.color} shadow-brutal`}>
          <span className="text-6xl">{level.emoji}</span>
          <span className="font-display text-5xl leading-none text-white text-stroke">{Math.round(clamped)}%</span>
          <span className="mt-1 max-w-[140px] text-center font-comic text-xl leading-none">{level.label}</span>
        </div>
      </div>
      <div className="mt-5 border-3 border-ink bg-paper p-3 text-center font-mono text-xs font-bold uppercase shadow-brutal-sm">
        Chismómetro explosivo · no acercar a fuentes dudosas
      </div>
    </div>
  );
};
export default ScoreGauge;
