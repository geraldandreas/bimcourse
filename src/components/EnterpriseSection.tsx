"use client";

import { useState } from "react";
import { Building2, Users, FileCheck, CheckCircle2, ArrowRight, MessageSquare, Mail, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SiteContentConfig } from "@/data/defaultSiteContent";

const OFFICIAL_EMAIL = "bim.courseacad@gmail.com";
const OFFICIAL_WHATSAPP = "6281524173386";

interface EnterpriseSectionProps {
  content?: SiteContentConfig["enterprise"];
}

export default function EnterpriseSection({ content }: EnterpriseSectionProps) {
  const { language, t } = useLanguage();
  const [inquirySent, setInquirySent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingMethod, setSubmittingMethod] = useState<"whatsapp" | "email" | null>(null);
  const [submittedVia, setSubmittedVia] = useState<"whatsapp" | "email">("whatsapp");

  const sendInquiry = async (method: "whatsapp" | "email") => {
    if (!companyName.trim() || !email.trim() || !participants.trim()) {
      alert(
        language === "en"
          ? "Please fill in Company Name, Business Email, and Planned Participant Count."
          : "Mohon isi Nama Perusahaan, Email Bisnis, dan Jumlah Peserta Rencana terlebih dahulu."
      );
      return;
    }

    setSubmittingMethod(method);
    setSubmittedVia(method);

    // Save lead to database
    try {
      await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          email,
          participants,
          notes,
          method,
        }),
      });
    } catch (err) {
      console.error("Consultation record error:", err);
    }

    if (method === "whatsapp") {
      const waText = `Halo BIMCourse, saya ingin berkonsultasi mengenai In-House Training Korporasi:\n\n*Nama Perusahaan / Instansi:* ${companyName}\n*Email Bisnis / PIC:* ${email}\n*Jumlah Peserta Rencana:* ${participants}${notes ? `\n*Kebutuhan Khusus:* ${notes}` : ""}\n\nMohon informasi silabus, jadwal, dan proposal penawarannya. Terima kasih!`;
      const waUrl = `https://wa.me/${OFFICIAL_WHATSAPP}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");
    } else {
      const emailSubject = `Konsultasi In-House Training BIM - ${companyName}`;
      const emailBody = `Halo Tim Enterprise BIMCourse (bim.courseacad@gmail.com),\n\nKami tertarik untuk mengadakan In-House Training BIM dengan rincian sebagai berikut:\n\n- Nama Perusahaan / Instansi: ${companyName}\n- Email PIC: ${email}\n- Jumlah & Komposisi Peserta: ${participants}\n${notes ? `- Kebutuhan Tambahan / Studi Kasus: ${notes}\n` : ""}\nMohon dikirimkan silabus pelatihan dan proposal penawaran harga resmi.\n\nTerima kasih.`;
      const mailtoUrl = `mailto:${OFFICIAL_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, "_blank");
    }

    setSubmittingMethod(null);
    setInquirySent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendInquiry("email");
  };

  const benefits = [
    {
      icon: Building2,
      title: language === "en" ? "In-House Training & Custom Case Study" : (content?.benefit1Title || "In-House Training & Custom Case Study"),
      desc:
        language === "en"
          ? "Materials tailored to your company's Revit templates, standard families, and active projects."
          : (content?.benefit1Desc || "Materi disesuaikan dengan template Revit, standard family, dan proyek riil yang sedang ditangani perusahaan Anda."),
    },
    {
      icon: FileCheck,
      title: language === "en" ? "ISO 19650 BEP & CDE Framework Audit" : (content?.benefit2Title || "ISO 19650 BEP & CDE Framework Audit"),
      desc:
        language === "en"
          ? "Consulting for BIM Execution Plan tender docs and multi-disciplinary naming standardization."
          : (content?.benefit2Desc || "Konsultasi penyusunan dokumen tender BIM Execution Plan dan standardisasi penamaan file multi-disiplin."),
    },
    {
      icon: Users,
      title: language === "en" ? "Corporate Analytics Dashboard" : (content?.benefit3Title || "Corporate Analytics Dashboard"),
      desc:
        language === "en"
          ? "Monitor your engineering team's progress with graduation reports and periodic portfolio evaluations."
          : (content?.benefit3Desc || "Pantau progress belajar tim engineer & drafter dengan laporan kelulusan dan evaluasi portfolio berkala."),
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
                  {language === "en" ? t.enterprise.badge : (content?.badge || "Solusi Korporasi & Kontraktor")}
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-950 dark:text-white mb-4">
                  {language === "en" ? t.enterprise.title : (content?.title || "BIMCourse for Enterprise")}
                </h2>
                <p className="text-gray-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed mb-8">
                  {language === "en"
                    ? t.enterprise.subtitle
                    : (content?.subtitle || "Akselerasi kesiapan digital tim teknik Anda menyambut mandat BIM dari Kementerian PUPR dan BUMN. Latih tim arsitektur, struktur, dan MEP dalam satu ekosistem kolaboratif standar ISO 19650.")}
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
                    {language === "en" ? "In-House Training Inquiry" : (content?.formTitle || "Konsultasi In-House Training")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
                    {language === "en"
                      ? "Receive a customized curriculum proposal and pricing for teams of 5 or more."
                      : (content?.formSubtitle || "Dapatkan proposal kurikulum khusus dan simulasi paket harga untuk tim minimal 5 orang.")}
                  </p>

                  {inquirySent ? (
                    <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-white/15 rounded-2xl p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-black dark:text-white">
                        {language === "en" ? "Consultation Request Dispatched!" : "Permintaan Konsultasi Terkirim!"}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {language === "en" ? (
                          <>
                            Inquiry for <span className="font-semibold text-gray-900 dark:text-white">{companyName}</span> ({participants}) has been logged and sent via <span className="font-bold uppercase text-amber-600 dark:text-amber-400">{submittedVia}</span>.
                            Our team will follow up at <span className="font-semibold text-gray-900 dark:text-white">{email}</span> within 1 business day.
                          </>
                        ) : (
                          <>
                            Permintaan untuk <span className="font-semibold text-gray-900 dark:text-white">{companyName}</span> ({participants}) telah dicatat dan diteruskan via <span className="font-bold uppercase text-amber-600 dark:text-amber-400">{submittedVia}</span>.
                            Konsultan kami akan menindaklanjuti ke <span className="font-semibold text-gray-900 dark:text-white">{email}</span> dalam 1x24 jam kerja.
                          </>
                        )}
                      </p>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500">
                        Official contact: <span className="font-mono text-gray-900 dark:text-zinc-300 font-semibold">{OFFICIAL_EMAIL}</span> • <span className="font-mono text-gray-900 dark:text-zinc-300 font-semibold">+62 815 2417 3386</span>
                      </div>
                      <button
                        onClick={() => {
                          setInquirySent(false);
                          setCompanyName("");
                          setEmail("");
                          setParticipants("");
                          setNotes("");
                        }}
                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 underline mt-2 block mx-auto cursor-pointer"
                      >
                        {language === "en" ? "Submit another inquiry" : "Kirim formulir lain"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Company / Organization Name:" : "Nama Perusahaan / Instansi:"} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={language === "en" ? "e.g. PT Wijaya Karya / Contractor" : "Contoh: PT Pembangunan Jaya / BUMN"}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Business Email / PIC:" : "Email Bisnis / PIC:"} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="pic.bim@perusahaan.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Planned Participant Count & Team:" : "Jumlah Peserta Rencana:"} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={
                            language === "en"
                              ? "e.g. 12 Structural Engineers & 5 Architects (specify freely)"
                              : "Contoh: 12 Insinyur Struktur, 5 Arsitek, atau tentukan sendiri..."
                          }
                          value={participants}
                          onChange={(e) => setParticipants(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-2xs"
                        />
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                          {language === "en"
                            ? "Free text: specify your team composition, disciplines, or estimated headcount."
                            : "Bebas tentukan: sebutkan estimasi jumlah tim, disiplin, atau kebutuhan spesifik Anda."}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                          {language === "en" ? "Specific Needs / Software Focus (Optional):" : "Catatan / Kebutuhan Khusus (Opsional):"}
                        </label>
                        <textarea
                          rows={2}
                          placeholder={
                            language === "en"
                              ? "e.g. Revit LOD 300, Navisworks clash audit, ISO 19650 BEP..."
                              : "Contoh: Pelatihan Revit Architecture, Navisworks Clash, atau audit BEP tender ISO 19650..."
                          }
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/15 text-xs focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-2xs resize-none"
                        />
                      </div>

                      {/* Dual Submission Actions: WhatsApp or Email */}
                      <div className="pt-2 space-y-2.5">
                        <p className="text-[11px] font-bold text-gray-600 dark:text-zinc-400 text-center">
                          {language === "en" ? "Choose submission channel:" : "Pilih saluran pengiriman konsultasi:"}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Send via WhatsApp */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => sendInquiry("whatsapp")}
                            disabled={submittingMethod !== null}
                            className="w-full py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                          >
                            {submittingMethod === "whatsapp" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-white" />
                            )}
                            <span>{language === "en" ? "Send via WhatsApp" : "Kirim via WhatsApp"}</span>
                          </motion.button>

                          {/* Send via Email */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => sendInquiry("email")}
                            disabled={submittingMethod !== null}
                            className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_2px_15px_rgba(245,180,50,0.35)] cursor-pointer disabled:opacity-60"
                          >
                            {submittingMethod === "email" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 text-black" />
                            )}
                            <span>{language === "en" ? "Send via Email" : "Kirim via Email"}</span>
                          </motion.button>
                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center">
                          Terkirim langsung ke konsultan resmi: <span className="font-mono text-gray-700 dark:text-zinc-300">bim.courseacad@gmail.com</span>
                        </p>
                      </div>
                    </div>
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
