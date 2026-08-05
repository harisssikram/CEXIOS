import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ProgressBar from "../components/ui/ProgressBar";
import projectService from "../services/projectService";
import { cn } from "../utils/cn";

const MAX_MANUAL_ROWS = 20;
const emptyRow = () => ({ name: "", ticker: "", website: "" });
const COLUMNS = ["name", "ticker", "website"];

export default function UploadPage() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  // Fully independent of the file-upload state above -- opening/using Instant Add
  // never touches `file`/`result`/`progress`, and vice versa.
  const [instantOpen, setInstantOpen] = useState(false);

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Enter your name so uploads can be credited to you.");
      return;
    }
    if (!file) {
      toast.error("Choose an .xlsx, .xls, or .csv file to upload.");
      return;
    }

    setSubmitting(true);
    setProgress(0);
    setResult(null);
    try {
      const data = await projectService.upload(name.trim(), file, setProgress);
      setResult(data);
      if (data.added > 0) {
        toast.success(`Uploaded! ${data.added} project(s) added.`);
      }
      if (data.duplicates > 0) {
        toast.error(
          `${data.duplicates} row(s) were rejected as duplicates (matched by name or website).`
        );
      }
      if (data.invalid > 0) {
        toast.error(`${data.invalid} row(s) were invalid and skipped.`);
      }
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed. Check the file and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Upload Excel">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-1.5">
          <h2 className="text-2xl font-bold text-primary">Add projects to the registry</h2>
        </div>
        <p className="text-muted text-sm mb-5">
          Upload a spreadsheet with <span className="font-mono text-primary">Project Name</span>,{" "}
          <span className="font-mono text-primary">Ticker</span>, and{" "}
          <span className="font-mono text-primary">Website</span> columns. Rows are rejected as
          duplicates if the <strong>project name</strong> or <strong>website</strong> already
          exists — the ticker is allowed to repeat.
        </p>

        <div className="mb-8">
          <InstantAddButton onClick={() => setInstantOpen(true)} />
        </div>

        <Card className="p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Malik"
            />

            <div>
              <span className="block text-sm font-medium text-primary mb-1.5">File</span>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "cursor-pointer border-2 border-dashed rounded-2xl py-12 px-6 text-center transition-colors",
                  dragOver ? "border-accent bg-accent-50" : "border-line bg-surface hover:border-accent/50"
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setResult(null);
                  }}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <DocumentTextIcon className="w-9 h-9 text-accent" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs text-muted">Click or drop to replace</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted">
                    <CloudArrowUpIcon className="w-9 h-9" />
                    <p>
                      Drag &amp; drop a file, or{" "}
                      <span className="text-accent font-medium">choose a file</span>
                    </p>
                    <p className="text-xs">.xlsx, .xls, or .csv</p>
                  </div>
                )}
              </div>
            </div>

            {submitting && (
              <div className="space-y-2">
                <ProgressBar percent={progress} />
                <p className="text-xs text-muted text-right">{progress}%</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Uploading..." : "Upload file"}
            </Button>
          </form>
        </Card>

        <AnimatePresence>
          {result && <UploadResult result={result} />}
        </AnimatePresence>

        <InstantAddModal open={instantOpen} onClose={() => setInstantOpen(false)} />
      </div>
    </DashboardLayout>
  );
}

const TABS = [
  { key: "added", label: "Added", tone: "success" },
  { key: "duplicates", label: "Duplicates", tone: "warning" },
  { key: "invalid", label: "Invalid", tone: "danger" },
];

function UploadResult({ result, compact = false }) {
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
          className={cn(
            "text-xs rounded-lg border px-3 py-2 flex items-start gap-2",
            toneClasses[tab]
          )}
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

function SummaryStat({ label, value, tone }) {
  const toneClasses = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };
  return (
    <div>
      <p className={cn("text-3xl font-bold tabular-nums", toneClasses[tone])}>{value}</p>
      <p className="text-xs text-muted uppercase tracking-wide mt-1 flex items-center justify-center gap-1">
        {tone === "danger" && <ExclamationTriangleIcon className="w-3.5 h-3.5" />}
        {label}
      </p>
    </div>
  );
}

function InstantAddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50 to-white hover:from-accent-100 hover:shadow-[0_6px_20px_-6px_rgba(30,99,255,0.4)] transition-all duration-200 focus-ring"
    >
      <span className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center shrink-0">
        <BoltIcon className="w-4 h-4 text-white" />
      </span>
      <span className="text-left">
        <span className="block text-sm font-semibold text-primary">Instant Add</span>
        <span className="block text-[11px] text-muted">Type up to 20 projects, no file needed</span>
      </span>
      <span
        aria-hidden
        className="absolute -top-2.5 -right-2.5 inline-block px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold tracking-wide shadow-md animate-wobble select-none"
      >
        NEW
      </span>
    </button>
  );
}

