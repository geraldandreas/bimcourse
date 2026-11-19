"use client";

import { useState } from "react";
import { Building2, Users, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function EnterpriseSection() {
  const { language, t } = useLanguage();
  const [inquirySent, setInquirySent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName && email) {
      setInquirySent(true);
    }
  };

  const benefits = [
    {
      icon: Building2,
      title: language === "en" ? "In-House Training & Custom Case Study" : "In-House Training & Custom Case Study",
      desc:
        language === "en"
          ? "Materials tailored to your company's Revit templates, standard families, and active projects."
          : "Materi disesuaikan dengan template Revit, standard family, dan proyek riil yang sedang ditangani perusahaan Anda.",
    },
    {
      icon: FileCheck,
      title: language === "en" ? "ISO 19650 BEP & CDE Framework Audit" : "ISO 19650 BEP & CDE Framework Audit",
      desc:
        language === "en"
          ? "Consulting for BIM Execution Plan tender docs and multi-disciplinary naming standardization."
          : "Konsultasi penyusunan dokumen tender BIM Execution Plan dan standardisasi penamaan file multi-disiplin.",
    },
    {
      icon: Users,
      title: language === "en" ? "Corporate Analytics Dashboard" : "Corporate Analytics Dashboard",
      desc:
        language === "en"
          ? "Monitor your engineering team's progress with graduation reports and periodic portfolio evaluations."
          : "Pantau progress belajar tim engineer & drafter dengan laporan kelulusan dan evaluasi portfolio berkala.",
    },
  ];

  return (
    <section id="enterprise" className="relative z-10 w-full bg-white dark:bg-[#09090B] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">06</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {language === "en" ? "ENTERPRISE & CONTRACTOR SOLUTIONS" : "SOLUSI KORPORASI & KONTRAKTOR"}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 06 / 07</span>
        </div>

        <FadeIn direction="up">
          <div className="bg-zinc-50/70 dark:bg-zinc-900/90 rounded-[40px] p-8 md:p-14 border border-zinc-200 dark:border-white/10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Text */}
              <div className="lg:col-span-7">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-400/35 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider inline-block mb-4 shadow-xs">
                  {t.enterprise.badge}
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-950 dark:text-white mb-4">
                  {language === "en" ? t.enterprise.title : "BIMCourse for Enterprise"}
                </h2>
                <p className="text-gray-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed mb-8">
                  {language === "en"
                    ? t.enterprise.subtitle
                    : "Akselerasi kesiapan digital tim teknik Anda menyambut mandat BIM dari Kementerian PUPR dan BUMN. Latih tim arsitektur, struktur, dan MEP dalam satu ekosistem kolaboratif standar ISO 19650."}
                </p>

                <div className="space-y-4">
                  {benefits.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div key={b.title} className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-200/60 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 text-amber-700 dark:text-amber-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-950 dark:text-white">{b.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{b.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Inquiry Form Card */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-white/10 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2">
                    {language === "en" ? "In-House Training Inquiry" : "Konsultasi In-House Training"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
                    {language === "en"
                      ? "Receive a customized curriculum proposal and pricing for teams of 5 or more."
                      : "Dapatkan proposal kurikulum khusus dan simulasi paket harga untuk tim minimal 5 orang."}
                  </p>

                  {inquirySent ? (
                    <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-white/15 rounded-2xl p-6 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-black dark:text-white mx-auto" />
                      <p className="text-sm font-bold text-black dark:text-white">
                        {language === "en" ? "Request Submitted!" : "Permintaan Terkirim!"}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {language === "en" ? (
                          <>Our BIM Enterprise Consultant will reach out to <span className="font-semibold text-gray-900 dark:text-white">{email}</span> within 1 business day.</>
                        ) : (
                          <>BIM Enterprise Consultant kami akan menghubungi Anda di <span className="font-semibold text-gray-900 dark:text-white">{email}</span> dalam 1x24 jam kerja.</>
                        )}
                      </p>
                      <button
                        onClick={() => setInquirySent(false)}
                        className="text-xs font-semibold text-black dark:text-white underline mt-2 block mx-auto cursor-pointer"
                      >
                        {language === "en" ? "Submit another inquiry" : "Kirim formulir lain"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Company / Organization Name:" : "Nama Perusahaan / Instansi:"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={language === "en" ? "Company / Institution Name" : "Nama Perusahaan / Instansi"}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Business Email / PIC:" : "Email Bisnis / PIC:"}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="pic@perusahaan.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Planned Participant Count:" : "Jumlah Peserta Rencana:"}
                        </label>
                        <select className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
                          <option>{language === "en" ? "5 - 15 Engineers / Architects" : "5 - 15 Insinyur / Arsitek"}</option>
                          <option>{language === "en" ? "16 - 30 Engineers / Architects" : "16 - 30 Insinyur / Arsitek"}</option>
                          <option>{language === "en" ? "30+ Engineers (Enterprise Division)" : "30+ Insinyur (Divisi Nasional)"}</option>
                        </select>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,180,50,0.35)] cursor-pointer"
                      >
                        {language === "en" ? "Request Proposal & Discuss Syllabus" : "Minta Proposal & Diskusi Silabus"}
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
