import cx from "./styles/cx";
import Card from "./Card";
import Starburst from "./Starburst";
import { LAYOUT } from "./styles/tokens";

/**
 * Marco compartido por Login, Register y Profile:
 * pantalla centrada + tarjeta + estrella + titulo + subtitulo.
 * Si recibe onSubmit, la tarjeta se renderiza como <form>.
 */
const AuthLayout = ({
  icon,
  iconTone = "electric",
  title,
  subtitle,
  shape = "irregular",
  onSubmit,
  children,
  className = "",
}) => (
  <div className={LAYOUT.screen}>
    <Card
      as={onSubmit ? "form" : "div"}
      onSubmit={onSubmit}
      tone="paper"
      shadow="md"
      shape={shape}
      padding="form"
      className={cx("w-full max-w-md", className)}
    >
      {icon && (
        <Starburst tone={iconTone} size="md" className="mx-auto">
          {icon}
        </Starburst>
      )}

      {title && (
        <h1 className="mt-6 text-center font-display text-3xl leading-tight">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="mt-2 text-center font-mono text-[11px] font-bold uppercase tracking-wide text-ink/70">
          {subtitle}
        </p>
      )}

      {children}
    </Card>
  </div>
);

export default AuthLayout;
