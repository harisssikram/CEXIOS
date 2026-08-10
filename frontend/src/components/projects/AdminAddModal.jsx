import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldExclamationIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProjectRowsGrid, { MAX_MANUAL_ROWS, emptyRow } from "./ProjectRowsGrid";
import UploadResultPanel from "./UploadResultPanel";
import adminService from "../../services/adminService";
import { usePin } from "../../hooks/usePin";

/**
 * "Admin Add" -- same grid/paste UI as Instant Add, but hits the force-add endpoint,
 * which inserts rows exactly as given with NO duplicate checking. Gated by PIN both
 * here (so we don't even try without one) and again on the backend.
 */
export default function AdminAddModal({ open, onClose, onSuccess }) {
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
      const data = await adminService.forceAddProjects(uploader.trim(), filled);
      setResult(data);
      if (data.added > 0) {
        toast.success(`${data.added} project(s) inserted directly — no duplicate check.`);
        onSuccess?.();
      }
      if (data.invalid > 0) toast.error(`${data.invalid} row(s) were invalid.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Admin Add failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <ShieldExclamationIcon className="w-5 h-5 text-danger" />
        <h3 className="text-lg font-semibold text-primary">Admin Add</h3>
      </div>
      <p className="text-sm text-muted mb-5">
        Inserts up to {MAX_MANUAL_ROWS} projects <strong>exactly as typed</strong> — duplicate
        names or websites are <strong>not</strong> checked. Use this only when you're sure.
        Requires a PIN.
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

          <Button type="submit" size="lg" variant="danger" className="w-full" disabled={submitting}>
            {submitting ? "Inserting..." : "Insert without duplicate check"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
