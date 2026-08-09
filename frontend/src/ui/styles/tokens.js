/**
 * TOKENS DEL SISTEMA VISUAL DE CINETRUTH
 * --------------------------------------
 * Este archivo es la UNICA fuente de verdad de las clases repetidas.
 * Si quieres cambiar el grosor del borde, la sombra o la tipografia
 * de todo el sitio, se cambia aqui y se propaga a toda la app.
 *
 * IMPORTANTE: Tailwind solo detecta clases escritas COMPLETAS en el
 * codigo fuente, por eso todos los valores son strings literales y
 * nunca se construyen con plantillas dinamicas.
 */

/* ------------------------------------------------------------------ */
/* 1. COLORES / SUPERFICIES                                            */
/* ------------------------------------------------------------------ */
export const TONE = {
  none: "",
  paper: "bg-paper text-ink",
  cream: "bg-cream text-ink",
  white: "bg-white text-ink",
  ink: "bg-ink text-paper",
  electric: "bg-electric text-ink",
  cyan: "bg-cyan text-ink",
  lime: "bg-lime text-ink",
  pink: "bg-pink text-ink",
  hotpink: "bg-hotpink text-white",
  violet: "bg-violet text-white",
  orange: "bg-orange text-ink",
  danger: "bg-danger text-white",
};

/* ------------------------------------------------------------------ */
/* 2. BORDES, SOMBRAS Y FORMAS (el "look" neo-brutalista)              */
/* ------------------------------------------------------------------ */
export const BORDER = {
  none: "",
  thin: "border-3 border-ink",
  thick: "border-4 border-ink",
};

export const SHADOW = {
  none: "",
  sm: "shadow-brutal-sm",
  md: "shadow-brutal",
  pink: "shadow-brutal-pink",
  cyan: "shadow-brutal-cyan",
  yellow: "shadow-brutal-yellow",
};

export const SHAPE = {
  none: "",
  irregular: "irregular",
  irregularAlt: "irregular-alt",
  cutout: "cutout",
  starburst: "starburst",
  round: "rounded-full",
};

export const PADDING = {
  none: "",
  xs: "px-3 py-1",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
  form: "p-8",
  card: "p-5 md:p-8",
};

/* ------------------------------------------------------------------ */
/* 3. TIPOGRAFIA                                                       */
/* ------------------------------------------------------------------ */
export const TEXT = {
  /** Titulo gigante tipo portada */
  display: "font-display leading-none",
  /** Titulo estilo comic */
  comic: "font-comic leading-none",
  /** Etiqueta pequena en mayusculas (la mas repetida del proyecto) */
  label: "font-mono text-xs font-bold uppercase",
  /** Igual que label pero con tracking amplio (antetitulos) */
  kicker: "font-mono text-xs font-bold uppercase tracking-[.2em]",
  /** Version diminuta para stickers */
  micro: "font-mono text-[10px] font-bold uppercase",
  /** Parrafo estandar */
  body: "font-semibold leading-relaxed",
};

/* ------------------------------------------------------------------ */
/* 4. LAYOUT                                                           */
/* ------------------------------------------------------------------ */
export const CONTAINER = {
  wide: "mx-auto max-w-7xl px-5 md:px-8",
  medium: "mx-auto max-w-6xl px-5 md:px-8",
  narrow: "mx-auto max-w-3xl",
};

export const LAYOUT = {
  section: "relative border-b-4 border-ink",
  /** Pantalla completa centrada (paginas de autenticacion) */
  screen:
    "flex min-h-screen items-center justify-center bg-cream px-4 paper-noise",
};

/* ------------------------------------------------------------------ */
/* 5. TEXTURAS DE FONDO                                                */
/* ------------------------------------------------------------------ */
export const TEXTURE = {
  base: "pointer-events-none absolute inset-0",
  dots: "comic-dots",
  grid: "comic-grid",
};

export const TEXTURE_OPACITY = {
  8: "opacity-[.08]",
  10: "opacity-10",
  20: "opacity-20",
};

/* ------------------------------------------------------------------ */
/* 6. FORMULARIOS                                                      */
/* ------------------------------------------------------------------ */
export const FIELD = {
  label: "block font-mono text-xs font-bold uppercase",
  input:
    "mt-2 w-full border-3 border-ink bg-white px-3 py-2 font-semibold outline-none",
  textarea:
    "irregular w-full resize-none border-4 border-ink bg-paper p-6 text-lg font-semibold shadow-brutal outline-none placeholder:text-muted/70",
};

/* ------------------------------------------------------------------ */
/* 7. TAMANOS DE PRIMITIVOS                                            */
/* ------------------------------------------------------------------ */
export const BADGE_SIZE = {
  xs: `px-3 py-1 ${TEXT.micro}`,
  sm: `px-3 py-1 ${TEXT.label}`,
  md: `px-4 py-2 ${TEXT.label}`,
  comic: "px-3 py-1 font-comic text-xl",
  comicMd: "px-3 py-2 font-comic text-xl",
  comicLg: "px-4 py-2 font-comic text-2xl",
};

export const STARBURST_SIZE = {
  sm: "h-12 w-12 text-xl",
  md: "h-14 w-14 text-2xl",
  lg: "h-24 w-24 p-4 text-center font-comic text-xl leading-none",
  gauge: "aspect-square w-56 flex-col",
};
