import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

export const MAX_MANUAL_ROWS = 20;
export const emptyRow = () => ({ name: "", ticker: "", website: "" });
const COLUMNS = ["name", "ticker", "website"];

/**
 * A small Excel-style grid: type into cells, or paste a multi-cell block copied
 * from Excel/Sheets/CSV into any cell and it fills across rows and columns from
 * that spot. Shared by Instant Add (duplicate-checked) and Admin Add (bypasses
 * duplicate checks) so both stay visually and behaviorally identical.
 */
export default function ProjectRowsGrid({ rows, setRows, maxRows = MAX_MANUAL_ROWS }) {
  function updateRow(idx, field, value) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    if (rows.length >= maxRows) return;
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(idx) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  function handlePaste(e, rowIdx, colKey) {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\t") && !text.includes("\n")) return;
    e.preventDefault();

    const grid = text
      .replace(/\r/g, "")
      .split("\n")
      .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
      .map((line) => line.split("\t"));

    const startCol = COLUMNS.indexOf(colKey);

    setRows((prev) => {
      const next = [...prev.map((r) => ({ ...r }))];
      let pastedRows = 0;
      let truncated = false;

      grid.forEach((cells, r) => {
        const targetIdx = rowIdx + r;
        if (targetIdx >= maxRows) {
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
        toast.error(`Only pasted up to row ${maxRows} — that's the max per batch.`);
      } else if (pastedRows > 1 || grid[0]?.length > 1) {
        toast.success(`Pasted ${pastedRows} row(s).`);
      }

      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-primary">Projects</span>
        <span className="text-xs text-muted">{rows.length} / {maxRows}</span>
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
        disabled={rows.length >= maxRows}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        + Add row
      </button>
    </div>
  );
}
