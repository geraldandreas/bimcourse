"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { DEFAULT_SITE_CONTENT, WebFaqItem } from "@/data/defaultSiteContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface FaqSectionProps {
  content?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    items?: WebFaqItem[];
  };
}

export default function FaqSection({
  content = DEFAULT_SITE_CONTENT.faq,
}: FaqSectionProps) {
  const { language, t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const items = Array.isArray(content?.items)
    ? content.items
    : DEFAULT_SITE_CONTENT.faq.items;

  return (
    <section id="faq" className="relative z-10 w-full bg-white dark:bg-[#09090B] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">07</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {language === "en" ? "FREQUENTLY ASKED QUESTIONS (FAQ)" : (content?.badge || "PERTANYAAN UMUM (FAQ)")}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 07 / 07</span>
        </div>

        <FadeIn direction="up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/35 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              {language === "en" ? t.faq.badge : (content?.badge || "Pusat Bantuan")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-950 dark:text-white mb-3">
              {language === "en" ? t.faq.title : (content?.title || "Sering Ditanyakan (FAQ)")}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base">
              {language === "en"
                ? t.faq.subtitle
                : (content?.subtitle ||
                  "Informasi seputar spesifikasi software, sistem kelas, sertifikat, dan pendampingan.")}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="space-y-4">
          {items.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <StaggerItem key={faq.id || idx}>
                <div
                  className={`border rounded-2xl overflow-hidden shadow-xs transition-all ${
                    isOpen
                      ? "border-amber-400/70 dark:border-amber-400/40 bg-white dark:bg-zinc-900 shadow-md ring-1 ring-amber-400/20"
                      : "border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                  >
                    <span className="text-base font-bold text-gray-950 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <span className={`p-1 rounded-full shrink-0 transition-colors ${
                      isOpen
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed border-t border-black/[0.04] dark:border-white/10">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
