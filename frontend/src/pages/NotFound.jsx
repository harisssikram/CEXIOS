import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-accent font-bold text-sm tracking-widest uppercase mb-3">404</p>
        <h1 className="text-3xl font-bold text-primary mb-2">Page not found</h1>
        <p className="text-muted mb-7">The page you're looking for doesn't exist or has moved.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </motion.div>
    </div>
  );
}
