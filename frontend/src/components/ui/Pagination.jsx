import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";

export default function Pagination({ page, totalPages, onPrev, onNext, onPage }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-line">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary disabled:opacity-40 disabled:hover:text-muted transition-colors focus-ring rounded-lg px-2 py-1"
      >
        <ChevronLeftIcon className="w-4 h-4" /> Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) => (
          <span key={p} className="flex items-center">
            {idx > 0 && p - pages[idx - 1] > 1 && <span className="px-1 text-muted text-sm">...</span>}
            <button
              onClick={() => onPage(p)}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-colors focus-ring",
                p === page ? "bg-primary text-white" : "text-muted hover:bg-primary-50 hover:text-primary"
              )}
            >
              {p}
            </button>
          </span>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary disabled:opacity-40 disabled:hover:text-muted transition-colors focus-ring rounded-lg px-2 py-1"
      >
        Next <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
