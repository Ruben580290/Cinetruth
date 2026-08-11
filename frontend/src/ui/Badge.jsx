import cx from "./styles/cx";
import { BADGE_SIZE, BORDER, SHADOW, SHAPE, TONE } from "./styles/tokens";

/**
 * Sticker/etiqueta pequena. Reemplaza el patron
 * "border-3 border-ink bg-X px-3 py-1 font-mono text-xs ... shadow-brutal-sm".
 */
const Badge = ({
  as: Component = "span",
  tone = "electric",
  size = "sm",
  border = "thin",
  shadow = "sm",
  shape = "none",
  className = "",
  children,
  ...rest
}) => (
  <Component
    className={cx(
      "inline-block",
      BORDER[border],
      TONE[tone],
      BADGE_SIZE[size] || BADGE_SIZE.sm,
      SHADOW[shadow],
      SHAPE[shape],
      className,
    )}
    {...rest}
  >
    {children}
  </Component>
);

export default Badge;
