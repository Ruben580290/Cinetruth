const Header = () => (
  <header className="sticky top-0 z-50 border-b-4 border-ink bg-paper/95 backdrop-blur-sm">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
      <a href="#top" className="group flex items-center gap-3">
        <span className="starburst flex h-12 w-12 items-center justify-center bg-electric text-xl">💥</span>
        <div>
          <span className="block font-display text-lg leading-none md:text-2xl">CINE<span className="text-hotpink">TRUTH</span></span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[.22em]">Chisme bajo sospecha</span>
        </div>
      </a>

      <nav className="hidden items-center gap-7 font-mono text-xs font-bold uppercase lg:flex">
        <a href="#analizar" className="">Destapar chisme</a>
        <a href="#como-funciona" className="">La receta</a>
        <a href="#equipo" className="">La redacción</a>
      </nav>

      <a href="#analizar" className="irregular border-3 border-ink bg-lime px-3 py-2 font-mono text-[10px] font-bold uppercase shadow-brutal-sm">
        🕵️ Chismógrafo listo
      </a>
    </div>
  </header>
);
export default Header;
