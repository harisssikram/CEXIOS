import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Card from "../ui/Card";
import { cn } from "../../utils/cn";

export const TABS = [
  { key: "added", label: "Added", tone: "success" },
  { key: "duplicates", label: "Duplicates", tone: "warning" },
  { key: "invalid", label: "Invalid", tone: "danger" },
];

export default function UploadResultPanel({ result, compact = false }) {
  const counts = {
    added: result.added,
    duplicates: result.duplicates,
    invalid: result.invalid,
  };
  const defaultTab = TABS.find((t) => counts[t.key] > 0)?.key || "added";
  const [tab, setTab] = useState(defaultTab);

  const listByTab = {
    added: (result.added_rows || []).map((r) => ({
      row: r.row,
      name: r.name,
      ticker: r.ticker,
      reason: r.website,
    })),
    duplicates: result.duplicate_rows || [],
    invalid: result.invalid_rows || [],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={compact ? "" : "mt-6"}
    >
      {compact ? (
        <ResultBody result={result} counts={counts} listByTab={listByTab} tab={tab} setTab={setTab} />
      ) : (
        <Card className="p-7">
          <ResultBody result={result} counts={counts} listByTab={listByTab} tab={tab} setTab={setTab} />
        </Card>
      )}
    </motion.div>
  );
}

function ResultBody({ result, counts, listByTab, tab, setTab }) {
  return (
    <>
      <div className="flex items-center gap-2 text-success font-semibold mb-6">
        <CheckCircleIcon className="w-5 h-5" />
        Upload complete
        <span className="ml-auto text-xs font-normal text-muted normal-case tracking-normal">
          Shown once — not stored anywhere
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mb-6">
        <SummaryStat label="Added" value={result.added} tone="success" />
        <SummaryStat label="Duplicates" value={result.duplicates} tone="warning" />
        <SummaryStat label="Invalid rows" value={result.invalid} tone="danger" />
      </div>

      <GlassToggle tabs={TABS} active={tab} onChange={setTab} counts={counts} />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="mt-4 h-80 overflow-y-auto pr-1"
        >
          {listByTab[tab].length > 0 ? (
            <ResultList tab={tab} items={listByTab[tab]} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-muted text-center">No {tab} rows in this upload.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function SummaryStat({ label, value, tone }) {
  const toneClasses = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };
  return (
    <div>
      <p className={cn("text-3xl font-bold", toneClasses[tone])}>{value}</p>
      <p className="text-xs text-muted uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function GlassToggle({ tabs, active, onChange, counts }) {
  return (
    <div className="relative flex p-1 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_16px_rgba(0,0,0,0.06)]">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cn(
            "relative flex-1 z-10 px-3 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5",
            active === t.key ? "text-white" : "text-muted hover:text-primary"
          )}
        >
          {active === t.key && (
            <motion.span
              layoutId="glass-pill"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className={cn(
                "absolute inset-0 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.4)]",
                t.tone === "success" && "bg-gradient-to-b from-success/90 to-success shadow-success/30",
                t.tone === "warning" && "bg-gradient-to-b from-warning/90 to-warning shadow-warning/30",
                t.tone === "danger" && "bg-gradient-to-b from-danger/90 to-danger shadow-danger/30"
              )}
            />
          )}
          <span className="relative">{t.label}</span>
          <span
            className={cn(
              "relative text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
              active === t.key ? "bg-white/25 text-white" : "bg-black/5 text-muted"
            )}
          >
            {counts[t.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

function ResultList({ tab, items }) {
  const toneClasses = {
    added: "text-success bg-success/10 border-success/20",
    duplicates: "text-warning bg-warning/10 border-warning/20",
    invalid: "text-danger bg-danger/10 border-danger/20",
  };
  const Icon = tab === "added" ? CheckCircleIcon : ExclamationTriangleIcon;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className={cn("text-xs rounded-lg border px-3 py-2 flex items-start gap-2", toneClasses[tab])}
        >
          <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>Row {item.row}</strong>
            {item.name ? ` — ${item.name}` : ""}
            {item.ticker ? ` (${item.ticker})` : ""}
            {tab === "added" ? ` · ${item.reason}` : `: ${item.reason}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
