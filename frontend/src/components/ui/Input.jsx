import { cn } from "../../utils/cn";

export default function Input({ label, icon: Icon, className, containerClassName, ...props }) {
  return (
    <label className={cn("block", containerClassName)}>
      {label && <span className="block text-sm font-medium text-primary mb-1.5">{label}</span>}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4 shrink-0 text-muted" />
          </span>
        )}
        <input
          className={cn(
            "w-full bg-white border border-line rounded-xl py-2.5 text-ink placeholder:text-muted/70 transition-colors",
            "focus-ring focus-visible:border-accent",
            Icon ? "pl-10 pr-4" : "px-4",
            className
          )}
          {...props}
        />
      </div>
    </label>
  );
}
