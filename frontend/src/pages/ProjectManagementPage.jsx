import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowsUpDownIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import { TableSkeleton } from "../components/ui/Skeleton";
import AdminAddModal from "../components/projects/AdminAddModal";
import { usePagination } from "../hooks/usePagination";
import { usePin } from "../hooks/usePin";
import adminService from "../services/adminService";
import { formatDate } from "../utils/formatDate";

const emptyForm = { name: "", ticker: "", website: "", ceo: "", telegram: "", notes: "" };

export default function ProjectManagementPage() {
  const { requirePin } = usePin();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("date_added");
  const [sortDir, setSortDir] = useState("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Independent of the Add/Edit modal above -- Admin Add bypasses duplicate checks
  // entirely and has its own state, so it never interferes with normal edits.
  const [adminAddOpen, setAdminAddOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    setLoading(true);
    adminService
      .listProjects()
      .then(setProjects)
      .catch(() => toast.error("Could not load projects."))
      .finally(() => setLoading(false));
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filteredSorted = useMemo(() => {
    const f = filter.trim().toLowerCase();
    let list = projects;
    if (f) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(f) || p.ticker.toLowerCase().includes(f)
      );
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [projects, filter, sortKey, sortDir]);

  const { pageItems, page, totalPages, nextPage, prevPage, setPage } = usePagination(
    filteredSorted,
    8
  );

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      ticker: p.ticker,
      website: p.website,
      ceo: p.ceo || "",
      telegram: p.telegram || "",
      notes: p.notes || "",
    });
    setEditingId(p.id);
    setModalOpen(true);
  }

  function saveProject(e) {
    e.preventDefault();
    requirePin(doSaveProject);
  }

  async function doSaveProject() {
    setSaving(true);
    try {
      if (editingId) {
        await adminService.updateProject(editingId, form);
        toast.success("Project updated.");
      } else {
        await adminService.createProject({ ...form, added_by: "admin" });
        toast.success("Project added.");
      }
      setModalOpen(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function confirmAndDelete() {
    requirePin(doDelete);
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteProject(confirmDelete.id);
      toast.success("Project deleted.");
      setConfirmDelete(null);
      loadProjects();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    try {
      await adminService.exportProjects();
      toast.success("Export downloaded.");
    } catch {
      toast.error("Export failed.");
    }
  }

  const columns = [
    { key: "ticker", label: "Ticker" },
    { key: "name", label: "Project" },
    { key: "website", label: "Website" },
    { key: "added_by", label: "Added By" },
    { key: "date_added", label: "Date Added" },
  ];

  return (
    <DashboardLayout title="Projects">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1.5">Project management</h2>
          <p className="text-muted text-sm">{projects.length} project(s) in the registry.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={ArrowDownTrayIcon} onClick={handleExport}>
            Export
          </Button>
          <Button
            variant="outlineDanger"
            icon={ShieldExclamationIcon}
            onClick={() => setAdminAddOpen(true)}
          >
            Admin Add
          </Button>
          <Button icon={PlusIcon} onClick={openAdd}>
            Add project
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-line">
          <Input
            icon={MagnifyingGlassIcon}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by ticker or name..."
            containerClassName="max-w-xs"
          />
        </div>

        {loading && <TableSkeleton rows={6} cols={5} />}

        {!loading && filteredSorted.length === 0 && (
          <EmptyState
            title="No projects match your filter"
            description="Try a different search term, or add a new project."
          />
        )}

        {!loading && filteredSorted.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-primary-50/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="px-5 py-3.5 font-semibold cursor-pointer select-none hover:text-primary transition-colors"
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <ArrowsUpDownIcon
                            className={`w-3.5 h-3.5 ${sortKey === col.key ? "text-accent" : "text-muted/40"}`}
                          />
                        </span>
                      </th>
                    ))}
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p.id} className="border-t border-line hover:bg-primary-50/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md text-xs">
                          {p.ticker}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-primary">{p.name}</td>
                      <td className="px-5 py-3.5 text-muted break-all">{p.website}</td>
                      <td className="px-5 py-3.5 text-muted">{p.added_by}</td>
                      <td className="px-5 py-3.5 text-muted">{formatDate(p.date_added)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 text-muted hover:text-accent hover:bg-accent-50 rounded-lg transition-colors focus-ring"
                            aria-label="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(p)}
                            className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focus-ring"
                            aria-label="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} onPage={setPage} />
          </>
        )}
      </Card>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit project" : "Add project"}>
        <form onSubmit={saveProject} className="space-y-3.5">
          <Input label="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input
            label="Ticker"
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            required
            className="font-mono"
          />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} required />
          <Input label="CEO (optional)" value={form.ceo} onChange={(e) => setForm({ ...form, ceo: e.target.value })} />
          <Input label="Telegram (optional)" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit" className="w-full mt-2" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Add project"}
          </Button>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Delete project?" maxWidth="max-w-sm">
        <p className="text-sm text-muted mb-6">
          This will permanently remove{" "}
          <span className="font-semibold text-primary">{confirmDelete?.name}</span> ({confirmDelete?.ticker}) from the
          registry. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={confirmAndDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      <AdminAddModal
        open={adminAddOpen}
        onClose={() => setAdminAddOpen(false)}
        onSuccess={loadProjects}
      />
    </DashboardLayout>
  );
}
