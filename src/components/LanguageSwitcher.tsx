"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "minimal";
  isDarkBg?: boolean;
}

export default function LanguageSwitcher({
  className = "",
  variant = "pill",
  isDarkBg = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "minimal") {
    return (
      <button
        onClick={() => setLanguage(language === "id" ? "en" : "id")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
          className ||
          (isDarkBg
            ? "bg-white/10 border-white/15 text-white hover:bg-white/20"
            : "bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15 text-zinc-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20")
        }`}
        title="Ganti Bahasa / Switch Language"
      >
        <Globe className={`w-3.5 h-3.5 ${isDarkBg ? "text-zinc-300" : "text-zinc-500 dark:text-zinc-300"}`} />
        <span>{language === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 text-[11px] font-bold select-none transition-all ${
        isDarkBg
          ? "bg-white/10 border border-white/15"
          : "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15"
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
          language === "id"
            ? "bg-white text-black font-bold shadow-xs dark:bg-white dark:text-black"
            : isDarkBg
            ? "text-zinc-400 hover:text-white hover:bg-white/5"
            : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        title="Bahasa Indonesia"
      >
        <span>🇮🇩</span>
        <span>ID</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
          language === "en"
            ? "bg-white text-black font-bold shadow-xs dark:bg-white dark:text-black"
            : isDarkBg
            ? "text-zinc-400 hover:text-white hover:bg-white/5"
            : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
