import cx from "./styles/cx";
import { BORDER, PADDING, SHADOW, SHAPE, TONE } from "./styles/tokens";

/**
 * Panel con borde grueso + sombra dura. Reemplaza el patron
 * "border-4 border-ink bg-X p-Y shadow-brutal" repetido en todo el proyecto.
 */
const Card = ({
  as: Component = "div",
  tone = "paper",
  border = "thick",
  shadow = "md",
  shape = "none",
  padding = "md",
  className = "",
  children,
  ...rest
}) => (
  <Component
    className={cx(
      BORDER[border],
      TONE[tone],
      PADDING[padding],
      SHADOW[shadow],
      SHAPE[shape],
      className,
    )}
    {...rest}
  >
    {children}
  </Component>
);

export default Card;
