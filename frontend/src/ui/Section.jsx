import cx from "./styles/cx";
import Container from "./Container";
import Texture from "./Texture";
import { LAYOUT, TONE } from "./styles/tokens";

/**
 * Seccion de pagina: fondo de color + borde inferior + textura opcional
 * + contenedor centrado. Reemplaza el bloque repetido en Hero,
 * AnalyzerPanel y HowItWorks.
 */
const Section = ({
  id,
  tone = "cream",
  texture,
  textureOpacity = 10,
  width = "wide",
  overflowHidden = false,
  container = true,
  className = "",
  innerClassName = "",
  children,
  after,
}) => (
  <section
    id={id}
    className={cx(
      LAYOUT.section,
      TONE[tone],
      overflowHidden && "overflow-hidden",
      className,
    )}
  >
    {texture && <Texture variant={texture} opacity={textureOpacity} />}
    {container ? (
      <Container width={width} className={cx("relative", innerClassName)}>
        {children}
      </Container>
    ) : (
      children
    )}
    {after}
  </section>
);

export default Section;
