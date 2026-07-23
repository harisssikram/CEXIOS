import { cn } from "../../utils/cn";

export function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-4 border-b border-line last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
