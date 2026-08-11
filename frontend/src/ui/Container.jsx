import cx from "./styles/cx";
import { CONTAINER } from "./styles/tokens";

/** Ancho maximo + padding horizontal estandar del sitio. */
const Container = ({
  as: Component = "div",
  width = "wide",
  className = "",
  children,
  ...rest
}) => (
  <Component
    className={cx(CONTAINER[width] || CONTAINER.wide, className)}
    {...rest}
  >
    {children}
  </Component>
);

export default Container;
