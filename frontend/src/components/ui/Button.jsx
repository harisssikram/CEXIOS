import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-accent-gradient text-white shadow-soft hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100",
  secondary:
    "bg-white text-primary border border-line hover:border-accent/40 hover:text-accent disabled:opacity-50",
  ghost: "bg-transparent text-muted hover:text-primary hover:bg-primary-50 disabled:opacity-50",
  danger: "bg-danger text-white hover:brightness-110 disabled:opacity-50",
  outlineDanger:
    "bg-white text-danger border border-danger/30 hover:bg-danger/10 hover:border-danger/50 disabled:opacity-50",
};

const sizes = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-6 py-3.5 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-ring",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </motion.button>
  );
}
