"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, Clock, BookOpen, ArrowUpRight, CheckCircle2, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";
import { COURSES, CATEGORIES, type Course } from "@/data/courses";
import CourseDetailModal from "./CourseDetailModal";
import CheckoutModal from "./CheckoutModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CourseCatalogProps {
  onEnrollSuccess?: (course: Course) => void;
  searchQueryProp?: string;
}

const normalizeCategory = (cat: string) => {
  const lower = (cat || "").toLowerCase();
  if (lower.includes("model") || lower.includes("structur") || lower.includes("revit") || lower.includes("tekla")) return "modeling";
  if (lower.includes("coordinat") || lower.includes("navis") || lower.includes("clash")) return "coordination";
  if (lower.includes("comput") || lower.includes("dynamo") || lower.includes("automa")) return "automation";
  if (lower.includes("infra") || lower.includes("civil") || lower.includes("sipil")) return "infrastructure";
  if (lower.includes("manage") || lower.includes("iso") || lower.includes("bep")) return "management";
  return lower;
};

export default function CourseCatalog({ onEnrollSuccess, searchQueryProp = "" }: CourseCatalogProps) {
  const { language, t } = useLanguage();
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(searchQueryProp);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [enrolledToast, setEnrolledToast] = useState<string | null>(null);
  const [targetCardSlug, setTargetCardSlug] = useState<string | null>(null);

  // Fetch live courses from SQLite database
  useEffect(() => {
    fetch("/api/courses?published=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          const mapped: Course[] = data.courses.map((c: any) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            category: normalizeCategory(c.category) as any,
            level: c.level as any,
            rating: 4.9,
            reviewsCount: 150 + (c._count?.enrollments || 0),
            studentsCount: (c._count?.enrollments || 0) + 1250,
            durationHours: c.durationHours || 20,
            modulesCount: c.modules?.length || 1,
            price: c.isFree ? 0 : c.price,
            originalPrice: c.originalPrice || (c.price ? c.price * 2 : 0),
            badge: c.badge || (c.isFree ? "Baru" : "Pilihan Industri"),
            thumbnail: c.thumbnail,
            software: [c.category || "Autodesk Revit"],
            instructor: {
              name: c.instructorName || c.instructor?.name || "Instruktur Praktisi BIMCourse",
              role: c.instructorTitle || c.instructor?.bio || "Lead BIM Specialist",
              company: c.instructorTitle || c.instructor?.organization || "PT BIMCourse Indonesia",
              avatar:
                c.instructorAvatar ||
                c.instructor?.avatar ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
            },
            summary: c.summary,
            keyLearnings:
              c.overview && c.overview.length > 20
                ? c.overview.split("\n").filter((l: string) => l.trim().length > 10).slice(0, 5)
                : [
                    "Pemodelan berbasis standar industri LOD 300 - 400",
                    "Penyusunan gambar kerja DED & BoQ otomatis",
                    "Praktik langsung studi kasus proyek konstruksi",
                  ],
            curriculum: (c.modules || []).map((m: any) => ({
              title: m.title,
              duration: m.duration || "2 Jam",
              lessons: (m.lessons || []).map((l: any) => l.title),
            })),
          }));

          // Use only real published courses from DB
          setCoursesList(mapped);
        } else if (data.courses && Array.isArray(data.courses) && data.courses.length === 0) {
          setCoursesList([]);
        }
      })
      .catch((err) => console.error("Error loading live courses:", err));
  }, []);

  // Check URL hash/query for targeted course (e.g. from superadmin preview)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTarget = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const querySlug = urlParams.get("course");
      const hash = window.location.hash;
      const hashSlug = hash.startsWith("#course-") ? hash.replace("#course-", "") : null;
      const slug = querySlug || hashSlug;

      if (slug && coursesList.length > 0) {
        setTargetCardSlug(slug);
        const found = coursesList.find((c) => c.slug === slug || c.id === slug);
        if (found) {
          // Reset active filters so the targeted card is guaranteed to be visible
          setActiveCategory("all");
          setActiveLevel("All");
          setSearchQuery("");
          // If query has openModal=true or just target
          if (urlParams.get("modal") === "true") {
            setSelectedCourse(found);
          }
          setTimeout(() => {
            const el = document.getElementById(`course-${found.slug}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 350);
        }
      }
    };

    checkTarget();
    window.addEventListener("hashchange", checkTarget);
    return () => window.removeEventListener("hashchange", checkTarget);
  }, [coursesList]);

  const filteredCourses = useMemo(() => {
    return coursesList.filter((c) => {
      // Category filter
      const matchesCategory =
        activeCategory === "all" ||
        c.category === activeCategory ||
        normalizeCategory(c.category) === activeCategory;

      // Level filter
      const matchesLevel =
        activeLevel === "All" || c.level === activeLevel;

      // Search keyword filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        (c.software && c.software.some((sw) => sw.toLowerCase().includes(q))) ||
        (c.instructor && c.instructor.name.toLowerCase().includes(q));

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [coursesList, activeCategory, activeLevel, searchQuery]);

  const handleEnroll = (course: Course) => {
    setSelectedCourse(null);
    setCheckoutCourse(course);
    if (onEnrollSuccess) onEnrollSuccess(course);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="courses" className="relative z-10 w-full bg-white dark:bg-[#09090B] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">01</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {language === "en" ? "SPECIALIZATION COURSE CATALOG" : "KATALOG KELAS SPESIALISASI"}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 01 / 07</span>
        </div>

        {/* Toast Notification */}
        {enrolledToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0F1115] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-400/30 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm font-medium pr-2">{enrolledToast}</p>
          </div>
        )}

        {/* Section Header */}
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/35 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {language === "en" ? t.courses.badge : "Kurikulum Praktisi Terakreditasi"}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-950 dark:text-white">
                {language === "en" ? t.courses.title : "Katalog Kelas Spesialisasi BIM"}
              </h2>
              <p className="text-gray-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mt-2">
                {language === "en"
                  ? t.courses.subtitle
                  : "Dari pemula hingga BIM Manager. Kurikulum berbasis proyek nyata, standar ISO 19650, dan studi kasus kontraktor terkemuka."}
              </p>
            </div>

            {/* Live Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder={language === "en" ? t.courses.searchPlaceholder : "Cari Revit, Navisworks, Dynamo..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-white/15 focus:outline-hidden focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-400 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-xs transition-colors"
              />
              <Search className="w-4 h-4 text-amber-500 dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-amber-600 dark:hover:text-amber-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Category Tabs & Level Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black shadow-[0_2px_15px_rgba(245,180,50,0.35)]"
                      : "bg-white/80 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:text-gray-950 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 border border-amber-200/50 dark:border-white/10"
                  }`}
                >
                  {cat.id === "all" ? t.courses.allCategory : cat.label}
                </button>
              );
            })}
          </div>

          {/* Level Dropdown / Filter */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              {language === "en" ? "Level:" : "Tingkat:"}
            </span>
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
              className="text-xs md:text-sm font-semibold bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 rounded-full px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white text-gray-800 dark:text-zinc-200"
            >
              <option value="All">{language === "en" ? "All Levels" : "Semua Tingkat"}</option>
              <option value="Beginner">{language === "en" ? "Beginner" : "Beginner (Pemula)"}</option>
              <option value="Intermediate">Intermediate (Menengah)</option>
              <option value="Advanced">Advanced (Lanjut)</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700">
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">Tidak ada kelas yang cocok</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
              Coba ubah kata kunci pencarian atau pilih kategori lain.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setActiveLevel("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-gray-800 dark:hover:bg-zinc-200"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <StaggerItem key={course.id}>
                <HoverCard lift={-6} scale={1.01} className="h-full">
                  <div
                    id={`course-${course.slug}`}
                    className={`bg-white dark:bg-zinc-900/90 rounded-3xl border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group scroll-mt-28 h-full ${
                      targetCardSlug === course.slug
                        ? "border-black dark:border-white ring-4 ring-black/20 dark:ring-white/20 shadow-xl scale-[1.01]"
                        : "border-zinc-200 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                    }`}
                  >
                    <div>
                      {/* Course Thumbnail Image */}
                      <Link href={`/courses/${course.slug}`} className="block relative aspect-16/10 overflow-hidden bg-gray-100 dark:bg-zinc-800">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Badge */}
                        {course.badge && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black text-[11px] font-black shadow-md">
                              {course.badge}
                            </span>
                          </div>
                        )}

                        {/* Level Pill */}
                        <div className="absolute top-4 right-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium">
                            {course.level}
                          </span>
                        </div>

                        {/* Software tags */}
                        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap gap-1.5">
                          {course.software.map((sw) => (
                            <span
                              key={sw}
                              className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium"
                            >
                              {sw}
                            </span>
                          ))}
                        </div>
                      </Link>

                      {/* Course Content Details */}
                      <div className="p-6">
                        {/* Rating & Metrics */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-2.5">
                          <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{course.rating}</span>
                            <span className="text-gray-400 dark:text-zinc-500 font-normal">({course.reviewsCount})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {course.durationHours}j
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {course.modulesCount} modul
                            </span>
                          </div>
                        </div>

                        {/* Course Title */}
                        <Link
                          href={`/courses/${course.slug}`}
                          className="text-lg font-bold text-gray-950 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2 cursor-pointer mb-2 block"
                        >
                          {course.title}
                        </Link>

                        {/* Instructor brief */}
                        <div className="flex items-center gap-2.5 mb-4">
                          <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200 dark:ring-zinc-700"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900 dark:text-zinc-200 leading-tight">{course.instructor.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate max-w-[200px]">{course.instructor.company}</p>
                          </div>
                        </div>

                        {/* Summary preview */}
                        <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                          {course.summary}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Price & Actions */}
                    <div className="p-6 pt-0 border-t border-black/[0.04] dark:border-white/10 mt-auto">
                      <div className="flex items-baseline justify-between pt-4 mb-4">
                        <div>
                          {course.price === 0 ? (
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                              GRATIS
                            </span>
                          ) : (
                            <>
                              <span className="text-lg font-black text-gray-950 dark:text-white">
                                {formatPrice(course.price)}
                              </span>
                              {course.originalPrice > course.price && (
                                <span className="text-xs text-gray-400 dark:text-zinc-500 line-through ml-2">
                                  {formatPrice(course.originalPrice)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {course.price === 0 ? (
                          <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                            {language === "en" ? "Open Access" : "Akses Terbuka"}
                          </span>
                        ) : (
                          course.originalPrice > course.price && (
                            <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-mono">
                              {language === "en" ? "Save" : "Diskon"} {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                            </span>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="w-full py-2.5 px-3 rounded-full border border-gray-300 dark:border-white/20 text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {language === "en" ? "Syllabus" : "Silabus"}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEnroll(course)}
                          className="w-full py-2.5 px-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-[0_2px_15px_rgba(245,180,50,0.35)] active:scale-95 cursor-pointer"
                        >
                          {t.courses.enrollNow}
                        </button>
                      </div>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Selected Course Detail Modal */}
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnroll}
        />

        {/* Checkout & Payment Modal */}
        <CheckoutModal
          course={checkoutCourse}
          isOpen={!!checkoutCourse}
          onClose={() => setCheckoutCourse(null)}
          onSuccess={() => {
            setEnrolledToast(
              language === "en"
                ? `Payment proof submitted for "${checkoutCourse?.title}". Waiting for admin approval!`
                : `Bukti transfer untuk "${checkoutCourse?.title}" berhasil dikirim! Menunggu persetujuan admin.`
            );
            setTimeout(() => setEnrolledToast(null), 5000);
          }}
        />
      </div>
    </section>
  );
}
