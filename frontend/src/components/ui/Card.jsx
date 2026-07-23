import { cn } from "../../utils/cn";

export default function Card({ children, className, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn(
        "bg-card border border-line rounded-2xl shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
