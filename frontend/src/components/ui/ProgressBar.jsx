import { motion } from "framer-motion";

export default function ProgressBar({ percent = 0 }) {
  return (
    <div className="w-full h-2 rounded-full bg-line overflow-hidden">
      <motion.div
        className="h-full bg-accent-gradient rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </div>
  );
}
