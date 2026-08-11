import cx from "./styles/cx";
import { BORDER, SHADOW, STARBURST_SIZE, TONE } from "./styles/tokens";

/** Estrella de comic centrada. Antes se repetia en 5 archivos. */
const Starburst = ({
  as: Component = "span",
  tone = "electric",
  size = "md",
  border = "none",
  shadow = "none",
  className = "",
  children,
  ...rest
}) => (
  <Component
    className={cx(
      "starburst flex items-center justify-center",
      TONE[tone],
      STARBURST_SIZE[size] || STARBURST_SIZE.md,
      BORDER[border],
      SHADOW[shadow],
      className,
    )}
    {...rest}
  >
    {children}
  </Component>
);

export default Starburst;
