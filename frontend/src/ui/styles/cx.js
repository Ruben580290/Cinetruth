/**
 * Une clases ignorando valores vacios, null, undefined o false.
 * Ejemplo: cx("p-4", isActive && "bg-cyan") -> "p-4 bg-cyan"
 */
const cx = (...classes) => classes.filter(Boolean).join(" ");

export default cx;
