"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw, CheckCircle, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function QuizRecommender() {
  const { language, t } = useLanguage();
  const [background, setBackground] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const backgrounds = [
    { id: "arch", label: language === "en" ? "Architecture / Interior Design" : "Arsitektur / Desain Interior", icon: "🏛️" },
    { id: "civil", label: language === "en" ? "Civil Engineering / Structure" : "Teknik Sipil / Struktur", icon: "🏗️" },
    { id: "mep", label: language === "en" ? "MEP / Mechanical Electrical" : "MEP / Mechanical Electrical", icon: "⚡" },
    { id: "drafter", label: language === "en" ? "AutoCAD 2D Drafter" : "Drafter AutoCAD 2D", icon: "📐" },
    { id: "student", label: language === "en" ? "Student / Fresh Graduate" : "Mahasiswa / Fresh Grad", icon: "🎓" },
    { id: "pm", label: language === "en" ? "Project Manager / Owner" : "Project Manager / Owner", icon: "💼" },
  ];

  const goals = [
    {
      id: "job",
      label: language === "en" ? "Become a BIM Modeler in Top AEC Firms" : "Diterima Jadi BIM Modeler di BUMN/Konsultan",
      desc: language === "en" ? "Focus on parametric modeling LOD 300 & DED" : "Fokus modeling parametrik LOD 300 & DED",
    },
    {
      id: "clash",
      label: language === "en" ? "Master Clash Detection & Coordination" : "Kuasai Clash Detection & Koordinasi",
      desc: language === "en" ? "Navisworks & BCF integration" : "Integrasi Navisworks & format BCF",
    },
    {
      id: "auto",
      label: language === "en" ? "Workflow Automation with Dynamo" : "Otomatisasi Pekerjaan dengan Dynamo",
      desc: language === "en" ? "Batch parameters & generative facade" : "Batch parameter & generative facade",
    },
    {
      id: "infra",
      label: language === "en" ? "Roads & Infrastructure BIM" : "BIM Proyek Jalan & Infrastruktur",
      desc: language === "en" ? "Civil 3D, cut & fill, and terrain" : "Civil 3D, cut & fill, dan kontur",
    },
    {
      id: "iso",
      label: language === "en" ? "Lead BIM Tenders & ISO 19650" : "Pimpin Tender BIM & Standar ISO 19650",
      desc: language === "en" ? "BEP, EIR, CDE, and project audit" : "BEP, EIR, CDE, dan audit proyek",
    },
  ];

  const getRecommendation = () => {
    if (goal === "auto") {
      return {
        title: "Dynamo Visual Programming for Revit",
        level: "Intermediate",
        match: "98% Sangat Cocok",
        reason: "Sangat ideal untuk mempercepat workflow pemodelan dan eliminasi pekerjaan berulang hingga 5x lebih cepat.",
        badge: "Otomasi Arsitek & Sipil",
        anchor: "#courses",
      };
    }
    if (goal === "clash") {
      return {
        title: "BIM Coordination & Clash Detection Pro: Navisworks Manage",
        level: "Intermediate",
        match: "99% Paling Relevan",
        reason: "Kombinasi penting untuk mengoordinasikan model multi-disiplin dan simulasi 4D jadwal proyek.",
        badge: "BIM Coordinator Role",
        anchor: "#courses",
      };
    }
    if (goal === "infra" || (background === "civil" && goal === "job")) {
      return {
        title: "Civil 3D & InfraWorks: Pemodelan Jalan & Earthwork Digital",
        level: "Intermediate",
        match: "96% Spesialisasi Sipil",
        reason: "Wajib dimiliki untuk engineer sipil di proyek jalan tol, bendungan, dan infrastruktur strategis nasional.",
        badge: "Civil BIM Track",
        anchor: "#courses",
      };
    }
    if (goal === "iso" || background === "pm") {
      return {
        title: "BIM Management Standar ISO 19650: Penyusunan BEP & CDE",
        level: "Advanced",
        match: "99% Management Focus",
        reason: "Kualifikasi nomor 1 bagi Project Manager dan calon BIM Manager untuk memenangkan tender proyek pemerintah.",
        badge: "Management Track",
        anchor: "#courses",
      };
    }

    return {
      title: "Mastering Revit Architecture: Dari Desain ke DED & BoQ",
      level: "Beginner",
      match: "97% Fondasi Utama",
      reason: "Langkah pertama terbaik untuk menguasai pondasi BIM standar industri dan membangun portofolio model siap kerja.",
      badge: "Pondasi Utama BIM",
      anchor: "#courses",
    };
  };

  const recommendation = getRecommendation();

  const handleReset = () => {
    setBackground(null);
    setGoal(null);
    setSubmitted(false);
  };

  return (
    <section id="quiz" className="relative z-10 w-full bg-white dark:bg-[#0B0C0E] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-12 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">04</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-amber-300">
            {language === "en" ? "AI CAREER PATHFINDER (30-SECOND DIAGNOSTIC)" : "AI CAREER PATHFINDER (KUIS 30 DETIK)"}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 04 / 07</span>
        </div>

        <FadeIn direction="up">
          <div className="bg-[#14161B] text-white rounded-[40px] p-8 md:p-14 overflow-hidden relative shadow-2xl border border-amber-400/25">
            {/* Glow backdrop */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-amber-500/15 via-yellow-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-400/35 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Career Pathfinder
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                {language === "en" ? t.quiz.title : "Bingung Mulai Belajar dari Mana?"}
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                {language === "en"
                  ? t.quiz.subtitle
                  : "Jawab 2 pertanyaan singkat ini. Kami rekomendasikan kelas yang paling efektif untuk target karier Anda."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 max-w-3xl mx-auto space-y-10"
                >
                  {/* Step 1: Background */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black flex items-center justify-center text-xs shadow-xs">1</span>
                      {language === "en" ? "Select Your Current Background / Profession:" : "Pilih Latar Belakang / Profesi Anda Saat Ini:"}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {backgrounds.map((b) => {
                        const isSelected = background === b.id;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={b.id}
                            onClick={() => setBackground(b.id)}
                            className={`p-3.5 rounded-2xl text-left border text-xs md:text-sm font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                              isSelected
                                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black border-amber-400 shadow-[0_2px_15px_rgba(245,180,50,0.35)] font-bold"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-amber-400/40"
                            }`}
                          >
                            <span className="text-lg">{b.icon}</span>
                            <span>{b.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Goal */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black flex items-center justify-center text-xs shadow-xs">2</span>
                      {language === "en" ? "What is Your Priority Goal in the Next 3 Months?" : "Apa Target Prioritas Anda Dalam 3 Bulan ke Depan?"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {goals.map((g) => {
                        const isSelected = goal === g.id;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={g.id}
                            onClick={() => setGoal(g.id)}
                            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black border-amber-400 shadow-[0_2px_15px_rgba(245,180,50,0.35)] font-bold"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-amber-400/40"
                            }`}
                          >
                            <p className="text-xs md:text-sm font-bold mb-0.5">{g.label}</p>
                            <p className={`text-[11px] ${isSelected ? "text-neutral-800" : "text-gray-400"}`}>
                              {g.desc}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-4">
                    <motion.button
                      whileHover={background && goal ? { scale: 1.04 } : {}}
                      whileTap={background && goal ? { scale: 0.97 } : {}}
                      disabled={!background || !goal}
                      onClick={() => setSubmitted(true)}
                      className={`px-8 py-4 rounded-full font-black text-sm transition-all flex items-center justify-center gap-2 mx-auto ${
                        background && goal
                          ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-[0_4px_25px_rgba(245,180,50,0.35)] cursor-pointer"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {language === "en" ? "View My Recommended Course" : "Lihat Rekomendasi Kelas Saya"}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* Result Card */
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 max-w-2xl mx-auto bg-white/95 dark:bg-zinc-900 text-gray-950 dark:text-white rounded-3xl p-8 md:p-10 shadow-2xl border border-amber-300/40 dark:border-amber-400/25"
                >
                  <div className="flex items-center justify-between pb-6 border-b border-amber-300/30 dark:border-amber-400/15">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black shadow-xs">
                        {recommendation.match}
                      </span>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                        {recommendation.badge}
                      </span>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-xs text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {language === "en" ? "Retake Quiz" : "Ulangi Tes"}
                    </button>
                  </div>

                  <div className="py-6">
                    <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                      {language === "en" ? "Best Recommended Course:" : "Rekomendasi Kelas Terbaik:"}
                    </span>
                    <h3 className="text-2xl font-black text-gray-950 dark:text-white mt-1 mb-3">
                      {recommendation.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed bg-amber-50/50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-amber-200/60 dark:border-white/10">
                      {recommendation.reason}
                    </p>
                  </div>

                  {/* Voucher code banner */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 dark:bg-zinc-800 border border-amber-400/35 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {language === "en" ? "Your Career Scholarship Coupon" : "Kupon Beasiswa Karier Khusus Anda"}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-zinc-400">
                          {language === "en" ? "Apply coupon during course checkout" : "Gunakan kode voucher saat pendaftaran"}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-sm bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1.5 rounded-lg text-black shadow-xs">
                      BIMCAREER60
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={recommendation.anchor}
                      className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-center font-black text-sm transition-all shadow-[0_4px_20px_rgba(245,180,50,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {language === "en" ? "Open & Enroll in this Course" : "Buka & Daftar Kelas Ini"}
                      <ArrowRight className="w-4 h-4" />
                    </motion.a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
