"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  ExternalLink,
  Download,
  Sparkles,
  ArrowRight,
  Award,
  UploadCloud,
  AlertCircle,
  Loader2,
  Send,
  Clock,
  AlertTriangle,
  CheckSquare,
  Trophy,
  FileCheck2,
} from "lucide-react";
import { QuizQuestion, QuizOption, QuizQuestionType } from "@/data/bimDocCurriculum";

// =========================================================================
// 1. CISCO TABBED CONCEPT CARDS (Screenshot 1)
// =========================================================================
export interface TabbedItem {
  id: string;
  title: string;
  content: string;
  points?: string[];
}

export interface TabbedBlockProps {
  header?: string;
  intro?: string;
  tabs: TabbedItem[];
  onAllTabsRead?: () => void;
}

export function CiscoTabbedCards({ header, intro, tabs, onAllTabsRead }: TabbedBlockProps) {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || "");
  const [viewedTabIds, setViewedTabIds] = useState<Set<string>>(
    () => new Set(tabs[0]?.id ? [tabs[0].id] : [])
  );
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    // If only 1 tab, immediately fulfilled
    if (tabs.length <= 1) {
      onAllTabsRead?.();
    }
  }, [tabs.length, onAllTabsRead]);

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    setViewedTabIds((prev) => {
      const next = new Set(prev);
      next.add(tabId);
      if (next.size >= tabs.length) {
        onAllTabsRead?.();
      }
      return next;
    });
  };

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="my-6 space-y-3 font-sans">
      {header && (
        <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
          {header}
        </h3>
      )}

      {intro && (
        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
          {intro}
        </p>
      )}

      {/* Progress pill: reading all tabs */}
      {tabs.length > 1 && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-gray-500 dark:text-zinc-400">
            Pilih dan baca semua tab untuk menyelesaikan topik ini:
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold transition-all ${
              viewedTabIds.size >= tabs.length
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-[#00BCEB]/10 text-[#00BCEB]"
            }`}
          >
            {viewedTabIds.size >= tabs.length
              ? "✓ Semua tab telah dibaca"
              : `Baca semua tab (${viewedTabIds.size}/${tabs.length})`}
          </span>
        </div>
      )}

      {/* Row of Horizontal Tabs */}
      <div className="pt-1">
        <div className="flex flex-wrap items-end gap-1.5 sm:gap-2 border-b-2 border-[#00BCEB] dark:border-[#38BDF8]">
          {tabs.map((tab) => {
            const isActive = tab.id === (activeTab?.id || tabs[0]?.id);
            const isRead = viewedTabIds.has(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`px-4 sm:px-6 py-3 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t-2 border-x-2 cursor-pointer relative -mb-[2px] flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#E0F7FE] dark:bg-[#0369A1]/30 border-[#00BCEB] dark:border-[#38BDF8] text-gray-950 dark:text-white shadow-xs z-10 font-extrabold"
                    : "bg-white dark:bg-[#161B22] border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <span>{tab.title}</span>
                {isRead && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                    title="Tab telah dibaca"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Content Box */}
        {activeTab && (
          <div className="p-5 sm:p-6 rounded-b-2xl border-2 border-t-0 border-[#00BCEB] dark:border-[#38BDF8] bg-white dark:bg-[#161B22] shadow-sm space-y-3 animate-in fade-in duration-200">
            <h4 className="text-base sm:text-lg font-black text-gray-950 dark:text-white">
              {activeTab.title}
            </h4>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line">
              {activeTab.content}
            </div>
            {activeTab.points && activeTab.points.length > 0 && (
              <ul className="pt-2 space-y-1.5 text-xs text-gray-700 dark:text-zinc-300">
                {activeTab.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#00BCEB] dark:text-[#38BDF8] font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 2. CISCO SKILLS CHECK (Screenshot 2)
// =========================================================================
export interface SkillsCheckOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface SkillsCheckProps {
  title?: string;
  subtitle?: string;
  question: string;
  instruction?: string; // e.g. "(Choose three.)"
  options: SkillsCheckOption[];
  onComplete?: () => void;
}

export function CiscoSkillsCheck({
  title = "Skills Check",
  subtitle = "Please answer the following questions after you have completed the lesson.",
  question,
  instruction = "(Choose all that apply.)",
  options,
  onComplete,
}: SkillsCheckProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (next.length > 0) {
        onComplete?.();
      }
      return next;
    });
  };

  return (
    <div className="my-6 p-5 sm:p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] shadow-sm space-y-4 font-sans">
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
          {subtitle}
        </p>
      )}

      {title && (
        <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
          {title}
        </h3>
      )}

      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 leading-snug">
        {question}{" "}
        {instruction && (
          <span className="text-gray-500 dark:text-zinc-400 font-normal">
            {instruction}
          </span>
        )}
      </p>

      {/* Options List */}
      <div className="space-y-2.5 pt-1">
        {options.map((opt) => {
          const isSelected = selectedIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleSelect(opt.id)}
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                isSelected
                  ? "border-[#00BCEB] dark:border-[#38BDF8] bg-[#E0F7FE]/40 dark:bg-[#0369A1]/20 shadow-xs"
                  : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/5"
              }`}
            >
              {/* Checkbox Icon */}
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "border-[#00BCEB] dark:border-[#38BDF8] bg-[#00BCEB] text-white"
                    : "border-gray-400 dark:border-zinc-600 bg-white dark:bg-[#0D1117]"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// 3. CISCO PRACTICE QUESTION WITH SUBMIT & FEEDBACK (Screenshot 3)
// =========================================================================
export interface PracticeOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PracticeQuestionProps {
  header?: string; // e.g. "1.2.4 Practice - Types of Penetration Tests"
  question: string;
  instruction?: string; // e.g. "(Choose three.)"
  options: PracticeOption[];
  explanation?: string;
  onComplete?: () => void;
}

export function CiscoPracticeQuestion({
  header = "Practice Question",
  question,
  instruction = "(Choose all that apply.)",
  options,
  explanation,
  onComplete,
}: PracticeQuestionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id);
  const isAllCorrect =
    correctIds.length === selectedIds.length &&
    correctIds.every((id) => selectedIds.includes(id));

  const handleSubmit = () => {
    setSubmitted(true);
    setShowFeedback(true);
    onComplete?.();
  };

  const handleReset = () => {
    setSelectedIds([]);
    setSubmitted(false);
    setShowFeedback(false);
  };

  return (
    <div className="my-6 p-5 sm:p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] shadow-sm space-y-4 font-sans">
      {header && (
        <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
          {header}
        </h3>
      )}

      <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 leading-relaxed">
        {question}{" "}
        {instruction && (
          <span className="text-gray-500 dark:text-zinc-400 font-normal">
            {instruction}
          </span>
        )}
      </p>

      {/* Options List */}
      <div className="space-y-2.5 pt-1">
        {options.map((opt) => {
          const isSelected = selectedIds.includes(opt.id);
          const showState = submitted && showFeedback;
          const isCorrect = opt.isCorrect;

          let stateStyle =
            "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/5";
          if (isSelected) {
            stateStyle =
              "border-[#00BCEB] dark:border-[#38BDF8] bg-[#E0F7FE]/40 dark:bg-[#0369A1]/20 shadow-xs";
          }
          if (showState) {
            if (isSelected && isCorrect) {
              stateStyle =
                "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20";
            } else if (isSelected && !isCorrect) {
              stateStyle = "border-rose-500 bg-rose-50/60 dark:bg-rose-950/20";
            } else if (!isSelected && isCorrect) {
              stateStyle =
                "border-amber-400 border-dashed bg-amber-50/40 dark:bg-amber-950/20";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleSelect(opt.id)}
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-center justify-between gap-3.5 transition-all cursor-pointer ${stateStyle}`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-[#00BCEB] dark:border-[#38BDF8] bg-[#00BCEB] text-white"
                      : "border-gray-400 dark:border-zinc-600 bg-white dark:bg-[#0D1117]"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100">
                  {opt.text}
                </span>
              </div>

              {showState && (
                <div className="shrink-0">
                  {isSelected && isCorrect && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Benar</span>
                    </span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                      <XCircle className="w-4 h-4" />
                      <span>Salah</span>
                    </span>
                  )}
                  {!isSelected && isCorrect && (
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      (Jawaban Seharusnya)
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedIds.length === 0}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            selectedIds.length > 0
              ? "bg-[#00BCEB] hover:bg-[#0098be] text-white shadow-md active:scale-95"
              : "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>

        <button
          type="button"
          onClick={() => setShowFeedback(!showFeedback)}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
        >
          {showFeedback ? "Hide feedback" : "Show feedback"}
        </button>

        {submitted && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer ml-auto"
            title="Reset Pertanyaan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Feedback Panel */}
      {showFeedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 animate-in fade-in duration-200 ${
            submitted && isAllCorrect
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-950 dark:text-emerald-200"
              : submitted
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-950 dark:text-amber-200"
              : "bg-blue-50 dark:bg-blue-950/20 border-blue-400 text-blue-950 dark:text-blue-200"
          }`}
        >
          <div className="font-bold flex items-center gap-2">
            {submitted && isAllCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Jawaban Tepat! Anda memahami konsep ini dengan baik.</span>
              </>
            ) : submitted ? (
              <>
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Belum tepat sepenuhnya. Silakan tinjau kembali opsi yang benar.</span>
              </>
            ) : (
              <span>Pembahasan Materi:</span>
            )}
          </div>
          {explanation && <p className="leading-relaxed opacity-90">{explanation}</p>}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 4. CISCO LAB EXERCISE CARD (Screenshot 4)
// =========================================================================
export interface LabCardProps {
  title: string; // e.g. "Lab - Compare Pentesting Methodologies"
  description?: string;
  fileUrl?: string;
  duration?: string;
  onLaunch?: () => void;
}

export function CiscoLabCard({
  title,
  description,
  fileUrl,
  duration,
  onLaunch,
}: LabCardProps) {
  return (
    <div className="my-5 p-4 sm:p-5 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-[#00BCEB] dark:hover:border-[#38BDF8] bg-white dark:bg-[#161B22] shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans group">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white group-hover:bg-[#00BCEB]/10 group-hover:text-[#00BCEB] transition-colors shrink-0">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white group-hover:text-[#00BCEB] dark:group-hover:text-[#38BDF8] transition-colors">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {duration && (
          <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 mr-2">
            {duration}
          </span>
        )}

        {fileUrl ? (
          <a
            href={fileUrl}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Panduan Lab</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onLaunch || (() => alert(`Membuka lab: ${title}`))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00BCEB] hover:bg-[#0098be] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Mulai Lab</span>
          </button>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. CISCO QUIZ ASSESSMENT INTRO & RUNNER (Screenshot 5)
// =========================================================================
export interface QuizIntroProps {
  title: string;
  questionsCount?: number;
  passRatePercent?: number;
  attempts?: string;
  timeLimit?: string;
  questions?: QuizQuestion[];
  courseId?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export function CiscoQuizIntro({
  title,
  questionsCount = 10,
  passRatePercent = 70,
  attempts = "unlimited attempts",
  timeLimit = "no time limit",
  questions = [],
  courseId = "revit-basic",
  onStart,
  onComplete,
}: QuizIntroProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { url: string; name: string; sizeMb?: number }>>({});
  const [uploadingForQId, setUploadingForQId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    mcScore: number;
    isPassed: boolean;
    hasManualReview: boolean;
    totalMC: number;
    correctMC: number;
  } | null>(null);

  const [existingSubmission, setExistingSubmission] = useState<{
    id: string;
    grade?: number | null;
    feedback?: string | null;
    status: string;
    notes?: string | null;
    createdAt: string;
  } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const hasQuestions = questions && questions.length > 0;
  const activeQuestionsCount = hasQuestions ? questions.length : questionsCount;

  // Load existing student submission on mount
  useEffect(() => {
    let isMounted = true;
    const fetchExisting = async () => {
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.submissions)) {
            const found = json.submissions.find(
              (s: any) => s.title === title || s.title.toLowerCase().includes(title.toLowerCase())
            );
            if (found && isMounted) {
              setExistingSubmission(found);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch existing quiz submission:", err);
      }
    };
    fetchExisting();
    return () => {
      isMounted = false;
    };
  }, [title]);

  const handleStartExam = () => {
    setIsStarted(true);
    setSubmissionResult(null);
    onStart?.();
  };

  const handleFileUpload = async (qId: string, file: File, allowedFormats?: string, maxSizeMb = 50) => {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const allowed = (allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc")
      .split(",")
      .map((s) => s.trim().toLowerCase());

    if (allowed.length > 0 && !allowed.some((a) => a === ext || a === "*")) {
      setUploadError(`Format berkas tidak sesuai. Format yang diperbolehkan: ${allowed.join(", ")}`);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setUploadError(`Ukuran file melebihi batas ${maxSizeMb} MB.`);
      return;
    }

    setUploadError(null);
    setUploadingForQId(qId);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah file.");
      }

      setUploadedFiles((prev) => ({
        ...prev,
        [qId]: {
          url: data.url,
          name: file.name,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
        },
      }));
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah file.");
    } finally {
      setUploadingForQId(null);
    }
  };

  // Submit and Grade Quiz
  const handleSubmitQuiz = async () => {
    if (!hasQuestions) {
      onComplete?.();
      return;
    }

    const unanswered = questions.filter((q) => {
      if (q.type === "multiple_choice") return !answers[q.id];
      if (q.type === "essay") return !answers[q.id]?.trim();
      if (q.type === "file_upload") return !uploadedFiles[q.id];
      return false;
    });

    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `Ada ${unanswered.length} butir soal yang belum Anda isi/unggah. Yakin ingin mengumpulkan sekarang?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      // 1. Calculate Multiple Choice Auto-Grade
      const mcQuestions = questions.filter((q) => q.type === "multiple_choice");
      let correctCount = 0;
      let totalMcWeight = 0;
      let earnedMcWeight = 0;

      mcQuestions.forEach((q) => {
        const weight = q.weight || 10;
        totalMcWeight += weight;
        const studentChoice = answers[q.id];
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (correctOpt && studentChoice === correctOpt.id) {
          correctCount++;
          earnedMcWeight += weight;
        }
      });

      const mcPercentage =
        totalMcWeight > 0 ? Math.round((earnedMcWeight / totalMcWeight) * 100) : 100;

      const hasManualReview = questions.some(
        (q) => q.type === "essay" || q.type === "file_upload"
      );
      const isPassed = mcPercentage >= passRatePercent;

      // 2. Build structured Quiz answers payload
      const quizAnswersPayload = questions.map((q) => {
        const studentAnswer = answers[q.id] || "";
        const correctOpt = q.options?.find((o) => o.isCorrect);
        const studentOpt = q.options?.find((o) => o.id === studentAnswer);
        const uploaded = uploadedFiles[q.id];

        return {
          questionId: q.id,
          type: q.type,
          prompt: q.prompt,
          weight: q.weight || 10,
          sampleAnswer: q.sampleAnswer,
          studentAnswer: studentAnswer,
          isCorrect: q.type === "multiple_choice" ? studentAnswer === correctOpt?.id : undefined,
          correctOptionId: correctOpt?.id,
          correctOptionText: correctOpt?.text,
          studentOptionText: studentOpt?.text,
          fileUrl: uploaded?.url,
          fileName: uploaded?.name,
        };
      });

      const quizPayload = {
        type: "quiz",
        quizTitle: title,
        mcScore: mcPercentage,
        totalMC: mcQuestions.length,
        correctMC: correctCount,
        hasManualReview,
        totalQuestions: questions.length,
        passRatePercent,
        answers: quizAnswersPayload,
      };

      // Determine primary fileUrl (if file_upload question exists, use uploaded file url)
      const primaryFile = Object.values(uploadedFiles)[0];
      const primaryFileUrl = primaryFile ? primaryFile.url : "quiz-submission";

      const finalStatus = hasManualReview ? "PENDING" : isPassed ? "APPROVED" : "REVISION";
      const finalGrade = hasManualReview ? undefined : mcPercentage;

      // 3. Post to /api/submissions
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          fileUrl: primaryFileUrl,
          notes: JSON.stringify(quizPayload),
          submissionId: existingSubmission?.id,
          status: finalStatus,
          grade: finalGrade,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menyimpan lembar jawaban kuis.");
      }

      setSubmissionResult({
        mcScore: mcPercentage,
        isPassed,
        hasManualReview,
        totalMC: mcQuestions.length,
        correctMC: correctCount,
      });

      onComplete?.();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat mengumpulkan kuis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If questions is not defined or empty, retain authentic simple intro banner
  if (!hasQuestions) {
    return (
      <div className="my-8 space-y-6 font-sans">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-center text-gray-800 dark:text-zinc-100 tracking-tight">
          {title}
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#EBEBEB] dark:bg-[#1C2128] border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            <div className="w-5 h-5 rounded-full bg-[#5CB85C] text-white flex items-center justify-center text-xs font-bold shrink-0">
              i
            </div>
            <span>Instructions:</span>
          </div>

          <ul className="pl-7 space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-zinc-300 list-disc">
            <li>
              The exam consists of <strong>{questionsCount} questions</strong> and{" "}
              <strong>{passRatePercent}%</strong> is required to pass.
            </li>
            <li>
              You have <strong>{attempts}</strong> to pass the exam.
            </li>
            <li>
              You have <strong>{timeLimit}</strong> per attempt to pass the exam.
            </li>
          </ul>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsStarted(true);
              onStart?.();
              onComplete?.();
            }}
            className="px-10 py-3 rounded-full bg-[#5CB85C] hover:bg-[#4CAE4C] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isStarted ? "Lanjutkan Ujian" : "Start"}
          </button>
        </div>

        {isStarted && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            ✓ Sesi kuis telah dimulai. Silakan jawab pertanyaan evaluasi yang tersedia!
          </div>
        )}
      </div>
    );
  }

  // RESULT VIEW
  if (submissionResult) {
    return (
      <div className="my-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {submissionResult.isPassed || submissionResult.hasManualReview ? (
              <Trophy className="w-8 h-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
            {submissionResult.hasManualReview
              ? "Ujian & Berkas Berhasil Dikumpulkan!"
              : submissionResult.isPassed
              ? "Selamat! Anda Lulus Kuis!"
              : "Belum Memenuhi Syarat Kelulusan"}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
            {submissionResult.hasManualReview
              ? "Jawaban pilihan ganda Anda telah dinilai otomatis, sementara jawaban esai dan file praktik Anda sedang menunggu pemeriksaan langsung oleh Pengajar/Superadmin."
              : submissionResult.isPassed
              ? `Skor Anda melampaui target kelulusan minimal ${passRatePercent}%. Hasil kelulusan telah dicatat pada sistem.`
              : `Skor Anda belum mencapai ambang batas ${passRatePercent}%. Anda dapat mempelajari kembali materi dan mengulang kuis.`}
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-center">
          <div>
            <span className="text-[10px] font-mono uppercase text-gray-400 block">Skor Pilihan Ganda</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {submissionResult.mcScore}%
            </span>
            <p className="text-[10px] text-gray-500">
              {submissionResult.correctMC} dari {submissionResult.totalMC} benar
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-gray-400 block">Target Kelulusan</span>
            <span className="text-2xl font-black text-gray-800 dark:text-zinc-200 font-mono">
              {passRatePercent}%
            </span>
            <p className="text-[10px] text-gray-500">Standar Kompetensi</p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-gray-400 block">Status Penilaian</span>
            <span
              className={`text-sm font-black font-mono block mt-1 px-2.5 py-1 rounded-full ${
                submissionResult.hasManualReview
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : submissionResult.isPassed
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              {submissionResult.hasManualReview
                ? "MENUNGGU REVIEW"
                : submissionResult.isPassed
                ? "LULUS"
                : "PERLU REVISI"}
            </span>
          </div>
        </div>

        {/* Answer Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Rangkuman Lembar Jawaban:
          </h4>
          <div className="space-y-2">
            {questions.map((q, idx) => {
              const studentAns = answers[q.id];
              const correctOpt = q.options?.find((o) => o.isCorrect);
              const studentOpt = q.options?.find((o) => o.id === studentAns);
              const isMcCorrect = q.type === "multiple_choice" && studentAns === correctOpt?.id;

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Soal #{idx + 1}: {q.prompt}
                    </span>
                    {q.type === "multiple_choice" ? (
                      isMcCorrect ? (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Benar
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0">
                          <XCircle className="w-3 h-3" /> Salah
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        {q.type === "essay" ? "Esai" : "Upload Berkas"}
                      </span>
                    )}
                  </div>

                  {q.type === "multiple_choice" && (
                    <div className="text-[11px] text-gray-600 dark:text-zinc-400 space-y-0.5 pl-2 border-l-2 border-gray-300 dark:border-zinc-700">
                      <p>
                        Jawaban Anda: <strong className={isMcCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{studentOpt?.text || "Tidak dijawab"}</strong>
                      </p>
                      {!isMcCorrect && correctOpt && (
                        <p className="text-emerald-600 dark:text-emerald-400">
                          Kunci Benar: <strong>{correctOpt.text}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {q.type === "essay" && (
                    <div className="text-[11px] text-gray-600 dark:text-zinc-400 pl-2 border-l-2 border-amber-500/50">
                      <p className="italic">"{studentAns || "Tidak ada jawaban tertulis."}"</p>
                    </div>
                  )}

                  {q.type === "file_upload" && (
                    <div className="text-[11px] pl-2 border-l-2 border-emerald-500/50">
                      {uploadedFiles[q.id] ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          ✓ Berkas: {uploadedFiles[q.id].name} ({uploadedFiles[q.id].sizeMb} MB)
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada file diunggah.</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              setIsStarted(true);
              setCurrentQIdx(0);
            }}
            className="px-6 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kerjakan Ulang</span>
          </button>
        </div>
      </div>
    );
  }

  // INTRO OVERVIEW (Before Clicking Start)
  if (!isStarted) {
    return (
      <div className="my-8 space-y-6 font-sans animate-in fade-in">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-center text-gray-800 dark:text-zinc-100 tracking-tight">
          {title}
        </h2>

        {/* Previous Submission Banner */}
        {existingSubmission && (
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">
                Riwayat Pengumpulan Terakhir:
              </span>
              <span
                className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full ${
                  existingSubmission.status === "APPROVED"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : existingSubmission.status === "PENDING"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {existingSubmission.status === "APPROVED"
                  ? `LULUS (${existingSubmission.grade}/100)`
                  : existingSubmission.status === "PENDING"
                  ? "MENUNGGU PEMERIKSAAN"
                  : `PERLU REVISI (${existingSubmission.grade}/100)`}
              </span>
            </div>
            {existingSubmission.feedback && (
              <p className="text-xs text-gray-600 dark:text-zinc-400 italic bg-white dark:bg-black/20 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                Catatan Pengajar: "{existingSubmission.feedback}"
              </p>
            )}
          </div>
        )}

        {/* Gray Instructions Banner with Green Icon */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#EBEBEB] dark:bg-[#1C2128] border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            <div className="w-5 h-5 rounded-full bg-[#5CB85C] text-white flex items-center justify-center text-xs font-bold shrink-0">
              i
            </div>
            <span>Instructions:</span>
          </div>

          <ul className="pl-7 space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-zinc-300 list-disc">
            <li>
              The exam consists of <strong>{activeQuestionsCount} questions</strong> and{" "}
              <strong>{passRatePercent}%</strong> is required to pass.
            </li>
            <li>
              You have <strong>{attempts}</strong> to pass the exam.
            </li>
            <li>
              You have <strong>{timeLimit}</strong> per attempt to pass the exam.
            </li>
          </ul>
        </div>

        {/* Centered Green Pill Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleStartExam}
            className="px-10 py-3 rounded-full bg-[#5CB85C] hover:bg-[#4CAE4C] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {existingSubmission ? "Mulai Ujian Kembali" : "Start"}
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ RUNNER
  const curQ = questions[currentQIdx] || questions[0];
  const isLastQuestion = currentQIdx === questions.length - 1;
  const answeredCount = questions.filter((q) => {
    if (q.type === "multiple_choice") return Boolean(answers[q.id]);
    if (q.type === "essay") return Boolean(answers[q.id]?.trim());
    if (q.type === "file_upload") return Boolean(uploadedFiles[q.id]);
    return false;
  }).length;

  return (
    <div className="my-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] p-5 sm:p-7 shadow-sm space-y-6 font-sans animate-in fade-in">
      {/* Top Bar: Progress & Jump Pills */}
      <div className="space-y-3 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{title}</h3>
            <p className="text-[11px] font-mono text-gray-500">
              Soal {currentQIdx + 1} dari {questions.length} • Terjawab {answeredCount}/{questions.length}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {questions.map((q, idx) => {
              const isAnswered =
                (q.type === "multiple_choice" && answers[q.id]) ||
                (q.type === "essay" && answers[q.id]?.trim()) ||
                (q.type === "file_upload" && uploadedFiles[q.id]);
              const isCurrent = idx === currentQIdx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQIdx(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? "ring-2 ring-purple-500 bg-purple-600 text-white shadow-xs"
                      : isAnswered
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white"
                  }`}
                  title={`Lompat ke soal #${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Question View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 font-mono font-black text-xs flex items-center justify-center border border-purple-500/20">
              {currentQIdx + 1}
            </span>

            {curQ.type === "multiple_choice" && (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[11px] font-bold flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Pilihan Ganda (Auto-Grade)</span>
              </span>
            )}

            {curQ.type === "essay" && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Uraian / Esai</span>
              </span>
            )}

            {curQ.type === "file_upload" && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Berkas Praktik</span>
              </span>
            )}
          </div>

          <span className="text-xs font-mono font-bold text-gray-500">
            Bobot: {curQ.weight || 10} Poin
          </span>
        </div>

        {/* Question Prompt */}
        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-relaxed">
          {curQ.prompt}
        </p>

        {/* INPUT: MULTIPLE CHOICE */}
        {curQ.type === "multiple_choice" && (
          <div className="space-y-2.5 pt-2">
            {(curQ.options || []).map((opt, optIdx) => {
              const isSelected = answers[curQ.id] === opt.id;
              return (
                <button
                  key={opt.id || optIdx}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [curQ.id]: opt.id,
                    }))
                  }
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-purple-50 dark:bg-purple-950/20 border-purple-500 text-purple-950 dark:text-purple-200 shadow-xs"
                      : "bg-gray-50 dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-gray-300 text-gray-800 dark:text-zinc-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-400 bg-transparent"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs sm:text-sm">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* INPUT: ESSAY */}
        {curQ.type === "essay" && (
          <div className="space-y-2 pt-2">
            <textarea
              rows={5}
              value={answers[curQ.id] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [curQ.id]: e.target.value,
                }))
              }
              placeholder="Tuliskan lembar jawaban esai Anda di sini secara jelas dan lengkap..."
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
            <p className="text-[11px] text-gray-500 text-right">
              {(answers[curQ.id] || "").length} karakter
            </p>
          </div>
        )}

        {/* INPUT: FILE UPLOAD */}
        {curQ.type === "file_upload" && (
          <div className="space-y-3 pt-2">
            {uploadedFiles[curQ.id] ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 line-clamp-1">
                      {uploadedFiles[curQ.id].name}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      {uploadedFiles[curQ.id].sizeMb} MB • Berhasil diunggah
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={uploadedFiles[curQ.id].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-2 rounded-xl bg-white dark:bg-black/30 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...uploadedFiles };
                      delete updated[curQ.id];
                      setUploadedFiles(updated);
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-bold cursor-pointer"
                    title="Ganti Berkas"
                  >
                    Ganti
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRefs.current[curQ.id]?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-emerald-500 bg-gray-50/50 dark:bg-white/[0.01] text-center space-y-2 cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[curQ.id] = el;
                  }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(curQ.id, f, curQ.allowedFormats, curQ.maxSizeMb);
                  }}
                  className="hidden"
                />

                {uploadingForQId === curQ.id ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Sedang mengunggah berkas model ke server...
                    </span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                      Klik untuk memilih berkas tugas praktik Anda
                    </p>
                    <p className="text-[11px] font-mono text-gray-500">
                      Format diizinkan: {curQ.allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc"} (Maks. {curQ.maxSizeMb || 50} MB)
                    </p>
                  </>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{uploadError}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          disabled={currentQIdx === 0}
          onClick={() => setCurrentQIdx((prev) => Math.max(0, prev - 1))}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <div className="flex items-center gap-2">
          {!isLastQuestion && (
            <button
              type="button"
              onClick={() => setCurrentQIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitQuiz}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-[#5CB85C] hover:bg-[#4CAE4C] text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mengirim Ujian...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Selesai &amp; Kumpulkan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. CISCO MATCHING PAIRS ACTIVITY (Screenshot 6)
// =========================================================================
export interface MatchPair {
  id: string;
  category: string;
  badge: string; // "A", "B", "C", "D", "E"
  correctOptionId: string;
}

export interface MatchOption {
  id: string;
  text: string;
}

export interface MatchingActivityProps {
  header?: string; // e.g. "2.3.2 Practice - Demonstrate an Ethical Hacking Mindset"
  instruction?: string;
  categories: MatchPair[];
  options: MatchOption[];
  onComplete?: () => void;
}

export function CiscoMatchingActivity({
  header = "Practice - Matching Activity",
  instruction = "Match each of the following categories with the associated options.",
  categories,
  options,
  onComplete,
}: MatchingActivityProps) {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  // Map of optionId -> assigned category badge
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const handleSelectCat = (catId: string) => {
    setSelectedCatId(catId);
  };

  const handleSelectOption = (optId: string) => {
    if (!selectedCatId) return;
    const cat = categories.find((c) => c.id === selectedCatId);
    if (!cat) return;

    setMatches((prev) => {
      // If this category was already assigned to another option, remove old assignment
      const updated: Record<string, string> = {};
      Object.entries(prev).forEach(([oId, b]) => {
        if (b !== cat.badge) updated[oId] = b;
      });
      updated[optId] = cat.badge;
      return updated;
    });

    setSelectedCatId(null);
    setChecked(false);
  };

  const handleReset = () => {
    setMatches({});
    setSelectedCatId(null);
    setChecked(false);
  };

  const calculateScore = () => {
    let correct = 0;
    categories.forEach((cat) => {
      if (matches[cat.correctOptionId] === cat.badge) {
        correct++;
      }
    });
    return { correct, total: categories.length };
  };

  const score = calculateScore();

  return (
    <div className="my-6 p-5 sm:p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] shadow-sm space-y-4 font-sans">
      {header && (
        <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
          {header}
        </h3>
      )}

      {instruction && (
        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 leading-relaxed">
          {instruction}
        </p>
      )}

      {/* 2-Column Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
        {/* Left Column: Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-center text-gray-900 dark:text-white">
            Categories:
          </h4>
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              // Check if this category is already assigned anywhere
              const isAssigned = Object.values(matches).includes(cat.badge);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCat(cat.id)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#00BCEB] dark:border-[#38BDF8] bg-[#E0F7FE]/50 dark:bg-[#0369A1]/30 ring-2 ring-[#00BCEB]/30"
                      : isAssigned
                      ? "border-gray-300 dark:border-white/20 bg-gray-50/70 dark:bg-white/5 opacity-80"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 bg-white dark:bg-[#161B22]"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 leading-snug">
                    {cat.category}
                  </span>

                  {/* Category Pill Badge (A, B, C...) */}
                  <span className="w-7 h-7 rounded-full bg-[#D4EDDA] dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {cat.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-center text-gray-900 dark:text-white">
            Options:
          </h4>
          <div className="space-y-2.5">
            {options.map((opt) => {
              const assignedBadge = matches[opt.id];
              // Find matching category to check if correct when checked
              const matchingCat = categories.find((c) => c.badge === assignedBadge);
              const isCorrect = matchingCat && matchingCat.correctOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer relative ${
                    selectedCatId
                      ? "hover:border-[#00BCEB] hover:bg-[#E0F7FE]/20"
                      : ""
                  } ${
                    checked && assignedBadge
                      ? isCorrect
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
                      : assignedBadge
                      ? "border-[#00BCEB] bg-[#E0F7FE]/30 dark:bg-[#0369A1]/10"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#161B22]"
                  }`}
                >
                  {/* Left Connector Circle / Assigned Badge */}
                  <div className="shrink-0">
                    {assignedBadge ? (
                      <span className="w-7 h-7 rounded-full bg-[#D4EDDA] dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-400 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                        {assignedBadge}
                      </span>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-600" />
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 leading-snug flex-1">
                    {opt.text}
                  </span>

                  {checked && assignedBadge && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs text-gray-500 dark:text-zinc-400">
          {selectedCatId ? (
            <span className="text-[#00BCEB] dark:text-[#38BDF8] font-bold">
              Pilih opsi di sebelah kanan untuk memasangkan!
            </span>
          ) : (
            <span>Klik kategori di kiri, lalu klik opsi yang cocok di kanan.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setChecked(true);
              onComplete?.();
            }}
            disabled={Object.keys(matches).length === 0}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              Object.keys(matches).length > 0
                ? "bg-[#00BCEB] hover:bg-[#0098be] text-white shadow-xs active:scale-95"
                : "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
            }`}
          >
            Check Answers
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Reset Pasangan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {checked && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            score.correct === score.total
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-800 dark:text-amber-300"
          }`}
        >
          {score.correct === score.total ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <HelpCircle className="w-4 h-4 text-amber-600" />
          )}
          <span>
            Skor Anda: {score.correct} / {score.total} Benar.{" "}
            {score.correct === score.total
              ? "Luar biasa! Semua pasangan tepat."
              : "Periksa kembali pasangan yang bertanda silang merah."}
          </span>
        </div>
      )}
    </div>
  );
}

export * from "./CiscoAssignmentBlock";
