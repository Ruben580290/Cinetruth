const TEAM = ["Rubén Verdesoto", "David Hurtado", "Gabriel Rivera"];
const Footer = () => (
  <footer id="equipo" className="bg-ink py-14 text-paper">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><p className="font-display text-3xl">CINE<span className="text-hotpink">TRUTH</span></p><p className="mt-4 max-w-lg font-semibold text-paper/80">Una revista de chismes que, por una vez, sí pregunta “¿y tú cómo sabes?”</p><p className="mt-4 max-w-lg text-xs text-paper/60">Esto es una guía educativa basada en indicios, no una sentencia divina ni legal. Confirma siempre con fuentes confiables antes de funar, llorar o reenviar</p></div>
        <div><p className="font-mono text-xs font-bold uppercase tracking-[.2em] text-electric">Equipo</p><ul className="mt-4 space-y-2 font-semibold">{TEAM.map((name) => <li key={name}>💥 {name}</li>)}</ul></div>
      </div>
      <div className="mt-12 border-t-2 border-paper/20 pt-5 font-mono text-[10px] uppercase tracking-[.18em] text-paper/50">© 2026 CineTruth · PUCE TEC · Hecho con código, café y desconfianza saludable</div>
    </div>
  </footer>
);
export default Footer;
