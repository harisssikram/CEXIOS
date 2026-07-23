import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar({ title, onOpenMobileMenu }) {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-line">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden text-muted hover:text-primary focus-ring rounded-lg p-1.5"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-primary items-center justify-center font-bold text-white text-xs shrink-0">
            CX
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-primary truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => navigate("/search")}
            className="text-muted hover:text-primary hover:bg-primary-50 transition-colors focus-ring rounded-lg p-2"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative text-muted hover:text-primary hover:bg-primary-50 transition-colors focus-ring rounded-lg p-2"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-line rounded-2xl shadow-lift p-2 origin-top-right"
                >
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Notifications
                  </p>
                  <div className="px-3 py-6 text-center text-sm text-muted">
                    You're all caught up.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-1.5 text-muted hover:text-primary hover:bg-primary-50 transition-colors focus-ring rounded-lg py-1.5 pl-2 pr-1.5"
            >
              <UserCircleIcon className="w-6 h-6" />
              <span className="hidden sm:inline text-sm font-medium text-primary">
                {isAuthenticated ? username || "Admin" : "Guest"}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-line rounded-2xl shadow-lift p-1.5 origin-top-right"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-primary truncate">{username}</p>
                        <p className="text-xs text-muted">Administrator</p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/admin/settings");
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-xl text-ink hover:bg-primary-50 transition-colors"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate("/");
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-xl text-danger hover:bg-danger/10 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/admin/login");
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-xl text-ink hover:bg-primary-50 transition-colors"
                    >
                      Admin Login
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
