"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BookOpenCheck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  X,
  FileCheck2,
} from "lucide-react";
import {
  QuizSubmissionReviewSheet,
  parseQuizNotes,
  ParsedQuizData,
} from "@/components/dashboard/QuizSubmissionReviewSheet";

interface QuizSubmissionRow {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  fileUrl: string;
  notes?: string | null;
  status: "PENDING" | "APPROVED" | "REVISION";
  grade?: number | null;
  feedback?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
  };
}

export default function QuizReviewPanel() {
  const [submissions, setSubmissions] = useState<QuizSubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REVISION">("ALL");
  const [onlyManualReview, setOnlyManualReview] = useState(false);

  const [selectedSub, setSelectedSub] = useState<QuizSubmissionRow | null>(null);
  const [evalGrade, setEvalGrade] = useState<string>("85");
  const [evalStatus, setEvalStatus] = useState<"APPROVED" | "REVISION" | "PENDING">("APPROVED");
  const [evalFeedback, setEvalFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQuizSubmissions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data kuis siswa.");
      }
      const rows: QuizSubmissionRow[] = Array.isArray(data.submissions) ? data.submissions : [];
      const quizRows = rows.filter(
        (row) => parseQuizNotes(row.notes) !== null || row.fileUrl === "quiz-submission"
      );
      setSubmissions(quizRows);
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat mengambil data kuis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizSubmissions();
  }, []);

  const enriched = useMemo(() => {
    return submissions.map((sub) => ({
      sub,
      quiz: parseQuizNotes(sub.notes),
    }));
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter(({ sub, quiz }) => {
      if (statusFilter !== "ALL" && sub.status !== statusFilter) return false;
      if (onlyManualReview && !quiz?.hasManualReview) return false;
      if (!q) return true;
      return (
        (sub.user?.name || "").toLowerCase().includes(q) ||
        (sub.user?.email || "").toLowerCase().includes(q) ||
        (sub.title || "").toLowerCase().includes(q) ||
        (quiz?.quizTitle || "").toLowerCase().includes(q) ||
        (sub.course?.title || "").toLowerCase().includes(q)
      );
    });
  }, [enriched, search, statusFilter, onlyManualReview]);

  const openReviewModal = (sub: QuizSubmissionRow, quiz: ParsedQuizData | null) => {
    setSelectedSub(sub);
    const defaultScore =
      sub.grade !== null && sub.grade !== undefined
        ? String(sub.grade)
        : quiz?.mcScore !== undefined
        ? String(quiz.mcScore)
        : "85";
    setEvalGrade(defaultScore);
    setEvalStatus(sub.status === "REVISION" ? "REVISION" : "APPROVED");
    setEvalFeedback(sub.feedback || "");
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSaving(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSub.id,
          grade: Number(evalGrade),
          status: evalStatus,
          feedback: evalFeedback.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan hasil evaluasi kuis.");
      }
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSub.id
            ? {
                ...item,
                grade: Number(evalGrade),
                status: evalStatus,
                feedback: evalFeedback.trim(),
              }
            : item
        )
      );
      setSelectedSub(null);
    } catch (err: any) {
      alert(err?.message || "Gagal menyimpan nilai kuis.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 animate-pulse space-y-3"
            >
              <div className="h-3 w-28 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-7 w-14 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-2.5 w-36 rounded bg-gray-100 dark:bg-white/5" />
            </div>
          ))
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Kuis Masuk</span>
                <BookOpenCheck className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white">{submissions.length}</p>
              <p className="text-[10px] text-gray-500 mt-1">Semua kuis evaluasi peserta</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Menunggu Koreksi</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {submissions.filter((s) => s.status === "PENDING").length}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1">Perlu penilaian esai / berkas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Kuis Lulus</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {submissions.filter((s) => s.status === "APPROVED").length}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Memenuhi passing grade</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Perlu Revisi</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {submissions.filter((s) => s.status === "REVISION").length}
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Dikembalikan ke siswa</p>
            </div>
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <span>Review &amp; Koreksi Kuis Siswa</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent">
                {filtered.length}
              </span>
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Periksa hasil pilihan ganda otomatis, koreksi jawaban uraian/esai serta unggahan file model, dan berikan nilai akhir siswa.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa, kuis, atau kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Koreksi</option>
              <option value="APPROVED">Lulus (Disetujui)</option>
              <option value="REVISION">Perlu Revisi</option>
            </select>

            <button
              type="button"
              onClick={() => setOnlyManualReview((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                onlyManualReview
                  ? "bg-amber-500 text-black border-amber-500 font-bold"
                  : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
              }`}
            >
              Butuh Koreksi Manual
            </button>

            <button
              type="button"
              onClick={fetchQuizSubmissions}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 cursor-pointer"
              title="Muat Ulang Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-black/25 border border-gray-200 dark:border-white/10 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-72 rounded bg-gray-100 dark:bg-white/5" />
                </div>
                <div className="h-8 w-28 rounded-xl bg-gray-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <BookOpenCheck className="w-9 h-9 mx-auto text-gray-300 dark:text-zinc-600" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">Belum ada submission kuis yang cocok.</p>
            <p className="text-[11px]">Pengumpulan kuis dari halaman belajar siswa akan otomatis muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-transparent uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-4">Kuis &amp; Kelas</th>
                  <th className="py-3 px-4">Hasil Auto-Grade &amp; Komponen</th>
                  <th className="py-3 px-4">Status &amp; Nilai</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map(({ sub, quiz }) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-950 dark:text-white">
                      {sub.user?.name || "Mahasiswa"}
                      <p className="text-[10px] text-gray-500 font-mono font-normal">
                        {sub.user?.email || "-"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {quiz?.quizTitle || sub.title}
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono line-clamp-1">
                        {sub.course?.title || "Kelas BIM"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {quiz ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                            PG: {quiz.mcScore ?? 0}% ({quiz.correctMC ?? 0}/{quiz.totalMC ?? 0})
                          </span>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {quiz.totalQuestions ?? quiz.answers.length} Soal{" "}
                            {quiz.hasManualReview ? "• Ada Esai/Berkas" : "• Pilihan Ganda"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">Format kuis standar</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.status === "PENDING" && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                          MENUNGGU KOREKSI
                        </span>
                      )}
                      {sub.status === "APPROVED" && (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>LULUS ({sub.grade ?? quiz?.mcScore ?? 0}/100)</span>
                        </div>
                      )}
                      {sub.status === "REVISION" && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-bold font-mono">
                          REVISI ({sub.grade ?? 0}/100)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openReviewModal(sub, quiz)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Review Kuis</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/15 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">
                    Review Jawaban Kuis Siswa
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {selectedSub.user?.name} ({selectedSub.user?.email}) • {selectedSub.course?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const quizData = parseQuizNotes(selectedSub.notes);
              if (quizData) {
                return <QuizSubmissionReviewSheet data={quizData} />;
              }
              return (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
                  {selectedSub.notes || "Tidak ada detail jawaban kuis."}
                </div>
              );
            })()}

            <form onSubmit={handleSaveEvaluation} className="space-y-4 pt-3 border-t border-gray-200 dark:border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nilai Akhir Kuis (0 - 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={evalGrade}
                    onChange={(e) => setEvalGrade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Status Kelulusan Kuis
                  </label>
                  <select
                    value={evalStatus}
                    onChange={(e) => setEvalStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="APPROVED">Lulus / Disetujui</option>
                    <option value="REVISION">Perlu Revisi</option>
                    <option value="PENDING">Menunggu Koreksi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Catatan / Feedback Pengajar
                </label>
                <textarea
                  rows={3}
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="Berikan catatan evaluasi jawaban esai atau koreksi file siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/15 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : "Simpan Nilai & Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
