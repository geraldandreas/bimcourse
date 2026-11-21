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
  X,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DEFAULT_SITE_CONTENT,
  SiteContentConfig,
  WebInstructor,
  InstructorProject,
  InstructorEducation,
  InstructorExperience,
  InstructorAchievement,
  InstructorCertificate,
  InstructorOrganization,
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
  const [modalTab, setModalTab] = useState<"basic" | "contact" | "projects" | "experience" | "awards">("basic");
  const [editingInstructor, setEditingInstructor] = useState<WebInstructor | null>(null);
  const [instructorForm, setInstructorForm] = useState<WebInstructor>({
    id: "",
    slug: "",
    name: "",
    role: "",
    experience: "",
    affiliation: "",
    expertise: [],
    avatar: "",
    communityRole: "",
    isVisible: true,
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolioLink: "",
    bio: "",
    education: [],
    workExperience: [],
    projects: [],
    achievements: [],
    certificates: [],
    organizations: [],
    softwareSkills: [],
    technicalSkills: [],
    softSkills: [],
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
      slug: `instruktur-${Date.now()}`,
      name: "",
      role: "",
      experience: "5+ Tahun di Industri AEC",
      affiliation: "Praktisi & Konsultan BIM",
      expertise: ["Revit", "BIM"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      communityRole: "Membimbing pemodelan BIM dan review portofolio.",
      isVisible: true,
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolioLink: "",
      bio: "",
      education: [],
      workExperience: [],
      projects: [],
      achievements: [],
      certificates: [],
      organizations: [],
      softwareSkills: [],
      technicalSkills: [],
      softSkills: [],
    });
    setExpertiseInput("Revit, BIM");
    setModalTab("basic");
    setInstructorModalOpen(true);
  };

  const handleOpenEditInstructor = (inst: WebInstructor) => {
    setEditingInstructor(inst);
    setInstructorForm({
      ...inst,
      projects: inst.projects ? [...inst.projects] : [],
      workExperience: inst.workExperience ? [...inst.workExperience] : [],
      education: inst.education ? [...inst.education] : [],
      achievements: inst.achievements ? [...inst.achievements] : [],
      certificates: inst.certificates ? [...inst.certificates] : [],
      organizations: inst.organizations ? [...inst.organizations] : [],
    });
    setExpertiseInput((inst.expertise || []).join(", "));
    setModalTab("basic");
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

    const slug =
      instructorForm.slug && instructorForm.slug.trim().length > 0
        ? instructorForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : instructorForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const readyInstructor: WebInstructor = {
      ...instructorForm,
      slug,
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

  // --- PROJECT MANAGEMENT IN MODAL ---
  const handleAddProject = () => {
    const newProj: InstructorProject = {
      id: `proj-${Date.now()}`,
      title: "Proyek Baru",
      year: new Date().getFullYear().toString(),
      category: "Sayembara & Konsep Arsitektur",
      location: "",
      team: "",
      tools: ["Autodesk Revit", "Chaos Enscape"],
      description: "Deskripsi konsep desain dan strategi spasial.",
      highlights: ["Simulasi daylight", "Efisiensi sirkulasi"],
      image: "/instructors/eddy/portfolio-page-3.png",
      gallery: [],
    };
    setInstructorForm((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
    }));
  };

  const handleUpdateProject = (index: number, field: keyof InstructorProject, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.projects || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, projects: updated };
    });
  };

  const handleDeleteProject = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.projects || [])];
      updated.splice(index, 1);
      return { ...prev, projects: updated };
    });
  };

  // --- WORK EXPERIENCE MANAGEMENT IN MODAL ---
  const handleAddExperience = () => {
    const newExp: InstructorExperience = {
      role: "BIM Modeler / Architectural Designer",
      company: "Nama Perusahaan / Biro",
      period: "2024 - Sekarang",
      location: "Jakarta, Indonesia",
      highlights: ["Penyusunan gambar DED berbasis Autodesk Revit", "Koordinasi multidisiplin"],
    };
    setInstructorForm((prev) => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), newExp],
    }));
  };

  const handleUpdateExperience = (index: number, field: keyof InstructorExperience, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.workExperience || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, workExperience: updated };
    });
  };

  const handleDeleteExperience = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.workExperience || [])];
      updated.splice(index, 1);
      return { ...prev, workExperience: updated };
    });
  };

  // --- EDUCATION MANAGEMENT IN MODAL ---
  const handleAddEducation = () => {
    const newEdu: InstructorEducation = {
      degree: "Sarjana Arsitektur (S.Ars)",
      institution: "Universitas",
      period: "2020 - 2024",
      gpa: "3.75",
      honors: [],
    };
    setInstructorForm((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEdu],
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof InstructorEducation, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, education: updated };
    });
  };

  const handleDeleteEducation = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.education || [])];
      updated.splice(index, 1);
      return { ...prev, education: updated };
    });
  };

  // --- ACHIEVEMENTS & CERTIFICATES ---
  const handleAddAchievement = () => {
    const newAch: InstructorAchievement = {
      year: new Date().getFullYear().toString(),
      title: "Juara Sayembara Desain Arsitektur",
      event: "Nama Kompetisi",
      organizer: "Nama Penyelenggara",
      rank: "Juara 1",
    };
    setInstructorForm((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAch],
    }));
  };

  const handleUpdateAchievement = (index: number, field: keyof InstructorAchievement, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.achievements || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, achievements: updated };
    });
  };

  const handleDeleteAchievement = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.achievements || [])];
      updated.splice(index, 1);
      return { ...prev, achievements: updated };
    });
  };

  const handleAddCertificate = () => {
    const newCert: InstructorCertificate = {
      year: new Date().getFullYear().toString(),
      title: "Autodesk Certified Professional: Revit",
      issuer: "Autodesk",
      image: "/instructors/eddy/portfolio-page-16.png",
    };
    setInstructorForm((prev) => ({
      ...prev,
      certificates: [...(prev.certificates || []), newCert],
    }));
  };

  const handleUpdateCertificate = (index: number, field: keyof InstructorCertificate, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.certificates || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, certificates: updated };
    });
  };

  const handleDeleteCertificate = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.certificates || [])];
      updated.splice(index, 1);
      return { ...prev, certificates: updated };
    });
  };

  // --- FAQ & TESTIMONIAL MANAGEMENT ---
  const handleAddFaq = () => {
    const newFaq: WebFaqItem = {
      id: `faq-${Date.now()}`,
      question: "Pertanyaan Baru?",
      answer: "Jawaban penjelasan detail.",
    };
    setContent((prev) => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: [...prev.faq.items, newFaq],
      },
    }));
  };

  const handleUpdateFaq = (index: number, field: keyof WebFaqItem, val: string) => {
    setContent((prev) => {
      const updated = [...prev.faq.items];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, faq: { ...prev.faq, items: updated } };
    });
  };

  const handleDeleteFaq = (index: number) => {
    setContent((prev) => {
      const updated = [...prev.faq.items];
      updated.splice(index, 1);
      return { ...prev, faq: { ...prev.faq, items: updated } };
    });
  };

  const handleAddTestimonial = () => {
    const newTesti: WebTestimonialItem = {
      id: `testi-${Date.now()}`,
      author: "Nama Alumni",
      role: "BIM Modeler",
      company: "PT Kontraktor Nasional",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      quote: "Materi sangat aplikatif dan sesuai standar proyek nyata.",
      courseTaken: "Revit Architecture & DED",
    };
    setContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        items: [...prev.testimonials.items, newTesti],
      },
    }));
  };

  const handleUpdateTestimonial = (index: number, field: keyof WebTestimonialItem, val: string) => {
    setContent((prev) => {
      const updated = [...prev.testimonials.items];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, testimonials: { ...prev.testimonials, items: updated } };
    });
  };

  const handleDeleteTestimonial = (index: number) => {
    setContent((prev) => {
      const updated = [...prev.testimonials.items];
      updated.splice(index, 1);
      return { ...prev, testimonials: { ...prev.testimonials, items: updated } };
    });
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
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
      name: "Tim Pengajar & Mentor Praktisi",
      description: "Daftar kartu profil instruktur dengan tombol langsung ke halaman CV & portofolio karya.",
      icon: Award,
      targetHref: "/#instructors",
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
            Kelola profil instruktur, portofolio proyek &amp; CV, teks beranda, serta visibilitas section secara menyeluruh.
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
          <span>Tim Pengajar, CV &amp; Portofolio Proyek</span>
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
          <span>Teks Hero, Komunitas, Testimoni &amp; FAQ</span>
        </button>
      </div>

      {/* SUB-TAB 1: INSTRUCTORS & MENTOR PRAKTISI (WITH CV & PORTFOLIO INTEGRATION) */}
      {activeSubTab === "instructors" && (
        <div className="space-y-6">
          {/* Notice Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#B27D56]/15 via-black/40 to-black/40 border border-[#B27D56]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B27D56]/20 border border-[#B27D56]/40 flex items-center justify-center text-[#E0A97D] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Kelola Instruktur, CV &amp; Portofolio Proyek
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      content.sectionsVisibility.instructors
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {content.sectionsVisibility.instructors ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Setiap instruktur memiliki halaman publik CV &amp; portofolio mandiri yang dapat diakses oleh publik dan calon siswa.
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
                    <span>Sembunyikan Section</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tampilkan Section</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenAddInstructor}
                className="px-4 py-2 rounded-xl bg-[#B27D56] hover:bg-[#9d6c48] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Instruktur Baru</span>
              </button>
            </div>
          </div>

          {/* Section Header Text Editor */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-[#B27D56]" />
              <span>Edit Judul &amp; Deskripsi Section Instruktur di Beranda</span>
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

          {/* Instructor Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Daftar Profil Instruktur ({content.instructors.length} Terdaftar)
                </h4>
                <p className="text-xs text-gray-400">
                  Klik tombol &ldquo;Edit Data &amp; Portofolio CV&rdquo; untuk mengubah proyek sayembara, sertifikat, atau riwayat kerja instruktur.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {content.instructors.map((instructor, idx) => {
                const instructorPublicUrl = `/instructors/${instructor.slug || instructor.id}`;
                return (
                  <div
                    key={instructor.id || idx}
                    className={`rounded-3xl p-5 border transition-all flex flex-col justify-between relative group ${
                      instructor.isVisible !== false
                        ? "bg-[#181B22] border-white/10 shadow-lg"
                        : "bg-[#121418] border-white/5 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Top Action & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            instructor.isVisible !== false
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-gray-700/40 text-gray-400 border-gray-600/30"
                          }`}
                        >
                          {instructor.isVisible !== false ? "AKTIF DI BERANDA" : "TERSEMBUNYI"}
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
                            className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                            title="Edit Data & Portofolio"
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

                      {/* Avatar & Experience Badge */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-white/10">
                        <img
                          src={instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"}
                          alt={instructor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
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

                      {/* Portfolio & CV Summary Counts */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-zinc-300">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-gray-400 block">Proyek:</span>
                          <span className="font-bold text-amber-400">{instructor.projects?.length || 0} Karya</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-gray-400 block">Sertifikat:</span>
                          <span className="font-bold text-emerald-400">{instructor.certificates?.length || 0} Dokumen</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <Link
                        href={instructorPublicUrl}
                        target="_blank"
                        className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-amber-500/20 text-white hover:text-amber-300 border border-white/10 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Lihat Halaman CV Publik</span>
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditInstructor(instructor)}
                        className="w-full py-2 px-3 rounded-xl bg-[#B27D56]/20 hover:bg-[#B27D56]/30 text-[#E0A97D] border border-[#B27D56]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Data &amp; Portofolio CV</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VISIBILITY TOGGLES */}
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

      {/* SUB-TAB 3: OTHER CONTENT (HERO, FAQ, TESTIMONI) */}
      {activeSubTab === "other" && (
        <div className="space-y-6">
          {/* Hero Banner Text Editor */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Teks Hero Section (Video Loop Beranda)</span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Judul Utama Baris 2 (Aksen Kuning/Emas)
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Deskripsi Hero
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Teks Tombol Utama
                </label>
                <input
                  type="text"
                  value={content.hero.primaryCtaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, primaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Teks Tombol Sekunder
                </label>
                <input
                  type="text"
                  value={content.hero.secondaryCtaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, secondaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Testimonials Editor */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Kelola Cerita Alumni &amp; Testimoni ({content.testimonials.items.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Testimoni</span>
              </button>
            </div>

            <div className="space-y-3">
              {content.testimonials.items.map((testi, i) => (
                <div key={testi.id || i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Testimoni #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(i)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Hapus testimoni"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Nama Siswa / Alumni</label>
                      <input
                        type="text"
                        value={testi.author}
                        onChange={(e) => handleUpdateTestimonial(i, "author", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Jabatan &amp; Perusahaan</label>
                      <input
                        type="text"
                        value={`${testi.role} • ${testi.company}`}
                        onChange={(e) => {
                          const parts = e.target.value.split("•").map((s) => s.trim());
                          handleUpdateTestimonial(i, "role", parts[0] || "");
                          handleUpdateTestimonial(i, "company", parts[1] || "");
                        }}
                        placeholder="BIM Modeler • PT Wika"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Kelas yang Diikuti</label>
                      <input
                        type="text"
                        value={testi.courseTaken}
                        onChange={(e) => handleUpdateTestimonial(i, "courseTaken", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Kutipan Ulasan / Testimoni</label>
                    <textarea
                      rows={2}
                      value={testi.quote}
                      onChange={(e) => handleUpdateTestimonial(i, "quote", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Editor */}
          <div className="p-5 rounded-2xl bg-[#14171E] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Kelola Tanya Jawab Umum (FAQ - {content.faq.items.length} Butir)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pertanyaan FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {content.faq.items.map((faqItem, i) => (
                <div key={faqItem.id || i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">FAQ #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(i)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Hapus FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Pertanyaan</label>
                    <input
                      type="text"
                      value={faqItem.question}
                      onChange={(e) => handleUpdateFaq(i, "question", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Jawaban</label>
                    <textarea
                      rows={2}
                      value={faqItem.answer}
                      onChange={(e) => handleUpdateFaq(i, "answer", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE MODAL: ADD / EDIT INSTRUCTOR & FULL CV / PORTFOLIO */}
      {instructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#181B22] border border-white/15 rounded-3xl w-full max-w-4xl p-6 sm:p-8 text-white shadow-2xl relative max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B27D56]/20 border border-[#B27D56]/40 flex items-center justify-center text-[#E0A97D]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingInstructor ? `Edit Profil & CV: ${instructorForm.name || "Instruktur"}` : "Tambah Instruktur Baru"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Perubahan akan langsung terbit pada kartu beranda dan halaman CV publik.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInstructorModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center gap-2 py-3 border-b border-white/10 overflow-x-auto shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab("basic")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "basic"
                    ? "bg-[#B27D56] text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>1. Profil &amp; Beranda</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("contact")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "contact"
                    ? "bg-[#B27D56] text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>2. Kontak &amp; Bio CV</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("projects")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "projects"
                    ? "bg-[#B27D56] text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>3. Portofolio Proyek ({instructorForm.projects?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("experience")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "experience"
                    ? "bg-[#B27D56] text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>4. Pengalaman &amp; Pendidikan</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("awards")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "awards"
                    ? "bg-[#B27D56] text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>5. Prestasi &amp; Sertifikat</span>
              </button>
            </div>

            {/* Modal Body with Scrolling */}
            <form onSubmit={handleSaveInstructor} className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* TAB 1: BASIC & HOMEPAGE CARD */}
              {modalTab === "basic" && (
                <div className="space-y-4">
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
                        placeholder="Contoh: Eddy Tuasikal, S.Ars"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Slug URL Halaman CV (Otomatis)
                      </label>
                      <input
                        type="text"
                        value={instructorForm.slug || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, slug: e.target.value })
                        }
                        placeholder="eddy-tuasikal"
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
                        placeholder="Contoh: BIM Modeller & Architectural Designer"
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
                        placeholder="Contoh: 3 Tahun di Proyek Nasional & BUMN"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Afiliasi / Portofolio Proyek Singkat
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
                        </div>

                        <input
                          type="text"
                          value={instructorForm.avatar}
                          onChange={(e) =>
                            setInstructorForm({ ...instructorForm, avatar: e.target.value })
                          }
                          placeholder="URL gambar (https://...) atau path unggahan"
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
                      placeholder="Contoh: Revit, AutoCAD, Navisworks, Enscape, SketchUp"
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
                      Tampilkan kartu instruktur ini di website beranda
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT & DETAILED BIO */}
              {modalTab === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Email Resmi
                      </label>
                      <input
                        type="email"
                        value={instructorForm.email || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, email: e.target.value })
                        }
                        placeholder="eddy.tuasikal18@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={instructorForm.phone || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, phone: e.target.value })
                        }
                        placeholder="+62 813 7070 4533"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Lokasi / Domisili
                      </label>
                      <input
                        type="text"
                        value={instructorForm.location || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, location: e.target.value })
                        }
                        placeholder="Romang Lompoa, Kec. Bontomarannu, Kab. Gowa, Sulawesi Selatan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Profil LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={instructorForm.linkedin || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, linkedin: e.target.value })
                        }
                        placeholder="https://www.linkedin.com/in/eddy-tuasikal"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Tautan Google Drive Dokumen Portofolio / CV PDF
                      </label>
                      <input
                        type="url"
                        value={instructorForm.portfolioLink || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, portfolioLink: e.target.value })
                        }
                        placeholder="https://drive.google.com/file/d/.../view"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Bio / Ringkasan Narasi Profil
                      </label>
                      <textarea
                        rows={4}
                        value={instructorForm.bio || ""}
                        onChange={(e) =>
                          setInstructorForm({ ...instructorForm, bio: e.target.value })
                        }
                        placeholder="Jelaskan latar belakang keahlian arsitektur, penguasaan BIM, dan pengalaman proyek..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS & COMPETITIONS */}
              {modalTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Daftar Karya Sayembara &amp; Proyek Arsitektur
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Proyek</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {instructorForm.projects?.map((proj, pIdx) => (
                      <div key={proj.id || pIdx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">Proyek #{pIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(pIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                            title="Hapus proyek ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Judul Proyek</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => handleUpdateProject(pIdx, "title", e.target.value)}
                              placeholder="Aura Pavilion"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Tahun &amp; Kategori</label>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={proj.year}
                                onChange={(e) => handleUpdateProject(pIdx, "year", e.target.value)}
                                placeholder="2024"
                                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                              />
                              <input
                                type="text"
                                value={proj.category}
                                onChange={(e) => handleUpdateProject(pIdx, "category", e.target.value)}
                                placeholder="Sayembara Paviliun"
                                className="col-span-2 w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Lokasi Proyek</label>
                            <input
                              type="text"
                              value={proj.location || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "location", e.target.value)}
                              placeholder="Tebet Eco Park, Jakarta"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Penghargaan / Juara</label>
                            <input
                              type="text"
                              value={proj.award || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "award", e.target.value)}
                              placeholder="2nd Runner Up Untar 2024"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Anggota Tim Kolaborator</label>
                            <input
                              type="text"
                              value={proj.team || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "team", e.target.value)}
                              placeholder="Nurjannah, Ghifari Aulia Ramadhani, Eddy Tuasikal"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Software / Tools (Pisahkan Koma)</label>
                            <input
                              type="text"
                              value={(proj.tools || []).join(", ")}
                              onChange={(e) =>
                                handleUpdateProject(
                                  pIdx,
                                  "tools",
                                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              placeholder="Autodesk Revit, SketchUp, Chaos Enscape"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Foto Sampul Utama / Gambar</label>
                            <input
                              type="text"
                              value={proj.image || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "image", e.target.value)}
                              placeholder="/instructors/eddy/portfolio-page-3.png"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Galeri Lembar Gambar (Pisahkan Koma)</label>
                            <input
                              type="text"
                              value={(proj.gallery || []).join(", ")}
                              onChange={(e) =>
                                handleUpdateProject(
                                  pIdx,
                                  "gallery",
                                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              placeholder="/instructors/eddy/portfolio-page-3.png, /instructors/eddy/portfolio-page-4.png"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Deskripsi Konsep Proyek</label>
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => handleUpdateProject(pIdx, "description", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: EXPERIENCE & EDUCATION */}
              {modalTab === "experience" && (
                <div className="space-y-6">
                  {/* Work Experience */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Pengalaman Kerja &amp; Praktik Industri
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pengalaman</span>
                      </button>
                    </div>

                    {instructorForm.workExperience?.map((exp, eIdx) => (
                      <div key={eIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">Pengalaman #{eIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(eIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(eIdx, "role", e.target.value)}
                            placeholder="Posisi (contoh: BIM Estimator)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(eIdx, "company", e.target.value)}
                            placeholder="Perusahaan (contoh: PT Midi Utama Indonesia)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={exp.period}
                            onChange={(e) => handleUpdateExperience(eIdx, "period", e.target.value)}
                            placeholder="Periode (contoh: Sep 2026 - Sekarang)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={exp.location || ""}
                            onChange={(e) => handleUpdateExperience(eIdx, "location", e.target.value)}
                            placeholder="Lokasi (contoh: Tangerang, Banten)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Riwayat Pendidikan Formal
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pendidikan</span>
                      </button>
                    </div>

                    {instructorForm.education?.map((edu, edIdx) => (
                      <div key={edIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">Pendidikan #{edIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteEducation(edIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(edIdx, "degree", e.target.value)}
                            placeholder="Gelar (contoh: Bachelor of Architecture (S.Ars))"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(edIdx, "institution", e.target.value)}
                            placeholder="Institusi (contoh: Universitas Hasanuddin)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={edu.period}
                            onChange={(e) => handleUpdateEducation(edIdx, "period", e.target.value)}
                            placeholder="Periode (contoh: 2021 - 2026)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) => handleUpdateEducation(edIdx, "gpa", e.target.value)}
                            placeholder="IPK / GPA (contoh: 3.79 / 4.00)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: AWARDS & CERTIFICATES */}
              {modalTab === "awards" && (
                <div className="space-y-6">
                  {/* Achievements */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Penghargaan Sayembara &amp; Lomba
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddAchievement}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Penghargaan</span>
                      </button>
                    </div>

                    {instructorForm.achievements?.map((ach, aIdx) => (
                      <div key={ach.id || aIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">Penghargaan #{aIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAchievement(aIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ach.title}
                            onChange={(e) => handleUpdateAchievement(aIdx, "title", e.target.value)}
                            placeholder="Gelar Juara (contoh: 2nd Runner Up)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={ach.event}
                            onChange={(e) => handleUpdateAchievement(aIdx, "event", e.target.value)}
                            placeholder="Nama Acara / Lomba"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={ach.organizer}
                            onChange={(e) => handleUpdateAchievement(aIdx, "organizer", e.target.value)}
                            placeholder="Penyelenggara (contoh: Universitas Tarumanagara)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={ach.year}
                            onChange={(e) => handleUpdateAchievement(aIdx, "year", e.target.value)}
                            placeholder="Tahun (contoh: 2024)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Certificates */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Sertifikat Kompetensi &amp; Piagam
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddCertificate}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Sertifikat</span>
                      </button>
                    </div>

                    {instructorForm.certificates?.map((cert, cIdx) => (
                      <div key={cert.id || cIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">Sertifikat #{cIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCertificate(cIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => handleUpdateCertificate(cIdx, "title", e.target.value)}
                            placeholder="Judul Sertifikat"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleUpdateCertificate(cIdx, "issuer", e.target.value)}
                            placeholder="Penerbit (contoh: Ecobuild Indonesia)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={cert.year}
                            onChange={(e) => handleUpdateCertificate(cIdx, "year", e.target.value)}
                            placeholder="Tahun (contoh: 2024)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={cert.image || ""}
                            onChange={(e) => handleUpdateCertificate(cIdx, "image", e.target.value)}
                            placeholder="Path gambar (/instructors/eddy/portfolio-page-16.png)"
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer Action */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
                <span className="text-xs text-gray-400">
                  Semua tab akan tersimpan bersama saat Anda menekan tombol di samping.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInstructorModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#B27D56] hover:bg-[#9d6c48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Simpan Semua Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
