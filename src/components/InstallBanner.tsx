import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const VISIT_KEY = "teamdino_visit_count";
const DISMISSED_KEY = "teamdino_install_dismissed";

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const count = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(count));

    if (count >= 3) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border bg-card p-4 shadow-lg"
        >
          <button onClick={dismiss} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TeamDino" className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-foreground">Install TeamDino</p>
              <p className="text-xs text-muted-foreground truncate">Quick access, offline support & more</p>
            </div>
            <Button
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => { dismiss(); navigate("/install"); }}
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
