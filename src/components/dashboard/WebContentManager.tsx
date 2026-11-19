"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Layout,
  Globe,
  Plus,
  Trash2,
  Edit3,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Award,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Star,
  ExternalLink,
  RotateCcw,
  Save,
  ArrowRight,
  Layers,
  FileText,
  Video,
  Building,
  Check,
  X
} from "lucide-react";
import {
  DEFAULT_SITE_CONTENT,
  SiteContentConfig,
  WebInstructor,
  WebFaqItem,
  WebTestimonialItem
} from "@/data/defaultSiteContent";

interface WebContentManagerProps {
  onShowToast: (msg: string) => void;
}

export default function WebContentManager({ onShowToast }: WebContentManagerProps) {
  const [content, setContent] = useState<SiteContentConfig>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"visibility" | "instructors" | "other">("instructors");

  // Modal State for Instructor
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<WebInstructor | null>(null);
  const [instructorForm, setInstructorForm] = useState<WebInstructor>({
    id: "",
    name: "",
    role: "",
    experience: "",
    affiliation: "",
    expertise: [],
    avatar: "",
    communityRole: "",
    isVisible: true,
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current site content from API
  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/site-content");
      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
      }
    } catch (err) {
      console.error("Failed to load site content:", err);
      onShowToast("Gagal memuat pengaturan konten web.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Save content to API
  const handleSaveContent = async (overrideContent?: SiteContentConfig) => {
    try {
      setSaving(true);
      const payload = overrideContent || content;
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onShowToast("Konten website berhasil disimpan dan dipublikasikan!");
      } else {
        alert(data.error || "Gagal menyimpan konten web.");
      }
    } catch {
      onShowToast("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm("Yakin ingin mereset seluruh konten web ke pengaturan bawaan awal?")) {
      setContent(DEFAULT_SITE_CONTENT);
      handleSaveContent(DEFAULT_SITE_CONTENT);
      onShowToast("Konten web dikembalikan ke default!");
    }
  };

  // Toggle Section Visibility
  const toggleSection = (key: keyof SiteContentConfig["sectionsVisibility"]) => {
    const updated = {
      ...content,
      sectionsVisibility: {
        ...content.sectionsVisibility,
        [key]: !content.sectionsVisibility[key],
      },
    };
    setContent(updated);
    handleSaveContent(updated);
  };

  // --- INSTRUCTOR HANDLERS ---
  const handleOpenAddInstructor = () => {
    setEditingInstructor(null);
    setInstructorForm({
      id: `inst-${Date.now()}`,
      name: "",
      role: "",
      experience: "8+ Tahun di Industri AEC",
      affiliation: "",
      expertise: ["Revit", "BIM"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      communityRole: "",
      isVisible: true,
    });
    setExpertiseInput("Revit, BIM");
    setInstructorModalOpen(true);
  };

  const handleOpenEditInstructor = (inst: WebInstructor) => {
    setEditingInstructor(inst);
    setInstructorForm({ ...inst });
    setExpertiseInput((inst.expertise || []).join(", "));
    setInstructorModalOpen(true);
  };

  const handleToggleInstructorVisibility = (id: string) => {
    const updatedInstructors = content.instructors.map((inst) =>
      inst.id === id ? { ...inst, isVisible: !inst.isVisible } : inst
    );
    const updated = { ...content, instructors: updatedInstructors };
    setContent(updated);
    handleSaveContent(updated);
  };

  const handleDeleteInstructor = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus instruktur "${name}"?`)) {
      const updatedInstructors = content.instructors.filter((inst) => inst.id !== id);
      const updated = { ...content, instructors: updatedInstructors };
      setContent(updated);
      handleSaveContent(updated);
      onShowToast(`Instruktur "${name}" dihapus.`);
    }
  };

  const handleSaveInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorForm.name || !instructorForm.role) {
      alert("Nama dan Jabatan wajib diisi.");
      return;
    }

    const tags = expertiseInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const readyInstructor: WebInstructor = {
      ...instructorForm,
      expertise: tags.length > 0 ? tags : ["BIM"],
    };

    let updatedInstructors: WebInstructor[];
    if (editingInstructor) {
      updatedInstructors = content.instructors.map((inst) =>
        inst.id === editingInstructor.id ? readyInstructor : inst
      );
    } else {
      updatedInstructors = [...content.instructors, readyInstructor];
    }

    const updated = { ...content, instructors: updatedInstructors };
    setContent(updated);
    handleSaveContent(updated);
    setInstructorModalOpen(false);
    onShowToast(`Instruktur "${readyInstructor.name}" berhasil disimpan!`);
  };

  // Upload Avatar
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto.");

      setInstructorForm((prev) => ({ ...prev, avatar: data.url }));
      onShowToast("Foto profil instruktur berhasil diunggah!");
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400 font-mono">Memuat Pengaturan Konten Web...</p>
      </div>
    );
  }

  // Section items list for visibility toggles
  const sectionList: {
    key: keyof SiteContentConfig["sectionsVisibility"];
    name: string;
    description: string;
    icon: any;
    targetHref?: string;
  }[] = [
    {
      key: "hero",
      name: "Hero Banner Utama (Cinematic Video)",
      description: "Video background looping, heading 'Learn Today Build Tomorrow', tombol CTA, dan rating proof.",
      icon: Video,
      targetHref: "/",
    },
    {
      key: "features",
      name: "3 Kartu Bento Pilar Pembelajaran",
      description: "Skills for Real Opportunities, Your Goals Our Support, dan Terhubung Instruktur.",
      icon: Layers,
      targetHref: "/#courses",
    },
    {
      key: "courses",
      name: "Katalog Kursus & Modul BIM",
      description: "Katalog modul interaktif dengan filter kategori, harga/free, dan pendaftaran kelas.",
      icon: Layout,
      targetHref: "/#courses",
    },
    {
      key: "roadmaps",
      name: "Jalur Karier (Career Roadmap)",
      description: "Peta jalan karier bertahap dari BIM Modeler, Coordinator, hingga BIM Manager.",
      icon: ArrowRight,
      targetHref: "/#roadmaps",
    },
    {
      key: "community",
      name: "Section Komunitas AEC & Sesi Mentoring",
      description: "Ekosistem komunitas, 4 pilar mentoring, dan simulasi tanya-jawab live koordinasi BIM.",
      icon: Users,
      targetHref: "/#community",
    },
    {
      key: "instructors",
      name: "Tim Pengajar & Mentor Praktisi (Khusus Gambar Terlampir)",
      description: "Daftar kartu foto profil instruktur, pengalaman BUMN, kutipan bimbingan, dan tag keahlian.",
      icon: Award,
      targetHref: "/#community",
    },
    {
      key: "quiz",
      name: "Kuis Rekomendasi Jalur BIM 30 Detik",
      description: "Interaktif mini kuis diagnostik untuk menentukan kursus yang paling sesuai dengan pengguna.",
      icon: Sparkles,
      targetHref: "/#quiz",
    },
    {
      key: "testimonials",
      name: "Cerita Alumni & Testimoni Industri",
      description: "Ulasan dari insinyur dan arsitek alumni yang berhasil berkarier di proyek nasional.",
      icon: Star,
    },
    {
      key: "enterprise",
      name: "Pelatihan Perusahaan (Corporate Training)",
      description: "Section konsultasi in-house training dan implementasi standar BIM ISO 19650 untuk BUMN.",
      icon: Building,
      targetHref: "/#enterprise",
    },
    {
      key: "faq",
      name: "Tanya Jawab Umum (FAQ)",
      description: "Accordion tanya-jawab seputar laptop, sertifikat resmi, lisensi, dan pendampingan.",
      icon: HelpCircle,
      targetHref: "/#faq",
    },
    {
      key: "cta",
      name: "Pre-Footer Banner CTA",
      description: "Ajakan bergabung terakhir 'Siap Naik Level di Era Konstruksi Digital?'.",
      icon: ShieldCheck,
    },
  ];

  const activeCount = Object.values(content.sectionsVisibility).filter(Boolean).length;
  const totalCount = Object.keys(content.sectionsVisibility).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
              Website Content &amp; Section Manager (CMS)
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Ubah konten teks, foto instruktur, atau sembunyikan section tertentu dari halaman utama.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-white dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Lihat Website</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>

          <button
            onClick={handleResetToDefault}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 dark:bg-white/5 dark:hover:bg-rose-500/10 dark:text-gray-400 dark:hover:text-rose-300 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kembalikan ke konten bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => handleSaveContent()}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Publikasikan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("instructors")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "instructors"
              ? "bg-[#B27D56] text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tim Pengajar &amp; Mentor Praktisi (Gambar Terlampir)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 text-amber-100">
            {content.instructors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("visibility")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "visibility"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Visibilitas Section (Sembunyikan / Tampilkan)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 text-purple-100">
            {activeCount}/{totalCount} Aktif
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("other")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "other"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Teks Hero, Komunitas &amp; FAQ</span>
        </button>
      </div>

      {/* SUB-TAB 1: INSTRUCTORS & MENTOR PRAKTISI (FOCUSED ON USER'S SCREENSHOT) */}
      {activeSubTab === "instructors" && (
        <div className="space-y-6">
          {/* Section Visibility Notice Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#B27D56]/15 via-black/40 to-black/40 border border-[#B27D56]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B27D56]/20 border border-[#B27D56]/40 flex items-center justify-center text-[#E0A97D] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Status Section Instruktur di Website:
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      content.sectionsVisibility.instructors
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {content.sectionsVisibility.instructors ? "DITAMPILKAN (AKTIF)" : "DISEMBUNYIKAN"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Anda bisa menyembunyikan seluruh section ini atau mengatur kartu mentor satu per satu di bawah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSection("instructors")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  content.sectionsVisibility.instructors
                    ? "bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {content.sectionsVisibility.instructors ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Sembunyikan Section Ini</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tampilkan Section Ini</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenAddInstructor}
                className="px-4 py-2 rounded-xl bg-[#B27D56] hover:bg-[#9d6c48] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Instruktur</span>
              </button>
            </div>
          </div>

          {/* Section Header Editor (Badge, Title, Subtitle) */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-[#B27D56]" />
              <span>Edit Judul &amp; Deskripsi Section Instruktur</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Sub-Badge Teks (Huruf Kapital)
                </label>
                <input
                  type="text"
                  value={content.community.instructorsBadge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      community: {
                        ...content.community,
                        instructorsBadge: e.target.value,
                      },
                    })
                  }
                  placeholder="TIM PENGAJAR & MENTOR PRAKTISI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B27D56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Judul Utama Section
                </label>
                <input
                  type="text"
                  value={content.community.instructorsTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      community: {
                        ...content.community,
                        instructorsTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Belajar Langsung dari Pelaku Industri Nyata"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B27D56]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Deskripsi / Penjelasan Singkat
                </label>
                <textarea
                  rows={2}
                  value={content.community.instructorsSubtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      community: {
                        ...content.community,
                        instructorsSubtitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Bukan sekadar akademisi, instruktur Anda adalah engineer..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B27D56]"
                />
              </div>
            </div>
          </div>

          {/* Instructor Cards Grid (Matches User's Attached Screenshot) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Daftar Kartu Instruktur &amp; Praktisi ({content.instructors.length} Terdaftar)
                </h4>
                <p className="text-xs text-gray-400">
                  Kartu ini ditampilkan persis seperti di halaman website. Klik tombol edit untuk mengubah foto, nama, atau tag keahlian.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddInstructor}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.instructors.map((instructor, idx) => (
                <div
                  key={instructor.id || idx}
                  className={`rounded-3xl p-5 border transition-all flex flex-col justify-between relative group ${
                    instructor.isVisible !== false
                      ? "bg-[#181B22] border-white/10 shadow-lg"
                      : "bg-[#121418] border-white/5 opacity-60"
                  }`}
                >
                  {/* Visibility Tag & Quick Controls */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        instructor.isVisible !== false
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-gray-700/40 text-gray-400 border-gray-600/30"
                      }`}
                    >
                      {instructor.isVisible !== false ? "AKTIF" : "TERSEMBUNYI"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleInstructorVisibility(instructor.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title={instructor.isVisible !== false ? "Sembunyikan kartu ini" : "Tampilkan kartu ini"}
                      >
                        {instructor.isVisible !== false ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditInstructor(instructor)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Instruktur"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteInstructor(instructor.id, instructor.name)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Instruktur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    {/* Avatar & Experience Badge */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-white/10">
                      <img
                        src={instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"}
                        alt={instructor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <span className="text-[9px] font-semibold text-emerald-300 bg-black/75 px-2 py-0.5 rounded-full border border-white/10">
                          {instructor.experience}
                        </span>
                      </div>
                    </div>

                    {/* Name, Role, Affiliation */}
                    <h5 className="text-sm font-bold text-white leading-snug">
                      {instructor.name}
                    </h5>
                    <p className="text-xs font-semibold text-[#E0A97D] mt-0.5">
                      {instructor.role}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {instructor.affiliation}
                    </p>

                    {/* Quote */}
                    {instructor.communityRole && (
                      <div className="mt-3 pt-2.5 border-t border-white/10">
                        <p className="text-[10px] text-gray-300 italic leading-relaxed line-clamp-2">
                          &ldquo;{instructor.communityRole}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  <div className="mt-4 pt-2.5 border-t border-white/5 flex flex-wrap gap-1">
                    {instructor.expertise?.map((exp, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-medium px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VISIBILITY TOGGLES (SEMBUNYIKAN / TAMPILKAN SECTION) */}
      {activeSubTab === "visibility" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Toggle sakelar di bawah untuk menyembunyikan atau menampilkan section di halaman utama secara instan.
              </span>
            </div>
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              {activeCount} / {totalCount} Section Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionList.map((sec) => {
              const Icon = sec.icon;
              const isEnabled = content.sectionsVisibility[sec.key];

              return (
                <div
                  key={sec.key}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    isEnabled
                      ? "bg-[#181B22] border-white/10"
                      : "bg-[#111317] border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isEnabled
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : "bg-white/5 text-gray-500 border-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {sec.name}
                        </h4>
                        {sec.key === "instructors" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Fokus Screenshot
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {sec.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.key)}
                      className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 cursor-pointer flex items-center ${
                        isEnabled ? "bg-emerald-600 justify-end" : "bg-gray-800 justify-start"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                    </button>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isEnabled ? "text-emerald-400" : "text-gray-500"
                      }`}
                    >
                      {isEnabled ? "Ditampilkan" : "Disembunyikan"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: OTHER SECTIONS CONTENT (HERO, FAQ, TESTIMONI) */}
      {activeSubTab === "other" && (
        <div className="space-y-6">
          {/* Hero Banner Text Editor */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Teks Hero Section (Video Loop)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Sub-Badge Hero
                </label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, badge: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Judul Utama Baris 1
                </label>
                <input
                  type="text"
                  value={content.hero.titleLine1}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, titleLine1: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Judul Utama Baris 2 (Warna Aksen)
                </label>
                <input
                  type="text"
                  value={content.hero.titleLine2}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, titleLine2: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={content.hero.description}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Community Section General Text Editor */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Heading Komunitas &amp; Mentoring</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Sub-Badge Komunitas
                </label>
                <input
                  type="text"
                  value={content.community.badge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      community: { ...content.community, badge: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Judul Utama Komunitas
                </label>
                <input
                  type="text"
                  value={content.community.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      community: { ...content.community, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Deskripsi Komunitas
                </label>
                <textarea
                  rows={2}
                  value={content.community.subtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      community: { ...content.community, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INSTRUCTOR */}
      {instructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181B22] border border-white/15 rounded-3xl w-full max-w-xl p-6 sm:p-8 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInstructorModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#B27D56]/20 border border-[#B27D56]/40 flex items-center justify-center text-[#E0A97D]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingInstructor ? "Edit Kartu Instruktur" : "Tambah Instruktur Baru"}
                </h3>
                <p className="text-xs text-gray-400">
                  Data ini akan langsung terlihat di section Tim Pengajar di halaman depan.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveInstructor} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Nama Lengkap &amp; Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.name}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, name: e.target.value })
                    }
                    placeholder="Contoh: Ir. Hendra Wijaya, S.T., M.Eng."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Jabatan / Spesialisasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.role}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, role: e.target.value })
                    }
                    placeholder="Contoh: Senior BIM Manager & Auditor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Lencana Pengalaman (Badge Hijau)
                  </label>
                  <input
                    type="text"
                    value={instructorForm.experience}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, experience: e.target.value })
                    }
                    placeholder="Contoh: 12+ Tahun di Proyek Nasional & BUMN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Afiliasi / Portofolio Proyek
                  </label>
                  <input
                    type="text"
                    value={instructorForm.affiliation}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, affiliation: e.target.value })
                    }
                    placeholder="Contoh: Eks Tim BIM MRT & High-Rise Specialist"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                  />
                </div>
              </div>

              {/* Avatar Upload / URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Foto Profil Instruktur
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-900 border border-white/15 shrink-0">
                    <img
                      src={instructorForm.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingAvatar ? "Mengunggah..." : "Upload Foto Baru"}</span>
                      </button>
                      <span className="text-[11px] text-gray-400">Maksimal 100MB</span>
                    </div>

                    <input
                      type="text"
                      value={instructorForm.avatar}
                      onChange={(e) =>
                        setInstructorForm({ ...instructorForm, avatar: e.target.value })
                      }
                      placeholder="URL gambar (https://...) atau path unggahan (/uploads/...)"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                    />
                  </div>
                </div>
              </div>

              {/* Kutipan Komunitas */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Kutipan / Peran Bimbingan di Komunitas
                </label>
                <textarea
                  rows={2}
                  value={instructorForm.communityRole}
                  onChange={(e) =>
                    setInstructorForm({ ...instructorForm, communityRole: e.target.value })
                  }
                  placeholder='Contoh: "Memandu audit BEP, strategi koordinasi multidisiplin, dan review kesiapan tender BIM."'
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                />
              </div>

              {/* Tag Keahlian / Software */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Tag Keahlian / Software (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="Contoh: Revit Architecture, Parametric Family, LOD 350, Enscape"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                />
              </div>

              {/* Checkbox Visibility */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="instVisibility"
                  checked={instructorForm.isVisible !== false}
                  onChange={(e) =>
                    setInstructorForm({ ...instructorForm, isVisible: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#B27D56] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="instVisibility" className="text-xs text-gray-200 cursor-pointer">
                  Tampilkan kartu instruktur ini di website publik
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setInstructorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B27D56] hover:bg-[#9d6c48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
