import { Badge, Card, Container, Section, Starburst, TEXT } from "../ui";

const TICKER_ITEMS = [
  "💋 SIN FILTROS",
  "🤡 SIN CADENAS DE WHATSAPP",
  "🔍 CON OJO DE VECINA",
  "💥 CHISME DESTRIPADO",
];

const Ticker = () => (
  <div className="ticker overflow-hidden border-t-4 border-ink bg-ink py-3 text-electric">
    <div className="ticker-track flex gap-8 whitespace-nowrap font-comic text-2xl tracking-wider">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  </div>
);

const Hero = () => (
  <Section
    id="top"
    tone="electric"
    texture="dots"
    textureOpacity={20}
    overflowHidden
    container={false}
    after={<Ticker />}
  >
    <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-hotpink blur-[1px]" />
    <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full bg-cyan" />

    <Container className="relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <Badge tone="paper" size="md" className="mb-5 -rotate-2">
          🚨 Exclusiva mundial de tu grupo familiar
        </Badge>

        <h1 className="max-w-4xl font-display text-[clamp(3.2rem,8vw,7.6rem)] leading-[.84] tracking-[-.055em]">
          ¿NOTICIA
          <span className="block text-violet text-stroke-white">O PURO</span>
          <span className="block -rotate-1 text-cyan text-stroke-white">
            CUENTO?
          </span>
        </h1>

        <p className="mt-8 max-w-2xl border-l-8 border-ink pl-5 text-lg font-semibold leading-relaxed md:text-xl">
          Sube esa foto rarísima o pega el titular que te mandó tu tía. Nosotros
          le quitamos la peluca, el filtro y la dignidad al chisme.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#analizar"
            className="irregular border-4 border-ink bg-hotpink px-7 py-4 font-comic text-2xl tracking-wide text-white shadow-brutal"
          >
            DESTAPAR EL CHISME →
          </a>
          <a
            href="#como-funciona"
            className="irregular-alt border-4 border-ink bg-paper px-7 py-4 font-comic text-2xl tracking-wide shadow-brutal"
          >
            ¿QUÉ BRUJERÍA ES ESTA?
          </a>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <Card tone="paper" shape="cutout" shadow="pink" className="rotate-3">
          <Card
            tone="violet"
            shadow="none"
            padding="none"
            className="p-4 text-center"
          >
            <p className={`${TEXT.kicker} tracking-[.25em]`}>
              Edición escándalo
            </p>
            <div className="my-5 text-8xl">📸</div>
            <p className="font-comic text-4xl leading-none">
              “¡FAMOSA VISTA CON UN ALIEN!”
            </p>
          </Card>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge
              tone="electric"
              size="comicMd"
              shadow="none"
              className="-rotate-3"
            >
              ¿EN SERIO?
            </Badge>
            <Starburst tone="hotpink" size="lg">
              95% HUMO
            </Starburst>
          </div>
        </Card>

        <Badge
          tone="lime"
          size="comicLg"
          className="absolute -left-9 -top-8 -rotate-12"
        >
          ¡AJÁ!
        </Badge>
        <Badge
          tone="cyan"
          size="comicLg"
          className="absolute -bottom-8 -right-4 rotate-6"
        >
          SE LE VEN 7 DEDOS 💅
        </Badge>
      </div>
    </Container>
  </Section>
);

export default Hero;
