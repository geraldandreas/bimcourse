"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  MessageSquare, 
  Video, 
  Award, 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  FileCheck2,
  CalendarCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";
import { DEFAULT_SITE_CONTENT, WebInstructor } from "@/data/defaultSiteContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const COMMUNITY_PILLARS = [
  {
    icon: MessageSquare,
    badge: "Q&A Tanpa Batas",
    title: "Diskusi & Troubleshooting Kendala Modeling",
    description: "Mengalami error family Revit, kendala export IFC, atau crash script Dynamo? Tanyakan langsung di forum. Instruktur dan mentor aktif merespon dengan screenshot, tips, dan file solusi nyata.",
    tagColor: "bg-zinc-100 text-zinc-900 border-zinc-200"
  },
  {
    icon: Video,
    badge: "Live Mentoring Rutin",
    title: "Sesi Bedah Model & Sharing Proyek Nyata",
    description: "Ikuti webinar live dan sesi bedah model rutin setiap bulan. Instruktur membongkar studi kasus asli dari proyek infrastruktur, gedung tinggi, dan bandara langsung di software BIM.",
    tagColor: "bg-zinc-100 text-zinc-900 border-zinc-200"
  },
  {
    icon: Award,
    badge: "Feedback 1-on-1",
    title: "Review Portofolio & Capstone Langsung Mentor",
    description: "Pastikan hasil model dan gambar kerja Anda siap diajukan ke perusahaan impian atau klien tender. Dapatkan feedback konstruktif atas ketepatan LOD, parameter, dan kerapian model Anda.",
    tagColor: "bg-black text-white border-black"
  },
  {
    icon: FolderGit2,
    badge: "Aset & Peluang",
    title: "Library Family BIM, Template & Info Loker Eksklusif",
    description: "Akses ratusan family Revit terstandar, template proyek siap pakai, serta jejaring loker BIM Modeler dan Coordinator yang dibagikan secara eksklusif antar member & relasi instruktur.",
    tagColor: "bg-zinc-100 text-zinc-900 border-zinc-200"
  }
];

interface CommunitySectionProps {
  content?: typeof DEFAULT_SITE_CONTENT.community;
  instructors?: WebInstructor[];
  showInstructors?: boolean;
}

