"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Clock,
  BarChart3,
  FlaskConical,
  MonitorPlay,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Globe,
  Share2,
  Users,
  Award,
  Play,
  Layers,
  Sparkles,
  HelpCircle,
  Laptop,
  Download,
  FileText,
  Paperclip,
  Check,
} from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";
import CourseDetailLoading from "./loading";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  isFree: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  isFree: boolean;
  price: number;
  originalPrice: number;
  durationHours: number;
  labsCount: number;
  learningMode: string;
  language: string;
  summary: string;
  overview: string | null;
  thumbnail: string;
  badge: string | null;
  published: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentDescription?: string | null;
  hasInstructorLed?: boolean;
  instructorName?: string | null;
  instructorTitle?: string | null;
  instructorAvatar?: string | null;
  keyLearnings?: string | null;
  benefits?: string | null;
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    organization: string | null;
  };
  modules: Module[];
  _count: {
    enrollments: number;
    submissions: number;
  };
}

const getKeyLearnings = (course: CourseData): string[] => {
  if (course.keyLearnings) {
    try {
      const parsed = JSON.parse(course.keyLearnings);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      const lines = course.keyLearnings.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 0) return lines;
    }
  }
  return [
    "Standar pemodelan 3D arsitektur & struktur LOD 300 - 400",
    "Ekstraksi data BoQ & scheduling material otomatis tanpa manual kalkulasi",
    "Penerapan Common Data Environment (CDE) dan BEP tender BUMN",
    "Penyusunan portofolio capstone siap kerja dengan review mentor",
  ];
};

