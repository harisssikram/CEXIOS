import { motion } from "framer-motion";
import Card from "./Card";
import { cn } from "../../utils/cn";

export default function StatCard({ label, value, icon: Icon, accent = "accent", delay = 0 }) {
  const accentClasses = {
    accent: "bg-accent-50 text-accent-600",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    primary: "bg-primary-50 text-primary",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="p-6 flex items-start justify-between hover:shadow-lift transition-shadow">
        <div>
          <p className="text-sm text-muted font-medium">{label}</p>
          <p className="text-3xl font-bold text-primary mt-2 tabular-nums">{value}</p>
        </div>
        {Icon && (
          <span className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", accentClasses[accent])}>
            <Icon className="w-5 h-5" />
          </span>
        )}
      </Card>
    </motion.div>
  );
}