function InstantAddModal({ open, onClose }) {
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [uploader, setUploader] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function reset() {
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setUploader("");
    setResult(null);
  }

  function handleClose() {
    onClose();
    // Slight delay so the modal doesn't visibly reset mid-close animation.
    setTimeout(reset, 200);
  }

  function updateRow(idx, field, value) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    if (rows.length >= MAX_MANUAL_ROWS) return;
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(idx) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handlePaste(e, rowIdx, colKey) {
    const text = e.clipboardData.getData("text");
    // Only intercept multi-cell pastes (copied from Excel/Sheets/CSV). A single
    // value pastes normally so it doesn't fight with the browser's own behavior.
    if (!text.includes("\t") && !text.includes("\n")) return;
    e.preventDefault();

    const grid = text
      .replace(/\r/g, "")
      .split("\n")
      .filter((line, i, arr) => !(i === arr.length - 1 && line === "")) // drop trailing blank line
      .map((line) => line.split("\t"));

    const startCol = COLUMNS.indexOf(colKey);

    setRows((prev) => {
      const next = [...prev.map((r) => ({ ...r }))];
      let pastedRows = 0;
      let truncated = false;

      grid.forEach((cells, r) => {
        const targetIdx = rowIdx + r;
        if (targetIdx >= MAX_MANUAL_ROWS) {
          truncated = true;
          return;
        }
        while (next.length <= targetIdx) next.push(emptyRow());
        cells.forEach((val, c) => {
          const col = COLUMNS[startCol + c];
          if (col) next[targetIdx][col] = val.trim();
        });
        pastedRows++;
      });

      if (truncated) {
        toast.error(`Only pasted up to row ${MAX_MANUAL_ROWS} — that's the max per batch.`);
      } else if (pastedRows > 1 || grid[0]?.length > 1) {
        toast.success(`Pasted ${pastedRows} row(s).`);
      }

      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uploader.trim()) {
      toast.error("Enter your name so these can be credited to you.");
      return;
    }
    const filled = rows.filter((r) => r.name.trim() || r.ticker.trim() || r.website.trim());
    if (filled.length === 0) {
      toast.error("Fill in at least one project row.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await projectService.instantAdd(uploader.trim(), filled);
      setResult(data);
      if (data.added > 0) toast.success(`${data.added} project(s) added.`);
      if (data.duplicates > 0) toast.error(`${data.duplicates} row(s) were duplicates.`);
      if (data.invalid > 0) toast.error(`${data.invalid} row(s) were invalid.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Instant Add failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <BoltIcon className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-primary">Instant Add</h3>
        <span className="text-[10px] font-bold tracking-wide text-white bg-danger rounded-full px-2 py-0.5">
          NEW
        </span>
      </div>
      <p className="text-sm text-muted mb-5">
        Type up to {MAX_MANUAL_ROWS} projects directly — same duplicate checks as the Excel
        upload, without needing a file.
      </p>

      {result ? (
        <>
          <UploadResult result={result} compact />
          <div className="flex gap-3 mt-5">
            <Button variant="secondary" className="flex-1" onClick={reset}>
              <SparklesIcon className="w-4 h-4" />
              Add more
            </Button>
            <Button className="flex-1" onClick={handleClose}>
              Done
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Your name"
            value={uploader}
            onChange={(e) => setUploader(e.target.value)}
            placeholder="e.g. Sarah Malik"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-primary">Projects</span>
              <span className="text-xs text-muted">{rows.length} / {MAX_MANUAL_ROWS}</span>
            </div>
            <p className="text-xs text-muted mb-2">
              Tip: copy cells from Excel or Google Sheets and paste into any box — it'll fill
              across rows and columns automatically.
            </p>
            <div className="border border-line rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1.2fr_auto] gap-px bg-line text-[11px] font-semibold uppercase tracking-wide text-muted">
                <div className="bg-surface px-3 py-2">Project Name</div>
                <div className="bg-surface px-3 py-2">Ticker</div>
                <div className="bg-surface px-3 py-2">Website</div>
                <div className="bg-surface px-2 py-2 w-9" />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {rows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1.2fr_auto] gap-px bg-line">
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(idx, "name", e.target.value)}
                      onPaste={(e) => handlePaste(e, idx, "name")}
                      placeholder="Solana"
                      className="bg-white px-3 py-2 text-sm text-primary outline-none focus:bg-accent-50"
                    />
                    <input
                      value={row.ticker}
                      onChange={(e) => updateRow(idx, "ticker", e.target.value)}
                      onPaste={(e) => handlePaste(e, idx, "ticker")}
                      placeholder="SOL"
                      className="bg-white px-3 py-2 text-sm text-primary outline-none focus:bg-accent-50"
                    />
                    <input
                      value={row.website}
                      onChange={(e) => updateRow(idx, "website", e.target.value)}
                      onPaste={(e) => handlePaste(e, idx, "website")}
                      placeholder="solana.com"
                      className="bg-white px-3 py-2 text-sm text-primary outline-none focus:bg-accent-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={rows.length <= 1}
                      className="bg-white px-2 flex items-center justify-center text-muted hover:text-danger disabled:opacity-30 disabled:hover:text-muted transition-colors"
                      aria-label="Remove row"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addRow}
              disabled={rows.length >= MAX_MANUAL_ROWS}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add row
            </button>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add projects"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
