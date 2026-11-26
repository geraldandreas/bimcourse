"use client";

import { useState, useEffect } from "react";
import { MapPin, Briefcase, DollarSign, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from "@/data/defaultSiteContent";

interface CareerRoadmapProps {
  content?: SiteContentConfig["roadmaps"];
}

export default function CareerRoadmap({ content }: CareerRoadmapProps) {
  const { language, t } = useLanguage();
  const tracks =
    content?.tracks && content.tracks.length > 0
      ? content.tracks
      : DEFAULT_SITE_CONTENT.roadmaps.tracks || [];

  const [selectedRoadmapId, setSelectedRoadmapId] = useState(tracks[0]?.id || "modeler");

  useEffect(() => {
    if (tracks.length > 0 && !tracks.some((r) => r.id === selectedRoadmapId)) {
      setSelectedRoadmapId(tracks[0].id);
    }
  }, [tracks, selectedRoadmapId]);

  const currentRoadmap = tracks.find((r) => r.id === selectedRoadmapId) || tracks[0];
  if (!currentRoadmap) return null;

  return (
    <section id="roadmaps" className="relative z-10 w-full bg-white dark:bg-[#09090B] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">02</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {language === "en" ? "CAREER ROADMAP (LEARNING PATH)" : (content?.badge ? content.badge.toUpperCase() : "PETA JALAN KARIER (ROADMAP)")}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 02 / 07</span>
        </div>

        {/* Header */}
        <FadeIn direction="up">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/35 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              {language === "en" ? t.roadmaps.badge : (content?.badge || "Roadmap Spesialisasi Karier")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-950 dark:text-white mb-4">
              {language === "en" ? t.roadmaps.title : (content?.title || "Peta Jalan Karier BIM Terstruktur")}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
              {language === "en"
                ? t.roadmaps.subtitle
                : (content?.subtitle || "Jangan buang waktu belajar tanpa arah. Pilih jalur yang sesuai dengan latar belakang dan target posisi impian Anda di industri arsitektur & konstruksi.")}
            </p>
          </div>
        </FadeIn>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tracks.map((roadmap) => {
            const isSelected = roadmap.id === currentRoadmap.id;
            return (
              <button
                key={roadmap.id}
                onClick={() => setSelectedRoadmapId(roadmap.id)}
                className={`px-6 py-3.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-[0_4px_18px_rgba(245,180,50,0.35)] scale-105 border-0 font-extrabold"
                    : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-amber-50/50 dark:hover:bg-zinc-800 border border-amber-200/60 dark:border-white/10"
                }`}
              >
                {roadmap.title}
              </button>
            );
          })}
        </div>

        {/* Active Roadmap Overview Card */}
        <FadeIn direction="up">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-10 border border-zinc-200 dark:border-white/10 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {currentRoadmap.subtitle}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                  {currentRoadmap.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs md:text-sm text-gray-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    {language === "en" ? `Duration: ${currentRoadmap.duration}` : `Durasi: ${currentRoadmap.duration}`}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    {language === "en" ? `Target Role: ${currentRoadmap.targetRole}` : `Target Posisi: ${currentRoadmap.targetRole}`}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 flex flex-col items-start lg:items-end">
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-semibold">
                  {language === "en" ? "Estimated Industry Salary Benchmark" : (content?.salaryLabel || "Estimasi Standar Gaji Industri")}
                </span>
                <span className="text-lg md:text-xl font-black text-gray-950 dark:text-amber-200 flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  {currentRoadmap.salaryRange}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">
                  {language === "en" ? "Based on 2026 AEC Contractor & Consultant benchmarks" : (content?.salarySourceNote || "Berdasarkan survei BUMN & Konsultan AEC 2026")}
                </span>
              </div>
            </div>

            {/* Roadmap Step Timeline */}
            <StaggerContainer key={currentRoadmap.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              {(currentRoadmap.steps || []).map((step, idx) => (
                <StaggerItem key={`${currentRoadmap.id}-${step.phase}-${idx}`}>
                  <HoverCard lift={-4} scale={1.01} className="h-full">
                    <div
                      className="relative p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/10 flex flex-col justify-between group hover:border-amber-400/60 dark:hover:border-amber-400/40 transition-colors h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[11px] font-black shadow-xs">
                            {step.phase}
                          </span>
                          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500">Step 0{idx + 1}</span>
                        </div>
                        <h4 className="text-base font-bold text-gray-950 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">
                          {step.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 -mx-6 -mb-6 p-4 rounded-b-2xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                          {language === "en" ? "Capstone Portfolio Deliverable:" : "Bukti Portofolio Capstone:"}
                        </span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-zinc-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {step.deliverable}
                        </span>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* CTA */}
            <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-400 text-center sm:text-left">
                {language === "en"
                  ? "Includes 1-on-1 portfolio review with licensed instructors & technical job interview simulations."
                  : (content?.ctaNote || "Termasuk bimbingan portfolio review 1-on-1 bersama instruktur berlisensi & simulasi tes teknis kerja.")}
              </p>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                href="#courses"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs md:text-sm font-black transition-all shadow-[0_4px_20px_rgba(245,180,50,0.35)] flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {language === "en"
                  ? `Enroll in ${currentRoadmap.title}`
                  : `${content?.ctaBtnPrefix || "Ambil Paket"} ${currentRoadmap.title}`}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
