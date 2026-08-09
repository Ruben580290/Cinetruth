import { Card, Starburst, TEXT } from "../ui";

const LEVELS = [
  {
    max: 30,
    label: "POQUITO HUMO",
    emoji: "😇",
    tone: "lime",
    sparks: ["✨", "😇"],
  },
  {
    max: 65,
    label: "HUELE RARO",
    emoji: "🤥",
    tone: "electric",
    sparks: ["👀", "🤥", "✨"],
  },
  {
    max: 101,
    label: "CHISME EN LLAMAS",
    emoji: "🤡",
    tone: "hotpink",
    sparks: ["🤡", "🤥", "💅", "💥", "🔥"],
  },
];

const getLevel = (score) => LEVELS.find((level) => score < level.max);

const ScoreGauge = ({ score = 0 }) => {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const level = getLevel(clamped);

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="relative">
        {level.sparks.map((spark, index) => (
          <span
            key={index}
            className="spark text-2xl"
            style={{
              left: `${18 + index * 16}%`,
              top: `${index % 2 ? 14 : 62}%`,
              "--spark-x": `${(index - 2) * 24}px`,
              "--spark-y": `${index % 2 ? -70 : 65}px`,
            }}
          >
            {spark}
          </span>
        ))}

        <Starburst
          as="div"
          tone={level.tone}
          size="gauge"
          border="thick"
          shadow="md"
          className="mx-auto"
        >
          <span className="text-6xl">{level.emoji}</span>
          <span className="font-display text-5xl leading-none text-white text-stroke">
            {Math.round(clamped)}%
          </span>
          <span className="mt-1 max-w-[140px] text-center font-comic text-xl leading-none">
            {level.label}
          </span>
        </Starburst>
      </div>

      <Card
        tone="paper"
        border="thin"
        shadow="sm"
        padding="sm"
        className={`mt-5 text-center ${TEXT.label}`}
      >
        Chismómetro explosivo · no acercar a fuentes dudosas
      </Card>
    </div>
  );
};

export default ScoreGauge;
