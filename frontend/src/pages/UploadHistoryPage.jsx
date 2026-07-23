import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { DocumentTextIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import adminService from "../services/adminService";
import { formatDateTime, timeAgo } from "../utils/formatDate";

export default function UploadHistoryPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    adminService
      .listUploads()
      .then(setUploads)
      .catch(() => toast.error("Could not load upload history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Upload History">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-primary mb-1.5">Upload history</h2>
        <p className="text-muted text-sm">Every spreadsheet imported into the registry, most recent first.</p>
      </div>

      {loading && (
        <div className="space-y-4 max-w-3xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </Card>
          ))}
        </div>
      )}

      {!loading && uploads.length === 0 && (
        <EmptyState icon={ClockIcon} title="No uploads yet" description="Uploaded files will appear here as a timeline." />
      )}

      {!loading && uploads.length > 0 && (
        <ol className="relative max-w-3xl border-l-2 border-line ml-3">
          {uploads.map((u, idx) => (
            <motion.li
              key={u.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className="mb-6 ml-6"
            >
              <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-accent-gradient ring-4 ring-surface" />
              <Card className="p-5 hover:shadow-lift transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <DocumentTextIcon className="w-4 h-4 text-muted shrink-0" />
                      <p className="font-semibold text-primary truncate">{u.file_name}</p>
                    </div>
                    <p className="text-sm text-muted">
                      Uploaded by <span className="font-medium text-primary">{u.uploaded_by}</span> -{" "}
                      {timeAgo(u.upload_date)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge tone="success">{u.imported_count} added</Badge>
                      <Badge tone="warning">{u.duplicate_count} duplicates</Badge>
                      <Badge tone="danger">{u.invalid_count} invalid</Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(u)}
                    className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-700 transition-colors focus-ring rounded-lg px-2 py-1"
                  >
                    <EyeIcon className="w-4 h-4" /> Details
                  </button>
                </div>
              </Card>
            </motion.li>
          ))}
        </ol>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Upload details" maxWidth="max-w-md">
        {selected && (
          <div className="space-y-3 text-sm">
            <Row label="File name" value={selected.file_name} />
            <Row label="Uploaded by" value={selected.uploaded_by} />
            <Row label="Date" value={formatDateTime(selected.upload_date)} />
            <Row label="Projects added" value={selected.imported_count} />
            <Row label="Duplicates skipped" value={selected.duplicate_count} />
            <Row label="Invalid rows" value={selected.invalid_count} />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-primary">{value}</span>
    </div>
  );
}
