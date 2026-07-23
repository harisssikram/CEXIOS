import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  CircleStackIcon,
  SwatchIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import adminService from "../services/adminService";

const swatches = [
  { name: "Primary", hex: "#0A2540" },
  { name: "Secondary", hex: "#123C66" },
  { name: "Accent", hex: "#1E63FF" },
  { name: "Background", hex: "#F5F7FB" },
];

export default function SettingsPage() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.dashboard().then(setStats).catch(() => setStats(null));
  }, []);

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  return (
    <DashboardLayout title="Settings">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-primary mb-1.5">Settings</h2>
        <p className="text-muted text-sm">Account, database, and appearance information.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <UserCircleIcon className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-primary">Admin account</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Username</dt>
              <dd className="font-medium text-primary">{username || "--"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Role</dt>
              <dd className="font-medium text-primary">Administrator</dd>
            </div>
          </dl>
          <div className="mt-5 pt-5 border-t border-line flex gap-2.5 text-xs text-muted bg-primary-50/60 rounded-xl p-3">
            <InformationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              The admin password is set via the <span className="font-mono">ADMIN_PASSWORD_HASH</span>{" "}
              environment variable on the backend. Ask whoever manages the deployment to rotate it --
              this keeps credentials out of the app itself.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <CircleStackIcon className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-primary">Database info</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">API endpoint</dt>
              <dd className="font-mono text-xs text-primary truncate max-w-[60%]">{apiUrl}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted">Total projects</dt>
              <dd className="font-medium text-primary">
                {stats ? stats.total_projects : <Skeleton className="h-4 w-8 inline-block" />}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted">Total uploads</dt>
              <dd className="font-medium text-primary">
                {stats ? stats.total_uploads : <Skeleton className="h-4 w-8 inline-block" />}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <SwatchIcon className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-primary">Appearance</h3>
          </div>
          <p className="text-sm text-muted mb-4">CEXIOS brand palette used throughout the app.</p>
          <div className="grid grid-cols-2 gap-3">
            {swatches.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 border border-line rounded-xl p-2.5">
                <span
                  className="w-8 h-8 rounded-lg border border-line shrink-0"
                  style={{ backgroundColor: s.hex }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary truncate">{s.name}</p>
                  <p className="text-[11px] text-muted font-mono">{s.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <ArrowDownTrayIcon className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-primary">Export</h3>
          </div>
          <p className="text-sm text-muted mb-5 flex-1">
            Download the full project registry as an Excel file.
          </p>
          <Button variant="secondary" onClick={() => navigate("/admin/export")} className="w-full">
            Go to Export
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
