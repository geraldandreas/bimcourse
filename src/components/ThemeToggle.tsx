"use client";

import { useTheme } from "@/lib/theme/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ThemeToggle({
  className = "",
  isDarkBg = false,
}: {
  className?: string;
  isDarkBg?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 shadow-xs ${
        isDarkBg
          ? "border border-white/20 bg-white/10 hover:bg-white/20 text-white"
          : "border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-800 dark:text-white"
      } ${className}`}
      title={
        isDark
          ? language === "en"
            ? "Switch to Light Mode"
            : "Beralih ke Mode Terang"
          : language === "en"
          ? "Switch to Dark Mode"
          : "Beralih ke Mode Gelap"
      }
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-amber-500 dark:text-amber-300" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Moon className={`w-4 h-4 drop-shadow-xs ${isDarkBg ? "text-white" : "text-zinc-800 dark:text-white"}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
