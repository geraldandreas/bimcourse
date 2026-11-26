"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Users,
  User,
  Award,
  ShieldCheck,
  UserPlus,
  Trash2,
  Search,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Clock,
  BarChart3,
  FlaskConical,
  MonitorPlay,
  Lock,
  Unlock,
  ExternalLink,
  Plus,
  Edit3,
  Eye,
  Layers,
  ChevronDown,
  ChevronRight,
  Globe,
  X,
  Play,
  Upload,
  FileText,
  Paperclip,
  Download,
  CreditCard,
  Check,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Mail,
  BookOpenCheck,

} from "lucide-react";
import WebContentManager from "@/components/dashboard/WebContentManager";
import CurriculumEditor from "@/components/dashboard/CurriculumEditor";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import NewsletterLeadsManager from "@/components/dashboard/NewsletterLeadsManager";
import { QuizSubmissionReviewSheet, parseQuizNotes } from "@/components/dashboard/QuizSubmissionReviewSheet";
import QuizReviewPanel from "@/components/dashboard/QuizReviewPanel";
import CertificateManagerPanel from "@/components/dashboard/CertificateManagerPanel";
import { CurriculumResource } from "@/data/bimDocCurriculum";

interface TransactionItem {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  paymentMethod: string;
  proofUrl: string | null;
  senderName: string | null;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedById: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    phone: string | null;
    organization: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    price: number;
    category: string;
    level: string;
  };
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  organization: string | null;
  phone: string | null;
  createdAt: string;
  _count: {
    enrollments: number;
    taughtCourses: number;
    submissions: number;
  };
}

interface LessonInput {
  title: string;
  duration: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  isFree: boolean;
}

interface ModuleInput {
  title: string;
  duration: string;
  lessons: LessonInput[];
}

interface CourseItem {
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
  };
  modules: {
    id: string;
    title: string;
    duration: string;
    lessons: { id: string; title: string; duration: string; isFree: boolean; videoUrl?: string; fileUrl?: string; fileName?: string }[];
  }[];
  _count: {
    enrollments: number;
    submissions: number;
  };
}

const parseKeyLearnings = (val: any): string[] => {
  if (!val) {
    return [
      "Standar pemodelan 3D arsitektur & struktur LOD 300 - 400",
      "Ekstraksi data BoQ & scheduling material otomatis tanpa manual kalkulasi",
      "Penerapan Common Data Environment (CDE) dan BEP tender BUMN",
      "Penyusunan portofolio capstone siap kerja dengan review mentor",
    ];
  }
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return String(val).split("\n").filter((l) => l.trim().length > 0);
};

const parseBenefits = (val: any): { title: string; description: string }[] => {
  if (!val) {
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
  }
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return [];
};

export interface SuperAdminSubmissionItem {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  courseId: string;
  course: { id: string; title: string };
  title: string;
  fileUrl: string;
  notes?: string | null;
  grade?: number | null;
  feedback?: string | null;
  status: "PENDING" | "APPROVED" | "REVISION" | string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"courses" | "curriculum" | "users" | "content" | "payments" | "submissions" | "quiz-review" | "certificates" | "newsletter">("courses");
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [submissions, setSubmissions] = useState<SuperAdminSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Search & Filters
  const [courseSearch, setCourseSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Submissions filter & evaluation modal
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("ALL");
  const [evalModalSub, setEvalModalSub] = useState<SuperAdminSubmissionItem | null>(null);
  const [evalGrade, setEvalGrade] = useState<number>(85);
  const [evalFeedback, setEvalFeedback] = useState("");
  const [evalStatus, setEvalStatus] = useState<"APPROVED" | "REVISION" | "PENDING">("APPROVED");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Payment Verification Filters & Modals
  const [txStatusFilter, setTxStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [txSearch, setTxSearch] = useState("");
  const [verifyingTxId, setVerifyingTxId] = useState<string | null>(null);
  const [rejectModalTx, setRejectModalTx] = useState<TransactionItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Modals
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // User form state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "pengajar",
    organization: "",
  });