const getBenefits = (course: CourseData): { title: string; description: string }[] => {
  if (course.benefits) {
    try {
      const parsed = JSON.parse(course.benefits);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      const lines = course.benefits.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        return lines.map((line) => {
          const parts = line.split(":");
          return {
            title: parts[0]?.trim() || line,
            description: parts[1]?.trim() || "",
          };
        });
      }
    }
  }
  return [
    {
      title: "Sertifikat Resmi Terverifikasi",
      description: "Dapat ditautkan di profil LinkedIn & portofolio tender",
    },
    {
      title: "File Latihan & Template Proyek",
      description: "Keluaran .rvt, .nwd, .ifc standar ISO 19650",
    },
    {
      title: "Komunitas Alumni AEC",
      description: "Akses grup diskusi & info lowongan kerja BUMN",
    },
  ];
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userEnrollment, setUserEnrollment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "resources">("overview");
  const [selectedMode, setSelectedMode] = useState<"self-paced" | "instructor-led">("self-paced");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [enrolledToast, setEnrolledToast] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/courses/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Course not found");
        return res.json();
      })
      .then((data) => {
        setCourse(data.course);
        const enrolled = Boolean(data.isEnrolled);
        setIsEnrolled(enrolled);
        if (data.isLoggedIn) setIsLoggedIn(true);
        setUserEnrollment(data.enrollment || null);

        // Check if a specific module was selected via query param (e.g. ?module=...)
        const targetModuleId = searchParams.get("module");
        if (targetModuleId) {
          setExpandedModules({ [targetModuleId]: true });
          setActiveTab("curriculum");
          setTimeout(() => {
            const el = document.getElementById("curriculum");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 300);
        } else if (data.course?.modules?.length > 0) {
          // Expand first module by default
          setExpandedModules({ [data.course.modules[0].id]: true });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, searchParams]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleEnroll = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }
    if (isEnrolled) {
      router.push(`/courses/${slug}/learn`);
      return;
    }
    setCheckoutOpen(true);
  };

  if (loading) {
    return <CourseDetailLoading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0C10] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar solidBg={true} />
        <div className="flex-1 flex flex-col items-center justify-center py-36 text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white mb-2">Modul Kursus Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 max-w-md">
            Kursus dengan slug "{slug}" mungkin telah dipindahkan atau belum dipublikasikan.
          </p>
          <Link
            href="/#courses"
            className="px-6 py-2.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const instructorName = course.instructorName || course.instructor?.name || "Ir. Rian Wicaksono, M.T.";
  const instructorTitle =
    course.instructorTitle || course.instructor?.organization || "Lead BIM Specialist • PT Wijaya Karya (Persero) Tbk";
  const instructorAvatar =
    course.instructorAvatar ||
    course.instructor?.avatar ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop";

  const keyLearnings = getKeyLearnings(course);
  const benefits = getBenefits(course);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0C10] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar solidBg={true} />

      {/* Toast Notification */}
      {enrolledToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-gray-950 dark:bg-zinc-900 text-white border border-gray-800 dark:border-white/20 text-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Berhasil mendaftar di kelas <strong>{course.title}</strong>!
          </span>
        </div>
      )}

      {/* Course Hero Section */}
      <section className="w-full border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#0F1218] pt-24 sm:pt-28 pb-12 sm:pb-16 relative overflow-hidden transition-colors">
        {/* Subtle background ambient glow for dark mode */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Course Header & Modes */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category, Academy & Badge Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                  BIMCourse <span className="text-amber-600 dark:text-amber-400">Academy</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/15 text-gray-800 dark:text-zinc-200 bg-gray-100 dark:bg-white/10 text-[11px] font-mono font-bold">
                  {course.badge || "Course"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full border border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10 text-[11px] font-mono font-bold">
                  {course.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 text-[11px] font-mono font-bold">
                  LOD 300 - 400
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-[1.14]">
                {course.title}
              </h1>

              {/* Summary */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                {course.summary}
              </p>

              {/* Learning Mode Cards (Conditionally show Instructor-Led if enabled) */}
              {course.hasInstructorLed ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("self-paced")}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedMode === "self-paced"
                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/40"
                        : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/60 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        selectedMode === "self-paced"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-950 dark:text-white">Self-Paced Online</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">
                        Belajar mandiri fleksibel kapan saja dengan akses seumur hidup
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("instructor-led")}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      selectedMode === "instructor-led"
                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/40"
                        : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/60 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        selectedMode === "instructor-led"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      <MonitorPlay className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-950 dark:text-white">Instructor-Led</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">
                        Bimbingan mentor praktisi live &amp; review portofolio 1-on-1
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/90 dark:border-white/10 shadow-2xs flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-950 dark:text-white">
                        {course.learningMode || "Self-Paced Online"}
                      </p>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        Akses Seumur Hidup
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      Belajar mandiri terstruktur kapan saja dengan materi interaktif, video tutorial FHD &amp; dataset proyek langsung.
                    </p>
                  </div>
                </div>
              )}

              {/* Language Selector & Enroll Button Row */}
              <div className="p-5 rounded-3xl bg-gray-50/90 dark:bg-white/[0.03] border border-gray-200/90 dark:border-white/10 space-y-4 shadow-sm">
                {/* Enrolled Status Notice */}
                {isEnrolled && (
                  <div className="w-full flex items-center justify-between flex-wrap gap-2 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Anda terdaftar di kelas ini • Akses modul aktif</span>
                    </div>
                    <Link
                      href={`/courses/${slug}/learn`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Buka Ruang Belajar</span>
                    </Link>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Language Pill */}
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-zinc-200 min-w-[170px] shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{course.language}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>

                  {/* Enroll / Continue Button */}
                  <button
                    onClick={handleEnroll}
                    className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                      isEnrolled
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold shadow-amber-500/20"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <Play className="w-4 h-4 fill-current text-black" />
                        <span>Lanjutkan Studi</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {course.isFree ? "Daftar Gratis Sekarang" : `Mulai Belajar — ${formatPrice(course.price)}`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-200/80 dark:border-white/10 text-xs">
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-400 dark:text-zinc-500">
                      BAHASA TERSEDIA:
                    </span>
                    <span>Bahasa Indonesia, English (Subtitle)</span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                    <span className="font-bold text-gray-950 dark:text-white font-mono">
                      {(course._count?.enrollments || 1200) + 18450}
                    </span>{" "}
                    siswa terdaftar
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media Card, Meta Stats, & Instructor */}
            <div className="lg:col-span-5 space-y-5">
              {/* Cover Image Card */}
              <div className="aspect-4/3 rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 shadow-xl relative group bg-gray-950">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md font-mono text-[11px] font-bold border border-white/20">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 font-bold text-[11px] shadow-sm">
                    LOD 300 - 400
                  </span>
                </div>
              </div>

              {/* Horizontal Meta Stats Icons */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                {/* 1. Price / Free */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs hover:border-amber-400/50 transition-colors">
                  {course.isFree ? (
                    <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-700 dark:text-zinc-300 mb-1" />
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-950 dark:text-white">
                    {course.isFree ? "FREE" : formatPrice(course.price)}
                  </span>
                </div>

                {/* 2. Duration Hours */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs hover:border-amber-400/50 transition-colors">
                  <Clock className="w-4 h-4 text-gray-700 dark:text-zinc-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-950 dark:text-white">
                    {course.durationHours} JAM
                  </span>
                </div>

                {/* 3. Level */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs hover:border-amber-400/50 transition-colors">
                  <BarChart3 className="w-4 h-4 text-gray-700 dark:text-zinc-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-950 dark:text-white">
                    {course.level}
                  </span>
                </div>

                {/* 4. Labs Count */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs hover:border-amber-400/50 transition-colors">
                  <FlaskConical className="w-4 h-4 text-gray-700 dark:text-zinc-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-950 dark:text-white">
                    {course.labsCount} LABS
                  </span>
                </div>
              </div>

              {/* Instructor Card (Customizable from SuperAdmin) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 flex items-center gap-3.5 shadow-2xs">
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0 bg-gray-100 dark:bg-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-400">
                    Instruktur &amp; Praktisi
                  </p>
                  <p className="text-xs font-bold text-gray-950 dark:text-white leading-tight truncate">
                    {instructorName}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                    {instructorTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Tabbed Section */}
      <section id="curriculum" className="w-full py-12 flex-1 bg-[#F8F9FA] dark:bg-[#0A0C10] border-t border-black/5 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-black/10 dark:border-white/10 mb-8 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              Overview
              {activeTab === "overview" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("curriculum")}
              className={`pb-4 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === "curriculum"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              <span>Curriculum</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-white/10 text-gray-800 dark:text-zinc-200 font-semibold border border-black/5 dark:border-white/10">
                {course.modules.length} Bab • {totalLessons} Sesi
              </span>
              {activeTab === "curriculum" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`pb-4 text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
                activeTab === "resources"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              Prasyarat &amp; Resources
              {activeTab === "resources" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Description & Key Learnings */}
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs space-y-3">
                  <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                    Tentang Modul Ini
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed space-y-4 whitespace-pre-line">
                    {course.overview || (
                      <p>
                        Modul kursus <strong>{course.title}</strong> dirancang untuk membekali insinyur, arsitek, dan modeler dengan kecakapan standar industri digital AEC terkini. Mulai dari pemodelan parametrik, koordinasi clash detection, hingga otomasi data kuantitas BoQ sesuai mandat BIM nasional dan ISO 19650.
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Learnings (Customizable from SuperAdmin) */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs space-y-4">
                  <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Yang Akan Anda Pelajari &amp; Kuasai</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-gray-700 dark:text-zinc-300">
                    {keyLearnings.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Graduation Benefits (Customizable from SuperAdmin) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Manfaat Kelulusan</span>
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    {benefits.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/30 shrink-0 mt-0.5">
                          {idx === 0 ? (
                            <Award className="w-4 h-4" />
                          ) : idx === 1 ? (
                            <Laptop className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{b.title}</p>
                          <p className="text-gray-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-snug">{b.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: CURRICULUM */}
          {activeTab === "curriculum" && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-950 dark:text-white">Silabus &amp; Kurikulum Lengkap</h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    Total {course.modules.length} bab pembelajaran terstruktur dengan {totalLessons} materi video dan proyek lab.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = Object.keys(expandedModules).length === course.modules.length;
                    if (allOpen) {
                      setExpandedModules({});
                    } else {
                      const all: Record<string, boolean> = {};
                      course.modules.forEach((m) => (all[m.id] = true));
                      setExpandedModules(all);
                    }
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {Object.keys(expandedModules).length === course.modules.length ? "Tutup Semua" : "Buka Semua"}
                </button>
              </div>

              {course.modules.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#161B22] rounded-2xl border border-dashed border-gray-300 dark:border-white/15 text-xs text-gray-500 dark:text-zinc-400">
                  Belum ada silabus yang ditambahkan pada modul ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules.map((mod, idx) => {
                    const isOpen = Boolean(expandedModules[mod.id]);
                    return (
                      <div
                        key={mod.id}
                        className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] overflow-hidden shadow-2xs transition-all"
                      >
                        {/* Module Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10">
                              {idx + 1}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{mod.title}</h3>
                              <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-mono mt-0.5">
                                {mod.lessons?.length || 0} materi pelajaran • {mod.duration}
                              </p>
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {/* Lessons List */}
                        {isOpen && mod.lessons && mod.lessons.length > 0 && (
                          <div className="px-5 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
                            {mod.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="py-2.5 flex items-center justify-between text-xs text-gray-700 dark:text-zinc-300"
                              >
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <Play className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                                  {lesson.isFree && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                      PREVIEW GRATIS
                                    </span>
                                  )}
                                  {lesson.fileUrl && (
                                    <a
                                      href={lesson.fileUrl}
                                      download
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition-colors"
                                      title="Download File Materi / Latihan"
                                    >
                                      <Download className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                      <span>{lesson.fileName || "File Latihan"}</span>
                                    </a>
                                  )}
                                </div>
                                <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400 shrink-0">
                                  {lesson.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: RESOURCES */}
          {activeTab === "resources" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {/* Official Project Dataset & Description Card */}
              {(course.attachmentUrl || course.attachmentDescription) && (
                <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-500/40 md:col-span-2 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          File Proyek Utama Kursus
                        </span>
                        <h4 className="text-base font-bold text-gray-950 dark:text-white mt-0.5">
                          {course.attachmentName || "Dataset & Starter Project"}
                        </h4>
                      </div>
                    </div>
                    {course.attachmentUrl && (
                      <a
                        href={course.attachmentUrl}
                        download={course.attachmentName || "bim-course-project"}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh File Proyek</span>
                      </a>
                    )}
                  </div>

                  {course.attachmentDescription && (
                    <div className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed bg-white/80 dark:bg-black/30 p-3.5 rounded-2xl border border-emerald-500/20 space-y-1">
                      <p className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                        Keterangan &amp; Petunjuk File Proyek:
                      </p>
                      <p className="whitespace-pre-wrap">{course.attachmentDescription}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 rounded-3xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">Spesifikasi Komputer Minimal</h3>
                <ul className="text-xs text-gray-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
                  <li>Sistem Operasi: Windows 10/11 64-bit</li>
                  <li>Prosesor: Intel Core i5 / AMD Ryzen 5 generasi terbaru</li>
                  <li>RAM: 16 GB (Disarankan 32 GB untuk proyek besar)</li>
                  <li>GPU: Dedicated Graphics 4 GB VRAM (DirectX 11 compliant)</li>
                  <li>Penyimpanan: 30 GB ruang kosong SSD</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">Software &amp; File Pendukung</h3>
                <ul className="text-xs text-gray-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
                  <li>Autodesk Revit 2023 / 2024 / 2025</li>
                  <li>Autodesk Navisworks Manage</li>
                  <li>Template Family Revit BIMCourse (.rte &amp; .rfa)</li>
                  <li>Dokumen BEP (BIM Execution Plan) standar PUPR &amp; ISO 19650</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        course={course}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setEnrolledToast(true);
          setTimeout(() => setEnrolledToast(false), 5000);
        }}
      />

      <Footer />
    </div>
  );
}
