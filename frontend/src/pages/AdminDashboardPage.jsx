import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FolderIcon,
  ArrowUpTrayIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import { Skeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import UploadsChart from "../components/charts/UploadsChart";
import adminService from "../services/adminService";
import { timeAgo } from "../utils/formatDate";

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.dashboard(), adminService.listUploads()])
      .then(([dashboardData, uploadsData]) => {
        setStats(dashboardData);
        setUploads(uploadsData);
      })
      .catch(() => toast.error("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const todaysUploads = uploads.filter((u) => isToday(u.upload_date)).length;
  const duplicatesPrevented = uploads.reduce((sum, u) => sum + (u.duplicate_count || 0), 0);

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-primary mb-1.5">Overview</h2>
        <p className="text-muted text-sm">Registry activity at a glance.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard label="Total Projects" value={stats?.total_projects ?? 0} icon={FolderIcon} accent="primary" delay={0} />
          <StatCard label="Today's Uploads" value={todaysUploads} icon={CalendarDaysIcon} accent="accent" delay={0.05} />
          <StatCard label="Total Uploads" value={stats?.total_uploads ?? 0} icon={ArrowUpTrayIcon} accent="accent" delay={0.1} />
          <StatCard label="Duplicates Prevented" value={duplicatesPrevented} icon={ShieldCheckIcon} accent="warning" delay={0.15} />
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 p-6">
          <h3 className="font-semibold text-primary mb-1">Upload activity</h3>
          <p className="text-xs text-muted mb-4">Projects added over the last 14 days</p>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <UploadsChart uploads={uploads} />
          )}
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 pb-3">
            <h3 className="font-semibold text-primary">Recent activity</h3>
          </div>
          {loading ? (
            <div className="px-6 pb-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : stats?.recent_uploads?.length ? (
            <ul className="divide-y divide-line max-h-72 overflow-y-auto">
              {stats.recent_uploads.map((u) => (
                <li key={u.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{u.uploaded_by}</p>
                    <p className="text-xs text-muted truncate">{u.file_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-success">+{u.imported_count}</p>
                    <p className="text-xs text-muted">{timeAgo(u.upload_date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No uploads yet" description="Uploaded files will show up here." />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
