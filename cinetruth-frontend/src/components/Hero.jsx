const Hero = () => (
  <section id="top" className="relative overflow-hidden border-b-4 border-ink bg-electric">
    <div className="absolute inset-0 comic-dots opacity-20" />
    <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-hotpink blur-[1px]" />
    <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full bg-cyan" />

    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <div className="mb-5 inline-flex -rotate-2 items-center gap-2 border-3 border-ink bg-paper px-4 py-2 font-mono text-xs font-bold uppercase shadow-brutal-sm">
          🚨 Exclusiva mundial de tu grupo familiar
        </div>
        <h1 className="max-w-4xl font-display text-[clamp(3.2rem,8vw,7.6rem)] leading-[.84] tracking-[-.055em]">
          ¿NOTICIA
          <span className="block text-hotpink text-stroke-white">O PURO</span>
          <span className="block -rotate-1 text-cyan text-stroke-white">CUENTO?</span>
        </h1>
        <p className="mt-8 max-w-2xl border-l-8 border-ink pl-5 text-lg font-semibold leading-relaxed md:text-xl">
          Sube esa foto rarísima o pega el titular que te mandó tu tía. Nosotros le quitamos la peluca, el filtro y la dignidad al chisme.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a href="#analizar" className="irregular border-4 border-ink bg-hotpink px-7 py-4 font-comic text-2xl tracking-wide text-white shadow-brutal">
            DESTAPAR EL CHISME →
          </a>
          <a href="#como-funciona" className="irregular-alt border-4 border-ink bg-paper px-7 py-4 font-comic text-2xl tracking-wide shadow-brutal">
            ¿QUÉ BRUJERÍA ES ESTA?
          </a>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="cutout rotate-3 border-4 border-ink bg-paper p-5 shadow-brutal-pink">
          <div className="border-4 border-ink bg-violet p-4 text-center text-white">
            <p className="font-mono text-xs font-bold uppercase tracking-[.25em]">Edición escándalo</p>
            <div className="my-5 text-8xl">📸</div>
            <p className="font-comic text-4xl leading-none">“¡FAMOSA VISTA CON UN ALIEN!”</p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="-rotate-3 border-3 border-ink bg-electric px-3 py-2 font-comic text-xl">¿EN SERIO?</span>
            <span className="starburst flex h-24 w-24 items-center justify-center bg-hotpink p-4 text-center font-comic text-xl leading-none text-white">95% HUMO</span>
          </div>
        </div>
        <div className="absolute -left-9 -top-8 -rotate-12 border-3 border-ink bg-lime px-4 py-2 font-comic text-2xl shadow-brutal-sm">¡AJÁ!</div>
        <div className="absolute -bottom-8 -right-4 rotate-6 border-3 border-ink bg-cyan px-4 py-2 font-comic text-2xl shadow-brutal-sm">SE LE VEN 7 DEDOS 💅</div>
      </div>
    </div>

    <div className="ticker overflow-hidden border-t-4 border-ink bg-ink py-3 text-electric">
      <div className="ticker-track flex gap-8 whitespace-nowrap font-comic text-2xl tracking-wider">
        <span>💋 SIN FILTROS</span><span>🤡 SIN CADENAS DE WHATSAPP</span><span>🔍 CON OJO DE VECINA</span><span>💥 CHISME DESTRIPADO</span>
        <span>💋 SIN FILTROS</span><span>🤡 SIN CADENAS DE WHATSAPP</span><span>🔍 CON OJO DE VECINA</span><span>💥 CHISME DESTRIPADO</span>
      </div>
    </div>
  </section>
);
export default Hero;
