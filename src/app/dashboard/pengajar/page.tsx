"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  MessageSquare,
  Award,
  ChevronRight,
  Sparkles,
  Layers,
  Download,
} from "lucide-react";
import CurriculumEditor from "@/components/dashboard/CurriculumEditor";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { QuizSubmissionReviewSheet, parseQuizNotes } from "@/components/dashboard/QuizSubmissionReviewSheet";

interface SubmissionItem {
  id: string;
  title: string;
  fileUrl: string;
  notes: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  course: {
    title: string;
  };
}

export default function PengajarDashboard() {
  const [activeTab, setActiveTab] = useState<"evaluasi" | "curriculum">("evaluasi");
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingSub, setEvaluatingSub] = useState<SubmissionItem | null>(null);
  const [gradeInput, setGradeInput] = useState<string>("85");
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<string>("APPROVED");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, subRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/submissions"),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        window.location.href = "/profile";
        return;
      }

      const statsData = await statsRes.json();

      if (statsData.role !== "superadmin" && statsData.role !== "admin" && statsData.role !== "pengajar") {
        window.location.href = "/profile";
        return;
      }

      const subData = await subRes.json();
      setStats(statsData);
      setSubmissions(subData.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingSub) return;

    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: evaluatingSub.id,
          grade: Number(gradeInput),
          feedback: feedbackInput,
          status: statusInput,
        }),
      });

      if (res.ok) {
        setEvaluatingSub(null);
        showToast("Penilaian tugas siswa berhasil disimpan!");
        fetchData();
      }
    } catch {
      showToast("Gagal menyimpan penilaian.");
    }
  };

  const showToast = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  if (loading) {
    return (
      <DashboardSkeleton
        title="Ruang Kerja Pengajar"
        subtitle="Memuat silabus materi, review tugas capstone mahasiswa, & statistik kelas..."
        roleBadge="BIM INSTRUCTOR & MENTOR PORTAL"
        cardsCount={4}
      />
    );
  }

  const myCourses = stats?.myCourses || [];
  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-amber-900 border border-amber-500 text-white text-xs shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/40 border border-amber-500/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold mb-2 border border-amber-500/30">
          <Compass className="w-3.5 h-3.5" />
          <span>BIM INSTRUCTOR & MENTOR PORTAL</span>
        </div>
        <h1 className="text-2xl font-black text-white">Ruang Kerja Pengajar</h1>
        <p className="text-xs text-gray-400 mt-1">
          Pantau silabus materi Anda, kelola modul pembelajaran interaktif, dan review tugas capstone mahasiswa.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("evaluasi")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "evaluasi"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Evaluasi Tugas Siswa</span>
          {pendingSubmissions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-mono text-[10px] font-bold">
              {pendingSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "curriculum"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tulis & Kelola Modul</span>
        </button>
      </div>

      {/* TAB 1: EVALUASI TUGAS SISWA */}
      {activeTab === "evaluasi" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Kelas Diajar</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{myCourses.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Revit, Navisworks & Detailing</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.myStudentsCount || 0}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Mengikuti kelas aktif Anda</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Tugas Menunggu Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{pendingSubmissions.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Perlu dievaluasi & diberi feedback</p>
        </div>
      </div>

      {/* Capstone Assignments Review Table */}
      <div className="rounded-3xl bg-[#14171E] border border-white/10 p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Evaluasi Tugas Capstone Siswa</span>
            {pendingSubmissions.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingSubmissions.length} Menunggu Penilaian
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Beri skor 0-100 dan masukan teknis standar BEP/LOD untuk kelulusan portofolio siswa.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            Belum ada pengumpulan tugas dari siswa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-4">Judul Tugas & Kelas</th>
                  <th className="py-3 px-4">Catatan Siswa</th>
                  <th className="py-3 px-4">File Model</th>
                  <th className="py-3 px-4">Status & Nilai</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {sub.user.name}
                      <p className="text-[10px] text-gray-500 font-mono font-normal">
                        {sub.user.email}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p className="font-semibold text-gray-200 line-clamp-1">{sub.title}</p>
                      <p className="text-[10px] text-[#D99B6A] line-clamp-1">
                        {sub.course.title}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 max-w-[200px]">
                      {(() => {
                        const quiz = parseQuizNotes(sub.notes);
                        if (quiz) {
                          return (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30 block w-fit">
                                KUIS: PG {quiz.mcScore ?? 0}%
                              </span>
                              <p className="text-[10px] text-gray-500 line-clamp-1">
                                {quiz.totalQuestions} Soal {quiz.hasManualReview ? "(Perlu Review)" : "(Auto)"}
                              </p>
                            </div>
                          );
                        }
                        return (
                          <p className="line-clamp-2 text-[11px] italic">
                            "{sub.notes || "Tidak ada catatan khusus."}"
                          </p>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-blue-300 hover:text-white border border-white/10 hover:border-blue-400 transition-colors text-[11px]"
                      >
                        <Download className="w-3 h-3 text-rose-400" />
                        <span>Unduh File ({sub.fileUrl.split('.').pop()?.toUpperCase() || "MODEL"})</span>
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                          MENUNGGU REVIEW
                        </span>
                      )}
                      {sub.status === "APPROVED" && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>LULUS ({sub.grade}/100)</span>
                        </div>
                      )}
                      {sub.status === "REVISION" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold font-mono">
                          REVISI ({sub.grade}/100)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEvaluatingSub(sub);
                          const quiz = parseQuizNotes(sub.notes);
                          const initialGrade = sub.grade
                            ? String(sub.grade)
                            : quiz?.mcScore !== undefined
                            ? String(quiz.mcScore)
                            : "85";
                          setGradeInput(initialGrade);
                          setFeedbackInput(sub.feedback || "");
                          setStatusInput(sub.status === "PENDING" ? "APPROVED" : sub.status);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        {sub.status === "PENDING" ? "Beri Nilai" : "Ubah Nilai"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
      {evaluatingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#161920] border border-white/15 rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Evaluasi Tugas: {evaluatingSub.user.name}</span>
                </h3>
                <p className="text-xs text-gray-400">{evaluatingSub.title} • {evaluatingSub.course.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingSub(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const quizData = parseQuizNotes(evaluatingSub.notes);
              if (quizData) {
                return <QuizSubmissionReviewSheet data={quizData} />;
              }
              return (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  {evaluatingSub.notes && (
                    <div>
                      <span className="text-gray-400 block mb-0.5">Catatan Siswa:</span>
                      <p className="italic text-gray-300">"{evaluatingSub.notes}"</p>
                    </div>
                  )}
                  {evaluatingSub.fileUrl && evaluatingSub.fileUrl !== "quiz-submission" && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={evaluatingSub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File Siswa</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            <form onSubmit={handleEvaluate} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Nilai Skor (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    Keputusan Evaluasi
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#191D24] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="APPROVED">LULUS (APPROVED)</option>
                    <option value="REVISION">PERLU REVISI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Masukan Teknis / Catatan Review Mentor
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Pemodelan compound walls sudah rapi dan parameter BoQ terbaca jelas. Mohon perbaiki detail sambungan curtain wall di grid 4."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEvaluatingSub(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
        </div>
      )}

      {/* TAB 2: CURRICULUM & INTERACTIVE MODULE EDITOR */}
      {activeTab === "curriculum" && (
        <div className="animate-in fade-in duration-300">
          <CurriculumEditor userRole="Pengajar" />
        </div>
      )}
    </div>
  );
}
