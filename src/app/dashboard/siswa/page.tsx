"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Award,
  Play,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

interface EnrollmentItem {
  id: string;
  progress: number;
  status: string;
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    thumbnail: string;
    instructor: {
      name: string;
    };
    modules: { id: string; title: string }[];
  };
}

interface SubmissionItem {
  id: string;
  title: string;
  fileUrl: string;
  notes: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
  createdAt: string;
  course: {
    title: string;
  };
}

export default function SiswaDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);
  const [stats, setStats] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [subTitle, setSubTitle] = useState("");
  const [subFileUrl, setSubFileUrl] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, subRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/submissions"),
      ]);
      const statsData = await statsRes.json();
      const subData = await subRes.json();
      setStats(statsData);
      setEnrollments(statsData.myEnrollments || []);
      setSubmissions(subData.submissions || []);
      if (statsData.myEnrollments?.length > 0) {
        setSelectedCourseId(statsData.myEnrollments[0].course.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: subTitle,
          fileUrl: subFileUrl,
          notes: subNotes,
        }),
      });

      if (res.ok) {
        setSubmitModalOpen(false);
        setSubTitle("");
        setSubFileUrl("");
        setSubNotes("");
        showToast("Tugas berhasil dikumpulkan! Menunggu review dari pengajar.");
        fetchData();
      }
    } catch {
      showToast("Gagal mengumpulkan tugas.");
    }
  };

  const showToast = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  if (loading) {
    return (
      <DashboardSkeleton
        title="Portal Belajar Mahasiswa"
        subtitle="Memuat modul aktif, progress kurikulum, dan pengumpulan tugas..."
        roleBadge="STUDENT PORTAL"
        cardsCount={3}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-900 border border-emerald-500 text-white text-xs shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black/40 border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold mb-2 border border-emerald-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>STUDENT LEARNING DASHBOARD</span>
          </div>
          <h1 className="text-2xl font-black text-white">Portal Siswa & Portofolio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Lanjutkan silabus video, pantau progress modul, dan kirim tugas capstone LOD 300 untuk sertifikasi.
          </p>
        </div>

        <button
          onClick={() => setSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Kumpul Tugas Capstone</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Kelas Diikuti</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{enrollments.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Akses materi selamanya</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Tugas Terkumpul</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{submissions.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Tugas capstone BIM model</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Sertifikat Kelulusan</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {submissions.filter((s) => s.status === "APPROVED").length} Lolos
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">Standar SKKNI & ISO 19650</p>
        </div>
      </div>

      {/* My Enrolled Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Kelas Saya yang Sedang Berjalan</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
              {enrollments.length} Kelas
            </span>
          </h2>
          <Link
            href="/#courses"
            className="text-xs text-white hover:underline font-bold"
          >
            + Eksplor Kelas Lain
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((en) => (
            <div
              key={en.id}
              className="p-6 rounded-3xl bg-[#14171E] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={en.course.thumbnail}
                    alt={en.course.title}
                    className="w-20 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-white/10"
                  />
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                      {en.course.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-2">
                      {en.course.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Mentor: {en.course.instructor.name}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Kemajuan Belajar</span>
                    <span className="font-bold font-mono text-white">
                      {Math.round(en.progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${en.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">
                  {en.course.modules.length} Modul Silabus
                </span>
                <Link
                  href="/#courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lanjutkan Belajar</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions & Evaluation Feedback */}
      <div className="rounded-3xl bg-[#14171E] border border-white/10 p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Status Tugas Capstone & Review Mentor</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hasil evaluasi dan catatan revisi teknis dari instruktur profesional.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs">
            Belum ada tugas yang dikumpulkan. Klik tombol "Kumpul Tugas Capstone" di atas.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{sub.title}</h3>
                    <p className="text-xs text-zinc-400">{sub.course.title}</p>
                  </div>

                  <div>
                    {sub.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                        <Clock className="w-3 h-3" />
                        <span>MENUNGGU REVIEW</span>
                      </span>
                    )}
                    {sub.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black border border-white text-xs font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>LULUS • NILAI {sub.grade}/100</span>
                      </span>
                    )}
                    {sub.status === "REVISION" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>PERLU REVISI • NILAI {sub.grade}/100</span>
                      </span>
                    )}
                  </div>
                </div>

                {sub.feedback && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 space-y-1">
                    <span className="font-bold text-white text-[11px] block">
                      Catatan Masukan dari Mentor:
                    </span>
                    <p className="italic leading-relaxed">{sub.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#161920] border border-white/15 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Kumpul Tugas Portofolio / Capstone BIM</span>
            </h3>
            <p className="text-xs text-gray-400">
              Kirim link file model Revit (.rvt), Navisworks (.nwd), atau link Google Drive/OneDrive Anda.
            </p>

            <form onSubmit={handleUploadSubmission} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Pilih Kelas
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#191D24] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {enrollments.map((en) => (
                    <option key={en.course.id} value={en.course.id}>
                      {en.course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Judul Portofolio / Tugas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pemodelan Gedung 5 Lantai LOD 300 & Schedule BoQ"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  URL File Cloud (.rvt / .nwd / Drive / BIM 360)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={subFileUrl}
                  onChange={(e) => setSubFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Catatan untuk Mentor (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan tantangan pemodelan atau bagian spesifik yang ingin di-review..."
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                >
                  Kirim Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
