import cx from "./styles/cx";
import { BORDER, SHADOW, TONE } from "./styles/tokens";

const ALERT_SIZES = {
  sm: "px-3 py-2 text-center",
  md: "px-5 py-4",
};

const ALERT_ICONS = {
  danger: "🚫",
  hotpink: "😵",
  lime: "🎉",
};

/** Mensaje de error / exito. Antes se repetia en 4 archivos. */
const Alert = ({
  tone = "hotpink",
  size = "sm",
  border = "thin",
  shadow = "none",
  icon,
  role = "alert",
  className = "",
  children,
}) => (
  <p
    role={role}
    className={cx(
      BORDER[border],
      TONE[tone],
      ALERT_SIZES[size] || ALERT_SIZES.sm,
      SHADOW[shadow],
      "font-bold",
      className,
    )}
  >
    {icon ?? ALERT_ICONS[tone] ?? "⚠️"} {children}
  </p>
);

export default Alert;
