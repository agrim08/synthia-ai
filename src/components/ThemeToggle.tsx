"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-ink-soft hover:text-ink hover:bg-ink/5 h-8 w-8 rounded-full relative overflow-hidden flex items-center justify-center"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.div
            key={isDark ? "dark" : "light"}
            initial={{ y: -12, opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={{ y: 12, opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.15 }}
            className="absolute flex items-center justify-center"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
