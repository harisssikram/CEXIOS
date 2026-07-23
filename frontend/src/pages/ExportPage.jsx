import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDownTrayIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import adminService from "../services/adminService";

export default function ExportPage() {
  const [count, setCount] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminService
      .dashboard()
      .then((d) => setCount(d.total_projects))
      .catch(() => setCount(null));
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      await adminService.exportProjects();
      toast.success("Export downloaded.");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <DashboardLayout title="Export">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-primary mb-1.5">Export the registry</h2>
        <p className="text-muted text-sm">Download every project currently in the database as a spreadsheet.</p>
      </div>

      <Card className="max-w-xl p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center mb-5">
          <TableCellsIcon className="w-7 h-7 text-accent-600" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-1">projects_export.xlsx</h3>
        {count === null ? (
          <Skeleton className="h-4 w-32 mt-1 mb-6" />
        ) : (
          <p className="text-sm text-muted mb-6">{count} project(s) will be included</p>
        )}
        <Button size="lg" icon={ArrowDownTrayIcon} onClick={handleExport} disabled={exporting}>
          {exporting ? "Preparing file..." : "Download export"}
        </Button>
      </Card>
    </DashboardLayout>
  );
}
