import { BORDER, SHADOW, TEXT, TONE } from "../styles/tokens";

export const BUTTON_BASE =
  "inline-block cursor-pointer text-center disabled:cursor-not-allowed disabled:opacity-60";

/** Los colores del boton SALEN de TONE, no se vuelven a escribir. */
export const BUTTON_VARIANTS = {
  primary: TONE.violet,
  secondary: TONE.cyan,
  danger: TONE.hotpink,
  success: TONE.lime,
  accent: TONE.electric,
  neutral: TONE.paper,
  ghost: "text-hotpink",
};

export const BUTTON_SIZES = {
  none: "",
  sm: `${BORDER.thin} px-3 py-2 font-mono text-[10px] font-bold uppercase ${SHADOW.sm}`,
  md: `${BORDER.thin} px-4 py-3 ${TEXT.label} ${SHADOW.sm}`,
  lg: `${BORDER.thick} px-4 py-4 font-comic text-xl ${SHADOW.sm} md:text-2xl`,
  xl: `${BORDER.thick} px-7 py-5 font-comic text-3xl tracking-wide ${SHADOW.md}`,
};

export const BUTTON_SHAPES = {
  none: "",
  irregular: "irregular",
  irregularAlt: "irregular-alt",
};
