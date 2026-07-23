import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon, ArrowUpTrayIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const cards = [
  {
    to: "/search",
    icon: MagnifyingGlassIcon,
    title: "Search Projects",
    description: "Look up any project by name, ticker, or website before you add a new one.",
  },
  {
    to: "/upload",
    icon: ArrowUpTrayIcon,
    title: "Upload Excel",
    description: "Import a spreadsheet of new projects. Duplicates are detected automatically.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-gradient flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center font-bold text-white text-sm">
          CX
        </div>
        <span className="text-white font-semibold tracking-tight">CEXIOS</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-accent-400 font-semibold text-sm tracking-widest uppercase mb-4"
        >
          Business Development - Internal Tool
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-4xl sm:text-6xl font-bold text-white tracking-tight max-w-3xl leading-tight"
        >
          Crypto Project Registry
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="text-primary-100/80 text-lg mt-5 max-w-xl"
        >
          Manage every crypto listing in one centralized database.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-5 mt-14 w-full max-w-2xl"
        >
          {cards.map((card) => (
            <button
              key={card.to}
              onClick={() => navigate(card.to)}
              className="group text-left glass rounded-2xl p-7 border border-white/20 hover:border-white/40 hover:-translate-y-1 transition-all duration-200 shadow-glass focus-ring"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-gradient flex items-center justify-center mb-5">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-primary font-semibold text-lg mb-1.5 flex items-center gap-1.5">
                {card.title}
                <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-sm text-muted">{card.description}</p>
            </button>
          ))}
        </motion.div>
      </main>

      <footer className="px-6 py-6 text-center text-primary-100/50 text-xs">
        (c) {new Date().getFullYear()} CEXIOS. Internal use only.
      </footer>
    </div>
  );
}
