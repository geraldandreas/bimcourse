"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Globe,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Clock,
  Check,
  Bookmark,
  Share2,
  Lock,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  BIM_MODULES,
  BIM_RESOURCES,
  getAllLessons,
  CurriculumLesson,
  CurriculumModule,
  CurriculumResource,
} from "@/data/bimDocCurriculum";
import LessonContentRenderer from "@/components/learn/LessonContentRenderer";
import {
  CiscoTabbedCards,
  CiscoSkillsCheck,
  CiscoPracticeQuestion,
  CiscoLabCard,
  CiscoQuizIntro,
  CiscoMatchingActivity,
  CiscoAssignmentBlock,
} from "@/components/learn/CiscoInteractiveBlocks";
import AntiScreenshotShield from "@/components/learn/AntiScreenshotShield";
import CourseLearnLoading from "./loading";

function CourseLearnContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "revit-basic";

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [resources, setResources] = useState<CurriculumResource[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const [courseData, setCourseData] = useState<{
    id?: string;
    title?: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentDescription?: string | null;
  } | null>(null);
  const [courseCert, setCourseCert] = useState<{
    id: string;
    certificateNo: string;
    status: "REQUESTED" | "ISSUED";
    issuedDate?: string;
  } | null>(null);
  const [requestingCert, setRequestingCert] = useState(false);
  const [certMsg, setCertMsg] = useState<string | null>(null);

  // Fetch current user session for security watermarking
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch course details (for master project dataset & description)
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/courses/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.course) {
          setCourseData(data.course);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Fetch student's certificate status for this course
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/certificates?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data?.certificates) && data.certificates.length > 0) {
          setCourseCert(data.certificates[0]);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Fetch dynamic curriculum & resources from API (no stale cache or dummy flash)
  useEffect(() => {
    let isMounted = true;
    setLoadingCurriculum(true);
    fetch(`/api/curriculum/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.modules)) {
          setModules(data.modules);
        } else {
          setModules(BIM_MODULES);
        }
        if (data && Array.isArray(data.resources)) {
          setResources(data.resources);
        } else {
          setResources([]);
        }
      })
      .catch(() => {
        if (isMounted) setModules(BIM_MODULES);
      })
      .finally(() => {
        if (isMounted) setLoadingCurriculum(false);
      });
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const allLessons = useMemo(() => {
    const list: CurriculumLesson[] = [];
    modules.forEach((mod) => {
      mod.sections?.forEach((sec) => {
        sec.lessons?.forEach((les) => {
          list.push(les);
        });
      });
    });
    return list;
  }, [modules]);

  // Active lesson state (initialized from URL param or first lesson)
  const initialLessonId = searchParams.get("lesson") || "";
  const [activeLessonId, setActiveLessonId] = useState<string>(initialLessonId);

  useEffect(() => {
    if (allLessons.length === 0) return;
    if (!activeLessonId || !allLessons.some((l) => l.id === activeLessonId)) {
      setActiveLessonId(allLessons[0].id);
    }
  }, [allLessons, activeLessonId]);

  // Mounted flag to avoid hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);

  // Completed lessons set (persisted in localStorage)
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem(`bimcourse_completed_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCompletedLessons(parsed);
          return;
        }
      }
    } catch {}
    if (allLessons[0]?.id) {
      setCompletedLessons([allLessons[0].id]);
    }
  }, [slug, allLessons]);

  // Tracking states for topic completion requirements
  const [scrollPassed, setScrollPassed] = useState<Record<string, boolean>>({});
  const [tabbedCompleted, setTabbedCompleted] = useState<Record<string, boolean>>({});
  const [skillsCompleted, setSkillsCompleted] = useState<Record<string, boolean>>({});
  const [practiceCompleted, setPracticeCompleted] = useState<Record<string, boolean>>({});
  const [matchingCompleted, setMatchingCompleted] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState<Record<string, boolean>>({});
  const [quizStatusMap, setQuizStatusMap] = useState<
    Record<string, "APPROVED" | "PENDING" | "REVISION">
  >({});

  // Sidebar open/collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active sidebar tab: "outline" or "resources"
  const [activeSidebarTab, setActiveSidebarTab] = useState<"outline" | "resources">("outline");

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Expanded module accordions state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
  });

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Find active module and active section (sub-bab)
  const { activeModule, activeSection } = useMemo(() => {
    for (const mod of modules) {
      for (const sec of mod.sections) {
        if (sec.lessons.some((l) => l.id === activeLessonId)) {
          return { activeModule: mod, activeSection: sec };
        }
      }
    }
    const firstMod = modules[0];
    const firstSec = firstMod?.sections[0];
    return { activeModule: firstMod, activeSection: firstSec };
  }, [modules, activeLessonId]);

  // All sections list for sub-bab next/prev navigation
  const allSections = useMemo(() => {
    return modules.flatMap((m) =>
      m.sections.map((s) => ({
        ...s,
        moduleId: m.id,
        moduleCode: m.code,
        moduleTitle: m.title,
      }))
    );
  }, [modules]);

  const currentSectionIndex = allSections.findIndex(
    (s) => s.id === activeSection?.id
  );
  const prevSection =
    currentSectionIndex > 0 ? allSections[currentSectionIndex - 1] : null;
  const nextSection =
    currentSectionIndex < allSections.length - 1
      ? allSections[currentSectionIndex + 1]
      : null;

  const isQuizLessonApproved = (lesson: CurriculumLesson) => {
    const status = quizStatusMap[lesson.id];
    if (status === "APPROVED") return true;
    if (status === "PENDING" || status === "REVISION") return false;
    return Boolean(quizCompleted[lesson.id]) || completedLessons.includes(lesson.id);
  };

  const activeSectionBlockingQuiz = useMemo(() => {
    if (!activeSection) return null;
    return (
      activeSection.lessons.find(
        (l) => Boolean(l.quizIntro) && !isQuizLessonApproved(l)
      ) || null
    );
  }, [activeSection, quizStatusMap, quizCompleted, completedLessons]);

  const firstLockedSectionIdx = useMemo(() => {
    return allSections.findIndex((sec) =>
      sec.lessons.some((l) => Boolean(l.quizIntro) && !isQuizLessonApproved(l))
    );
  }, [allSections, quizStatusMap, quizCompleted, completedLessons]);

  const getQuizLockReason = (quizLesson: CurriculumLesson | null) => {
    if (!quizLesson) return null;
    const status = quizStatusMap[quizLesson.id];
    const kkm = quizLesson.quizIntro?.passRatePercent ?? 70;
    const hasManual = quizLesson.quizIntro?.questions?.some(
      (q) => q.type === "essay" || q.type === "file_upload"
    );
    if (status === "PENDING") {
      return "Menunggu verifikasi SuperAdmin/Pengajar untuk kuis isian atau tugas sebelum dapat melanjutkan ke Sub-Bab berikutnya.";
    }
    if (status === "REVISION") {
      return `Nilai kuis masih di bawah KKM (${kkm}%). Silakan revisi dan kerjakan ulang kuis untuk membuka Sub-Bab berikutnya.`;
    }
    if (hasManual) {
      return "Kerjakan kuis & tunggu verifikasi SuperAdmin/Pengajar terlebih dahulu untuk membuka Sub-Bab berikutnya.";
    }
    return `Selesaikan kuis dengan nilai minimal KKM ${kkm}% untuk melanjutkan ke Sub-Bab berikutnya.`;
  };

  const activeQuizLockReason = getQuizLockReason(activeSectionBlockingQuiz);

  // Active lesson object
  const activeLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  // Find current index and neighbors for pagination
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Auto-complete check: triggers when user has scrolled through AND completed any interactive requirements
  useEffect(() => {
    if (!activeSection) return;

    activeSection.lessons.forEach((lesson) => {
      if (completedLessons.includes(lesson.id)) return;

      // 1. Must be scrolled through
      const isScrolled = scrollPassed[lesson.id];
      if (!isScrolled) return;

      // 2. Tabbed requirement: all tabs must have been read
      if (lesson.tabbedBlock && !tabbedCompleted[lesson.id]) return;

      // 3. Skills check requirement
      if (lesson.skillsCheck && !skillsCompleted[lesson.id]) return;

      // 4. Practice question requirement
      if (lesson.practiceQuestion && !practiceCompleted[lesson.id]) return;

      // 5. Matching activity requirement
      if (lesson.matchingActivity && !matchingCompleted[lesson.id]) return;

      // 6. Quiz intro requirement
      if (lesson.quizIntro && !quizCompleted[lesson.id]) return;

      // All requirements met! Automatically mark as completed
      setCompletedLessons((prev) => {
        if (prev.includes(lesson.id)) return prev;
        const updated = [...prev, lesson.id];
        try {
          localStorage.setItem(
            `bimcourse_completed_${slug}`,
            JSON.stringify(updated)
          );
        } catch {}
        return updated;
      });
    });
  }, [
    activeSection,
    completedLessons,
    scrollPassed,
    tabbedCompleted,
    skillsCompleted,
    practiceCompleted,
    matchingCompleted,
    quizCompleted,
    slug,
  ]);

  // IntersectionObserver to detect when user scrolls past sentinels & updates active topic
  useEffect(() => {
    const container = mainContentRef.current;
    if (!container || !activeSection) return;

    const sentinelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lessonId = entry.target.getAttribute("data-lesson-id");
            if (lessonId) {
              setScrollPassed((prev) =>
                prev[lessonId] ? prev : { ...prev, [lessonId]: true }
              );
            }
          }
        });
      },
      {
        root: container,
        rootMargin: "0px 0px 80px 0px",
        threshold: 0.05,
      }
    );

    const topicObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lessonId = entry.target.getAttribute("data-lesson-id");
            if (lessonId) {
              setActiveLessonId(lessonId);
            }
          }
        });
      },
      {
        root: container,
        rootMargin: "-10% 0px -75% 0px",
        threshold: 0,
      }
    );

    // Also direct scroll listener as a fallback
    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      activeSection.lessons.forEach((l) => {
        const sentinelEl = document.getElementById(`sentinel-${l.id}`);
        if (sentinelEl) {
          const rect = sentinelEl.getBoundingClientRect();
          if (rect.top <= containerRect.bottom + 80) {
            setScrollPassed((prev) =>
              prev[l.id] ? prev : { ...prev, [l.id]: true }
            );
          }
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    activeSection.lessons.forEach((l) => {
      const sentinelEl = document.getElementById(`sentinel-${l.id}`);
      if (sentinelEl) sentinelObserver.observe(sentinelEl);

      const topicEl = document.getElementById(`lesson-${l.id}`);
      if (topicEl) topicObserver.observe(topicEl);
    });

    // Check once immediately in case short content is already visible
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      sentinelObserver.disconnect();
      topicObserver.disconnect();
    };
  }, [activeSection]);

  // Navigate to a specific topic
  const handleSelectLesson = (lesson: CurriculumLesson) => {
    const isCurrentSection = activeSection?.lessons.some((l) => l.id === lesson.id);
    setActiveLessonId(lesson.id);

    if (isCurrentSection) {
      const el = document.getElementById(`lesson-${lesson.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setTimeout(() => {
        const el = document.getElementById(`lesson-${lesson.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (mainContentRef.current) {
          mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 80);
    }

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Total completion calculation
  const totalLessonsCount = allLessons.length;
  const completedCount = completedLessons.filter((id) =>
    allLessons.some((l) => l.id === id)
  ).length;
  const progressPercent =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  // Toggle module accordion
  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Filtered modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase();
    return modules.map((mod) => {
      const filteredSections = mod.sections
        .map((sec) => {
          const matchingLessons = sec.lessons.filter(
            (les) =>
              les.title.toLowerCase().includes(q) ||
              les.code.toLowerCase().includes(q) ||
              les.summary.toLowerCase().includes(q) ||
              les.paragraphs.some((p) => p.toLowerCase().includes(q))
          );
          return { ...sec, lessons: matchingLessons };
        })
        .filter((sec) => sec.lessons.length > 0);
      return { ...mod, sections: filteredSections };
    }).filter((mod) => mod.sections.length > 0);
  }, [searchQuery, modules]);

  const finalModule = useMemo(() => {
    return modules.find((m) => m.isFinalModule) || modules[modules.length - 1] || null;
  }, [modules]);

  const isInFinalSection = useMemo(() => {
    if (!finalModule || !activeSection) return false;
    const lastSecOfFinalMod = finalModule.sections?.[finalModule.sections.length - 1];
    return activeSection.id === lastSecOfFinalMod?.id || !nextSection;
  }, [finalModule, activeSection, nextSection]);

  const canRequestCertificate =
    isInFinalSection &&
    firstLockedSectionIdx === -1 &&
    !activeSectionBlockingQuiz &&
    !loadingCurriculum;

  const handleRequestCertificate = async () => {
    setRequestingCert(true);
    setCertMsg(null);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseData?.id,
          courseSlug: slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan sertifikat.");
      }
      setCourseCert(data.certificate);
      setCertMsg(
        data.message ||
          "Pengajuan sertifikat berhasil dikirim! Menunggu verifikasi dan penerbitan SuperAdmin."
      );
    } catch (err: any) {
      setCertMsg(err?.message || "Gagal mengajukan sertifikat.");
    } finally {
      setRequestingCert(false);
    }
  };

  if (loadingCurriculum) {
    return <CourseLearnLoading />;
  }

  const isCurrentCompleted = completedLessons.includes(activeLesson?.id);

  return (
    <AntiScreenshotShield userEmail={currentUser?.email} userName={currentUser?.name}>
      <div className="min-h-screen h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3] overflow-hidden select-none font-sans transition-colors duration-200">
        {/* 1. TOP NAVBAR */}
      <header className="h-14 sm:h-16 shrink-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] px-3 sm:px-6 flex items-center justify-between z-30 transition-colors shadow-2xs">
        {/* Left: Sidebar Toggle + Brand Logo + Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={isSidebarOpen ? "Sembunyikan Sidebar" : "Buka Sidebar Outline"}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo (matches homepage & navbar) */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" title="Beranda BIMCourse">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center p-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 shadow-inner transition-colors">
              <Image
                src="/logo.png"
                alt="BIMCourse Logo"
                width={22}
                height={22}
                className="object-contain group-hover:scale-105 transition-transform dark:invert"
              />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-1.5 transition-colors">
              BIMCourse
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/35">
                AEC
              </span>
            </span>
          </Link>

          <div className="h-4 w-px bg-black/10 dark:bg-white/10 shrink-0 hidden sm:block" />

          {/* Breadcrumbs (e.g. 1.0 Introduction > 1.0.1 Definisi BIM) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold truncate min-w-0">
            <span className="text-gray-500 dark:text-zinc-400 truncate max-w-[120px] sm:max-w-[180px] hidden md:inline">
              {activeLesson?.category || "1.0 Introduction"}
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden md:inline" />

            <span className="text-gray-950 dark:text-white font-extrabold truncate max-w-[160px] sm:max-w-md">
              <span className="font-mono text-amber-600 dark:text-amber-400 mr-1.5">
                {activeLesson?.code}
              </span>
              <span>{activeLesson?.title}</span>
            </span>
          </div>
        </div>

        {/* Right Controls: Dark/Light Mode, Language, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Search Outline Trigger (Mobile/Compact) */}
          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(true);
              setActiveSidebarTab("outline");
            }}
            className="p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer sm:hidden"
            title="Cari Materi"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-xs font-bold font-mono">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline text-xs font-bold font-mono">Dark</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Ganti Bahasa (ID / EN)"
          >
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-mono font-extrabold uppercase">
              {language}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="hidden sm:flex p-2 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-200 transition-all items-center justify-center cursor-pointer shadow-2xs"
            title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* 2. BODY CONTAINER: SIDEBAR + MAIN READER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR (Collapsible, Cisco NetAcad Design) */}
        <aside
          className={`${
            isSidebarOpen
              ? "translate-x-0 w-80 sm:w-96"
              : "-translate-x-full w-0"
          } shrink-0 transition-all duration-300 ease-in-out border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] flex flex-col z-20 absolute md:static inset-y-0 left-0 shadow-xl md:shadow-none overflow-hidden`}
        >
          {/* Sidebar Top: Tabs (Course Outline / Resources) */}
          <div className="p-3 border-b border-black/10 dark:border-white/10 bg-gray-50/70 dark:bg-[#0D1117]/60">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-200/60 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setActiveSidebarTab("outline")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSidebarTab === "outline"
                    ? "bg-white dark:bg-[#21262D] text-gray-950 dark:text-white shadow-xs border border-black/5 dark:border-white/10"
                    : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Course Outline</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab("resources")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSidebarTab === "resources"
                    ? "bg-white dark:bg-[#21262D] text-gray-950 dark:text-white shadow-xs border border-black/5 dark:border-white/10"
                    : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Resources</span>
              </button>
            </div>

            {/* Overall Course Progress Bar in Sidebar */}
            <div className="mt-3 px-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-gray-500 dark:text-zinc-400 font-medium">
                  Progress Silabus
                </span>
                <span
                  suppressHydrationWarning
                  className="font-extrabold text-amber-600 dark:text-amber-400"
                >
                  {hasMounted
                    ? `${completedCount}/${totalLessonsCount} Selesai (${progressPercent}%)`
                    : `...`}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-500 shadow-sm"
                  style={{ width: `${hasMounted ? Math.max(4, progressPercent) : 4}%` }}
                />
              </div>
            </div>
          </div>

          {/* TAB 1: COURSE OUTLINE */}
          {activeSidebarTab === "outline" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar: "Search course outline" */}
              <div className="p-3 border-b border-black/5 dark:border-white/5">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search course outline..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-gray-100 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modules & Topics Tree */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {filteredModules.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    Tidak ditemukan materi dengan kata kunci "{searchQuery}".
                  </div>
                ) : (
                  filteredModules.map((mod) => {
                    const isExpanded = Boolean(expandedModules[mod.id]);
                    const modLessons = mod.sections.flatMap((s) => s.lessons);
                    const modCompletedCount = modLessons.filter((l) =>
                      completedLessons.includes(l.id)
                    ).length;
                    const modTotalCount = modLessons.length;
                    const isModCompleted =
                      modTotalCount > 0 && modCompletedCount === modTotalCount;

                    return (
                      <div
                        key={mod.id}
                        className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] overflow-hidden shadow-2xs"
                      >
                        {/* Module Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-black/5 dark:border-white/5"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-800 dark:text-zinc-200">
                                Modul {mod.code}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-400">
                                {modCompletedCount} / {modTotalCount}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-gray-950 dark:text-white mt-1 leading-snug truncate">
                              {mod.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isModCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {/* Lessons Tree Connector List */}
                        {isExpanded && (
                          <div className="p-2 space-y-1 relative">
                            {/* Vertical Dotted Tree Line */}
                            <div className="absolute left-[26px] top-4 bottom-4 w-px border-l-2 border-dotted border-gray-300 dark:border-zinc-700 pointer-events-none" />

                            {mod.sections.map((section) => (
                              <div key={section.id} className="space-y-1 pt-1 first:pt-0">
                                {/* Section Header Subhead */}
                                <div className="pl-9 pr-2 py-1 text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
                                  {section.title}
                                </div>

                                {section.lessons.map((lesson) => {
                                  const isActive = activeLessonId === lesson.id;
                                  const isDone = completedLessons.includes(lesson.id);
                                  const secGlobalIdx = allSections.findIndex((s) => s.id === section.id);
                                  const isLockedByQuiz =
                                    firstLockedSectionIdx !== -1 &&
                                    secGlobalIdx > firstLockedSectionIdx;

                                  return (
                                    <button
                                      key={lesson.id}
                                      type="button"
                                      disabled={isLockedByQuiz}
                                      onClick={() => {
                                        if (!isLockedByQuiz) handleSelectLesson(lesson);
                                      }}
                                      title={
                                        isLockedByQuiz
                                          ? "Lulus atau tunggu verifikasi kuis pada Sub-Bab sebelumnya terlebih dahulu"
                                          : lesson.title
                                      }
                                      className={`w-full text-left py-2 px-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 relative z-10 ${
                                        isLockedByQuiz
                                          ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-zinc-500"
                                          : isActive
                                          ? "bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 text-gray-950 dark:text-white font-bold shadow-2xs cursor-pointer"
                                          : "hover:bg-gray-100/70 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300 font-medium cursor-pointer"
                                      }`}
                                    >
                                      {/* Status Checkbox Icon */}
                                      <div className="mt-0.5 shrink-0 bg-white dark:bg-[#161B22] rounded-full">
                                        {isLockedByQuiz ? (
                                          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 flex items-center justify-center">
                                            <Lock className="w-2.5 h-2.5" />
                                          </div>
                                        ) : isDone ? (
                                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                          </div>
                                        ) : isActive ? (
                                          <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                          </div>
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-zinc-700" />
                                        )}
                                      </div>

                                      {/* Code & Title */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`font-mono text-[11px] ${
                                              isActive
                                                ? "text-amber-600 dark:text-amber-400 font-bold"
                                                : "text-gray-400 dark:text-zinc-500"
                                            }`}
                                          >
                                            {lesson.code}
                                          </span>
                                          <span className="truncate leading-snug">
                                            {lesson.title}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCES */}
          {activeSidebarTab === "resources" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="pb-2 border-b border-black/5 dark:border-white/5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
                  Materi & File Download
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                  File proyek master latihan, dataset capstone, dan acuan standar.
                </p>
              </div>

              {/* Master Project / Dataset File Uploaded by Admin */}
              {(courseData?.attachmentUrl || courseData?.attachmentDescription) && (
                <div className="p-3.5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white inline-flex items-center gap-1">
                        <Download className="w-2.5 h-2.5" />
                        File Proyek &amp; Dataset Kursus
                      </span>
                      <h5 className="text-xs font-bold text-gray-950 dark:text-white mt-1.5 leading-snug">
                        {courseData.attachmentName || "File Proyek Master Pelatihan"}
                      </h5>
                    </div>
                  </div>

                  {courseData.attachmentDescription && (
                    <div className="text-[11px] text-gray-700 dark:text-zinc-300 leading-relaxed bg-white/80 dark:bg-black/30 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
                      <p className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                        Keterangan &amp; Petunjuk File:
                      </p>
                      <p className="whitespace-pre-wrap">{courseData.attachmentDescription}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                    {courseData.attachmentUrl ? (
                      <a
                        href={courseData.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={courseData.attachmentName || "bim-course-project"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File Proyek</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-500 italic">File akan segera disediakan oleh instruktur</span>
                    )}
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                      Resmi Kursus
                    </span>
                  </div>
                </div>
              )}

              {/* Reference Documents (Only show if superadmin/instructor uploaded resources) */}
              {resources && resources.length > 0 && (
                <>
                  <div className="pt-2 pb-1 text-[10px] font-mono font-bold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">
                    Dokumen Acuan &amp; Template Tambahan ({resources.length})
                  </div>

                  {resources.map((res) => {
                    const hasValidUrl = res.url && res.url !== "#";
                    return (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1C2128] hover:border-amber-400/50 transition-all space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-zinc-300">
                              {res.fileType || "Dokumen"} • {res.fileSize || "Online"}
                            </span>
                            <h5 className="text-xs font-bold text-gray-950 dark:text-white mt-1.5 leading-snug">
                              {res.title}
                            </h5>
                          </div>
                        </div>

                        {res.description && (
                          <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                            {res.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                          {res.isExternal ? (
                            <a
                              href={hasValidUrl ? res.url : "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              <span>Buka Tautan Acuan</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : hasValidUrl ? (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={res.title || "resource-document"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh Dokumen</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">
                              File akan segera disediakan oleh instruktur
                            </span>
                          )}

                          <span className="text-[10px] text-gray-400 font-mono">
                            {res.fileType}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Empty state if neither master attachment nor additional resources exist */}
              {!courseData?.attachmentUrl && (!resources || resources.length === 0) && (
                <div className="py-12 px-4 text-center space-y-2 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto text-gray-300 dark:text-zinc-600" />
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Belum ada berkas materi atau dokumen acuan yang diunggah untuk modul ini.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    File latihan atau materi referensi akan muncul di sini setelah diunggah oleh superadmin/pengajar.
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* 3. MAIN CONTENT PANE (Cisco NetAcad Reading Viewer) */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto bg-white dark:bg-[#0D1117] transition-colors relative flex flex-col justify-between"
        >
          {/* FLOATING LEFT CHEVRON (<) */}
          {prevLesson && (
            <button
              type="button"
              onClick={() => handleSelectLesson(prevLesson)}
              className="hidden lg:flex fixed left-88 xl:left-100 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-md text-gray-800 dark:text-white shadow-xl hover:scale-110 hover:border-amber-400 hover:text-amber-500 transition-all items-center justify-center cursor-pointer group"
              title={`Sebelumnya: ${prevLesson.title}`}
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* FLOATING RIGHT CHEVRON (>) */}
          {nextLesson && (
            <button
              type="button"
              onClick={() => handleSelectLesson(nextLesson)}
              className="hidden lg:flex fixed right-6 xl:right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-md text-gray-800 dark:text-white shadow-xl hover:scale-110 hover:border-amber-400 hover:text-amber-500 transition-all items-center justify-center cursor-pointer group"
              title={`Selanjutnya: ${nextLesson.title}`}
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* SUB-BAB CONTINUOUS READING CONTAINER */}
          <div className="max-w-5xl mx-auto px-5 sm:px-10 lg:px-12 py-8 sm:py-12 space-y-10 flex-1">
            {/* SUB-BAB / SECTION HEADER BANNER */}
            {activeSection && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-transparent border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Sub-Bab {activeSection.code}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                      Modul {activeModule?.code} • {activeModule?.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {activeSection.lessons.filter((l) => completedLessons.includes(l.id)).length} / {activeSection.lessons.length} Topik Selesai
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
                  {activeSection.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                  Seluruh topik pada sub-bab ini tersaji bersambung secara berurutan. Saat Anda membaca hingga akhir topik dan menyelesaikan blok interaktif, topik akan otomatis terchecklist.
                </p>
              </div>
            )}

            {/* TOPICS FLOW IN ACTIVE SUB-BAB */}
            <div className="space-y-12">
              {activeSection?.lessons.map((lesson, idx) => {
                const isDone = completedLessons.includes(lesson.id);
                const isScrolled = Boolean(scrollPassed[lesson.id]);
                const hasTabbed = Boolean(lesson.tabbedBlock);
                const isTabbedDone = Boolean(tabbedCompleted[lesson.id]);
                const hasSkills = Boolean(lesson.skillsCheck);
                const isSkillsDone = Boolean(skillsCompleted[lesson.id]);
                const hasPractice = Boolean(lesson.practiceQuestion);
                const isPracticeDone = Boolean(practiceCompleted[lesson.id]);
                const hasMatching = Boolean(lesson.matchingActivity);
                const isMatchingDone = Boolean(matchingCompleted[lesson.id]);
                const hasQuiz = Boolean(lesson.quizIntro);
                const isQuizDone = Boolean(quizCompleted[lesson.id]);

                // Determine auto-status badge
                let statusBadge = null;
                if (isDone) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Selesai Dipelajari</span>
                    </span>
                  );
                } else if (hasTabbed && !isTabbedDone) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-xs border border-amber-500/30">
                      <span>Baca semua tab untuk checklist</span>
                    </span>
                  );
                } else if (
                  (hasSkills && !isSkillsDone) ||
                  (hasPractice && !isPracticeDone) ||
                  (hasMatching && !isMatchingDone) ||
                  (hasQuiz && !isQuizDone)
                ) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold text-xs border border-blue-500/30">
                      <span>Lakukan aktivitas untuk checklist</span>
                    </span>
                  );
                } else if (!isScrolled) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 dark:text-zinc-400 text-xs">
                      <span>Scroll hingga akhir topik</span>
                    </span>
                  );
                }

                return (
                  <section
                    key={lesson.id}
                    id={`lesson-${lesson.id}`}
                    data-lesson-id={lesson.id}
                    className="scroll-mt-14 space-y-6 pt-4 first:pt-0"
                  >
                    {/* Topic Header Area */}
                    <div className="space-y-3 border-b border-black/10 dark:border-white/10 pb-5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-500/30">
                            Topik {lesson.code}
                          </span>
                          <span className="text-gray-400 dark:text-zinc-500">•</span>
                          <span className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.readTime || "5 Menit"}</span>
                          </span>
                        </div>

                        {/* Automatic Checklist Status (No manual buttons) */}
                        {statusBadge}
                      </div>

                      {/* Topic Title */}
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
                        {lesson.title}
                      </h2>

                      {/* Subtitle */}
                      {lesson.subtitle && (
                        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300 font-medium leading-relaxed">
                          {lesson.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Article Reading Content */}
                    <div className="space-y-6">
                      {lesson.summary && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border-l-4 border-amber-500 dark:border-amber-400 text-sm font-medium text-gray-900 dark:text-zinc-100 leading-relaxed shadow-2xs">
                          {lesson.summary}
                        </div>
                      )}

                      <LessonContentRenderer paragraphs={lesson.paragraphs || []} />

                      {lesson.quote && (
                        <blockquote className="my-6 p-5 rounded-2xl bg-gray-100/80 dark:bg-[#161B22] border-l-4 border-emerald-500 dark:border-emerald-400 space-y-2 shadow-2xs clear-both">
                          <p className="text-sm italic text-gray-800 dark:text-zinc-200 leading-relaxed">
                            "{lesson.quote.text}"
                          </p>
                          <footer className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            — {lesson.quote.author}
                          </footer>
                        </blockquote>
                      )}
                    </div>

                    {/* Interactive Learning Blocks */}
                    {(lesson.tabbedBlock ||
                      lesson.skillsCheck ||
                      lesson.practiceQuestion ||
                      lesson.labCard ||
                      lesson.quizIntro ||
                      lesson.matchingActivity ||
                      lesson.assignmentBlock) && (
                      <div className="pt-6 border-t border-black/10 dark:border-white/10 space-y-8 animate-in fade-in duration-300">
                        {lesson.tabbedBlock && (
                          <CiscoTabbedCards
                            {...lesson.tabbedBlock}
                            onAllTabsRead={() => {
                              setTabbedCompleted((prev) => ({
                                ...prev,
                                [lesson.id]: true,
                              }));
                            }}
                          />
                        )}

                        {lesson.skillsCheck && (
                          <CiscoSkillsCheck
                            {...lesson.skillsCheck}
                            onComplete={() => {
                              setSkillsCompleted((prev) => ({
                                ...prev,
                                [lesson.id]: true,
                              }));
                            }}
                          />
                        )}

                        {lesson.practiceQuestion && (
                          <CiscoPracticeQuestion
                            {...lesson.practiceQuestion}
                            onComplete={() => {
                              setPracticeCompleted((prev) => ({
                                ...prev,
                                [lesson.id]: true,
                              }));
                            }}
                          />
                        )}

                        {lesson.labCard && (
                          <CiscoLabCard {...lesson.labCard} />
                        )}

                        {lesson.matchingActivity && (
                          <CiscoMatchingActivity
                            {...lesson.matchingActivity}
                            onComplete={() => {
                              setMatchingCompleted((prev) => ({
                                ...prev,
                                [lesson.id]: true,
                              }));
                            }}
                          />
                        )}

                        {lesson.quizIntro && (
                          <CiscoQuizIntro
                            {...lesson.quizIntro}
                            courseId={courseData?.id || slug}
                            onComplete={() => {
                              setQuizCompleted((prev) => ({
                                ...prev,
                                [lesson.id]: true,
                              }));
                            }}
                            onStatusChange={(status) => {
                              setQuizStatusMap((prev) => ({
                                ...prev,
                                [lesson.id]: status,
                              }));
                              if (status === "APPROVED") {
                                setQuizCompleted((prev) => ({
                                  ...prev,
                                  [lesson.id]: true,
                                }));
                              } else {
                                setQuizCompleted((prev) => ({
                                  ...prev,
                                  [lesson.id]: false,
                                }));
                                setCompletedLessons((prev) => {
                                  if (!prev.includes(lesson.id)) return prev;
                                  const updated = prev.filter((id) => id !== lesson.id);
                                  try {
                                    localStorage.setItem(
                                      `bimcourse_completed_${slug}`,
                                      JSON.stringify(updated)
                                    );
                                  } catch {}
                                  return updated;
                                });
                              }
                            }}
                          />
                        )}

                        {lesson.assignmentBlock && (
                          <CiscoAssignmentBlock
                            courseId={courseData?.id || slug}
                            courseSlug={slug}
                            courseTitle={courseData?.title || "Revit Architecture Mastery"}
                            lessonId={lesson.id}
                            lessonCode={lesson.code}
                            data={lesson.assignmentBlock}
                            onSubmitted={() => {
                              setCompletedLessons((prev) =>
                                prev.includes(lesson.id) ? prev : [...prev, lesson.id]
                              );
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* Sentinel Element for IntersectionObserver auto-completion */}
                    <div
                      id={`sentinel-${lesson.id}`}
                      data-lesson-id={lesson.id}
                      className="h-3 w-full pointer-events-none"
                    />

                    {/* Dotted Flow Connector between Topics in this Sub-Bab */}
                    {idx < activeSection.lessons.length - 1 && (
                      <div className="py-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                        <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-mono text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          <span>Bersambung ke Topik {activeSection.lessons[idx + 1]?.code}</span>
                          <span>↓</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* END OF SUB-BAB: TRANSITION CARD */}
            {nextSection ? (
              activeSectionBlockingQuiz ? (
                <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sub-Bab {nextSection.code} Terkunci</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                    Selesaikan Kuis untuk Membuka {nextSection.code} {nextSection.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
                    {activeQuizLockReason}
                  </p>
                  <div>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-300 dark:bg-white/10 text-gray-500 dark:text-zinc-400 font-extrabold text-sm cursor-not-allowed opacity-80"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Buka Sub-Bab {nextSection.code}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-transparent border border-amber-500/30 text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Sub-Bab {activeSection?.code} Selesai Dibaca</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                    Lanjut ke Sub-Bab Berikutnya: {nextSection.code} {nextSection.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto">
                    Materi akan bersambung ke topik {nextSection.lessons[0]?.code} {nextSection.lessons[0]?.title}.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSelectLesson(nextSection.lessons[0])}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Buka Sub-Bab {nextSection.code}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ) : isInFinalSection ? null : (
              <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-black text-gray-950 dark:text-white">
                  Selamat! Anda telah mempelajari seluruh kurikulum ini.
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                  Semua modul dan aktivitas interaktif telah selesai dieksplorasi.
                </p>
              </div>
            )}

            {/* FINAL MODULE COMPLETION & CERTIFICATE REQUEST CARD */}
            {isInFinalSection && (
              <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-amber-500/5 to-transparent border-2 border-emerald-500/30 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>

                {courseCert?.status === "ISSUED" ? (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                      SERTIFIKAT SUDAH DITERBITKAN • {courseCert.certificateNo}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                      Sertifikat Resmi Anda Siap Diunduh!
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
                      SuperAdmin telah menerbitkan sertifikat kompetensi bertanda tangan CEO untuk kelas ini dan mengirimkannya ke akun serta email Anda.
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/profile?tab=certificates"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                      >
                        <Award className="w-4 h-4" />
                        <span>Lihat &amp; Unduh Sertifikat</span>
                      </Link>
                    </div>
                  </>
                ) : courseCert?.status === "REQUESTED" ? (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
                      MENUNGGU PROSES SUPERADMIN • {courseCert.certificateNo}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                      Pengajuan Sertifikat Anda Sedang Diproses
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
                      Tim SuperAdmin sedang meninjau kelulusan modul akhir Anda dan akan men-generate serta mengirimkan sertifikat melalui web BIMCourse &amp; email terdaftar Anda.
                    </p>
                  </>
                ) : !canRequestCertificate ? (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
                      AKHIR MODUL KURSUS • SYARAT SERTIFIKAT
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                      Lulus Kuis untuk Mengajukan Sertifikat
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
                      {activeQuizLockReason ||
                        "Pastikan seluruh kuis pilihan ganda memenuhi KKM dan kuis isian/tugas telah diverifikasi SuperAdmin/Pengajar terlebih dahulu."}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                      AKHIR MODUL SELESAI • SIAP PENGAJUAN
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                      Selamat! Anda Telah Mencapai Akhir Modul Kursus
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
                      Seluruh syarat modul telah terpenuhi. Ajukan penerbitan sertifikat kelulusan resmi bertanda tangan CEO BIMCourse ke SuperAdmin sekarang.
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={requestingCert}
                        onClick={handleRequestCertificate}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>
                          {requestingCert ? "Mengirim Pengajuan..." : "Ajukan Sertifikat Kelulusan"}
                        </span>
                      </button>
                    </div>
                  </>
                )}

                {certMsg && (
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 pt-1">
                    {certMsg}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 4. BOTTOM ACTION & NAVIGATION BAR (Sub-Bab & Auto-Status) */}
          <div className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] px-6 sm:px-12 py-4 z-10 transition-colors">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              {/* Previous Sub-Bab Button */}
              {prevSection ? (
                <button
                  type="button"
                  onClick={() => handleSelectLesson(prevSection.lessons[0])}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-bold text-gray-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <div className="text-left hidden sm:block">
                    <div className="text-[10px] font-mono text-gray-400">Sub-Bab Sebelumnya</div>
                    <div className="truncate max-w-[150px] font-medium">{prevSection.code} {prevSection.title}</div>
                  </div>
                  <span className="sm:hidden">Sebelumnya</span>
                </button>
              ) : (
                <div />
              )}

              {/* Sub-Bab Progress status in Center */}
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-zinc-400">
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Sub-Bab {activeSection?.code}
                </span>
                <span>•</span>
                <span>
                  {activeSection?.lessons.filter((l) => completedLessons.includes(l.id)).length} / {activeSection?.lessons.length} Topik Tercentang Otomatis
                </span>
              </div>

              {/* Next Sub-Bab in Right */}
              {nextSection ? (
                <button
                  type="button"
                  disabled={Boolean(activeSectionBlockingQuiz)}
                  onClick={() => {
                    if (!activeSectionBlockingQuiz) {
                      handleSelectLesson(nextSection.lessons[0]);
                    }
                  }}
                  title={activeQuizLockReason || undefined}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    activeSectionBlockingQuiz
                      ? "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-zinc-400 cursor-not-allowed opacity-75"
                      : "bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black cursor-pointer"
                  }`}
                >
                  <span className="sm:hidden">
                    {activeSectionBlockingQuiz ? "Kuis Belum Lulus" : "Lanjut Sub-Bab"}
                  </span>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-mono opacity-60">
                      {activeSectionBlockingQuiz ? "Terkunci (Kuis)" : "Sub-Bab Selanjutnya"}
                    </div>
                    <div className="truncate max-w-[150px] font-medium">{nextSection.code} {nextSection.title}</div>
                  </div>
                  {activeSectionBlockingQuiz ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  </AntiScreenshotShield>
  );
}

export default function CourseLearnPage() {
  return (
    <Suspense fallback={<CourseLearnLoading />}>
      <CourseLearnContent />
    </Suspense>
  );
}

