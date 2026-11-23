"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  BookOpen,
  MoreVertical,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Download,
  Layers,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface LessonItem {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  isFree?: boolean;
  order: number;
}

interface ModuleItem {
  id: string;
  title: string;
  duration: string;
  order: number;
  lessons?: LessonItem[];
}

interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  thumbnail: string;
  durationHours: number;
  badge?: string;
  summary: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  instructor?: {
    id?: string;
    name: string;
    avatar?: string | null;
    organization?: string | null;
  };
  modules: ModuleItem[];
}

interface Enrollment {
  id: string;
  status: string;
  progress: number;
  enrolledAt: string;
  updatedAt: string;
  course: EnrolledCourse;
}

// Individual Cisco-Style Course Card matching user's reference screenshot
function EnrolledCourseCard({
  enrollment,
  language,
}: {
  enrollment: Enrollment;
  language: string;
}) {
  const course = enrollment.course;
  const modules = course.modules || [];

  // Active module state (stored in localStorage)
  const [activeModuleId, setActiveModuleId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bimcourse_active_mod_${course.id}`);
      if (saved && modules.some((m) => m.id === saved)) return saved;
    }
    return modules[0]?.id || "";
  });

  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        moduleDropdownRef.current &&
        !moduleDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModuleDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeModuleIndex = modules.findIndex((m) => m.id === activeModuleId);
  const activeModule =
    modules.find((m) => m.id === activeModuleId) || modules[0] || null;

  const handleSelectModule = (modId: string) => {
    setActiveModuleId(modId);
    setIsModuleDropdownOpen(false);
    try {
      localStorage.setItem(`bimcourse_active_mod_${course.id}`, modId);
    } catch {}
  };

  const courseUrl = `/courses/${course.slug}/learn${
    activeModule ? `?module=${activeModule.id}` : ""
  }`;

  const levelText = (course.level || "INTERMEDIATE").toUpperCase();

  return (
    <div className="group rounded-2xl bg-[#F8F9FA] dark:bg-[#12151B] border border-black/10 dark:border-white/10 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      <div>
        {/* Top Media Thumbnail Area */}
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-zinc-900">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />

          {/* Level Pill Badge (Top-Left) - Luxury Gold Accent */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3 py-1 rounded bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-extrabold text-[11px] tracking-wider uppercase shadow-md select-none">
              {levelText}
            </span>
          </div>

          {/* Center Play Button with Circular Gold-Glow Outline */}
          <Link
            href={courseUrl}
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            title={language === "en" ? "Play Course" : "Lanjutkan Belajar"}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-300/90 flex items-center justify-center bg-black/50 backdrop-blur-[2px] shadow-[0_0_20px_rgba(245,180,50,0.35)] group-hover:scale-110 group-hover:border-amber-300 group-hover:shadow-[0_0_30px_rgba(245,180,50,0.7)] transition-all duration-300">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-0.5" />
            </div>
          </Link>
        </div>

        {/* Card Body Content */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Academy Brand Line with Gold Touch */}
          <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
            <span>BIMCourse </span>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400">
              Academy
            </span>
          </div>

          {/* Metadata Row: Book Icon + Course | Self-paced + 3-dots Menu */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 font-normal">
              <BookOpen className="w-4 h-4 text-gray-500 shrink-0 stroke-[1.75]" />
              <span>
                Course | Self-paced
                {modules.length > 0 && (
                  <span className="text-[11px] font-mono text-gray-400 ml-1.5">
                    ({modules.length} Bab)
                  </span>
                )}
              </span>
            </div>

            {/* Three Vertical Dots Options Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-amber-500 hover:text-amber-400 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer rounded-lg hover:bg-amber-400/10"
                title="Opsi Modul"
              >
                <MoreVertical className="w-5 h-5 fill-current" />
              </button>

              {/* Popup Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white dark:bg-[#1A1E27] border border-black/10 dark:border-white/15 shadow-2xl py-1.5 z-30 text-xs font-medium text-gray-800 dark:text-zinc-200 animate-in fade-in zoom-in-95">
                  <Link
                    href={courseUrl}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>Lanjutkan Pembelajaran</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsModuleDropdownOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <Layers className="w-3.5 h-3.5 text-gray-500" />
                    <span>Ganti Modul Aktif</span>
                  </button>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                    <span>Lihat Silabus Lengkap</span>
                  </Link>

                  <Link
                    href="/profile?tab=courses"
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-t border-black/5 dark:border-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    <span>Buka di Profil Saya</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Course Title */}
          <Link href={courseUrl} className="block group/title">
            <h3 className="text-xl sm:text-[22px] font-black text-gray-950 dark:text-white tracking-tight leading-snug group-hover/title:text-[#5a902c] dark:group-hover/title:text-[#84cc16] transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Subtitle / Interactive Module Selector ("Sesuai Modul yg Dia Pilih") */}
          <div className="relative pt-0.5" ref={moduleDropdownRef}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                className="flex items-center gap-1.5 text-sm sm:text-base font-semibold text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-left py-0.5"
                title="Klik untuk memilih modul"
              >
                <span className="line-clamp-1">
                  {activeModule
                    ? activeModule.title
                    : course.title}
                </span>
                {modules.length > 1 && (
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-gray-500 transition-transform ${
                      isModuleDropdownOpen ? "rotate-180 text-black dark:text-white" : ""
                    }`}
                  />
                )}
              </button>

              {modules.length > 1 && (
                <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 shrink-0 ml-2">
                  Bab {activeModuleIndex + 1}/{modules.length}
                </span>
              )}
            </div>

            {/* Dropdown Menu for Module Selection */}
            {isModuleDropdownOpen && modules.length > 1 && (
              <div className="absolute left-0 top-full mt-2 w-full max-w-sm rounded-2xl bg-white dark:bg-[#1A1E27] border border-black/15 dark:border-white/15 shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  PILIH MODUL:
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {modules.map((m, idx) => {
                    const isCurrent = m.id === activeModule?.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModule(m.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                            : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="opacity-70 font-mono mr-1.5">
                            {idx + 1}.
                          </span>
                          <span>{m.title}</span>
                        </div>
                        {isCurrent && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
            {course.summary ||
              "Pelajari kurikulum standar industri AEC langsung dengan modul video komprehensif, latihan praktis, dan dataset siap pakai."}
          </p>

          {/* Quick Lessons Count & Progress */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-zinc-400 border-t border-black/5 dark:border-white/5">
            <span>
              {activeModule?.lessons?.length || 0} Materi dalam Bab Ini
            </span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">
              {Math.round(enrollment.progress)}% Selesai
            </span>
          </div>

          {/* Dedicated Lanjutkan Studi Button */}
          <div className="pt-2">
            <Link
              href={courseUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-bold text-xs flex items-center justify-between transition-all shadow-md group/btn cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 fill-current text-amber-400 group-hover/btn:scale-110 transition-transform" />
                <span>Lanjutkan Studi</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Accent Luxury Gold Metallic Line */}
      <div className="w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-500 rounded-b-2xl shadow-[0_2px_12px_rgba(245,180,50,0.35)]" />
    </div>
  );
}

export default function ContinueLearningSection() {
  const { language } = useLanguage();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/user/enrollments")
      .then((res) =>
        res.ok ? res.json() : { authenticated: false, enrollments: [] }
      )
      .then((data) => {
        if (!isMounted) return;
        if (
          data.authenticated &&
          Array.isArray(data.enrollments) &&
          data.enrollments.length > 0
        ) {
          setEnrollments(data.enrollments);
        }
      })
      .catch((err) => console.error("Error fetching enrollments:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || enrollments.length === 0) {
    return null;
  }

  return (
    <section className="relative z-20 w-full bg-white dark:bg-[#08090C] py-12 sm:py-16 border-b border-black/10 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono uppercase tracking-wider text-[11px] font-bold">
                {language === "en" ? "RESUME LEARNING" : "LANJUTKAN BELAJAR"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              {language === "en"
                ? "Your Enrolled Courses"
                : "Lanjutkan Pembelajaran Anda"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-xl">
              {language === "en"
                ? "Continue your active modules and access practical exercises."
                : "Akses modul aktif dan lanjutkan materi pembelajaran kelas yang Anda ikuti."}
            </p>
          </div>

          <Link
            href="/profile?tab=courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors self-start sm:self-auto py-1"
          >
            <span>
              {language === "en"
                ? `All Courses (${enrollments.length})`
                : `Semua Kelas Saya (${enrollments.length})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Course Cards Grid - Cisco Networking Academy Card Format */}
        <div
          className={`grid gap-6 sm:gap-8 ${
            enrollments.length === 1
              ? "max-w-md mx-auto sm:mx-0"
              : enrollments.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {enrollments.map((en) => (
            <EnrolledCourseCard
              key={en.id}
              enrollment={en}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
