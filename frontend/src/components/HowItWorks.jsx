import { Badge, Card, Section } from "../ui";

const STEPS = [
  {
    emoji: "📥",
    title: "TÚ TRAES EL CHISME",
    detail:
      "Foto rara, captura sospechosa o titular que grita más que presentadora de reality.",
  },
  {
    emoji: "👀",
    title: "LE MIRAMOS LAS COSTURAS",
    detail:
      "Buscamos manos imposibles, letras derretidas, fondos mareados y frases que prometen mucho pero cuentan cero.",
  },
  {
    emoji: "💥",
    title: "EL CHISMÓMETRO SE ALTERA",
    detail:
      "Mientras más cosas no cuadran, más tiembla, chispea y se llena de payasos. Ciencia de vecina, pero con método.",
  },
  {
    emoji: "💅",
    title: "TE DAMOS EL RECIBO",
    detail:
      "Explicación clara, pistas concretas y un consejo para que la próxima no te vendan humo con moño.",
  },
];

const HowItWorks = () => (
  <Section
    id="como-funciona"
    tone="cyan"
    texture="dots"
    textureOpacity={10}
    className="py-20"
  >
    <Badge tone="paper" size="md" className="rotate-1">
      El método que tu tía necesitaba
    </Badge>

    <h2 className="mt-6 max-w-4xl font-display text-4xl leading-none md:text-6xl">
      ASÍ LE QUITAMOS EL MAQUILLAJE A LA MENTIRA
    </h2>

    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {STEPS.map((step, index) => (
        <Card
          key={step.title}
          as="article"
          tone={index % 2 ? "electric" : "paper"}
          shape={index % 2 ? "irregularAlt" : "irregular"}
          padding="lg"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="text-5xl">{step.emoji}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-3 border-ink bg-hotpink font-comic text-xl text-white">
              {index + 1}
            </span>
          </div>
          <h3 className="mt-6 font-comic text-3xl leading-none">
            {step.title}
          </h3>
          <p className="mt-4 font-semibold leading-relaxed">{step.detail}</p>
        </Card>
      ))}
    </div>
  </Section>
);

export default HowItWorks;
