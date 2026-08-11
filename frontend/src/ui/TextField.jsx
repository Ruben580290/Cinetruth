import cx from "./styles/cx";
import { FIELD } from "./styles/tokens";

/** Etiqueta + input con el estilo unico del proyecto. */
const TextField = ({
  id,
  label,
  className = "",
  inputClassName = "",
  ...inputProps
}) => (
  <div className={className}>
    <label htmlFor={id} className={FIELD.label}>
      {label}
    </label>
    <input
      id={id}
      className={cx(FIELD.input, inputClassName)}
      {...inputProps}
    />
  </div>
);

export default TextField;
