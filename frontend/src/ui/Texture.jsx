import cx from "./styles/cx";
import { TEXTURE, TEXTURE_OPACITY } from "./styles/tokens";

/** Capa decorativa de puntos o cuadricula sobre una seccion. */
const Texture = ({ variant = "dots", opacity = 10, className = "" }) => (
  <div
    aria-hidden="true"
    className={cx(
      TEXTURE.base,
      TEXTURE[variant] || TEXTURE.dots,
      TEXTURE_OPACITY[opacity] || TEXTURE_OPACITY[10],
      className,
    )}
  />
);

export default Texture;
