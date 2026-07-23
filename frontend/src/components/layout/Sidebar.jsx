import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

const publicItems = [
  { to: "/search", label: "Search Projects", icon: MagnifyingGlassIcon },
  { to: "/upload", label: "Upload Excel", icon: ArrowUpTrayIcon },
];

const adminItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: Squares2X2Icon },
  { to: "/admin/uploads", label: "Upload History", icon: ClockIcon },
  { to: "/admin/projects", label: "Projects", icon: FolderIcon },
  { to: "/admin/export", label: "Export", icon: ArrowDownTrayIcon },
  { to: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "relative flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-ring",
          isActive
            ? "bg-white/10 text-white"
            : "text-primary-100/70 hover:bg-white/5 hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-accent-400" />
          )}
          <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-accent-400" : "")} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-accent-gradient flex items-center justify-center font-bold text-white text-sm">
          CX
        </div>
        <div>
          <p className="text-white font-semibold leading-tight">CEXIOS</p>
          <p className="text-primary-100/60 text-xs leading-tight">Project Registry</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-3.5 pt-3 pb-2 text-xs font-semibold uppercase tracking-wider text-primary-100/40">
          Registry
        </p>
        {publicItems.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}

        <p className="px-3.5 pt-5 pb-2 text-xs font-semibold uppercase tracking-wider text-primary-100/40">
          Admin
        </p>
        {adminItems.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="px-3 pb-5 pt-2 border-t border-white/10 mt-2">
        {isAuthenticated ? (
          <button
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-primary-100/70 hover:bg-white/5 hover:text-white transition-colors focus-ring"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        ) : (
          <NavItem to="/admin/login" label="Admin Login" icon={ArrowRightOnRectangleIcon} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-brand-gradient sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary-900/50 z-40 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 w-72 bg-brand-gradient z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={onCloseMobile}
                className="absolute top-5 right-4 text-white/70 hover:text-white focus-ring rounded-lg p-1"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <SidebarContent onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
