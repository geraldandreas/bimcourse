"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Camera,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  ExternalLink,
  ArrowRight,
  LogOut,
  Copy,
  Check,
  Printer,
  X,
  Sparkles,
  Building2,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Play,
  FileCheck,
  Loader2,
  CreditCard,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ProfileLoading from "./loading";

interface EnrolledCourse {
  id: string;
  progress: number;
  status: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    level: string;
    thumbnail: string;
    durationHours: number;
    labsCount: number;
    instructor: {
      name: string;
      avatar: string | null;
    };
    modules: { id: string; title: string }[];
  };
}

interface Certificate {
  id: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  category: string;
  studentName: string;
  instructorName: string;
  completedAt: string;
  grade: string;
  standards: string;
  verificationCode: string;
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
    id: string;
    title: string;
    slug: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  organization: string | null;
  createdAt: string;
}

interface TransactionItem {
  id: string;
  courseId: string;
  amount: number;
  paymentMethod: string;
  proofUrl: string | null;
  senderName: string | null;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    thumbnail: string;
    price: number;
  };
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const { t, language } = useLanguage();
  const p = t.profilePage;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"courses" | "certificates" | "assignments" | "edit" | "transactions">(
    tabQuery === "edit" ? "edit" : tabQuery === "transactions" ? "transactions" : "courses"
  );

  // Selected Proof Image Lightbox Modal
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editOrg, setEditOrg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Certificate Modal
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Assignment Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [subFileUrl, setSubFileUrl] = useState("");
  const [subNotes, setSubNotes] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // Toast message
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.status === 401) {
        router.push("/login?redirect=/profile");
        return;
      }
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        setEditName(data.user.name || "");

        // Clean organization and bio (no dummy values, examples, or Google Account labels)
        const cleanOrg = (!data.user.organization || data.user.organization === "Google Account" || data.user.organization === "Mahasiswa / Profesional Mandiri") 
          ? "" 
          : data.user.organization;
        const cleanBio = (!data.user.bio || 
          data.user.bio.includes("Mahasiswa / Pembelajar Digital Construction") || 
          data.user.bio.includes("Pengguna terdaftar") ||
          data.user.bio.includes("Student of BIMCourse") ||
          data.user.bio.includes("Mahasiswa / Profesional pembelajar"))
          ? ""
          : data.user.bio;

        setEditBio(cleanBio);
        setEditPhone(data.user.phone || "");
        setEditOrg(cleanOrg);
        setEnrollments(data.enrollments || []);
        setCertificates(data.certificates || []);
        setSubmissions(data.submissions || []);
        setTransactions(data.transactions || []);
        if (data.enrollments?.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data.enrollments[0].course.id);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat profil.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (tabQuery === "edit") {
      setActiveTab("edit");
    } else if (tabQuery === "transactions") {
      setActiveTab("transactions");
    } else if (tabQuery === "certificates") {
      setActiveTab("certificates");
    } else if (tabQuery === "assignments") {
      setActiveTab("assignments");
    } else if (tabQuery === "courses") {
      setActiveTab("courses");
    }
  }, [tabQuery]);

  // Handle Avatar Change & Direct Upload to Supabase Storage
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB for avatar)
    if (file.size > 5 * 1024 * 1024) {
      showToast(language === "en" ? "Photo exceeds 5MB size limit." : "Ukuran foto melebihi batas 5MB.", "error");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal mengunggah foto.");

      const newAvatarUrl = uploadData.url;

      // Update user profile in database
      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: newAvatarUrl }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || "Gagal memperbarui foto profil.");

      setUser((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : null));
      showToast(p.photoUpdated, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal mengunggah foto profil.", "error");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast(language === "en" ? "Name cannot be empty." : "Nama tidak boleh kosong.", "error");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          phone: editPhone,
          organization: editOrg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil.");

      setUser(data.user);
      showToast(p.editSuccess, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan perubahan.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Capstone Submission
  const handleUploadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !subTitle || !subFileUrl) {
      showToast("Lengkapi form pengumpulan tugas.", "error");
      return;
    }

    try {
      setSubmittingTask(true);
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
        showToast("Tugas capstone berhasil dikirim untuk review!", "success");
        fetchProfile();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal mengumpulkan tugas.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan sistem saat mengirim tugas.", "error");
    } finally {
      setSubmittingTask(false);
    }
  };

  // Copy Certificate Verification Link
  const handleCopyCertLink = (cert: Certificate) => {
    const url = `${window.location.origin}/verify-certificate?id=${cert.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast(p.linkCopied, "success");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return <ProfileLoading />;
  }

  const isProfileIncomplete = user && (!user.phone || !user.organization);
  const pendingTransactions = transactions.filter((t) => t.status === "PENDING");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0C0E12] text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-amber-500/20 transition-colors duration-200">
      {/* Navbar with solid background */}
      <Navbar solidBg={true} />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold ${
            toastMsg.type === "success"
              ? "bg-emerald-50 dark:bg-[#14231E] border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/90 border border-rose-500/30 dark:border-rose-500/40 text-rose-800 dark:text-rose-200"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Banner 1: Lengkapi Profil Mahasiswa jika belum lengkap */}
        {isProfileIncomplete && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {p.completeProfileTitle}
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed max-w-3xl">
                  {p.completeProfileDesc}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("edit")}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-2xl transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
            >
              {p.completeProfileBtn}
            </button>
          </div>
        )}

        {/* Banner 2: Pembayaran Sedang Diverifikasi jika ada transaksi PENDING */}
        {pendingTransactions.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-blue-500/10 border border-blue-500/25 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  {p.pendingPaymentTitle}
                </h4>
                <p className="text-xs text-blue-800/90 dark:text-blue-200/80 leading-relaxed max-w-3xl">
                  {p.pendingPaymentDesc.replace("{count}", String(pendingTransactions.length))}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("transactions")}
              className="px-5 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-2xl border border-blue-500/30 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {p.checkStatusBtn}
            </button>
          </div>
        )}

        {/* Profile Hero Header Card */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#12151B] shadow-xs dark:shadow-2xl transition-colors">
          {/* Ambient Banner Cover */}
          <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-zinc-100 via-zinc-200/60 to-amber-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-black relative overflow-hidden">
            {/* Grid Blueprint Lines Overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(120,120,120,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,0.15) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider text-zinc-800 dark:text-white border border-zinc-200 dark:border-white/15 shadow-2xs">
                {p.badge}
              </span>
            </div>
          </div>

          {/* Profile Card Body */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              {/* Avatar with Camera Overlay */}
              <div className="relative group shrink-0 self-start sm:self-auto">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-white dark:ring-[#12151B] shadow-lg dark:shadow-2xl bg-zinc-100 dark:bg-[#191D24] relative flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "Student"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 dark:bg-[#181B22] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                      <User className="w-14 h-14 sm:w-18 sm:h-18 stroke-[1.25]" />
                    </div>
                  )}
                  {/* Uploading Spinner Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-2">
                      <Loader2 className="w-6 h-6 text-white animate-spin mb-1" />
                      <span className="text-[10px] text-gray-300 font-medium">{p.uploadingPhoto}</span>
                    </div>
                  )}
                </div>

                {/* Camera Button to Change Avatar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-white hover:bg-zinc-100 text-black shadow-md transition-all active:scale-95 border-2 border-white dark:border-[#12151B] group/btn cursor-pointer"
                  title={p.changeAvatar}
                >
                  <Camera className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Action Buttons Top Right */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                    activeTab === "edit"
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-200 dark:border-white/10"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{p.tabEdit}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{p.logout}</span>
                </button>
              </div>
            </div>

            {/* User Meta Info */}
            <div className="mt-5 space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
                  <span>{user?.name}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{p.verifiedBadge}</span>
                  </span>
                </h1>
                {Boolean(
                  user?.bio && 
                  !user.bio.includes("Mahasiswa / Pembelajar Digital Construction") && 
                  !user.bio.includes("Student of BIMCourse") && 
                  !user.bio.includes("Mahasiswa / Profesional pembelajar") &&
                  !user.bio.includes("Pengguna terdaftar")
                ) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
                    {user?.bio}
                  </p>
                )}
              </div>

              {/* Sub-meta chips */}
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{user?.email}</span>
                </div>
                {Boolean(
                  user?.organization && 
                  user.organization !== "Google Account" && 
                  user.organization !== "Mahasiswa / Profesional Mandiri"
                ) && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{user?.organization}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-white" />
                    <span className="text-gray-800 dark:text-white font-mono">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {p.memberSince}{" "}
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                      language === "en" ? "en-US" : "id-ID",
                      { month: "short", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="border-t border-zinc-200 dark:border-white/10 px-6 sm:px-10 flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none bg-zinc-50/70 dark:bg-[#0F1115]/60">
            <button
              onClick={() => setActiveTab("courses")}
              className={`py-4 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === "courses"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{p.tabCourses}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200/80 dark:bg-white/10 text-zinc-700 dark:text-gray-300">
                {enrollments.length}
              </span>
              {activeTab === "courses" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`py-4 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === "certificates"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{p.tabCertificates}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-white border border-emerald-500/30 dark:border-white/20">
                {certificates.length}
              </span>
              {activeTab === "certificates" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("assignments")}
              className={`py-4 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === "assignments"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{p.tabAssignments}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200/80 dark:bg-white/10 text-zinc-700 dark:text-gray-300">
                {submissions.length}
              </span>
              {activeTab === "assignments" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-4 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === "transactions"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{p.tabTransactions}</span>
              {pendingTransactions.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                  {pendingTransactions.length} {p.pendingBadge}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200/80 dark:bg-white/10 text-zinc-700 dark:text-gray-300">
                  {transactions.length}
                </span>
              )}
              {activeTab === "transactions" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`py-4 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === "edit"
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{p.tabEdit}</span>
              {isProfileIncomplete && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              {activeTab === "edit" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Kelas Diikuti */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2.5">
                  <span>{p.tabCourses}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white border border-zinc-200 dark:border-transparent">
                    {enrollments.length} {p.classesCount}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {language === "en"
                    ? "Access comprehensive video syllabus, practical exercise files, and continuous evaluations with practicing mentors."
                    : "Akses silabus video lengkap, file modul latihan, dan evaluasi berkala bersama instruktur praktisi."}
                </p>
              </div>

              <Link
                href="/#courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-bold transition-all border border-zinc-800 dark:border-white/10 shadow-xs self-start sm:self-auto shrink-0"
              >
                <span>+ {p.exploreCourses}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-[#12151B] border border-zinc-200 dark:border-white/10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-400 dark:text-gray-500 shadow-2xs">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">{p.noCourses}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    {language === "en"
                      ? "Start your BIM certification journey now by selecting a specialization course program."
                      : "Mulai perjalanan sertifikasi BIM Anda sekarang dengan memilih program kursus spesialisasi."}
                  </p>
                </div>
                <Link
                  href="/#courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md"
                >
                  <span>{p.exploreCourses}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((en) => {
                  const isCompleted = en.progress >= 100 || en.status === "COMPLETED";
                  return (
                    <div
                      key={en.id}
                      className="rounded-3xl bg-white dark:bg-[#14171E] border border-zinc-200 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl dark:shadow-xl group"
                    >
                      <div>
                        {/* Course Thumbnail */}
                        <div className="relative h-44 w-full overflow-hidden bg-black/40">
                          <img
                            src={en.course.thumbnail}
                            alt={en.course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#14171E] via-transparent to-black/30" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                              {en.course.category}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold backdrop-blur-md border ${
                                isCompleted
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {isCompleted ? p.completedBadge : p.inProgressBadge}
                            </span>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="p-5 space-y-4">
                          <div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">
                              Level {en.course.level} • {en.course.durationHours} Jam Materi
                            </span>
                            <h3 className="text-base font-bold text-gray-950 dark:text-white mt-1 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {en.course.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                              <span>Instruktur:</span>
                              <span className="text-gray-800 dark:text-gray-300 font-medium">{en.course.instructor.name}</span>
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">{p.progressLabel}</span>
                              <span className={`font-mono font-bold ${isCompleted ? "text-emerald-600 dark:text-white" : "text-gray-900 dark:text-zinc-300"}`}>
                                {Math.round(en.progress)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isCompleted
                                    ? "bg-emerald-500 dark:bg-white"
                                    : "bg-gradient-to-r from-amber-400 to-yellow-500"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, en.progress))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom CTA */}
                      <div className="p-5 pt-0 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                          {en.course.modules?.length || 5} {p.modulesCount}
                        </span>

                        <Link
                          href={`/courses/${en.course.slug}/learn`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                          <span>{p.continueLearning}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Cek Sertifikat */}
        {activeTab === "certificates" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <span>{p.tabCertificates}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {certificates.length} {p.certificatesCount}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {p.certSubTitle}
                </p>
              </div>
            </div>

            {certificates.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-[#12151B] border border-zinc-200 dark:border-white/10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-2xs">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">{p.noCertificatesTitle}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    {p.noCertificatesDesc}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("courses")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-bold transition-all border border-zinc-200 dark:border-white/10"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{p.viewActiveCourses}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-6 rounded-3xl bg-zinc-50 dark:bg-gradient-to-br dark:from-[#161922] dark:via-[#13161C] dark:to-[#1C1814] border border-zinc-200 dark:border-white/15 shadow-xs dark:shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-400/60 dark:hover:border-white/40 transition-all"
                  >
                    {/* Architectural corner watermark */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      <Award className="w-32 h-32 text-zinc-300 dark:text-zinc-700" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-700 dark:text-white border border-emerald-500/25 dark:border-white/20 text-[11px] font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-white" />
                          <span>{p.verifiedBadge}</span>
                        </span>

                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                          ID: <span className="text-gray-900 dark:text-white font-bold">{cert.id}</span>
                        </span>
                      </div>

                      {/* Course Title */}
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                          {cert.category}
                        </span>
                        <h3 className="text-lg font-black text-gray-950 dark:text-white mt-0.5 leading-snug">
                          {cert.courseTitle}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {language === "en" ? "Recipient" : "Penerima"}: <strong className="text-gray-950 dark:text-white">{cert.studentName}</strong> • {language === "en" ? "Grade" : "Nilai"}:{" "}
                          <span className="text-amber-600 dark:text-amber-300 font-bold font-mono">{cert.grade}</span>
                        </p>
                      </div>

                      {/* Competency tags */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase block">
                          {p.standards}
                        </span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          {cert.standards}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3 relative z-10">
                      <button
                        onClick={() => handleCopyCertLink(cert)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 text-gray-700 border-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10 text-xs font-semibold transition-all border cursor-pointer"
                        title={p.copyLink}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{p.copyLink}</span>
                      </button>

                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{p.viewCertificate}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tugas Portofolio & Capstone */}
        {activeTab === "assignments" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-gray-950 dark:text-white" />
                  <span>{p.tabAssignments}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-gray-300 border border-zinc-200 dark:border-transparent">
                    {submissions.length} {language === "en" ? "Tasks" : "Tugas"}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {language === "en"
                    ? "Submit your BIM LOD 300 model files, Navisworks clash matrix, or BoQ calculations for direct evaluation by instructors."
                    : "Kumpulkan file pemodelan BIM LOD 300, Navisworks clash matrix, atau kalkulasi BoQ untuk evaluasi langsung oleh instruktur."}
                </p>
              </div>

              <button
                onClick={() => setSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md active:scale-95 self-start sm:self-auto shrink-0 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{p.uploadTaskBtn}</span>
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-[#12151B] border border-zinc-200 dark:border-white/10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-400 dark:text-gray-500 shadow-2xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">{p.noSubmissions}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    {language === "en"
                      ? "Submit your Google Drive or Autodesk Construction Cloud project file links to get detailed reviews from industry practitioners."
                      : "Kirim link file project Google Drive / Autodesk Construction Cloud Anda untuk mendapatkan review mendalam dari praktisi industri."}
                  </p>
                </div>
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{p.uploadTaskBtn}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#14171E] border border-zinc-200 dark:border-white/10 space-y-4 shadow-xs dark:shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                          {sub.course.title}
                        </span>
                        <h3 className="text-base font-bold text-gray-950 dark:text-white mt-0.5">{sub.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-mono text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-white dark:hover:text-zinc-300 underline font-medium"
                          >
                            <span>{language === "en" ? "Project File Link" : "Link File Proyek"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <div>
                        {sub.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:bg-zinc-800 dark:text-zinc-300 border border-amber-500/25 dark:border-zinc-700 text-xs font-mono font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{p.statusPending}</span>
                          </span>
                        )}
                        {sub.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-white dark:text-black border border-emerald-500/30 dark:border-white text-xs font-mono font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {p.statusApproved} • {sub.grade}/100
                            </span>
                          </span>
                        )}
                        {sub.status === "REVISION" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>
                              {p.statusRevision} • {sub.grade}/100
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {sub.feedback && (
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        <span className="font-bold text-gray-950 dark:text-white text-[11px] block">
                          {p.feedbackTitle}
                        </span>
                        <p className="italic leading-relaxed text-gray-700 dark:text-gray-300">{sub.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Transaksi & Pembayaran */}
        {activeTab === "transactions" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-gray-950 dark:text-white" />
                  <span>{p.transactionsTitle}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white border border-zinc-200 dark:border-transparent">
                    {transactions.length} {p.ordersCount}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {p.transactionsDesc}
                </p>
              </div>

              <Link
                href="/#courses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-bold transition-all border border-zinc-800 dark:border-white/10 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <span>{p.exploreMoreCourses}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-[#12151B] border border-zinc-200 dark:border-white/10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-400 dark:text-gray-500 shadow-2xs">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">{p.noTransactions}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    {p.noTransactionsDesc}
                  </p>
                </div>
                <Link
                  href="/#courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md"
                >
                  <span>{p.openCatalog}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#14171E] border border-zinc-200 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs dark:shadow-none"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-start sm:items-center gap-4">
                      <img
                        src={tx.course.thumbnail}
                        alt={tx.course.title}
                        className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl object-cover ring-1 ring-zinc-200 dark:ring-white/10 shrink-0"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-gray-300 border border-zinc-200 dark:border-transparent">
                            {tx.course.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-gray-400 border border-zinc-200 dark:border-transparent">
                            {tx.paymentMethod}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-950 dark:text-white leading-snug">
                          {tx.course.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {p.timeLabel}: {new Date(tx.createdAt).toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })} {language === "en" ? "WIB" : "WIB"}
                        </p>
                        {tx.senderName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.senderLabel}: <span className="text-gray-800 dark:text-gray-200 font-medium">{tx.senderName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount, Status & Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-200 dark:border-white/10">
                      <div className="text-left md:text-right">
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{p.transferAmount}</div>
                        <div className="text-lg font-black text-gray-950 dark:text-white font-mono">
                          Rp {tx.amount.toLocaleString("id-ID")}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {tx.status === "PENDING" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{p.statusPendingAdmin}</span>
                          </div>
                        )}
                        {tx.status === "APPROVED" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{p.statusApprovedActive}</span>
                          </div>
                        )}
                        {tx.status === "REJECTED" && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{p.statusRejected}</span>
                          </div>
                        )}
                      </div>

                      {/* Rejection Note */}
                      {tx.status === "REJECTED" && tx.rejectionReason && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-300 max-w-xs text-left md:text-right italic">
                          {language === "en" ? "Reason: " : "Alasan: "}{tx.rejectionReason}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        {tx.proofUrl && (
                          <button
                            onClick={() => setPreviewProofUrl(tx.proofUrl)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-medium border dark:border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === "en" ? "View Proof" : "Lihat Bukti"}</span>
                          </button>
                        )}

                        {tx.status === "APPROVED" && (
                          <Link
                            href={`/courses/${tx.course.slug}`}
                            className="px-4 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <span>{language === "en" ? "Open Course" : "Buka Modul"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Edit Profil */}
        {activeTab === "edit" && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-[#14171E] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 shadow-xs dark:shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-gray-950 dark:text-white" />
                <span>{p.tabEdit}</span>
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {p.editSubtitle}
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo preview and quick change button */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || "Student"}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/10 dark:ring-white/30 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                    <User className="w-7 h-7 stroke-[1.5]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white">{p.changeAvatar}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{p.photoFormatHint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-semibold transition-all border dark:border-white/10 shrink-0 cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    p.changeAvatar
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {p.fullName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {p.emailLabel}
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                  {p.emailCannotChange}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {p.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 8..."
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {p.orgLabel}
                  </label>
                  <input
                    type="text"
                    value={editOrg}
                    onChange={(e) => setEditOrg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {p.bioLabel}
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("courses")}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white cursor-pointer"
                >
                  {p.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{p.savingBtn}</span>
                    </>
                  ) : (
                    <span>{p.saveBtn}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Official Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-[#0F1115] border border-zinc-200 dark:border-white/20 rounded-3xl p-6 sm:p-8 text-gray-900 dark:text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-950 dark:text-white" />
                <h3 className="text-base font-bold text-gray-950 dark:text-white">{p.verifiedCertificate}</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Landscape Certificate Paper */}
            <div
              id="certificate-paper"
              className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-50/20 via-white to-zinc-50 dark:from-[#1C1F26] dark:to-[#12141A] border-4 border-amber-600/30 dark:border-zinc-700 shadow-2xl text-center space-y-6 print:border-black print:text-black print:bg-white text-gray-900 dark:text-white"
            >
              {/* Inner Decorative Border */}
              <div className="absolute inset-3 border border-amber-500/20 dark:border-zinc-800 rounded-2xl pointer-events-none" />

              {/* Certificate Header */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center p-2 border border-black/10 dark:border-white/20 shadow-inner">
                  <Image
                    src="/logo.png"
                    alt="BIMCourse Logo"
                    width={36}
                    height={36}
                    className="object-contain dark:invert"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-widest text-gray-950 dark:text-white uppercase font-mono">
                  BIMCOURSE ACADEMY
                </h2>
                <span className="text-[10px] tracking-widest text-gray-500 dark:text-gray-400 uppercase font-mono">
                  Center for Building Information Modeling &amp; Architectural Engineering Excellence
                </span>
              </div>

              {/* Certificate Main Title */}
              <div className="py-2">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono tracking-wider block uppercase">
                  {language === "en" ? "OFFICIAL COMPETENCY CERTIFICATE" : "SERTIFIKAT KOMPETENSI RESMI"}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  {language === "en" ? "Proudly presented to:" : "Diberikan dengan bangga kepada:"}
                </p>
                <h1 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white mt-2 tracking-tight uppercase border-b-2 border-black/30 dark:border-white/40 inline-block px-8 pb-2">
                  {selectedCert.studentName}
                </h1>
              </div>

              {/* Certificate Description */}
              <div className="max-w-xl mx-auto space-y-2">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === "en"
                    ? "Has successfully completed the industry-standard curriculum and passed the capstone modeling evaluation in the specialization program:"
                    : "Telah berhasil menyelesaikan kurikulum berstandar industri dan lulus evaluasi proyek pemodelan capstone pada program spesialisasi:"}
                </p>
                <h4 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
                  {selectedCert.courseTitle}
                </h4>
                <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  {selectedCert.standards}
                </p>
              </div>

              {/* Signatures & Seal Section */}
              <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-zinc-200 dark:border-white/10 text-xs">
                {/* Left: Lead Instructor */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-gray-800 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1 mx-auto max-w-[160px]">
                    {selectedCert.instructorName}
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono block">
                    {language === "en" ? "Professional BIM Instructor" : "Instruktur BIM Profesional"}
                  </span>
                </div>

                {/* Center: Official Golden Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/60 dark:border-white/60 flex items-center justify-center p-1 bg-amber-50/50 dark:bg-white/10 shadow-inner">
                    <div className="w-13 h-13 rounded-full bg-amber-400 text-black dark:bg-white dark:text-black flex flex-col items-center justify-center text-[8px] font-bold tracking-tighter shadow-xs">
                      <span>OFFICIAL</span>
                      <span>VERIFIED</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-gray-700 dark:text-white mt-1">
                    ID: {selectedCert.id}
                  </span>
                </div>

                {/* Right: Academic Director */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-gray-800 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-1 mx-auto max-w-[160px]">
                    Dr. Ir. Hendra Gunawan, M.T.
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono block">
                    Head of Academic Board
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleCopyCertLink(selectedCert)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 border dark:border-white/10 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? p.linkCopied : p.copyLink}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2.5 rounded-xl text-xs text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white cursor-pointer"
                >
                  {p.close}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{p.downloadPdf}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Upload Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#161920] border border-zinc-200 dark:border-white/15 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-950 dark:text-white" />
                <span>{language === "en" ? "Submit BIM Portfolio / Capstone Project" : "Kumpul Tugas Portofolio / Capstone BIM"}</span>
              </h3>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {language === "en"
                ? "Submit your cloud model file (.rvt, .nwd, or Google Drive / OneDrive link) for mentor evaluation."
                : "Kirim link file cloud model Revit (.rvt), Navisworks (.nwd), atau link Google Drive/OneDrive Anda untuk evaluasi mentor."}
            </p>

            <form onSubmit={handleUploadSubmission} className="space-y-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "en" ? "Select Course" : "Pilih Kelas"}
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#191D24] border border-zinc-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white"
                >
                  {enrollments.map((en) => (
                    <option key={en.course.id} value={en.course.id}>
                      {en.course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "en" ? "Portfolio / Task Title" : "Judul Portofolio / Tugas"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "en" ? "5-Story Building LOD 300 & BoQ Schedule" : "Pemodelan Gedung 5 Lantai LOD 300 & Schedule BoQ"}
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "en" ? "Cloud File URL (.rvt / .nwd / Drive / BIM 360)" : "URL File Cloud (.rvt / .nwd / Drive / BIM 360)"}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={subFileUrl}
                  onChange={(e) => setSubFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {language === "en" ? "Notes for Mentor (Optional)" : "Catatan untuk Mentor (Opsional)"}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === "en" ? "Describe modeling challenges or specific sections you want reviewed..." : "Ceritakan tantangan pemodelan atau bagian spesifik yang ingin di-review..."}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white cursor-pointer"
                >
                  {p.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingTask ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{p.savingBtn}</span>
                    </>
                  ) : (
                    <span>{language === "en" ? "Submit Project" : "Kirim Tugas"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Transfer Lightbox Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-white dark:bg-[#12151B] border border-zinc-200 dark:border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>{language === "en" ? "Proof of Transfer / Payment" : "Bukti Transfer Pembayaran"}</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  title={language === "en" ? "Open Original Image in New Tab" : "Buka Gambar Asli di Tab Baru"}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewProofUrl(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-black/60 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewProofUrl}
                alt={language === "en" ? "Payment Proof" : "Bukti Transfer"}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {p.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}
