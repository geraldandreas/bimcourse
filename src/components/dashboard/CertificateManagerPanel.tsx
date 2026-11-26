"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Award,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Mail,
  Edit3,
  Send,
  Plus,
  Trash2,
  X,
  Eye,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface CertificateRecord {
  id: string;
  certificateNo: string;
  userId: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  instructorName: string;
  ceoName: string;
  ceoTitle: string;
  grade: string;
  standards: string;
  issuedDate: string;
  status: "REQUESTED" | "ISSUED";
  emailSentAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    slug: string;
    category?: string;
    instructorName?: string | null;
  };
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CourseOption {
  id: string;
  title: string;
  slug: string;
  instructorName?: string | null;
}

const toDateInputValue = (iso?: string) => {
  if (!iso) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

export default function CertificateManagerPanel() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "REQUESTED" | "ISSUED">("ALL");
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Edit & Preview modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateRecord | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [formState, setFormState] = useState({
    certificateNo: "",
    studentName: "",
    studentEmail: "",
    courseTitle: "",
    instructorName: "",
    ceoName: "Eddy Tuasikal, S.Ars",
    ceoTitle: "Chief Executive Officer, BIMCourse Academy",
    grade: "Kompeten / Lulus",
    standards: "SKKNI BIM Level 6 • Mandat PUPR • ISO 19650",
    issuedDate: toDateInputValue(),
    notes: "",
  });

  // Manual Creation Modal state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [manualForm, setManualForm] = useState({
    userId: "",
    courseId: "",
    studentName: "",
    studentEmail: "",
    courseTitle: "",
    instructorName: "Eddy Tuasikal, S.Ars",
    ceoName: "Eddy Tuasikal, S.Ars",
    ceoTitle: "Chief Executive Officer, BIMCourse Academy",
    grade: "Kompeten / Lulus",
    standards: "SKKNI BIM Level 6 • Mandat PUPR • ISO 19650",
    issuedDate: toDateInputValue(),
    sendEmail: true,
  });

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/certificates", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat sertifikat.");
      setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
    } catch (err: any) {
      setBannerMsg({ type: "error", text: err?.message || "Gagal mengambil data sertifikat." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certificates.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.studentName.toLowerCase().includes(q) ||
        c.studentEmail.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q) ||
        c.certificateNo.toLowerCase().includes(q)
      );
    });
  }, [certificates, search, statusFilter]);

  const openEditModal = (cert: CertificateRecord) => {
    setEditingCert(cert);
    setFormState({
      certificateNo: cert.certificateNo,
      studentName: cert.studentName,
      studentEmail: cert.studentEmail,
      courseTitle: cert.courseTitle,
      instructorName: cert.instructorName,
      ceoName: cert.ceoName || "Eddy Tuasikal, S.Ars",
      ceoTitle: cert.ceoTitle || "Chief Executive Officer, BIMCourse Academy",
      grade: cert.grade || "Kompeten / Lulus",
      standards: cert.standards || "SKKNI BIM Level 6 • Mandat PUPR • ISO 19650",
      issuedDate: toDateInputValue(cert.issuedDate),
      notes: cert.notes || "",
    });
    setShowPreview(true);
    setEditModalOpen(true);
  };

  const handleSaveCert = async (mode: "save" | "issue" | "issueAndEmail") => {
    if (!editingCert) return;
    setSavingEdit(true);
    setBannerMsg(null);
    try {
      const res = await fetch("/api/certificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCert.id,
          ...formState,
          status: mode === "save" ? editingCert.status : "ISSUED",
          sendEmail: mode === "issueAndEmail",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui sertifikat.");

      setCertificates((prev) =>
        prev.map((c) => (c.id === editingCert.id ? data.certificate : c))
      );
      setEditModalOpen(false);
      setBannerMsg({
        type: "success",
        text: data.message || "Sertifikat berhasil diperbarui!",
      });
    } catch (err: any) {
      setBannerMsg({ type: "error", text: err?.message || "Gagal menyimpan sertifikat." });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickIssueAndEmail = async (cert: CertificateRecord, sendEmail: boolean) => {
    setBusyId(cert.id);
    setBannerMsg(null);
    try {
      const res = await fetch("/api/certificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cert.id,
          status: "ISSUED",
          sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses sertifikat.");

      setCertificates((prev) =>
        prev.map((c) => (c.id === cert.id ? data.certificate : c))
      );
      setBannerMsg({
        type: "success",
        text:
          sendEmail && data.emailResult?.success === false
            ? "Sertifikat aktif di web BIMCourse, namun pengiriman email gagal/tertunda (cek konfigurasi SMTP)."
            : data.message || "Sertifikat berhasil diproses!",
      });
    } catch (err: any) {
      setBannerMsg({ type: "error", text: err?.message || "Gagal memproses sertifikat." });
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus data sertifikat ini?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/certificates?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menghapus sertifikat.");
      }
      setCertificates((prev) => prev.filter((c) => c.id !== id));
      setBannerMsg({ type: "success", text: "Sertifikat berhasil dihapus." });
    } catch (err: any) {
      setBannerMsg({ type: "error", text: err?.message || "Gagal menghapus sertifikat." });
    } finally {
      setBusyId(null);
    }
  };

  const openManualModal = async () => {
    setManualModalOpen(true);
    try {
      const [uRes, cRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/courses", { cache: "no-store" }),
      ]);
      const [uData, cData] = await Promise.all([
        uRes.ok ? uRes.json() : { users: [] },
        cRes.ok ? cRes.json() : { courses: [] },
      ]);
      const userList: UserOption[] = uData.users || [];
      const courseList: CourseOption[] = cData.courses || [];
      setUsers(userList);
      setCourses(courseList);

      const firstStudent = userList.find((u) => u.role === "siswa" || u.role === "mahasiswa") || userList[0];
      const firstCourse = courseList[0];
      setManualForm((prev) => ({
        ...prev,
        userId: firstStudent?.id || "",
        studentName: firstStudent?.name || "",
        studentEmail: firstStudent?.email || "",
        courseId: firstCourse?.id || "",
        courseTitle: firstCourse?.title || "",
        instructorName: firstCourse?.instructorName || "Eddy Tuasikal, S.Ars",
      }));
    } catch {}
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.userId || !manualForm.courseId) {
      alert("Pilih mahasiswa dan kursus terlebih dahulu.");
      return;
    }
    setSavingEdit(true);
    setBannerMsg(null);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualForm,
          status: "ISSUED",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menerbitkan sertifikat manual.");
      await fetchCertificates();
      setManualModalOpen(false);
      setBannerMsg({
        type: "success",
        text: `Sertifikat ${data.certificate?.certificateNo || ""} berhasil diterbitkan${manualForm.sendEmail ? " & dikirim via email" : ""}!`,
      });
    } catch (err: any) {
      setBannerMsg({ type: "error", text: err?.message || "Gagal menerbitkan sertifikat." });
    } finally {
      setSavingEdit(false);
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
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Sertifikat</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white">{certificates.length}</p>
              <p className="text-[10px] text-gray-500 mt-1">Pengajuan &amp; terbit semua kelas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Menunggu Diproses</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {certificates.filter((c) => c.status === "REQUESTED").length}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1">Pengajuan baru siswa akhir modul</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Terbit di Web</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {certificates.filter((c) => c.status === "ISSUED").length}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Aktif di akun &amp; verifikasi publik</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Terkirim ke Email</span>
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {certificates.filter((c) => Boolean(c.emailSentAt)).length}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">Notifikasi &amp; sertifikat email</p>
            </div>
          </>
        )}
      </div>

      {bannerMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            bannerMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {bannerMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <span>Manajemen &amp; Penerbitan Sertifikat Kelulusan</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent">
                {filtered.length}
              </span>
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Proses pengajuan sertifikat siswa, edit nama/tanggal/nomor sertifikat bila ada kesalahan, generate sertifikat bertanda tangan CEO, dan kirim melalui web BIMCourse serta email siswa.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, no sertifikat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 w-52"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="REQUESTED">Menunggu Diproses</option>
              <option value="ISSUED">Sudah Terbit</option>
            </select>

            <button
              type="button"
              onClick={openManualModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Sertifikat Manual</span>
            </button>

            <button
              type="button"
              onClick={fetchCertificates}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 cursor-pointer"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-black/25 border border-gray-200 dark:border-white/10 animate-pulse flex items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-52 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-72 rounded bg-gray-100 dark:bg-white/5" />
                </div>
                <div className="h-8 w-36 rounded-xl bg-gray-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <Award className="w-9 h-9 mx-auto text-gray-300 dark:text-zinc-600" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Belum ada pengajuan atau data sertifikat.
            </p>
            <p className="text-[11px]">
              Siswa yang menuntaskan modul terakhir kursus dapat mengajukan sertifikat, atau klik &ldquo;Buat Sertifikat Manual&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-transparent uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">Program &amp; No. Sertifikat</th>
                  <th className="py-3 px-4">Tanggal Terbit &amp; Predikat</th>
                  <th className="py-3 px-4">Status &amp; Pengiriman</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-950 dark:text-white">{cert.studentName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{cert.studentEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {cert.courseTitle}
                      </p>
                      <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                        {cert.certificateNo}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(cert.issuedDate))}
                      </p>
                      <p className="text-[10px] text-gray-500">{cert.grade}</p>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {cert.status === "ISSUED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                          <CheckCircle2 className="w-3 h-3" /> TERBIT DI WEB
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                          <Clock className="w-3 h-3" /> PENGAJUAN BARU
                        </span>
                      )}

                      {cert.emailSentAt && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>Email terkirim</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openEditModal(cert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-900 dark:text-white font-bold text-[11px] cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit / Preview</span>
                        </button>

                        <button
                          type="button"
                          disabled={busyId === cert.id}
                          onClick={() => handleQuickIssueAndEmail(cert, true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>
                            {busyId === cert.id
                              ? "Memproses..."
                              : cert.status === "ISSUED"
                              ? "Kirim Ulang Email"
                              : "Generate & Kirim"}
                          </span>
                        </button>

                        {cert.status === "ISSUED" && (
                          <a
                            href={`/verify-certificate?id=${encodeURIComponent(cert.certificateNo)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Halaman Verifikasi Publik"
                            className="p-1.5 rounded-xl text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-white/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={busyId === cert.id}
                          onClick={() => handleDeleteCert(cert.id)}
                          title="Hapus Data"
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT + LIVE CERTIFICATE PREVIEW MODAL */}
      {editModalOpen && editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/15 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">
                    Edit &amp; Generate Sertifikat Mahasiswa
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Koreksi ejaan nama, tanggal terbit, nomor sertifikat, maupun nama CEO sebelum mengirim ke siswa.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-800 dark:text-white cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showPreview ? "Sembunyikan Preview" : "Lihat Preview"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-12" : ""} gap-6`}>
              {/* Form Column */}
              <div className={`${showPreview ? "lg:col-span-5" : ""} space-y-3`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nama Mahasiswa
                    </label>
                    <input
                      type="text"
                      value={formState.studentName}
                      onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs font-bold text-gray-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Email Penerima
                    </label>
                    <input
                      type="email"
                      value={formState.studentEmail}
                      onChange={(e) => setFormState({ ...formState, studentEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nomor Sertifikat
                    </label>
                    <input
                      type="text"
                      value={formState.certificateNo}
                      onChange={(e) => setFormState({ ...formState, certificateNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs font-mono text-gray-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Tanggal Terbit
                    </label>
                    <input
                      type="date"
                      value={formState.issuedDate}
                      onChange={(e) => setFormState({ ...formState, issuedDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Judul Program / Kursus
                  </label>
                  <input
                    type="text"
                    value={formState.courseTitle}
                    onChange={(e) => setFormState({ ...formState, courseTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Predikat / Nilai
                    </label>
                    <input
                      type="text"
                      value={formState.grade}
                      onChange={(e) => setFormState({ ...formState, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nama Instruktur
                    </label>
                    <input
                      type="text"
                      value={formState.instructorName}
                      onChange={(e) => setFormState({ ...formState, instructorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nama CEO (TTD Resmi)
                    </label>
                    <input
                      type="text"
                      value={formState.ceoName}
                      onChange={(e) => setFormState({ ...formState, ceoName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Jabatan CEO
                    </label>
                    <input
                      type="text"
                      value={formState.ceoTitle}
                      onChange={(e) => setFormState({ ...formState, ceoTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Standar Kompetensi
                  </label>
                  <input
                    type="text"
                    value={formState.standards}
                    onChange={(e) => setFormState({ ...formState, standards: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs text-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Live Certificate Preview with CEO Signature */}
              {showPreview && (
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF8] border-4 border-amber-500/40 text-gray-900 shadow-lg text-center space-y-4">
                    <div className="flex flex-col items-center space-y-1">
                      <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
                      <p className="text-xs font-black tracking-widest uppercase font-mono">
                        BIMCOURSE ACADEMY
                      </p>
                      <span className="text-[9px] text-gray-500 font-mono uppercase">
                        Sertifikat Kompetensi Resmi
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-500 italic">Diberikan kepada:</p>
                      <h4 className="text-xl sm:text-2xl font-black uppercase text-gray-950 border-b-2 border-zinc-300 inline-block px-5 pb-1 mt-1">
                        {formState.studentName || "Nama Mahasiswa"}
                      </h4>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-600">
                        Telah menuntaskan modul &amp; evaluasi program:
                      </p>
                      <p className="text-sm font-bold text-amber-700">{formState.courseTitle}</p>
                      <p className="text-[10px] font-mono text-gray-500">{formState.standards}</p>
                      <p className="text-[10px] font-mono text-gray-600">
                        Predikat: <strong>{formState.grade}</strong> • Terbit:{" "}
                        <strong>
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(new Date(formState.issuedDate || Date.now()))}
                        </strong>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 grid grid-cols-3 gap-3 items-end text-[10px]">
                      <div>
                        <p className="font-serif italic text-xs text-gray-800 border-b border-gray-300 pb-1">
                          {formState.instructorName}
                        </p>
                        <span className="text-gray-500 font-mono block mt-0.5">Instruktur</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-full bg-amber-400 text-black flex flex-col items-center justify-center text-[7px] font-black leading-tight">
                          <span>OFFICIAL</span>
                          <span>VERIFIED</span>
                        </div>
                        <span className="font-mono text-[9px] font-bold text-gray-700 mt-1">
                          {formState.certificateNo}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-col items-center border-b border-gray-300 pb-0.5">
                          <img
                            src="/ceo-signature.png"
                            alt="TTD CEO"
                            className="h-11 w-auto object-contain mix-blend-multiply"
                          />
                          <span className="font-bold text-[10px] text-gray-900">{formState.ceoName}</span>
                        </div>
                        <span className="text-gray-500 font-mono block mt-0.5 truncate">
                          {formState.ceoTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/15 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => handleSaveCert("save")}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 dark:bg-white/15 dark:hover:bg-white/25 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Simpan Edit Saja
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => handleSaveCert("issue")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Generate &amp; Aktifkan di Web
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => handleSaveCert("issueAndEmail")}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{savingEdit ? "Mengirim..." : "Terbitkan ke Web & Kirim Email"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL CREATE CERTIFICATE MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleCreateManual}
            className="w-full max-w-xl bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/15 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold">Buat &amp; Kirim Sertifikat Manual</h3>
              </div>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Pilih Akun Mahasiswa
                </label>
                <select
                  value={manualForm.userId}
                  onChange={(e) => {
                    const u = users.find((x) => x.id === e.target.value);
                    setManualForm((prev) => ({
                      ...prev,
                      userId: e.target.value,
                      studentName: u?.name || prev.studentName,
                      studentEmail: u?.email || prev.studentEmail,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Pilih Kursus
                </label>
                <select
                  value={manualForm.courseId}
                  onChange={(e) => {
                    const c = courses.find((x) => x.id === e.target.value);
                    setManualForm((prev) => ({
                      ...prev,
                      courseId: e.target.value,
                      courseTitle: c?.title || prev.courseTitle,
                      instructorName: c?.instructorName || prev.instructorName,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Nama Tertulis di Sertifikat
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.studentName}
                  onChange={(e) => setManualForm({ ...manualForm, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Email Tujuan Pengiriman
                </label>
                <input
                  type="email"
                  required
                  value={manualForm.studentEmail}
                  onChange={(e) => setManualForm({ ...manualForm, studentEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  value={manualForm.issuedDate}
                  onChange={(e) => setManualForm({ ...manualForm, issuedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Predikat / Nilai
                </label>
                <input
                  type="text"
                  value={manualForm.grade}
                  onChange={(e) => setManualForm({ ...manualForm, grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/15 text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={manualForm.sendEmail}
                onChange={(e) => setManualForm({ ...manualForm, sendEmail: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span>Sekaligus kirim sertifikat ke email siswa</span>
            </label>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/15 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? "Memproses..." : "Terbitkan Sekarang"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
