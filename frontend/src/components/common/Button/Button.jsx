import {
  BUTTON_BASE,
  BUTTON_SHAPES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from "./buttonVariants";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const Button = ({
  as: Component = "button",
  variant = "primary",
  size = "md",
  shape = "none",
  fullWidth = false,
  className = "",
  type,
  children,
  ...rest
}) => {
  const classes = cx(
    BUTTON_BASE,
    BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary,
    BUTTON_SIZES[size] || BUTTON_SIZES.md,
    BUTTON_SHAPES[shape],
    fullWidth && "w-full",
    className,
  );

  const nativeType = Component === "button" ? type || "button" : type;

  return (
    <Component className={classes} type={nativeType} {...rest}>
      {children}
    </Component>
  );
};

export default Button;