export default function CommunitySection({
  content = DEFAULT_SITE_CONTENT.community,
  instructors = DEFAULT_SITE_CONTENT.instructors,
  showInstructors = true,
}: CommunitySectionProps) {
  const { language, t } = useLanguage();

  const scrollToCourses = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("courses");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const localizedPillars = [
    {
      icon: MessageSquare,
      badge: t.community.pillar1Badge,
      title: t.community.pillar1Title,
      description: t.community.pillar1Desc,
      tagColor: "bg-zinc-100 text-zinc-900 border-zinc-200"
    },
    {
      icon: Video,
      badge: t.community.pillar2Badge,
      title: t.community.pillar2Title,
      description: t.community.pillar2Desc,
      tagColor: "bg-zinc-100 text-zinc-900 border-zinc-200"
    },
    {
      icon: Award,
      badge: t.community.pillar3Badge,
      title: t.community.pillar3Title,
      description: t.community.pillar3Desc,
      tagColor: "bg-black text-white border-black"
    },
    {
      icon: FolderGit2,
      badge: t.community.pillar4Badge,
      title: t.community.pillar4Title,
      description: t.community.pillar4Desc,
      tagColor: "bg-zinc-100 text-zinc-900 border-zinc-200"
    }
  ];

  const visibleInstructors = (instructors || []).filter(
    (inst) => inst.isVisible !== false
  );

  return (
    <section id="community" className="relative z-10 w-full bg-white dark:bg-[#09090B] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 transition-colors duration-300">
      {/* Anchor alias so #projects also works if bookmarked */}
      <div id="projects" className="absolute -top-12 left-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">03</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {language === "en" ? "COMMUNITY & MENTORING WITH INSTRUCTORS" : "KOMUNITAS & MENTORING BERSAMA INSTRUKTUR"}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 03 / 07</span>
        </div>

        {/* Header Section */}
        <FadeIn direction="up">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/35 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {language === "en" ? t.community.badge : (content?.badge || "Ekosistem Belajar Kolaboratif")}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-950 dark:text-white leading-tight">
                {language === "en" ? t.community.title : (content?.title || "Terhubung Langsung dengan Instruktur & Komunitas AEC Terbesar")}
              </h2>
              <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base max-w-2xl mt-4 leading-relaxed font-normal">
                {language === "en"
                  ? t.community.subtitle
                  : (content?.subtitle ||
                    "Belajar BIM tidak boleh membuat Anda frustrasi sendirian saat menghadapi software crash, error family, atau standar BEP proyek. Di BIMCourse, Anda didampingi langsung oleh para praktisi teruji yang siap membantu Anda berkembang.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-zinc-200 shadow-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{language === "en" ? t.community.activeMembers : (content?.activeMembersText || "18.500+ Member Aktif")}</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-zinc-200 shadow-xs flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>{language === "en" ? t.community.mentorBadge : (content?.mentorBadgeText || "Mentor BUMN & Konsultan")}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 4 Pillars Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {localizedPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <StaggerItem key={i}>
                <HoverCard lift={-4} scale={1.01} className="h-full">
                  <div
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-zinc-200 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-amber-400/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200/50 dark:border-white/10 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-xs group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-black group-hover:border-amber-400 transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${pillar.tagColor} dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-200`}>
                          {pillar.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-2.5 leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Interactive Community Simulation & Live Session Spotlight */}
        <FadeIn direction="up">
          <div className="bg-gradient-to-br from-[#111316] via-[#16191F] to-[#1F232B] dark:from-zinc-950 dark:via-zinc-900 dark:to-black rounded-3xl md:rounded-[36px] p-6 sm:p-10 text-white mb-20 shadow-2xl relative overflow-hidden border border-white/10 dark:border-white/15">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Community Value Proposition */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-zinc-200 border border-white/15 backdrop-blur-md">
                  <CalendarCheck className="w-4 h-4 text-white" />
                  {t.community.liveBadge}
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
                  {language === "en" ? t.community.cardHeading : (content?.cardHeading || "Bukan Sekadar Nonton Video, Tapi Berproses Bareng Praktisinya")}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {language === "en" ? t.community.cardDesc : (content?.cardDescription ||
                    "Setiap member BIMCourse mendapatkan akses seumur hidup ke grup diskusi eksklusif bersama instruktur. Anda bisa melampirkan file .rvt, .nwc, atau .dyn untuk dibedah solusinya.")}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>{t.community.bullet1}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>{t.community.bullet2}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>{t.community.bullet3}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    href="#courses"
                    onClick={scrollToCourses}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-[0_4px_20px_rgba(245,180,50,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {t.community.joinBtn}
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                  <span className="text-xs text-gray-400 font-medium text-center sm:text-left">
                    {t.community.instantAccess}
                  </span>
                </div>
              </div>

              {/* Right: Realistic Discussion Feed Simulation Mockup */}
              <div className="lg:col-span-7">
                <div className="bg-[#0B0D11]/90 rounded-2xl md:rounded-3xl border border-white/15 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">#qna-revit-dan-koordinasi</span>
                          <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold">LIVE</span>
                        </div>
                        <span className="text-[11px] text-gray-400">Komunitas BIMCourse • Didampingi Instruktur Aktif</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">1.240 Online</span>
                  </div>

                  {/* Simulated Chat Feed */}
                  <div className="space-y-4">
                    {/* Student Message */}
                    <div className="flex items-start gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop"
                        alt="Student"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-200">Fikri Ramadhan</span>
                            <span className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">Siswa BIMCourse</span>
                          </div>
                          <span className="text-[10px] text-gray-500">10:42 WIB</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                          Izin bertanya Pak Hendra & Pak Budi, pas saya running Clash Detection di Navisworks untuk proyek RS 5 Lantai, pipa sprinkler banyak yang clash keras dengan balok induk struktur di koridor. Baiknya di-reroute atau minta web opening ke tim struktur?
                        </p>
                      </div>
                    </div>

                    {/* Instructor Reply */}
                    <div className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl border border-white/15">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                        alt="Instructor Hendra"
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Ir. Hendra Wijaya, S.T.</span>
                            <span className="text-[10px] text-black bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 rounded-full font-bold shadow-xs">
                              INSTRUKTUR UTAMA
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">10:48 WIB</span>
                        </div>
                        <p className="text-xs text-gray-200 mt-1.5 leading-relaxed">
                          Halo Mas Fikri! Pertanyaan bagus. Di standar BEP proyek rumah sakit: jika diameter pipa &lt; 100mm dan di zona tengah bentang balok (1/3 bentang), web sleeve diperbolehkan dengan persetujuan lead struktur. Namun untuk koridor utama, rekomendasi kami adalah <span className="text-white underline font-semibold">lowering offset 150mm di bawah soffit balok</span> agar elevasi ceiling tetap rapi. File contoh potongan detail sudah saya upload di tab Family &amp; Template ya!
                        </p>
                        <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] text-zinc-300 font-mono">
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Detail_Clearance_MEP_vs_Beam_SNI.rvt (2.4 MB)</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Upcoming Session Banner */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-white">
                            Live Sharing: Bedah Proyek Stasiun LRT &amp; Koordinasi Tekla LOD 400
                          </p>
                          <p className="text-[10px] text-gray-300">
                            Sabtu ini, 19:30 WIB • Bersama Budi Santoso (Principal Structural BIM)
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-black shrink-0 shadow-xs">
                        Khusus Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Instruktur & Praktisi Pendamping Profiles (Can be toggled by SuperAdmin) */}
        {showInstructors && visibleInstructors.length > 0 && (
          <div id="instructors">
            <FadeIn direction="up">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-amber-700 dark:text-amber-300 mb-2 block">
                    {language === "en" ? t.community.instructorsBadge : (content?.instructorsBadge || "TIM PENGAJAR & MENTOR PRAKTISI")}
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white">
                    {language === "en" ? t.community.instructorsTitle : (content?.instructorsTitle || "Belajar Langsung dari Pelaku Industri Nyata")}
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-400 text-xs sm:text-sm max-w-xl mt-1.5">
                    {language === "en"
                      ? t.community.instructorsSubtitle
                      : (content?.instructorsSubtitle ||
                        "Bukan sekadar akademisi, instruktur Anda adalah engineer dan arsitek aktif yang setiap hari memegang proyek infrastruktur dan gedung berskala nasional.")}
                  </p>
                </div>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleInstructors.map((instructor) => {
                const instructorHref = `/instructors/${instructor.slug || instructor.id}`;
                return (
                  <StaggerItem key={instructor.id}>
                    <HoverCard lift={-4} scale={1.01} className="h-full">
                      <div
                        className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-amber-400/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full"
                      >
                        <div>
                          {/* Avatar & Badges */}
                          <Link href={instructorHref} className="block relative aspect-square rounded-2xl overflow-hidden mb-5 bg-zinc-900 shadow-inner group/img">
                            <img
                              src={instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"}
                              alt={instructor.name}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-white bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20">
                                {instructor.experience}
                              </span>
                              <span className="text-[10px] font-bold text-amber-300 bg-black/80 px-2 py-0.5 rounded-full border border-amber-400/30">
                                CV &amp; Karya
                              </span>
                            </div>
                          </Link>

                          {/* Name & Role */}
                          <Link href={instructorHref} className="block group/title">
                            <h4 className="text-base font-bold text-gray-950 dark:text-white group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400 transition-colors leading-snug">
                              {instructor.name}
                            </h4>
                          </Link>
                          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                            {instructor.role}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1">
                            {instructor.affiliation}
                          </p>

                          {/* Peran di Komunitas */}
                          {instructor.communityRole && (
                            <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                              <p className="text-[11px] text-gray-700 dark:text-zinc-300 italic leading-relaxed">
                                &ldquo;{instructor.communityRole}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          {/* Software / Expertise Tags */}
                          {Array.isArray(instructor.expertise) && instructor.expertise.length > 0 && (
                            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-white/10 flex flex-wrap gap-1.5">
                              {instructor.expertise.map((exp) => (
                                <span
                                  key={exp}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Direct Link to CV & Portfolio Button */}
                          <Link
                            href={instructorHref}
                            className="mt-4 inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-amber-400/15 text-zinc-800 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-amber-400/15 dark:hover:text-amber-300 border border-zinc-200 dark:border-white/10 hover:border-amber-400/40 text-xs font-semibold transition-all group/btn cursor-pointer"
                          >
                            <span>Lihat CV &amp; Portofolio Proyek</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-amber-500" />
                          </Link>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}
      </div>
    </section>
  );
}