  // Course Builder Form State (4 tabs)
  const [courseFormTab, setCourseFormTab] = useState<"details" | "instructor" | "learning" | "curriculum">("details");
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    category: "BIM Modeling",
    level: "Intermediate",
    isFree: false,
    price: 499000,
    originalPrice: 1250000,
    durationHours: 24,
    labsCount: 12,
    learningMode: "Self-Paced Online",
    language: "Bahasa Indonesia",
    summary: "",
    overview: "",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    badge: "Course",
    published: true,
    attachmentUrl: "",
    attachmentName: "",
    attachmentDescription: "",
    hasInstructorLed: false,
    instructorName: "Ir. Rian Wicaksono, M.T.",
    instructorTitle: "Lead BIM Specialist • PT Wijaya Karya (Persero) Tbk",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    keyLearnings: [
      "Standar pemodelan 3D arsitektur & struktur LOD 300 - 400",
      "Ekstraksi data BoQ & scheduling material otomatis tanpa manual kalkulasi",
      "Penerapan Common Data Environment (CDE) dan BEP tender BUMN",
      "Penyusunan portofolio capstone siap kerja dengan review mentor",
    ],
    benefits: [
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
    ],
  });

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadingInstructorAvatar, setUploadingInstructorAvatar] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const attachmentFileRef = useRef<HTMLInputElement>(null);
  const instructorAvatarFileRef = useRef<HTMLInputElement>(null);

  const [modulesInput, setModulesInput] = useState<ModuleInput[]>([
    {
      title: "Bab 1: Pengenalan & Setup Parameter Proyek",
      duration: "2 Jam",
      lessons: [
        { title: "Filosofi BIM & Mandat PUPR", duration: "20 Menit", isFree: true },
        { title: "Setup Project Template & Levels", duration: "25 Menit", isFree: false },
      ],
    },
  ]);

  const [resourcesInput, setResourcesInput] = useState<CurriculumResource[]>([]);
  const [uploadingResourceIdx, setUploadingResourceIdx] = useState<number | null>(null);
  const resourceFileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTargetIdx, setCurrentUploadTargetIdx] = useState<number | null>(null);

  const handleAddResourceRow = () => {
    setResourcesInput((prev) => [
      ...prev,
      {
        id: `res-${Date.now()}`,
        title: "",
        description: "",
        fileType: "PDF Document",
        fileSize: "Online",
        url: "",
        isExternal: false,
      },
    ]);
  };

  const handleRemoveResourceRow = (index: number) => {
    setResourcesInput((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateResourceRow = (index: number, patch: Partial<CurriculumResource>) => {
    setResourcesInput((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };

  const handleUploadResourceFile = async (index: number, file: File) => {
    setUploadingResourceIdx(index);
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
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      const detectedType =
        ext === "RTE"
          ? "Revit Template (.RTE)"
          : ext === "RVT"
          ? "Revit Model (.RVT)"
          : ext === "DWG"
          ? "CAD Drawing (.DWG)"
          : ext === "PDF"
          ? "PDF Document"
          : `${ext} File`;

      handleUpdateResourceRow(index, {
        url: data.url,
        fileSize: `${sizeMb} MB`,
        fileType: detectedType,
        title: resourcesInput[index]?.title || file.name.replace(/\.[^/.]+$/, ""),
        isExternal: false,
      });
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file dokumen acuan.");
    } finally {
      setUploadingResourceIdx(null);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, coursesRes, txRes, subsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/users"),
        fetch("/api/courses"),
        fetch("/api/transactions"),
        fetch("/api/submissions"),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403 || usersRes.status === 401 || usersRes.status === 403) {
        window.location.href = "/profile";
        return;
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const txData = await txRes.json();
      const subsData = subsRes.ok ? await subsRes.json() : { submissions: [] };

      setStats(statsData.metrics);
      setUsers(usersData.users || []);
      setCourses(coursesData.courses || []);
      setTransactions(txData.transactions || []);
      setSubmissions(subsData.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvaluate = (sub: SuperAdminSubmissionItem) => {
    setEvalModalSub(sub);
    const quiz = parseQuizNotes(sub.notes);
    const initialGrade =
      sub.grade !== null && sub.grade !== undefined
        ? sub.grade
        : quiz?.mcScore !== undefined
        ? quiz.mcScore
        : 85;
    setEvalGrade(initialGrade);
    setEvalFeedback(sub.feedback || "");
    setEvalStatus((sub.status as any) || "APPROVED");
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalModalSub) return;
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: evalModalSub.id,
          grade: Number(evalGrade),
          feedback: evalFeedback,
          status: evalStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menilai tugas.");

      showToast(`Tugas siswa ${evalModalSub.user.name} berhasil dinilai (${evalStatus}).`);
      setEvalModalSub(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal menilai tugas: " + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveTransaction = async (tx: TransactionItem) => {
    if (
      !confirm(
        `Setujui pembayaran kelas "${tx.course.title}" untuk siswa ${tx.user.name}? Siswa akan langsung terdaftar di kelas dan modul materi aktif.`
      )
    ) {
      return;
    }
    try {
      setVerifyingTxId(tx.id);
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyetujui transaksi.");

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === tx.id
            ? { ...item, status: "APPROVED", verifiedAt: new Date().toISOString() }
            : item
        )
      );
      showToast(data.message || `Pembayaran untuk "${tx.course.title}" berhasil disetujui!`);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memverifikasi pembayaran.");
    } finally {
      setVerifyingTxId(null);
    }
  };

  const handleRejectTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTx) return;
    if (!rejectionReasonInput.trim()) {
      alert("Harap masukkan alasan penolakan pembayaran.");
      return;
    }
    try {
      setVerifyingTxId(rejectModalTx.id);
      const res = await fetch(`/api/transactions/${rejectModalTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason: rejectionReasonInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menolak transaksi.");

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === rejectModalTx.id
            ? { ...item, status: "REJECTED", rejectionReason: rejectionReasonInput.trim() }
            : item
        )
      );
      showToast(`Pembayaran kelas "${rejectModalTx.course.title}" telah ditolak.`);
      setRejectModalTx(null);
      setRejectionReasonInput("");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses penolakan.");
    } finally {
      setVerifyingTxId(null);
    }
  };

  const showToast = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleUploadFile = async (
    file: File,
    onSuccess: (data: { url: string; filename: string }) => void,
    setLoadingState?: (loading: boolean) => void
  ) => {
    if (!file) return;
    try {
      if (setLoadingState) setLoadingState(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah file.");

      onSuccess({ url: data.url, filename: data.filename });
      showToast(`File "${data.filename}" berhasil diunggah!`);
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file.");
    } finally {
      if (setLoadingState) setLoadingState(false);
    }
  };

  // --- COURSE ACTIONS ---
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseFormTab("details");
    setCourseForm({
      title: "",
      slug: "",
      category: "BIM Modeling",
      level: "Intermediate",
      isFree: false,
      price: 499000,
      originalPrice: 1250000,
      durationHours: 24,
      labsCount: 12,
      learningMode: "Self-Paced Online",
      language: "Bahasa Indonesia",
      summary: "",
      overview: "",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      badge: "Course",
      published: true,
      attachmentUrl: "",
      attachmentName: "",
      attachmentDescription: "",
      hasInstructorLed: false,
      instructorName: "Ir. Rian Wicaksono, M.T.",
      instructorTitle: "Lead BIM Specialist • PT Wijaya Karya (Persero) Tbk",
      instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      keyLearnings: [
        "Standar pemodelan 3D arsitektur & struktur LOD 300 - 400",
        "Ekstraksi data BoQ & scheduling material otomatis tanpa manual kalkulasi",
        "Penerapan Common Data Environment (CDE) dan BEP tender BUMN",
        "Penyusunan portofolio capstone siap kerja dengan review mentor",
      ],
      benefits: [
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
      ],
    });
    setModulesInput([
      {
        title: "Bab 1: Pengenalan & Setup Parameter Proyek",
        duration: "2 Jam",
        lessons: [
          { title: "Filosofi BIM & Mandat PUPR", duration: "20 Menit", isFree: true, videoUrl: "", fileUrl: "", fileName: "" },
          { title: "Setup Project Template & Levels", duration: "25 Menit", isFree: false, videoUrl: "", fileUrl: "", fileName: "" },
        ],
      },
    ]);
    setResourcesInput([]);
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c: CourseItem) => {
    setEditingCourseId(c.id);
    setCourseFormTab("details");
    setResourcesInput([]);
    setCourseForm({
      title: c.title,
      slug: c.slug,
      category: c.category,
      level: c.level,
      isFree: c.isFree,
      price: c.price,
      originalPrice: c.originalPrice,
      durationHours: c.durationHours || 20,
      labsCount: c.labsCount || 5,
      learningMode: c.learningMode || "Self-Paced Online",
      language: c.language || "Bahasa Indonesia",
      summary: c.summary,
      overview: c.overview || "",
      thumbnail: c.thumbnail,
      badge: c.badge || "Course",
      published: c.published,
      attachmentUrl: c.attachmentUrl || "",
      attachmentName: c.attachmentName || "",
      attachmentDescription: c.attachmentDescription || "",
      hasInstructorLed: Boolean(c.hasInstructorLed),
      instructorName: c.instructorName || c.instructor?.name || "Ir. Rian Wicaksono, M.T.",
      instructorTitle: c.instructorTitle || (c.instructor as any)?.organization || "Lead BIM Specialist",
      instructorAvatar: c.instructorAvatar || c.instructor?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      keyLearnings: parseKeyLearnings(c.keyLearnings),
      benefits: parseBenefits(c.benefits),
    });
    // Transform existing modules
    if (c.modules && c.modules.length > 0) {
      setModulesInput(
        c.modules.map((m) => ({
          title: m.title,
          duration: m.duration,
          lessons: (m.lessons || []).map((l) => ({
            title: l.title,
            duration: l.duration,
            isFree: l.isFree,
            videoUrl: l.videoUrl || "",
            fileUrl: l.fileUrl || "",
            fileName: l.fileName || "",
          })),
        }))
      );
    } else {
      setModulesInput([]);
    }

    // Preload custom resources/dokumen acuan for this course
    if (c.slug) {
      fetch(`/api/curriculum/${c.slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.resources)) {
            setResourcesInput(data.resources);
          }
        })
        .catch(() => {});
    }

    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = "/api/courses";
      const method = editingCourseId ? "PUT" : "POST";
      const payload = {
        ...(editingCourseId ? { id: editingCourseId } : {}),
        ...courseForm,
        modules: modulesInput,
        resources: resourcesInput,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kursus");

      setCourseModalOpen(false);
      showToast(editingCourseId ? "Modul kursus berhasil diperbarui!" : "Modul kursus berhasil dibuat!");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kursus");
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: courseId, published: !currentStatus }),
      });
      if (res.ok) {
        showToast(!currentStatus ? "Modul berhasil dipublikasikan ke Katalog!" : "Modul dialihkan menjadi Draft.");
        await fetchData();
      }
    } catch {
      showToast("Gagal mengubah status publikasi.");
    }
  };

  const handleViewInCatalog = async (c: CourseItem) => {
    if (!c.published) {
      const confirmPub = confirm(
        `Modul "${c.title}" saat ini masih berstatus DRAFT (belum tampil di katalog publik).\n\nApakah Anda ingin menerbitkannya (Live) sekarang agar modul ini bisa langsung dilihat di katalog?`
      );
      if (confirmPub) {
        await handleTogglePublish(c.id, false);
      }
    }
    window.open(`/#course-${c.slug}`, "_blank");
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Hapus modul kursus "${title}" secara permanen?`)) return;
    try {
      const res = await fetch(`/api/courses?id=${courseId}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Kursus "${title}" berhasil dihapus.`);
        fetchData();
      }
    } catch {
      showToast("Gagal menghapus kursus.");
    }
  };

  // Curriculum dynamic builders
  const addModuleRow = () => {
    setModulesInput([
      ...modulesInput,
      {
        title: `Bab ${modulesInput.length + 1}: Pemodelan Lanjutan`,
        duration: "2 Jam",
        lessons: [{ title: "Materi Pengantar", duration: "20 Menit", isFree: false }],
      },
    ]);
  };

  const removeModuleRow = (index: number) => {
    setModulesInput(modulesInput.filter((_, i) => i !== index));
  };

  const addLessonRow = (moduleIndex: number) => {
    const updated = [...modulesInput];
    updated[moduleIndex].lessons.push({
      title: `Pelajaran Baru ${updated[moduleIndex].lessons.length + 1}`,
      duration: "15 Menit",
      isFree: false,
    });
    setModulesInput(updated);
  };

  const removeLessonRow = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modulesInput];
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setModulesInput(updated);
  };

  // --- USER ACTIONS ---
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        showToast("Role pengguna berhasil diperbarui!");
        fetchData();
      }
    } catch {
      showToast("Gagal memperbarui role.");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Yakin ingin menghapus pengguna "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(`Pengguna "${userName}" berhasil dihapus.`);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch {
      showToast("Gagal menghapus pengguna.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAddUserModalOpen(false);
        setUserForm({ name: "", email: "", password: "", role: "pengajar", organization: "" });
        showToast(`User ${data.user.name} berhasil dibuat!`);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch {
      showToast("Gagal membuat user.");
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredCourses = courses.filter((c) => {
    const q = courseSearch.toLowerCase().trim();
    return !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const q = userSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.organization && u.organization.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = txStatusFilter === "ALL" ? true : tx.status === txStatusFilter;
    const q = txSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tx.user.name.toLowerCase().includes(q) ||
      tx.user.email.toLowerCase().includes(q) ||
      tx.course.title.toLowerCase().includes(q) ||
      (tx.senderName && tx.senderName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const filteredSubmissions = submissions.filter((s) => {
    const matchesStatus = submissionStatusFilter === "ALL" ? true : s.status === submissionStatusFilter;
    const q = submissionSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.user.name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.course.title.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <DashboardSkeleton
        title="SuperAdmin Control Hub"
        subtitle="Memuat metrik platform, manajemen pengguna, verifikasi pembayaran, & katalog kursus..."
        roleBadge="SUPERADMIN WORKSPACE"
        cardsCount={4}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-gray-900 dark:bg-purple-950 border border-purple-500 text-white text-xs shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white dark:from-purple-950/60 dark:via-[#181224] dark:to-black/60 border border-purple-200 dark:border-purple-500/20 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-mono font-bold mb-2 border border-purple-200 dark:border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ROOT SUPERADMINISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">SuperAdmin Control Hub</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
            Kelola modul kursus (durasi, hands-on labs, free/berbayar, overview, kurikulum dan file materi) serta hak akses akun platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenAddCourse}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#28A745] hover:bg-[#218838] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Modul Kursus</span>
          </button>
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "courses" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manajemen Modul &amp; Kursus</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-400 font-bold border border-gray-200 dark:border-transparent">
            {courses.length} Modul
          </span>
          {activeTab === "courses" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#28A745] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "curriculum" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Editor Kurikulum &amp; Modul</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/20">
            Interaktif
          </span>
          {activeTab === "curriculum" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Akun &amp; Role RBAC</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-purple-700 dark:text-purple-300 font-bold border border-gray-200 dark:border-transparent">
            {users.length} Akun
          </span>
          {activeTab === "users" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "payments" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span>Verifikasi Pembayaran</span>
          {transactions.filter((t) => t.status === "PENDING").length > 0 ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30 animate-pulse">
              {transactions.filter((t) => t.status === "PENDING").length} Menunggu
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 font-bold border border-gray-200 dark:border-transparent">
              {transactions.length} Total
            </span>
          )}
          {activeTab === "payments" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "content" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Globe className="w-4 h-4 text-[#B27D56]" />
          <span>Manajemen Konten Web (CMS)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B27D56]/15 text-[#B27D56] dark:text-[#E0A97D] font-bold border border-[#B27D56]/30">
            Live
          </span>
          {activeTab === "content" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B27D56] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "submissions" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Award className="w-4 h-4 text-rose-500" />
          <span>Tugas Siswa &amp; Evaluasi</span>
          {submissions.filter((s) => s.status === "PENDING").length > 0 ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/30 animate-pulse">
              {submissions.filter((s) => s.status === "PENDING").length} Menunggu
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 font-bold border border-gray-200 dark:border-transparent">
              {submissions.length} Tugas
            </span>
          )}
          {activeTab === "submissions" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
          )}
        </button>

        {/* Quiz Review Tab */}
        <button
          onClick={() => setActiveTab("quiz-review")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "quiz-review" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <BookOpenCheck className="w-4 h-4 text-amber-500" />
          <span>Review Kuis Siswa</span>
          {activeTab === "quiz-review" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>

        {/* Certificates Tab */}
        <button
          onClick={() => setActiveTab("certificates")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "certificates" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Sertifikat</span>
          {activeTab === "certificates" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("newsletter")}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "newsletter" ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Mail className="w-4 h-4 text-amber-500" />
          <span>Buletin &amp; Leads</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
            Digest
          </span>
          {activeTab === "newsletter" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: COURSES MANAGEMENT */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Modul Kursus</span>
                <BookOpen className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white">{courses.length}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                {courses.filter((c) => c.published).length} Live di Katalog
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Modul Gratis (FREE)</span>
                <Unlock className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {courses.filter((c) => c.isFree).length}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Akses terbuka untuk siswa</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Jam Silabus</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white">
                {courses.reduce((acc, c) => acc + (c.durationHours || 0), 0)} Jam
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Total durasi materi</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Proyek Lab Hands-on</span>
                <FlaskConical className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {courses.reduce((acc, c) => acc + (c.labsCount || 0), 0)} Labs
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">LOD 300-400 capstone</p>
            </div>
          </div>

          {/* Courses List */}
          <div className="rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span>Daftar Modul &amp; Silabus Kursus</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent">
                    {filteredCourses.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Setiap modul memiliki background, pengaturan free/berbayar, durasi jam, tingkat level, overview, kurikulum dan file materi.
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari judul modul, kategori..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="px-3.5 py-1.5 pl-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 w-64"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-4">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover shrink-0 ring-1 ring-gray-200 dark:ring-white/10"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                          {c.category}
                        </span>
                        {c.isFree ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            FREE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                            {formatPrice(c.price)}
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                          {c.durationHours} JAM
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/20">
                          {c.level}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-transparent">
                          {c.labsCount} LABS
                        </span>
                        {c.attachmentUrl && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                            <Paperclip className="w-2.5 h-2.5" />
                            File Proyek Latihan
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-950 dark:text-white leading-snug max-w-xl">
                        {c.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xl">
                        {c.summary}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {c.modules?.length || 0} Bab Silabus • Mode: <span className="text-gray-900 dark:text-gray-200 font-semibold">{c.learningMode}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => handleViewInCatalog(c)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-white/5 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Lihat Tampilan Modul di Katalog Utama"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Lihat di Katalog</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600/60 dark:text-emerald-500/60" />
                    </button>

                    <button
                      onClick={() => handleOpenEditCourse(c)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span>Edit Modul</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("curriculum")}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Buka Editor Kurikulum & Modul Interaktif"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      <span>Kelola Silabus &amp; Topik</span>
                    </button>

                    <button
                      onClick={() => handleTogglePublish(c.id, c.published)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        c.published
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 ring-2 ring-amber-500/20"
                      }`}
                      title={
                        c.published
                          ? "Status: Live di Katalog. Klik untuk jadikan Draft."
                          : "Status: Draft (Tersembunyi dari Siswa). Klik untuk Terbitkan ke Katalog."
                      }
                    >
                      <span className={`w-2 h-2 rounded-full ${c.published ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-amber-500 dark:bg-amber-400"}`} />
                      <span>{c.published ? "Live di Katalog" : "Draft (Klik Publikasi)"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      className="p-2 rounded-xl text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus Modul"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER & ROLE RBAC MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span>Manajemen Akun &amp; Hak Akses Role</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent">
                    {filteredUsers.length} Pengguna
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Ubah role pengguna (superadmin, admin, pengajar, siswa) langsung di sini.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama, email, instansi..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="px-3.5 py-1.5 pl-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
                  {(["all", "superadmin", "admin", "pengajar", "siswa"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                        roleFilter === r
                          ? "bg-purple-600 text-white font-bold shadow-xs"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-transparent uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Instansi</th>
                    <th className="py-3 px-4">Aktivitas</th>
                    <th className="py-3 px-4">Bergabung</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredUsers.map((u) => {
                    const roleBadges: Record<string, string> = {
                      superadmin: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
                      admin: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40",
                      pengajar: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40",
                      siswa: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
                      mahasiswa: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
                    };

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                              }
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-gray-950 dark:text-white">{u.name}</p>
                                {Boolean(u.avatar?.includes("googleusercontent.com")) && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                    </svg>
                                    Google
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                              roleBadges[u.role] || "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white border-gray-200 dark:border-white/20"
                            } bg-white dark:bg-[#191D24]`}
                          >
                            <option value="superadmin">SuperAdmin</option>
                            <option value="admin">Admin</option>
                            <option value="pengajar">Pengajar</option>
                            <option value="siswa">Mahasiswa / Siswa</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {u.organization || <span className="text-gray-400 dark:text-gray-500">-</span>}
                        </td>

                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {u.role === "pengajar" && (
                            <span>{u._count.taughtCourses} Kelas Diajar</span>
                          )}
                          {(u.role === "siswa" || u.role === "mahasiswa") && (
                            <span>{u._count.enrollments} Kelas Diikuti</span>
                          )}
                          {(u.role === "superadmin" || u.role === "admin") && (
                            <span className="text-purple-600 dark:text-purple-300 font-mono">Platform Admin</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEB CONTENT & SECTIONS CMS */}
      {activeTab === "content" && (
        <WebContentManager onShowToast={showToast} />
      )}

      {/* TAB 4: VERIFIKASI PEMBAYARAN KELAS */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Transaksi</span>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white">{transactions.length}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Pendaftaran &amp; Checkout</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Menunggu Verifikasi</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-300">
                {transactions.filter((t) => t.status === "PENDING").length}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1">Perlu dicek admin</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Disetujui (Aktif)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {transactions.filter((t) => t.status === "APPROVED").length}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Akses modul aktif</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Omset Sukses</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white font-mono">
                Rp {transactions
                  .filter((t) => t.status === "APPROVED")
                  .reduce((acc, t) => acc + (t.amount || 0), 0)
                  .toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Pembayaran terverifikasi</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span>Daftar Transaksi Pembayaran Mahasiswa</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent">
                    {filteredTransactions.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Verifikasi bukti transfer bank mahasiswa untuk mengaktifkan akses kurikulum &amp; modul kelas secara instan.
                </p>
              </div>

              {/* Status Filter & Search */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
                  {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTxStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        txStatusFilter === st
                          ? "bg-white dark:bg-white text-gray-950 dark:text-black shadow-xs font-bold"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {st === "ALL"
                        ? "Semua"
                        : st === "PENDING"
                        ? `Menunggu (${transactions.filter((t) => t.status === "PENDING").length})`
                        : st === "APPROVED"
                        ? "Disetujui"
                        : "Ditolak"}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari siswa, email, kursus..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="px-3.5 py-1.5 pl-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 space-y-3">
                <CreditCard className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tidak ada transaksi yang cocok.</p>
                <p className="text-xs text-gray-500">
                  Coba ubah filter status atau kata kunci pencarian Anda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Waktu &amp; Siswa</th>
                      <th className="p-3.5">Kursus &amp; Kategori</th>
                      <th className="p-3.5">Metode &amp; Pengirim</th>
                      <th className="p-3.5">Nominal</th>
                      <th className="p-3.5">Bukti Bayar</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right rounded-r-xl">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        {/* Waktu & Siswa */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                tx.user.avatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  tx.user.name || "Student"
                                )}`
                              }
                              alt={tx.user.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/20 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-950 dark:text-white text-xs">{tx.user.name}</div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{tx.user.email}</div>
                              {tx.user.phone && (
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                  WA: {tx.user.phone}
                                </div>
                              )}
                              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                                {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Kursus & Kategori */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5 max-w-xs">
                            <img
                              src={tx.course.thumbnail}
                              alt={tx.course.title}
                              className="w-12 h-9 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-transparent">
                                {tx.course.category}
                              </span>
                              <div className="font-semibold text-gray-900 dark:text-white truncate text-xs mt-0.5">
                                {tx.course.title}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Metode & Pengirim */}
                        <td className="p-3.5">
                          <span className="font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-[11px] font-semibold border border-gray-200 dark:border-transparent">
                            {tx.paymentMethod}
                          </span>
                          {tx.senderName && (
                            <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                              A/N: <span className="text-gray-900 dark:text-gray-200 font-medium">{tx.senderName}</span>
                            </div>
                          )}
                          {tx.notes && (
                            <div className="text-[10px] text-gray-500 italic truncate max-w-[150px] mt-0.5" title={tx.notes}>
                              Catatan: {tx.notes}
                            </div>
                          )}
                        </td>

                        {/* Nominal */}
                        <td className="p-3.5 font-mono font-bold text-gray-950 dark:text-white text-xs">
                          Rp {tx.amount.toLocaleString("id-ID")}
                        </td>

                        {/* Bukti Bayar */}
                        <td className="p-3.5">
                          {tx.proofUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewProofUrl(tx.proofUrl)}
                              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white text-[11px] font-medium border border-gray-200 dark:border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Bukti</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">Tanpa bukti</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {tx.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>Menunggu</span>
                            </span>
                          )}
                          {tx.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {tx.status === "REJECTED" && (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                <XCircle className="w-3 h-3" />
                                <span>Ditolak</span>
                              </span>
                              {tx.rejectionReason && (
                                <p className="text-[10px] text-rose-600 dark:text-rose-300/80 italic max-w-[130px] truncate" title={tx.rejectionReason}>
                                  {tx.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Aksi Verifikasi */}
                        <td className="p-3.5 text-right">
                          {tx.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                disabled={verifyingTxId === tx.id}
                                onClick={() => handleApproveTransaction(tx)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                title="Setujui pembayaran dan aktifkan kelas untuk siswa"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                              <button
                                type="button"
                                disabled={verifyingTxId === tx.id}
                                onClick={() => {
                                  setRejectModalTx(tx);
                                  setRejectionReasonInput("");
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                title="Tolak pembayaran"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : tx.status === "APPROVED" ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                              Siswa Terdaftar
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-500 font-mono">
                              Ditolak
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CURRICULUM & INTERACTIVE MODULE EDITOR */}
      {activeTab === "curriculum" && (
        <div className="animate-in fade-in duration-300">
          <CurriculumEditor userRole="SuperAdmin" />
        </div>
      )}

      {/* TAB 6: TUGAS SISWA & EVALUASI */}
      {activeTab === "submissions" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Total Tugas Terkumpul</span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white">{submissions.length}</p>
              <p className="text-[10px] text-gray-500 mt-1">Pengumpulan dari semua kelas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Menunggu Penilaian</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {submissions.filter((s) => s.status === "PENDING").length}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1">Perlu direview &amp; dinilai</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Tugas Disetujui (Lulus)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {submissions.filter((s) => s.status === "APPROVED").length}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Memenuhi kriteria kelulusan</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Perlu Revisi</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {submissions.filter((s) => s.status === "REVISION").length}
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Dikembalikan ke mahasiswa</p>
            </div>
          </div>

          {/* Submissions Table Container */}
          <div className="rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span>Evaluasi Tugas Mahasiswa</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent">
                    {filteredSubmissions.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Periksa file model (.rvt, .dwg, .pdf, .zip, .ifc) yang dikumpulkan mahasiswa, unduh berkas, berikan skor nilai 0-100, dan kirim masukan teknis.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari siswa, judul, atau kelas..."
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rose-500 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={submissionStatusFilter}
                  onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Menunggu Review</option>
                  <option value="APPROVED">Disetujui (Lulus)</option>
                  <option value="REVISION">Perlu Revisi</option>
                </select>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400 space-y-2">
                <Award className="w-8 h-8 mx-auto text-gray-300 dark:text-zinc-600" />
                <p>Tidak ada pengumpulan tugas yang sesuai kriteria pencarian.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-transparent uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Siswa</th>
                      <th className="py-3 px-4">Judul Tugas &amp; Kelas</th>
                      <th className="py-3 px-4">Catatan Siswa</th>
                      <th className="py-3 px-4">File Model</th>
                      <th className="py-3 px-4">Status &amp; Nilai</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-950 dark:text-white">
                          {sub.user?.name || "Mahasiswa"}
                          <p className="text-[10px] text-gray-500 font-mono font-normal">
                            {sub.user?.email || "-"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 max-w-[220px]">
                          <p className="font-semibold text-gray-900 dark:text-gray-200 line-clamp-1">{sub.title}</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono line-clamp-1">
                            {sub.course?.title || "Revit Mastery"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 max-w-[200px]">
                          {(() => {
                            const quiz = parseQuizNotes(sub.notes);
                            if (quiz) {
                              return (
                                <div className="space-y-0.5">
                                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30 block w-fit">
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
                                "{sub.notes || "Tidak ada catatan."}"
                              </p>
                            );
                          })()}
                        </td>

                        <td className="py-3.5 px-4">
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white font-bold text-xs transition-colors shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-rose-500" />
                            <span>Unduh Berkas</span>
                          </a>
                        </td>

                        <td className="py-3.5 px-4">
                          {sub.status === "PENDING" && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                              MENUNGGU REVIEW
                            </span>
                          )}
                          {sub.status === "APPROVED" && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>LULUS ({sub.grade}/100)</span>
                            </div>
                          )}
                          {sub.status === "REVISION" && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-bold font-mono">
                              REVISI ({sub.grade}/100)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEvaluate(sub)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            Beri Nilai
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    {/* TAB: REVIEW KUIS SISWA */}
      {activeTab === "quiz-review" && (
        <div className="animate-in fade-in duration-300">
          <QuizReviewPanel />
        </div>
      )}

      {/* TAB: SERTIFIKAT KELULUSAN */}
      {activeTab === "certificates" && (
        <div className="animate-in fade-in duration-300">
          <CertificateManagerPanel />
        </div>
      )}
      
      {/* TAB 7: BULETIN & KONSULTASI LEADS */}
      {activeTab === "newsletter" && (
        <div className="animate-in fade-in duration-300">
          <NewsletterLeadsManager />
        </div>
      )}

      {/* COURSE BUILDER MODAL */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 text-gray-900 dark:text-white shadow-2xl my-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">
                    {editingCourseId ? "Edit Modul Kursus" : "Tambah Modul Kursus Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Atur cover, skema biaya, durasi jam, tingkat level, overview, kurikulum dan file materi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCourseModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setCourseFormTab("details")}
                className={`py-2 px-2.5 rounded-xl font-bold transition-colors cursor-pointer text-center truncate ${
                  courseFormTab === "details" ? "bg-[#28A745] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                1. Detail &amp; Biaya
              </button>
              <button
                type="button"
                onClick={() => setCourseFormTab("instructor")}
                className={`py-2 px-2.5 rounded-xl font-bold transition-colors cursor-pointer text-center truncate ${
                  courseFormTab === "instructor" ? "bg-[#28A745] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                2. Instruktur &amp; Mode
              </button>
              <button
                type="button"
                onClick={() => setCourseFormTab("learning")}
                className={`py-2 px-2.5 rounded-xl font-bold transition-colors cursor-pointer text-center truncate ${
                  courseFormTab === "learning" ? "bg-[#28A745] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                3. Overview &amp; Manfaat
              </button>
              <button
                type="button"
                onClick={() => setCourseFormTab("curriculum")}
                className={`py-2 px-2.5 rounded-xl font-bold transition-colors cursor-pointer text-center truncate ${
                  courseFormTab === "curriculum" ? "bg-[#28A745] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                4. Silabus &amp; Bab
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-5">
              {/* TAB 1: DETAILS & SPECS */}
              {courseFormTab === "details" && (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  {/* Status Publikasi ke Katalog */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-gray-950 dark:text-white block">Status Publikasi ke Katalog</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {courseForm.published
                            ? "🟢 LIVE: Modul langsung tampil di katalog beranda dan bisa dilihat/didaftarkan oleh siswa."
                            : "🟡 DRAFT: Modul disimpan privat internal dan disembunyikan dari katalog umum."}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-200 dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, published: true })}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            courseForm.published
                              ? "bg-[#28A745] text-white shadow-xs"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Live (Publikasi)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, published: false })}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            !courseForm.published
                              ? "bg-amber-600 text-white shadow-xs"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Draft (Privat)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Judul Modul Kursus
                      </label>
                      <span className="text-[11px] text-gray-500 font-mono">
                        ID: #{courseForm.slug || "otomatis"}
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Mastering Revit Architecture / Navisworks Coordination"
                      value={courseForm.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        const genSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                        setCourseForm((prev) => ({
                          ...prev,
                          title: val,
                          slug: !editingCourseId || !prev.slug || prev.slug === "tekla-structures-detailing" ? genSlug : prev.slug,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Slug URL Modul (Tautan Katalog: bimcourse.com/#course-...)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="revit-basic"
                      value={courseForm.slug}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""),
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-emerald-600 dark:text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Kategori BIM
                      </label>
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="BIM Modeling">BIM Modeling (Revit/Tekla)</option>
                        <option value="BIM Coordination">BIM Coordination (Navisworks)</option>
                        <option value="BIM Management">BIM Management &amp; ISO 19650</option>
                        <option value="BIM Structure">BIM Structure &amp; Detailing</option>
                        <option value="Computational Design">Dynamo &amp; Computational</option>
                        <option value="Infrastructure">Civil 3D &amp; Infrastruktur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Tingkat / Level
                      </label>
                      <select
                        value={courseForm.level}
                        onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Beginner">Beginner (Pemula)</option>
                        <option value="Intermediate">Intermediate (Menengah)</option>
                        <option value="Advanced">Advanced (Mahir)</option>
                      </select>
                    </div>
                  </div>

                  {/* Free vs Paid Toggle */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-950 dark:text-white block">Skema Biaya Modul</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Pilih apakah modul ini GRATIS (Free) atau berbayar</span>
                      </div>

                      <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-200 dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, isFree: true, price: 0 })}
                          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            courseForm.isFree ? "bg-[#28A745] text-white" : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          FREE (Gratis)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, isFree: false, price: 499000 })}
                          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            !courseForm.isFree ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Berbayar
                        </button>
                      </div>
                    </div>

                    {!courseForm.isFree && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Harga Kelas (IDR)</label>
                          <input
                            type="number"
                            value={courseForm.price}
                            onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">Harga Asli Coret (IDR)</label>
                          <input
                            type="number"
                            value={courseForm.originalPrice}
                            onChange={(e) => setCourseForm({ ...courseForm, originalPrice: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hours & Labs & Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Estimasi Durasi (Jam)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={courseForm.durationHours}
                        onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })}
                        placeholder="24"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Jumlah Proyek / Labs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={courseForm.labsCount}
                        onChange={(e) => setCourseForm({ ...courseForm, labsCount: Number(e.target.value) })}
                        placeholder="12"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Mode Belajar
                      </label>
                      <select
                        value={courseForm.learningMode}
                        onChange={(e) => setCourseForm({ ...courseForm, learningMode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                      >
                        <option value="Self-Paced Online">Self-Paced Online</option>
                        <option value="Instructor-Led">Instructor-Led</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  {/* Background / Cover Image with Upload */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Gambar Cover / Thumbnail Modul
                      </label>
                      <div>
                        <input
                          type="file"
                          ref={coverFileRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadFile(
                                file,
                                (data) => setCourseForm((prev) => ({ ...prev, thumbnail: data.url })),
                                setUploadingCover
                              );
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={uploadingCover}
                          onClick={() => coverFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingCover ? "Mengunggah..." : "Upload Gambar"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Upload file gambar atau tempel URL (https://...)"
                        value={courseForm.thumbnail}
                        onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                      />
                      {courseForm.thumbnail && (
                        <img
                          src={courseForm.thumbnail}
                          alt="Preview"
                          className="w-14 h-10 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/20 shrink-0 bg-gray-100 dark:bg-black/40"
                        />
                      )}
                    </div>
                  </div>

                  {/* Course Master Project / Dataset File Attachment */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-950 dark:text-white block">File Proyek &amp; Dataset Latihan</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Lampirkan file materi (.rvt, .dwg, .nwd, .ifc, .zip, .pdf)
                        </span>
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={attachmentFileRef}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadFile(
                                file,
                                (data) =>
                                  setCourseForm((prev) => ({
                                    ...prev,
                                    attachmentUrl: data.url,
                                    attachmentName: data.filename,
                                  })),
                                setUploadingAttachment
                              );
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={uploadingAttachment}
                          onClick={() => attachmentFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingAttachment ? "Mengunggah..." : "Upload File"}</span>
                        </button>
                      </div>
                    </div>

                    {courseForm.attachmentUrl ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-emerald-800 dark:text-emerald-300 font-mono truncate font-semibold">
                            {courseForm.attachmentName || courseForm.attachmentUrl}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, attachmentUrl: "", attachmentName: "" })}
                          className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                          title="Hapus file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 italic">
                        Belum ada file proyek terlampir. Siswa dapat mengunduh file ini setelah terdaftar di kelas melalui tab Resources.
                      </p>
                    )}

                    {/* Keterangan File Proyek */}
                    <div className="space-y-1 pt-1 border-t border-gray-200 dark:border-white/10">
                      <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                        Keterangan File Proyek (Muncul di tab Resources siswa):
                      </label>
                      <textarea
                        rows={2}
                        value={courseForm.attachmentDescription}
                        onChange={(e) => setCourseForm({ ...courseForm, attachmentDescription: e.target.value })}
                        placeholder="Contoh: File proyek Revit 2024 (.rvt) LOD 300 lengkap beserta family arsitektur &amp; struktur untuk latihan praktikum..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Dokumen Acuan & Template Tambahan (Resources LMS) */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-950 dark:text-white">
                            Dokumen Acuan &amp; Template Tambahan
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30">
                            {resourcesInput.length} Dokumen
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Dokumen panduan, BEP, template Revit (.rte), standar PUPR, atau tautan Google Docs yang tampil di tab Resources LMS siswa.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddResourceRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Tambah Dokumen</span>
                      </button>
                    </div>

                    {/* Hidden file input for uploading individual resource file */}
                    <input
                      type="file"
                      ref={resourceFileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && currentUploadTargetIdx !== null) {
                          handleUploadResourceFile(currentUploadTargetIdx, file);
                        }
                        e.target.value = "";
                      }}
                    />

                    {resourcesInput.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400 space-y-2 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-black/20">
                        <FileText className="w-7 h-7 mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="text-[11px] font-medium text-gray-500">
                          Belum ada dokumen acuan tambahan. Siswa hanya akan melihat berkas master latihan jika diunggah di atas.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddResourceRow}
                          className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                        >
                          + Tambah Dokumen Acuan Pertama
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {resourcesInput.map((res, rIdx) => (
                          <div
                            key={res.id || rIdx}
                            className="p-3.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 space-y-3 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500">
                                Dokumen #{rIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveResourceRow(rIdx)}
                                className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 block">
                                  Judul Dokumen / Nama Template
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Template Proyek Autodesk Revit (.RTE)"
                                  value={res.title}
                                  onChange={(e) => handleUpdateResourceRow(rIdx, { title: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 block">
                                  Format / Tipe File
                                </label>
                                <select
                                  value={res.fileType}
                                  onChange={(e) => handleUpdateResourceRow(rIdx, { fileType: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                                >
                                  <option value="PDF Document">PDF Document</option>
                                  <option value="Revit Template (.RTE)">Revit Template (.RTE)</option>
                                  <option value="Revit Model (.RVT)">Revit Model (.RVT)</option>
                                  <option value="CAD Drawing (.DWG)">CAD Drawing (.DWG)</option>
                                  <option value="IFC Model">IFC Model</option>
                                  <option value="Google Docs">Google Docs</option>
                                  <option value="Spreadsheet / Excel">Spreadsheet / Excel</option>
                                  <option value="ZIP Archive">ZIP Archive</option>
                                  <option value="File Acuan">File Acuan</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 block">
                                Berkas / URL Unduhan
                              </label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  placeholder="Upload file atau tempel tautan (https://...)"
                                  value={res.url}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleUpdateResourceRow(rIdx, {
                                      url: val,
                                      isExternal: val.startsWith("http://") || val.startsWith("https://") ? !val.includes("/uploads/") : false,
                                    });
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white font-mono placeholder:text-gray-400 focus:outline-none truncate"
                                />
                                <button
                                  type="button"
                                  disabled={uploadingResourceIdx === rIdx}
                                  onClick={() => {
                                    setCurrentUploadTargetIdx(rIdx);
                                    resourceFileInputRef.current?.click();
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{uploadingResourceIdx === rIdx ? "Mengunggah..." : "Upload File"}</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 block">
                                  Deskripsi Singkat Berkas
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Dokumen standar acuan resmi BIM & Revit AEC Industry."
                                  value={res.description || ""}
                                  onChange={(e) => handleUpdateResourceRow(rIdx, { description: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 block">
                                  Ukuran File (Otomatis)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 18.4 MB / Online"
                                  value={res.fileSize || "Online"}
                                  onChange={(e) => handleUpdateResourceRow(rIdx, { fileSize: e.target.value })}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white font-mono focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: INSTRUCTOR & MODE */}
              {courseFormTab === "instructor" && (
                <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-2">
                  {/* Instructor-Led Toggle */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-gray-950 dark:text-white block">Sesi Mentoring Instructor-Led (Live 1-on-1)</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {courseForm.hasInstructorLed
                            ? "🟢 AKTIF: Halaman modul akan menampilkan opsi 'Instructor-Led' bersama 'Self-Paced'."
                            : "⚪ NONAKTIF (Hanya Jual Modul): Opsi Instructor-Led dihilangkan dari halaman kursus siswa."}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-200 dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, hasInstructorLed: false })}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            !courseForm.hasInstructorLed
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Hanya Modul Mandiri
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, hasInstructorLed: true })}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            courseForm.hasInstructorLed
                              ? "bg-purple-600 text-white shadow-xs"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          Ada Instructor-Led
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Details */}
                  <div className="p-5 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
                    <h3 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Profil Instruktur &amp; Praktisi Kursus</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Nama Instruktur
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Ir. Rian Wicaksono, M.T."
                          value={courseForm.instructorName}
                          onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Gelar / Jabatan / Perusahaan
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Lead BIM Specialist • PT Wijaya Karya (Persero) Tbk"
                          value={courseForm.instructorTitle}
                          onChange={(e) => setCourseForm({ ...courseForm, instructorTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Instructor Avatar Upload */}
                    <div className="pt-2 border-t border-gray-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Foto Profil Instruktur
                        </label>
                        <div>
                          <input
                            type="file"
                            ref={instructorAvatarFileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadFile(
                                  file,
                                  (data) => setCourseForm((prev) => ({ ...prev, instructorAvatar: data.url })),
                                  setUploadingInstructorAvatar
                                );
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={uploadingInstructorAvatar}
                            onClick={() => instructorAvatarFileRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingInstructorAvatar ? "Mengunggah..." : "Upload Foto Profil"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center">
                        <img
                          src={
                            courseForm.instructorAvatar ||
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                          }
                          alt="Preview Instruktur"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0 bg-gray-100 dark:bg-black/40"
                        />
                        <input
                          type="text"
                          placeholder="URL Foto Profil atau gunakan tombol upload di atas"
                          value={courseForm.instructorAvatar}
                          onChange={(e) => setCourseForm({ ...courseForm, instructorAvatar: e.target.value })}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: OVERVIEW & MANFAAT */}
              {courseFormTab === "learning" && (
                <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
                  {/* Pitch & Overview */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Ringkasan Singkat (Short Pitch)
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Contoh: Kuasai pemodelan arsitektur 3D LOD 300, scheduling material otomatis, hingga ekspor gambar kerja DED..."
                        value={courseForm.summary}
                        onChange={(e) => setCourseForm({ ...courseForm, summary: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Deskripsi Lengkap (Overview Modul)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tuliskan latar belakang industri, regulasi PUPR, dan cakupan materi kursus ini..."
                        value={courseForm.overview}
                        onChange={(e) => setCourseForm({ ...courseForm, overview: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Section: Yang Akan Anda Pelajari & Kuasai */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Yang Akan Anda Pelajari &amp; Kuasai</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Poin kompetensi utama yang ditampilkan dengan centang hijau.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCourseForm({
                            ...courseForm,
                            keyLearnings: [...courseForm.keyLearnings, "Poin pembelajaran baru"],
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Poin</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {courseForm.keyLearnings.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-gray-500 w-5 text-right">{idx + 1}.</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...courseForm.keyLearnings];
                              updated[idx] = e.target.value;
                              setCourseForm({ ...courseForm, keyLearnings: updated });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = courseForm.keyLearnings.filter((_, i) => i !== idx);
                              setCourseForm({ ...courseForm, keyLearnings: updated });
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-500 cursor-pointer"
                            title="Hapus poin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Manfaat Kelulusan */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#B27D56] dark:text-[#D99B6A]" />
                          <span>Manfaat Kelulusan</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Keuntungan yang didapatkan peserta setelah menyelesaikan modul.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCourseForm({
                            ...courseForm,
                            benefits: [
                              ...courseForm.benefits,
                              { title: "Manfaat Baru", description: "Deskripsi singkat manfaat kelulusan..." },
                            ],
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#B27D56]/15 hover:bg-[#B27D56]/25 text-[#B27D56] dark:text-[#D99B6A] text-xs font-semibold border border-[#B27D56]/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Manfaat</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {courseForm.benefits.map((b, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              placeholder="Judul Manfaat (e.g. Sertifikat Resmi Terverifikasi)"
                              value={b.title}
                              onChange={(e) => {
                                const updated = [...courseForm.benefits];
                                updated[idx].title = e.target.value;
                                setCourseForm({ ...courseForm, benefits: updated });
                              }}
                              className="flex-1 px-3 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-950 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = courseForm.benefits.filter((_, i) => i !== idx);
                                setCourseForm({ ...courseForm, benefits: updated });
                              }}
                              className="p-1 text-gray-400 hover:text-rose-500 cursor-pointer"
                              title="Hapus manfaat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Deskripsi singkat manfaat..."
                            value={b.description}
                            onChange={(e) => {
                              const updated = [...courseForm.benefits];
                              updated[idx].description = e.target.value;
                              setCourseForm({ ...courseForm, benefits: updated });
                            }}
                            className="w-full px-3 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] text-gray-700 dark:text-gray-300 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CURRICULUM BUILDER */}
              {courseFormTab === "curriculum" && (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  {/* Informative Note: Curriculum modules are written directly in the web */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Materi &amp; Modul Disusun Langsung di Web</p>
                      <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                        Anda tidak perlu mengunggah file modul di sini. Modul teks bersambung, gambar materi, topik bertingkat, dan blok interaktif (kuis, tabbed, matching) dikelola langsung via menu <strong>Editor Kurikulum &amp; Modul</strong>. Di tab ini Anda cukup mengatur daftar bab dan estimasi durasi silabus.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Daftar bab silabus modul kursus ini:
                    </p>
                    <button
                      type="button"
                      onClick={addModuleRow}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Bab Modul</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {modulesInput.map((mod, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-4 rounded-2xl bg-gray-50/90 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder={`Bab ${mIdx + 1} Judul`}
                              value={mod.title}
                              onChange={(e) => {
                                const updated = [...modulesInput];
                                updated[mIdx].title = e.target.value;
                                setModulesInput(updated);
                              }}
                              className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/15 text-xs text-gray-900 dark:text-white focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Durasi (e.g. 2 Jam)"
                              value={mod.duration}
                              onChange={(e) => {
                                const updated = [...modulesInput];
                                updated[mIdx].duration = e.target.value;
                                setModulesInput(updated);
                              }}
                              className="px-3 py-2 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/15 text-xs text-gray-900 dark:text-white focus:outline-none font-mono"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeModuleRow(mIdx)}
                            className="p-2 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                            title="Hapus Bab"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Lessons inside module */}
                        <div className="pl-4 border-l-2 border-gray-200 dark:border-white/10 space-y-2.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                              Materi Pelajaran ({mod.lessons.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => addLessonRow(mIdx)}
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                            >
                              + Tambah Pelajaran
                            </button>
                          </div>

                          {mod.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className="p-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Judul materi pelajaran"
                                  value={lesson.title}
                                  onChange={(e) => {
                                    const updated = [...modulesInput];
                                    updated[mIdx].lessons[lIdx].title = e.target.value;
                                    setModulesInput(updated);
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Durasi (20 Menit)"
                                  value={lesson.duration}
                                  onChange={(e) => {
                                    const updated = [...modulesInput];
                                    updated[mIdx].lessons[lIdx].duration = e.target.value;
                                    setModulesInput(updated);
                                  }}
                                  className="w-24 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white font-mono"
                                />
                                <label className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={lesson.isFree}
                                    onChange={(e) => {
                                      const updated = [...modulesInput];
                                      updated[mIdx].lessons[lIdx].isFree = e.target.checked;
                                      setModulesInput(updated);
                                    }}
                                    className="rounded border-gray-300 dark:border-white/20 text-emerald-600"
                                  />
                                  <span>Preview</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeLessonRow(mIdx, lIdx)}
                                  className="p-1 text-gray-400 hover:text-rose-500"
                                  title="Hapus pelajaran"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Lesson Video URL (optional) */}
                              <div className="pt-1 border-t border-gray-100 dark:border-white/5">
                                <input
                                  type="text"
                                  placeholder="URL Video (opsional, e.g. https://...)"
                                  value={lesson.videoUrl || ""}
                                  onChange={(e) => {
                                    const updated = [...modulesInput];
                                    updated[mIdx].lessons[lIdx].videoUrl = e.target.value;
                                    setModulesInput(updated);
                                  }}
                                  className="w-full px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] text-gray-900 dark:text-white font-mono placeholder:text-gray-400"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  {courseFormTab !== "details" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (courseFormTab === "curriculum") setCourseFormTab("learning");
                        else if (courseFormTab === "learning") setCourseFormTab("instructor");
                        else if (courseFormTab === "instructor") setCourseFormTab("details");
                      }}
                      className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                    >
                      &larr; Kembali
                    </button>
                  )}
                  {courseFormTab !== "curriculum" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (courseFormTab === "details") setCourseFormTab("instructor");
                        else if (courseFormTab === "instructor") setCourseFormTab("learning");
                        else if (courseFormTab === "learning") setCourseFormTab("curriculum");
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-900 dark:text-white text-xs font-bold cursor-pointer"
                    >
                      Lanjut &rarr;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#28A745] hover:bg-[#218838] text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    Simpan Modul Kursus
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD USER */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#161920] border border-gray-200 dark:border-white/15 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Buat Akun Pengguna Baru</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Superadmin dapat membuat akun langsung untuk peran Admin, Pengajar, atau Siswa.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ir. Budi Santoso, M.T."
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi@perusahaan.co.id"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password Awal
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Role Pengguna
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#191D24] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="pengajar">Pengajar</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">SuperAdmin</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Instansi / Perusahaan
                  </label>
                  <input
                    type="text"
                    placeholder="WIKA / IAI / Kampus"
                    value={userForm.organization}
                    onChange={(e) => setUserForm({ ...userForm, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Transfer Lightbox Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-white dark:bg-[#12151B] border border-gray-200 dark:border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bukti Transfer Mahasiswa</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors"
                  title="Buka Gambar Asli di Tab Baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewProofUrl(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/60 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewProofUrl}
                alt="Bukti Transfer"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-md w-full bg-white dark:bg-[#14171E] border border-rose-200 dark:border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Tolak Pembayaran Mahasiswa</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setRejectModalTx(null);
                  setRejectionReasonInput("");
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-gray-700 dark:text-gray-300">
                Anda akan menolak transaksi untuk kelas{" "}
                <span className="font-bold text-gray-950 dark:text-white">"{rejectModalTx.course.title}"</span> oleh siswa{" "}
                <span className="font-bold text-gray-950 dark:text-white">{rejectModalTx.user.name}</span>.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Berikan alasan penolakan agar mahasiswa dapat memperbaiki atau mengunggah ulang bukti transfer yang sah:
              </p>
            </div>

            <form onSubmit={handleRejectTransaction} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Contoh: Nominal transfer tidak sesuai, atau bukti mutasi rekening tidak terbaca..."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-500 resize-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalTx(null);
                    setRejectionReasonInput("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={verifyingTxId === rejectModalTx.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {verifyingTxId === rejectModalTx.id ? "Memproses..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVALUATION MODAL */}
      {evalModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/15 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  Evaluasi Tugas Mahasiswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEvalModalSub(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const quizData = parseQuizNotes(evalModalSub.notes);
              if (quizData) {
                return <QuizSubmissionReviewSheet data={quizData} />;
              }
              return (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mahasiswa:</span>
                    <span className="font-bold text-gray-950 dark:text-white">{evalModalSub.user?.name} ({evalModalSub.user?.email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tugas:</span>
                    <span className="font-bold text-gray-950 dark:text-white">{evalModalSub.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kelas:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{evalModalSub.course?.title}</span>
                  </div>
                  {evalModalSub.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                      <span className="text-gray-400 block mb-0.5">Catatan Mahasiswa:</span>
                      <p className="italic text-gray-700 dark:text-zinc-300">"{evalModalSub.notes}"</p>
                    </div>
                  )}
                  {evalModalSub.fileUrl && evalModalSub.fileUrl !== "quiz-submission" && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={evalModalSub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File Mahasiswa</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                  Status Evaluasi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvalStatus("APPROVED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      evalStatus === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500"
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Disetujui / Lulus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalStatus("REVISION")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      evalStatus === "REVISION"
                        ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500"
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Perlu Revisi</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Nilai Kelulusan (0 - 100):
                  </label>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {evalGrade} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={evalGrade}
                  onChange={(e) => setEvalGrade(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                  Ulasan &amp; Masukan Teknis (Feedback):
                </label>
                <textarea
                  rows={4}
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="Beri catatan mengenai kesesuaian family Revit, level LOD, atau instruksi perbaikan untuk revisi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEvalModalSub(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isEvaluating ? "Menyimpan..." : "Simpan Penilaian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
