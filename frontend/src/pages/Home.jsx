import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ArrowRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

const cards = [
  {
    to: "/search",
    icon: MagnifyingGlassIcon,
    title: "Search Projects",
    description: "Look up any project by name, ticker, or website before you add a new one.",
    glow: "from-accent-500/20",
  },
  {
    to: "/upload",
    icon: ArrowUpTrayIcon,
    title: "Upload Excel",
    description: "Import a spreadsheet of new projects. Duplicates are detected automatically.",
    glow: "from-indigo-500/20",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#050b17] relative overflow-hidden font-sans text-white">
      {/* Ambient glow orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[520px] h-[520px] bg-accent-600/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[480px] h-[480px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(62,123,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(62,123,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Nav */}
      <header className="relative z-20 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(62,123,255,0.25)]">
            CX
          </div>
          <span className="font-semibold tracking-tight">CEXIOS</span>
        </div>
        <Link
          to="/admin/login"
          className="text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-accent-400/50 hover:bg-white/5 px-5 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-accent-400 font-bold text-xs tracking-[0.3em] uppercase mb-5"
        >
          Business Development · Internal Tool
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-5xl sm:text-7xl font-black tracking-tight max-w-4xl leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-accent-400 drop-shadow-[0_0_40px_rgba(30,99,255,0.35)]"
        >
          Crypto Project Registry
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="text-white/50 text-lg mt-6 max-w-xl font-light"
        >
          Manage every crypto listing in one centralized, always up-to-date database.
        </motion.p>

        {/* Action cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-5 mt-16 w-full max-w-2xl"
        >
          {cards.map((card) => (
            <button
              key={card.to}
              onClick={() => navigate(card.to)}
              className="group relative text-left rounded-2xl p-7 border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-accent-400/40 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_0_40px_-10px_rgba(30,99,255,0.35)] focus-ring overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <card.icon className="w-5 h-5 text-accent-400 drop-shadow-[0_0_10px_rgba(62,123,255,0.7)]" />
              </div>
              <h3 className="relative font-semibold text-lg mb-1.5 flex items-center gap-1.5 tracking-wide">
                {card.title}
                <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="relative text-sm text-white/45 leading-relaxed">{card.description}</p>
            </button>
          ))}
        </motion.div>

        {/* Admin CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-14"
        >
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-accent-600 to-indigo-600 border border-accent-400/30 shadow-[0_0_30px_rgba(30,99,255,0.3)] hover:shadow-[0_0_50px_rgba(30,99,255,0.55)] transition-all duration-300 overflow-hidden focus-ring"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
            <Squares2X2Icon className="relative w-5 h-5" />
            <span className="relative tracking-wide">Admin Dashboard</span>
            <ArrowRightIcon className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 py-6 text-center text-white/30 text-xs tracking-wide">
        &copy; {new Date().getFullYear()} CEXIOS. Internal use only.
      </footer>
    </div>
  );
}
