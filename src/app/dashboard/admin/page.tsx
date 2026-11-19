"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Plus,
  DollarSign,
  Users,
  Eye,
  TrendingUp,
  Search,
  Sparkles,
} from "lucide-react";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  price: number;
  published: boolean;
  thumbnail: string;
  instructor: {
    name: string;
  };
  _count: {
    enrollments: number;
  };
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/stats"),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        window.location.href = "/profile";
        return;
      }

      const coursesData = await coursesRes.json();
      const statsData = await statsRes.json();

      if (statsData.role !== "superadmin" && statsData.role !== "admin") {
        window.location.href = "/profile";
        return;
      }

      setCourses(coursesData.courses || []);
      setStats(statsData.metrics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: courseId, published: !currentStatus }),
      });
      if (res.ok) {
        showToast(
          !currentStatus
            ? "Kelas berhasil disetujui & dipublikasikan ke katalog!"
            : "Kelas berhasil ditarik ke status draft."
        );
        fetchData();
      }
    } catch {
      showToast("Gagal memperbarui status publikasi kelas.");
    }
  };

  const showToast = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.instructor.name.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <DashboardSkeleton
        title="Admin Operations"
        subtitle="Memuat persetujuan kelas, katalog modul, dan aktivitas operasional..."
        roleBadge="ADMIN PORTAL"
        cardsCount={4}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-blue-900 border border-blue-500 text-white text-xs shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-black/40 border border-blue-500/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold mb-2 border border-blue-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>OPERATIONAL & CURRICULUM MANAGEMENT</span>
        </div>
        <h1 className="text-2xl font-black text-white">Admin Operations Workspace</h1>
        <p className="text-xs text-gray-400 mt-1">
          Persetujuan dan kurasi kelas BIM, monitoring pendaftaran siswa, serta rekonsiliasi transaksi.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Kelas</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{courses.length}</p>
          <p className="text-[10px] text-emerald-400 mt-1">
            {courses.filter((c) => c.published).length} Live di Katalog
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Menunggu Review</span>
            <XCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {courses.filter((c) => !c.published).length}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Draft dari Pengajar</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Pendaftaran Siswa</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.totalEnrollments || 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">Siswa aktif kursus</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Estimasi Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {formatRupiah(stats?.estimatedRevenue || 0)}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Volume pendaftaran</p>
        </div>
      </div>

      {/* Courses Moderation Table */}
      <div className="rounded-3xl bg-[#14171E] border border-white/10 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Kurasi & Publikasi Kelas BIM</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                {filteredCourses.length} Kelas
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Setujui kelas dari instruktur untuk langsung tampil di halaman depan website.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari judul kelas, instruktur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 pl-9 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Instruktur</th>
                <th className="py-3 px-4">Kategori & Level</th>
                <th className="py-3 px-4">Biaya</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Status Kurasi</th>
                <th className="py-3 px-4 text-right">Aksi Publikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-12 h-8 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <span className="font-bold text-white line-clamp-1">{c.title}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-gray-300">{c.instructor.name}</td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 font-mono text-[10px]">
                      {c.category} • {c.level}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {formatRupiah(c.price)}
                  </td>

                  <td className="py-3.5 px-4 text-gray-400 font-mono">
                    {c._count.enrollments} Terdaftar
                  </td>

                  <td className="py-3.5 px-4">
                    {c.published ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>LIVE (PUBLISHED)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
                        <XCircle className="w-3 h-3" />
                        <span>MENUNGGU REVIEW</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleTogglePublish(c.id, c.published)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                        c.published
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {c.published ? "Tarik ke Draft" : "Setujui & Publikasikan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
