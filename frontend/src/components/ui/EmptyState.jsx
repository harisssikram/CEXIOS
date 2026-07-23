import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function EmptyState({
  icon: Icon = MagnifyingGlassIcon,
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-16 px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-primary-500" />
      </div>
      <h3 className="text-base font-semibold text-primary mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mb-5">{description}</p>}
      {action}
    </motion.div>
  );
}
