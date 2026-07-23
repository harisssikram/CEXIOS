import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success("Welcome back.");
      const redirectTo = location.state?.from?.pathname || "/admin/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="glass border border-white/25 rounded-2xl shadow-glass p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 rounded-xl bg-accent-gradient flex items-center justify-center font-bold text-white mb-4">
              CX
            </div>
            <h1 className="text-xl font-bold text-primary">Admin sign in</h1>
            <p className="text-sm text-muted mt-1">CEXIOS Project Registry</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              icon={UserIcon}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
            <Input
              label="Password"
              icon={LockClosedIcon}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-line text-accent focus:ring-accent"
              />
              Remember me
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
