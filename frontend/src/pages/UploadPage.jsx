import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  BoltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ProgressBar from "../components/ui/ProgressBar";
import ProjectRowsGrid, { MAX_MANUAL_ROWS, emptyRow } from "../components/projects/ProjectRowsGrid";
import UploadResultPanel from "../components/projects/UploadResultPanel";
import projectService from "../services/projectService";
import { usePin } from "../hooks/usePin";
import { cn } from "../utils/cn";

export default function UploadPage() {
  const { requirePin } = usePin();
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Enter your name so uploads can be credited to you.");
      return;
    }
    if (!file) {
      toast.error("Choose an .xlsx, .xls, or .csv file to upload.");
      return;
    }
    requirePin(doUpload);
  }

  async function doUpload() {
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
        <h2 className="text-2xl font-bold text-primary mb-1.5">Add projects to the registry</h2>
        <p className="text-muted text-sm mb-5">
          Upload a spreadsheet with <span className="font-mono text-primary">Project Name</span>,{" "}
          <span className="font-mono text-primary">Ticker</span>, and{" "}
          <span className="font-mono text-primary">Website</span> columns. Rows are rejected as
          duplicates if the <strong>project name</strong> or <strong>website</strong> already
          exists — the ticker is allowed to repeat. Adding or uploading requires a PIN.
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
          {result && <UploadResultPanel result={result} />}
        </AnimatePresence>

        <InstantAddModal open={instantOpen} onClose={() => setInstantOpen(false)} />
      </div>
    </DashboardLayout>
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
  const { requirePin } = usePin();
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

  function handleSubmit(e) {
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
    requirePin(() => doSubmit(filled));
  }

  async function doSubmit(filled) {
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
        upload, without needing a file. Requires a PIN.
      </p>

      {result ? (
        <>
          <UploadResultPanel result={result} compact />
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

          <ProjectRowsGrid rows={rows} setRows={setRows} />

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add projects"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
