import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import projectService from "../services/projectService";
import { cn } from "../utils/cn";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

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
      toast.success(`Uploaded! ${data.added} project(s) added.`);
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
        <p className="text-muted text-sm mb-8">
          Upload a spreadsheet with <span className="font-mono text-primary">Project Name</span>,{" "}
          <span className="font-mono text-primary">Ticker</span>, and{" "}
          <span className="font-mono text-primary">Website</span> columns. Duplicates (matched by
          ticker or website) are skipped automatically.
        </p>

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
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Card className="p-7">
                <div className="flex items-center gap-2 text-success font-semibold mb-6">
                  <CheckCircleIcon className="w-5 h-5" />
                  Upload complete
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <SummaryStat label="Added" value={result.added} tone="success" />
                  <SummaryStat label="Duplicates" value={result.duplicates} tone="warning" />
                  <SummaryStat label="Invalid rows" value={result.invalid} tone="danger" />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
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
