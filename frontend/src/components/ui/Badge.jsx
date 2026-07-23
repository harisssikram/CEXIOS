import { cn } from "../../utils/cn";

const tones = {
  neutral: "bg-primary-50 text-primary-500",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  accent: "bg-accent-50 text-accent-600",
};

export default function Badge({ children, tone = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
