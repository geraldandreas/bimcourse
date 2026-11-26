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
  ChevronUp,
  RefreshCw,
  Link2
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
  InstructorWebinar,
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
  const [activeSubTab, setActiveSubTab] = useState<"visibility" | "instructors" | "sections">("sections");
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("hero");

  // Modal State for Instructor
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<
    "basic" | "contact" | "education" | "experience" | "organization" | "skills" | "projects" | "awards"
  >("basic");
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
    webinars: [],
    softwareSkills: [],
    technicalSkills: [],
    softSkills: [],
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [softwareSkillsInput, setSoftwareSkillsInput] = useState("");
  const [technicalSkillsInput, setTechnicalSkillsInput] = useState("");
  const [softSkillsInput, setSoftSkillsInput] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMediaKey, setUploadingMediaKey] = useState<string | null>(null);
  const [syncingFooterCourses, setSyncingFooterCourses] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSyncFooterCourses = async () => {
    try {
      setSyncingFooterCourses(true);
      const res = await fetch("/api/courses");
      const data = await res.json();
      const liveCourses = (data.courses || []).filter((c: any) => c.published !== false);
      if (liveCourses.length === 0) {
        onShowToast("Belum ada kursus aktif di katalog.");
        return;
      }
      const mapped = liveCourses.slice(0, 6).map((c: any) => ({
        label: c.title,
        href: `/courses/${c.slug}`,
      }));
      mapped.push({ label: "Semua Katalog Kelas", href: "/#courses" });
      setContent((prev) => ({
        ...prev,
        footer: {
          ...(prev.footer || DEFAULT_SITE_CONTENT.footer),
          popularCourses: mapped,
        },
      }));
      onShowToast(`Berhasil menyinkronkan ${liveCourses.length} kursus aktif ke Kelas Populer! Klik Simpan untuk mempublikasikan.`);
    } catch {
      onShowToast("Gagal mengambil daftar kursus aktif.");
    } finally {
      setSyncingFooterCourses(false);
    }
  };

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
      experience: "3+ Tahun di Industri AEC",
      affiliation: "Praktisi & Konsultan BIM",
      expertise: ["Revit", "BIM"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      communityRole: "Membimbing pemodelan BIM dan troubleshooting teknis.",
      isVisible: true,
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolioLink: "",
      bio: "",
      education: [
        {
          degree: "Sarjana Arsitektur (S.Ars)",
          institution: "Universitas",
          period: "2021 - 2026",
          gpa: "3.75",
          honors: ["Konsentrasi Studi Struktur & Konstruksi"],
        },
      ],
      workExperience: [
        {
          role: "BIM Modeler",
          company: "Nama Perusahaan / Konsultan",
          period: "2025 - Sekarang",
          location: "Jakarta, Indonesia",
          highlights: ["Penyusunan gambar kerja DED berbasis Revit"],
        },
      ],
      projects: [],
      achievements: [],
      certificates: [],
      organizations: [],
      webinars: [],
      softwareSkills: [{ name: "Autodesk Revit" }, { name: "AutoCAD" }],
      technicalSkills: ["Architectural Design", "BIM Modeling"],
      softSkills: ["Team Collaboration", "Problem Solving"],
    });
    setExpertiseInput("Revit, BIM");
    setSoftwareSkillsInput("Autodesk Revit, AutoCAD");
    setTechnicalSkillsInput("Architectural Design, BIM Modeling");
    setSoftSkillsInput("Team Collaboration, Problem Solving");
    setModalTab("basic");
    setInstructorModalOpen(true);
  };

  const handleOpenEditInstructor = (inst: WebInstructor) => {
    setEditingInstructor(inst);
    setInstructorForm({
      ...inst,
      education: inst.education ? [...inst.education] : [],
      workExperience: inst.workExperience ? [...inst.workExperience] : [],
      projects: inst.projects ? [...inst.projects] : [],
      achievements: inst.achievements ? [...inst.achievements] : [],
      certificates: inst.certificates ? [...inst.certificates] : [],
      organizations: inst.organizations ? [...inst.organizations] : [],
      webinars: inst.webinars ? [...inst.webinars] : [],
      softwareSkills: inst.softwareSkills ? [...inst.softwareSkills] : [],
      technicalSkills: inst.technicalSkills ? [...inst.technicalSkills] : [],
      softSkills: inst.softSkills ? [...inst.softSkills] : [],
    });
    setExpertiseInput((inst.expertise || []).join(", "));
    setSoftwareSkillsInput((inst.softwareSkills || []).map((s) => s.name).join(", "));
    setTechnicalSkillsInput((inst.technicalSkills || []).join(", "));
    setSoftSkillsInput((inst.softSkills || []).join(", "));
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

    const softSkills = softSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const technicalSkills = technicalSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const softwareSkills = softwareSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const slug =
      instructorForm.slug && instructorForm.slug.trim().length > 0
        ? instructorForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : instructorForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const readyInstructor: WebInstructor = {
      ...instructorForm,
      slug,
      expertise: tags.length > 0 ? tags : ["BIM"],
      softwareSkills,
      technicalSkills,
      softSkills,
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
    onShowToast(`Data instruktur "${readyInstructor.name}" berhasil disimpan!`);
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

  // Generic media upload helper for all CMS sections (images, avatars, video backgrounds)
  const handleCmsMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mediaKey: string,
    onUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingMediaKey(mediaKey);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah media.");
      onUrl(data.url);
      onShowToast("Media berhasil diunggah! Klik Simpan & Publikasikan untuk menerapkan ke web.");
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file media.");
    } finally {
      setUploadingMediaKey(null);
      e.target.value = "";
    }
  };

  // --- EDUCATION MANAGEMENT ---
  const handleAddEducation = () => {
    const newEdu: InstructorEducation = {
      degree: "Sarjana Arsitektur (S.Ars)",
      institution: "Universitas Hasanuddin (Makassar, Indonesia)",
      period: "2021 - 2026",
      gpa: "3.79 / 4.00",
      honors: ["Konsentrasi Studi Struktur & Konstruksi (LBE)"],
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

  // --- WORK EXPERIENCE MANAGEMENT ---
  const handleAddExperience = () => {
    const newExp: InstructorExperience = {
      role: "BIM Estimator",
      company: "PT Midi Utama Indonesia Tbk",
      period: "Sep 2026 - Sekarang",
      location: "Tangerang, Banten",
      highlights: ["Perhitungan volume material (Quantity Take-Off/BoQ) berbasis model BIM 3D"],
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

  // --- ORGANIZATIONS MANAGEMENT ---
  const handleAddOrganization = () => {
    const newOrg: InstructorOrganization = {
      role: "Staff Minat Ilmiah & Bakat",
      organization: "HMA FT Universitas Hasanuddin",
      period: "Agu 2023 - Mei 2024",
      description: "Program kerja pengembangan keilmuan dan minat bakat arsitektur mahasiswa.",
    };
    setInstructorForm((prev) => ({
      ...prev,
      organizations: [...(prev.organizations || []), newOrg],
    }));
  };

  const handleUpdateOrganization = (index: number, field: keyof InstructorOrganization, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.organizations || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, organizations: updated };
    });
  };

  const handleDeleteOrganization = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.organizations || [])];
      updated.splice(index, 1);
      return { ...prev, organizations: updated };
    });
  };

  // --- WEBINARS MANAGEMENT ---
  const handleAddWebinar = () => {
    const newWeb: InstructorWebinar = {
      year: new Date().getFullYear().toString(),
      title: "Webinar Nasional Arsitektur & BIM",
      organizer: "Penyelenggara / Kampus",
      type: "Webinar Nasional",
    };
    setInstructorForm((prev) => ({
      ...prev,
      webinars: [...(prev.webinars || []), newWeb],
    }));
  };

  const handleUpdateWebinar = (index: number, field: keyof InstructorWebinar, val: any) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.webinars || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, webinars: updated };
    });
  };

  const handleDeleteWebinar = (index: number) => {
    setInstructorForm((prev) => {
      const updated = [...(prev.webinars || [])];
      updated.splice(index, 1);
      return { ...prev, webinars: updated };
    });
  };

  // --- PROJECT MANAGEMENT ---
  const handleAddProject = () => {
    const newProj: InstructorProject = {
      id: `proj-${Date.now()}`,
      title: "Aura Pavilion",
      year: "2024",
      category: "Sayembara Paviliun & Ruang Publik",
      location: "Tebet Eco Park, Jakarta",
      team: "Nurjannah, Ghifari Aulia Ramadhani, Eddy Tuasikal",
      tools: ["Autodesk Revit", "SketchUp", "Chaos Enscape"],
      award: "2nd Runner Up - Untar Architectural Design Week 2024",
      description: "Desain paviliun ruang publik yang mengintegrasikan simulasi pencahayaan alami dan struktur parametrik.",
      highlights: ["Analisis daylight 22 Desember", "Struktur kanopi organik", "Detail potongan melintang"],
      image: "/instructors/eddy/portfolio-page-3.png",
      gallery: [
        "/instructors/eddy/portfolio-page-3.png",
        "/instructors/eddy/portfolio-page-4.png",
      ],
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

  // --- ACHIEVEMENTS & CERTIFICATES ---
  const handleAddAchievement = () => {
    const newAch: InstructorAchievement = {
      year: "2024",
      title: "2nd Runner Up (Juara 3)",
      event: "Architectural Design Week Competition Untar",
      organizer: "Universitas Tarumanagara",
      rank: "Juara 3 Nasional",
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
      year: "2024",
      title: "Certificate of Participation - Innovations in Eco-Friendly Architecture",
      issuer: "Ecobuild Indonesia",
      image: "/instructors/eddy/portfolio-page-17.png",
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
      faq: { ...prev.faq, items: [...prev.faq.items, newFaq] },
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
      testimonials: { ...prev.testimonials, items: [...prev.testimonials.items, newTesti] },
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
      <div className="space-y-6 py-4 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
          <div className="space-y-2">
            <div className="h-6 w-64 rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="h-3.5 w-96 max-w-full rounded bg-gray-200/80 dark:bg-white/5" />
          </div>
          <div className="h-10 w-44 rounded-xl bg-amber-500/20" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-10 rounded-xl bg-gray-200/80 dark:bg-white/5" />
            ))}
          </div>
          <div className="lg:col-span-9 p-6 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4">
            <div className="h-6 w-56 rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-12 rounded-xl bg-gray-200/70 dark:bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section list for visibility toggles
  const sectionList: {
    key: keyof SiteContentConfig["sectionsVisibility"];
    name: string;
    description: string;
    icon: any;
  }[] = [
    {
      key: "hero",
      name: "Hero Banner Utama (Cinematic Video)",
      description: "Video background looping, heading 'Learn Today Build Tomorrow', tombol CTA, dan rating proof.",
      icon: Video,
    },
    {
      key: "features",
      name: "3 Kartu Bento Pilar Pembelajaran",
      description: "Skills for Real Opportunities, Your Goals Our Support, dan Terhubung Instruktur.",
      icon: Layers,
    },
    {
      key: "courses",
      name: "Katalog Kursus & Modul BIM",
      description: "Katalog modul interaktif dengan filter kategori, harga/free, dan pendaftaran kelas.",
      icon: Layout,
    },
    {
      key: "roadmaps",
      name: "Jalur Karier (Career Roadmap)",
      description: "Peta jalan karier bertahap dari BIM Modeler, Coordinator, hingga BIM Manager.",
      icon: ArrowRight,
    },
    {
      key: "community",
      name: "Section Komunitas AEC & Sesi Mentoring",
      description: "Ekosistem komunitas, 4 pilar mentoring, dan simulasi tanya-jawab live koordinasi BIM.",
      icon: Users,
    },
    {
      key: "instructors",
      name: "Tim Pengajar & Mentor Praktisi",
      description: "Daftar kartu profil instruktur dengan tombol langsung ke halaman CV & portofolio karya.",
      icon: Award,
    },
    {
      key: "quiz",
      name: "Kuis Rekomendasi Jalur BIM 30 Detik",
      description: "Interaktif mini kuis diagnostik untuk menentukan kursus yang paling sesuai dengan pengguna.",
      icon: HelpCircle,
    },
    {
      key: "testimonials",
      name: "Cerita Alumni & Testimoni Industri",
      description: "Ulasan dari insinyur dan arsitek alumni yang berhasil berkarier di proyek nasional.",
      icon: MessageSquare,
    },
    {
      key: "enterprise",
      name: "Pelatihan Perusahaan (Corporate Training)",
      description: "Section konsultasi in-house training dan implementasi standar BIM ISO 19650 untuk BUMN.",
      icon: Building,
    },
    {
      key: "faq",
      name: "Tanya Jawab Umum (FAQ)",
      description: "Accordion tanya-jawab seputar laptop, sertifikat resmi, lisensi, dan pendampingan.",
      icon: HelpCircle,
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
            Kelola profil instruktur, data CV &amp; portofolio proyek, teks beranda, serta visibilitas section website.
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
              : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-950 border border-gray-200 shadow-2xs dark:bg-white/5 dark:text-gray-400 dark:hover:text-white dark:border-transparent"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tim Pengajar, CV &amp; Portofolio Proyek</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 text-white font-bold">
            {content.instructors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("visibility")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "visibility"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-950 border border-gray-200 shadow-2xs dark:bg-white/5 dark:text-gray-400 dark:hover:text-white dark:border-transparent"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Visibilitas Section (Sembunyikan / Tampilkan)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 text-white font-bold">
            {activeCount}/{totalCount} Aktif
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("sections")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === "sections"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-950 border border-gray-200 shadow-2xs dark:bg-white/5 dark:text-gray-400 dark:hover:text-white dark:border-transparent"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Teks Seluruh Section Web (CMS)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 text-white font-bold">
            12 Section
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: INSTRUCTORS & MENTOR PRAKTISI */}
      {activeSubTab === "instructors" && (
        <div className="space-y-6">
          {/* Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#B27D56]/15 via-[#B27D56]/5 to-transparent dark:from-[#B27D56]/15 dark:via-black/40 dark:to-black/40 border border-[#B27D56]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B27D56]/20 border border-[#B27D56]/40 flex items-center justify-center text-[#E0A97D] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                    Kelola Instruktur, CV &amp; Portofolio
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
                  Setiap instruktur memiliki halaman web mandiri untuk menampilkan riwayat pendidikan, pengalaman kerja, keahlian, dan portofolio proyek.
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

          {/* Section Heading Editor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-[#B27D56]" />
              <span>Edit Judul Section Instruktur di Beranda</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-300 mb-1">
                  Sub-Badge Teks
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#B27D56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-300 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#B27D56]"
                />
              </div>
            </div>
          </div>

          {/* Instructor Cards List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-gray-950 dark:text-white">
                  Daftar Profil Instruktur ({content.instructors.length} Terdaftar)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Klik &ldquo;Edit Data &amp; Portofolio CV&rdquo; untuk mengubah isi CV, pendidikan, pengalaman, keahlian, atau proyek sayembara.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddInstructor}
                className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
                        ? "bg-white dark:bg-[#181B22] border-gray-200 dark:border-white/10 shadow-sm shadow-lg"
                        : "bg-gray-50 dark:bg-[#121418] border-gray-200 dark:border-white/5 opacity-60"
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

                      {/* Avatar */}
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
                      <h5 className="text-sm font-bold text-gray-950 dark:text-white leading-snug">
                        {instructor.name}
                      </h5>
                      <p className="text-xs font-semibold text-[#E0A97D] mt-0.5">
                        {instructor.role}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {instructor.affiliation}
                      </p>

                      {/* Counts */}
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] text-zinc-300">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-center">
                          <span className="text-gray-400 block text-[9px]">Pendidikan:</span>
                          <span className="font-bold text-amber-400">{instructor.education?.length || 0}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-center">
                          <span className="text-gray-400 block text-[9px]">Pengalaman:</span>
                          <span className="font-bold text-emerald-400">{instructor.workExperience?.length || 0}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-center">
                          <span className="text-gray-400 block text-[9px]">Proyek:</span>
                          <span className="font-bold text-blue-400">{instructor.projects?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
                      <Link
                        href={instructorPublicUrl}
                        target="_blank"
                        className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-amber-500/10 text-gray-800 hover:text-amber-700 dark:bg-white/10 dark:hover:bg-amber-500/20 dark:text-white dark:hover:text-amber-300 border border-gray-200 dark:border-white/10 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Buka Halaman CV Publik</span>
                        <ExternalLink className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditInstructor(instructor)}
                        className="w-full py-2 px-3 rounded-xl bg-[#B27D56]/15 hover:bg-[#B27D56]/25 text-[#9A623C] dark:bg-[#B27D56]/20 dark:hover:bg-[#B27D56]/30 dark:text-[#E0A97D] border border-[#B27D56]/30 dark:border-[#B27D56]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isEnabled
                      ? "bg-white dark:bg-[#181B22] border-gray-200 dark:border-white/10 shadow-sm shadow-sm"
                      : "bg-gray-50 dark:bg-[#111317] border-gray-200 dark:border-white/5 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
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
                        <h4 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">
                          {sec.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          {sec.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.key)}
                        className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 cursor-pointer flex items-center ${
                          isEnabled ? "bg-emerald-600 justify-end" : "bg-gray-300 dark:bg-gray-700 justify-start"
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

                  {/* Action Link to Edit Section Text */}
                  <div className="pt-2.5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSectionKey(sec.key);
                        setActiveSubTab("sections");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Teks &amp; Isi Section</span>
                    </button>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {isEnabled ? "Aktif di beranda" : "Tersembunyi"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EDIT TEKS SELURUH SECTION WEB (CMS) */}
      {activeSubTab === "sections" && (
        <div className="space-y-6">
          {/* Section Selection Banner & Quick Navigation */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span>Pilih Section yang Ingin Diedit Kata-Katanya</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Klik salah satu section di bawah untuk mengubah judul, sub-heading, deskripsi, teks tombol, dan badge.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveContent()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Menyimpan..." : "Simpan Teks Web"}</span>
              </button>
            </div>

            {/* Section Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                { key: "hero", label: "Hero Banner", icon: Video },
                { key: "features", label: "3 Bento Features", icon: Layers },
                { key: "courses", label: "Katalog Kursus", icon: Layout },
                { key: "roadmaps", label: "Jalur Karier", icon: ArrowRight },
                { key: "community", label: "Komunitas & 4 Pilar", icon: Users },
                { key: "instructors", label: "Header Tim Pengajar", icon: Award },
                { key: "quiz", label: "Kuis Rekomendasi", icon: HelpCircle },
                { key: "testimonials", label: "Cerita Alumni", icon: MessageSquare },
                { key: "enterprise", label: "Pelatihan Perusahaan", icon: Building },
                { key: "faq", label: "Tanya Jawab (FAQ)", icon: HelpCircle },
                { key: "cta", label: "Pre-Footer Banner", icon: ShieldCheck },
                { key: "footer", label: "Footer, Kontak & Rekening", icon: MapPin },
              ].map((item) => {
                const ItemIcon = item.icon;
                const isSelected = selectedSectionKey === item.key;
                const isVisible =
                  item.key === "footer"
                    ? true
                    : content.sectionsVisibility[item.key as keyof typeof content.sectionsVisibility];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedSectionKey(item.key)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30 dark:bg-blue-600/30 dark:border-blue-400 dark:text-white dark:ring-blue-400/50"
                        : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200/90 hover:border-gray-300 shadow-2xs dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ItemIcon className={`w-4 h-4 ${isSelected ? "text-white dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected
                            ? "bg-white ring-1 ring-white/50"
                            : isVisible
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-rose-500"
                        }`}
                        title={isVisible ? "Section Aktif" : "Section Tersembunyi"}
                      />
                    </div>
                    <span className={`text-xs font-bold truncate leading-tight ${isSelected ? "text-white" : "text-gray-900 dark:text-gray-200"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: HERO */}
          {selectedSectionKey === "hero" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">1. Hero Banner Utama (Cinematic Video)</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Bagian paling atas yang pertama kali dilihat pengunjung web.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.hero ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.hero ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("hero")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.hero ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Sub-Badge Hero (Teks Mengambang di Atas Judul)
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Judul Baris 1
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Judul Baris 2
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Paragraf Deskripsi Hero
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.description}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, description: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Teks Tombol CTA Utama
                  </label>
                  <input
                    type="text"
                    value={content.hero.primaryCtaText || "Eksplor Semua Kelas"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, primaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Teks Tombol Video Showcase
                  </label>
                  <input
                    type="text"
                    value={content.hero.secondaryCtaText || "Tonton Video Pengenalan"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, secondaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Skor Rating Ulasan (Social Proof)
                  </label>
                  <input
                    type="text"
                    value={content.hero.statsRating || "4.94 / 5.0"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, statsRating: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Jumlah Peserta / Alumni (Social Proof)
                  </label>
                  <input
                    type="text"
                    value={content.hero.statsStudents || "18,500+ Mahasiswa & Insinyur Telah Bergabung"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, statsStudents: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* Video / Gambar Background Hero */}
                <div className="md:col-span-2 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-amber-300 block">
                        Media Background Hero (Video MP4 atau Gambar Banner)
                      </span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">
                        Mendukung file video `.mp4` maupun gambar `.jpg/.png/.webp` untuk latar belakang Hero &amp; Showcase.
                      </span>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300 dark:border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {uploadingMediaKey === "hero_video" ? "Mengunggah..." : "Unggah Video / Gambar"}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) =>
                          handleCmsMediaUpload(e, "hero_video", (url) =>
                            setContent((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, videoUrl: url },
                            }))
                          )
                        }
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={content.hero.videoUrl ?? "/hero-bg.mp4"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, videoUrl: e.target.value },
                      })
                    }
                    placeholder="/hero-bg.mp4 atau URL gambar/video..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: BENTO FEATURES */}
          {selectedSectionKey === "features" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">2. Tiga Kartu Bento Pilar Keunggulan</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Menampilkan 3 kartu utama: Kurikulum Praktik, Peta Jalan, dan Bimbingan Instruktur.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.features ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.features ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("features")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.features ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Kartu 1 */}
              <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Kartu 1: Kurikulum &amp; Standar Industri
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Badge Kartu 1</label>
                    <input
                      type="text"
                      value={content.features?.card1Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Judul Kartu 1</label>
                    <input
                      type="text"
                      value={content.features?.card1Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">Deskripsi Kartu 1</label>
                    <textarea
                      rows={2}
                      value={content.features?.card1Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Label Tag 1 (Standar)</label>
                    <input
                      type="text"
                      value={content.features?.card1Tag1 || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1Tag1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Label Tag 2 (LOD)</label>
                    <input
                      type="text"
                      value={content.features?.card1Tag2 || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1Tag2: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Judul Stack Software</label>
                    <input
                      type="text"
                      value={content.features?.card1SoftwareTitle ?? "Stack Software Industri:"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1SoftwareTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Daftar Tag Software (pisahkan koma)</label>
                    <input
                      type="text"
                      value={(content.features?.card1SoftwareTags || ["Revit", "Navisworks", "Tekla", "Dynamo"]).join(", ")}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: {
                            ...(content.features || DEFAULT_SITE_CONTENT.features),
                            card1SoftwareTags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      placeholder="Revit, Navisworks, Tekla, Dynamo"
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                        Gambar Background Kartu 1
                      </span>
                      <label className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingMediaKey === "feat_card1" ? "Mengunggah..." : "Unggah Gambar"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            handleCmsMediaUpload(e, "feat_card1", (url) =>
                              setContent((prev) => ({
                                ...prev,
                                features: { ...(prev.features || DEFAULT_SITE_CONTENT.features), card1ImageUrl: url },
                              }))
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={content.features?.card1ImageUrl || DEFAULT_SITE_CONTENT.features.card1ImageUrl}
                        alt="Preview Kartu 1"
                        className="w-16 h-11 rounded-lg object-cover border border-gray-200 dark:border-white/10 shrink-0"
                      />
                      <input
                        type="text"
                        value={content.features?.card1ImageUrl || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card1ImageUrl: e.target.value },
                          })
                        }
                        placeholder="URL gambar latar belakang kartu 1..."
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu 2 */}
              <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Kartu 2: Peta Jalan Karier &amp; Stepper
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Kartu 2</label>
                    <input
                      type="text"
                      value={content.features?.card2Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Judul Kartu 2</label>
                    <input
                      type="text"
                      value={content.features?.card2Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Deskripsi Kartu 2</label>
                    <textarea
                      rows={2}
                      value={content.features?.card2Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Judul Header Box Stepper</label>
                    <input
                      type="text"
                      value={content.features?.card2BoxTitle ?? "Level Kompetensi & Progresi"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2BoxTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Header Box Stepper</label>
                    <input
                      type="text"
                      value={content.features?.card2BoxBadge ?? "Terarah 100%"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2BoxBadge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Step 1</label>
                      <input
                        type="text"
                        value={content.features?.card2Step1 || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2Step1: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Step 2</label>
                      <input
                        type="text"
                        value={content.features?.card2Step2 || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2Step2: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Step 3</label>
                      <input
                        type="text"
                        value={content.features?.card2Step3 || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card2Step3: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu 3 */}
              <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Kartu 3: Terhubung Instruktur &amp; Praktisi
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Kartu 3</label>
                    <input
                      type="text"
                      value={content.features?.card3Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Judul Kartu 3</label>
                    <input
                      type="text"
                      value={content.features?.card3Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Deskripsi Kartu 3</label>
                    <textarea
                      rows={2}
                      value={content.features?.card3Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Teks Status Atas (Standby)</label>
                    <input
                      type="text"
                      value={content.features?.card3StatusTitle ?? "Instruktur Standby"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3StatusTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Status Atas</label>
                    <input
                      type="text"
                      value={content.features?.card3StatusBadge ?? "Aktif Setiap Hari"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3StatusBadge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* 3 Avatar Mini Kartu 3 */}
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10">
                    {(["card3Avatar1", "card3Avatar2", "card3Avatar3"] as const).map((avatarField, aIdx) => {
                      const avatarVal = (content.features as any)?.[avatarField] || (DEFAULT_SITE_CONTENT.features as any)[avatarField];
                      return (
                        <div key={avatarField} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Avatar #{aIdx + 1}</span>
                            <label className="text-[10px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer">
                              {uploadingMediaKey === avatarField ? "Mengunggah..." : "Unggah"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) =>
                                  handleCmsMediaUpload(e, avatarField, (url) =>
                                    setContent((prev) => ({
                                      ...prev,
                                      features: { ...(prev.features || DEFAULT_SITE_CONTENT.features), [avatarField]: url },
                                    }))
                                  )
                                }
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <img src={avatarVal} alt={`Avatar ${aIdx + 1}`} className="w-7 h-7 rounded-full object-cover border border-gray-300 shrink-0" />
                            <input
                              type="text"
                              value={avatarVal || ""}
                              onChange={(e) =>
                                setContent({
                                  ...content,
                                  features: { ...(content.features || DEFAULT_SITE_CONTENT.features), [avatarField]: e.target.value },
                                })
                              }
                              className="w-full px-2 py-1 rounded bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[10px] font-mono text-gray-800 dark:text-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Pengirim Pesan Chat</label>
                    <input
                      type="text"
                      value={content.features?.card3ChatAuthor || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3ChatAuthor: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Jabatan / Role Pengirim Chat</label>
                    <input
                      type="text"
                      value={content.features?.card3ChatRole || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3ChatRole: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Isi Kutipan Pesan Chat Mentoring</label>
                    <input
                      type="text"
                      value={content.features?.card3ChatQuote || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3ChatQuote: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Teks Member Bawah</label>
                    <input
                      type="text"
                      value={content.features?.card3MembersTag ?? "18.500+ Member AEC"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3MembersTag: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Teks Tautan Bawah</label>
                    <input
                      type="text"
                      value={content.features?.card3LinkText || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          features: { ...(content.features || DEFAULT_SITE_CONTENT.features), card3LinkText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: COURSES CATALOG */}
          {selectedSectionKey === "courses" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">3. Katalog Kelas Spesialisasi BIM</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Heading dan teks pengantar di atas daftar modul kursus.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.courses ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.courses ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("courses")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.courses ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Badge Katalog
                  </label>
                  <input
                    type="text"
                    value={content.courses?.badge || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        courses: { ...(content.courses || DEFAULT_SITE_CONTENT.courses), badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Judul Utama Section
                  </label>
                  <input
                    type="text"
                    value={content.courses?.title || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        courses: { ...(content.courses || DEFAULT_SITE_CONTENT.courses), title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Placeholder Kotak Pencarian
                  </label>
                  <input
                    type="text"
                    value={content.courses?.searchPlaceholder || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        courses: { ...(content.courses || DEFAULT_SITE_CONTENT.courses), searchPlaceholder: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Subtitle / Paragraf Pengantar
                  </label>
                  <textarea
                    rows={2}
                    value={content.courses?.subtitle || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        courses: { ...(content.courses || DEFAULT_SITE_CONTENT.courses), subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CAREER ROADMAPS */}
          {selectedSectionKey === "roadmaps" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">4. Jalur Karier BIM (Learning Path)</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Heading dan teks pengantar pada peta jalan karier bertahap.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.roadmaps ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.roadmaps ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("roadmaps")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.roadmaps ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Badge Roadmap
                  </label>
                  <input
                    type="text"
                    value={content.roadmaps?.badge || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Judul Utama Roadmap
                  </label>
                  <input
                    type="text"
                    value={content.roadmaps?.title || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Subtitle / Paragraf Pengantar
                  </label>
                  <textarea
                    rows={2}
                    value={content.roadmaps?.subtitle || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Label Kotak Gaji</label>
                  <input
                    type="text"
                    value={content.roadmaps?.salaryLabel ?? "Estimasi Standar Gaji Industri"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), salaryLabel: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Catatan Sumber Gaji</label>
                  <input
                    type="text"
                    value={content.roadmaps?.salarySourceNote ?? "Berdasarkan survei BUMN & Konsultan AEC 2026"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), salarySourceNote: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Catatan Bawah CTA Roadmap</label>
                  <input
                    type="text"
                    value={content.roadmaps?.ctaNote ?? "Termasuk bimbingan portfolio review 1-on-1 bersama instruktur berlisensi & simulasi tes teknis kerja."}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), ctaNote: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Awalan Teks Tombol Paket</label>
                  <input
                    type="text"
                    value={content.roadmaps?.ctaBtnPrefix ?? "Ambil Paket"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), ctaBtnPrefix: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Daftar Jalur Karier Spesifik (Tracks) */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Daftar Jalur Karier Spesifik ({(content.roadmaps?.tracks || DEFAULT_SITE_CONTENT.roadmaps.tracks || []).length} Jalur)
                    </h5>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Edit tab jalur karier, estimasi gaji, durasi, target posisi, dan tahapan capstone di setiap jalur.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const curr = content.roadmaps?.tracks || DEFAULT_SITE_CONTENT.roadmaps.tracks || [];
                      setContent({
                        ...content,
                        roadmaps: {
                          ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps),
                          tracks: [
                            ...curr,
                            {
                              id: `track-${Date.now()}`,
                              title: "Jalur Karier Baru",
                              subtitle: "Untuk Engineer & Praktisi BIM",
                              duration: "6 Minggu",
                              targetRole: "BIM Specialist",
                              salaryRange: "Rp 10.000.000 - Rp 18.000.000 / bln",
                              steps: [
                                {
                                  phase: "Tahap 1",
                                  title: "Fondasi & Standar Kerja",
                                  description: "Memahami alur kerja BIM dan pembuatan model terstruktur.",
                                  deliverable: "Model Proyek Dasar",
                                },
                              ],
                            },
                          ],
                        },
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Jalur Karier</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(content.roadmaps?.tracks || DEFAULT_SITE_CONTENT.roadmaps.tracks || []).map((track, tIdx) => {
                    const updateTrack = (patch: Partial<typeof track>) => {
                      const list = [...(content.roadmaps?.tracks || DEFAULT_SITE_CONTENT.roadmaps.tracks || [])];
                      list[tIdx] = { ...list[tIdx], ...patch };
                      setContent({
                        ...content,
                        roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), tracks: list },
                      });
                    };

                    return (
                      <div key={track.id || tIdx} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2">
                          <span className="text-xs font-extrabold text-gray-950 dark:text-amber-300">
                            Jalur #{tIdx + 1}: {track.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(content.roadmaps?.tracks || DEFAULT_SITE_CONTENT.roadmaps.tracks || [])];
                              list.splice(tIdx, 1);
                              setContent({
                                ...content,
                                roadmaps: { ...(content.roadmaps || DEFAULT_SITE_CONTENT.roadmaps), tracks: list },
                              });
                            }}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:text-rose-400 cursor-pointer"
                            title="Hapus Jalur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Judul Tab Jalur</label>
                            <input
                              type="text"
                              value={track.title}
                              onChange={(e) => updateTrack({ title: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Subjudul / Target Peserta</label>
                            <input
                              type="text"
                              value={track.subtitle}
                              onChange={(e) => updateTrack({ subtitle: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Durasi Belajar</label>
                            <input
                              type="text"
                              value={track.duration}
                              onChange={(e) => updateTrack({ duration: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Target Posisi Karier</label>
                            <input
                              type="text"
                              value={track.targetRole}
                              onChange={(e) => updateTrack({ targetRole: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Estimasi Rentang Gaji</label>
                            <input
                              type="text"
                              value={track.salaryRange}
                              onChange={(e) => updateTrack({ salaryRange: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                            />
                          </div>
                        </div>

                        {/* Phases / Steps inside this Track */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                              Tahapan Belajar ({track.steps?.length || 0} Tahap):
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateTrack({
                                  steps: [
                                    ...(track.steps || []),
                                    {
                                      phase: `Tahap ${(track.steps?.length || 0) + 1}`,
                                      title: "Judul Tahap Baru",
                                      description: "Deskripsi materi tahap ini.",
                                      deliverable: "Deliverable Capstone",
                                    },
                                  ],
                                })
                              }
                              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tambah Tahap</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {(track.steps || []).map((st, sIdx) => {
                              const updateStep = (patch: Partial<typeof st>) => {
                                const stepsCopy = [...(track.steps || [])];
                                stepsCopy[sIdx] = { ...stepsCopy[sIdx], ...patch };
                                updateTrack({ steps: stepsCopy });
                              };
                              return (
                                <div key={sIdx} className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <input
                                      type="text"
                                      value={st.phase}
                                      onChange={(e) => updateStep({ phase: e.target.value })}
                                      className="w-24 px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-[10px] font-black text-amber-900 dark:text-amber-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const stepsCopy = [...(track.steps || [])];
                                        stepsCopy.splice(sIdx, 1);
                                        updateTrack({ steps: stepsCopy });
                                      }}
                                      className="text-rose-500 p-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={st.title}
                                    onChange={(e) => updateStep({ title: e.target.value })}
                                    placeholder="Judul Tahap"
                                    className="w-full px-2 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                                  />
                                  <textarea
                                    rows={2}
                                    value={st.description}
                                    onChange={(e) => updateStep({ description: e.target.value })}
                                    placeholder="Deskripsi..."
                                    className="w-full px-2 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[11px] text-gray-700 dark:text-gray-300"
                                  />
                                  <input
                                    type="text"
                                    value={st.deliverable}
                                    onChange={(e) => updateStep({ deliverable: e.target.value })}
                                    placeholder="Bukti Portofolio Capstone"
                                    className="w-full px-2 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: COMMUNITY & 4 PILLARS */}
          {selectedSectionKey === "community" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">5. Section Komunitas AEC &amp; 4 Pilar Mentoring</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Mengatur teks pengantar ekosistem belajar dan 4 pilar mentoring.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.community ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.community ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("community")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.community ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Header Komunitas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Badge Komunitas</label>
                  <input
                    type="text"
                    value={content.community.badge}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Utama Komunitas</label>
                  <input
                    type="text"
                    value={content.community.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Subtitle Komunitas</label>
                  <textarea
                    rows={2}
                    value={content.community.subtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Tag Member Aktif</label>
                  <input
                    type="text"
                    value={content.community.activeMembersText}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, activeMembersText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Tag Mentor BUMN</label>
                  <input
                    type="text"
                    value={content.community.mentorBadgeText}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, mentorBadgeText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Kartu Diskusi</label>
                  <input
                    type="text"
                    value={content.community.cardHeading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, cardHeading: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Deskripsi Kartu Diskusi</label>
                  <input
                    type="text"
                    value={content.community.cardDescription}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, cardDescription: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Kartu Simulasi Live Mentoring & Q&A Chat */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-4">
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  Live Mentoring &amp; Simulasi Forum Q&amp;A
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Atas Live</label>
                    <input
                      type="text"
                      value={content.community.liveBadge ?? "Live Sesi Mentoring Setiap Minggu"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, liveBadge: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Teks Tombol Gabung</label>
                    <input
                      type="text"
                      value={content.community.joinBtnText ?? "Pilih Modul & Bergabung"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, joinBtnText: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Teks Info Akses Instan</label>
                    <input
                      type="text"
                      value={content.community.instantAccessText ?? "Akses langsung diberikan otomatis setelah registrasi kelas."}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, instantAccessText: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={content.community.bullet1 ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, bullet1: e.target.value } })}
                    placeholder="Poin Checklist 1"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.bullet2 ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, bullet2: e.target.value } })}
                    placeholder="Poin Checklist 2"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.bullet3 ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, bullet3: e.target.value } })}
                    placeholder="Poin Checklist 3"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                {/* Chat Header & Participants */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <input
                    type="text"
                    value={content.community.chatChannel ?? "#qna-revit-dan-koordinasi"}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, chatChannel: e.target.value } })}
                    placeholder="Nama Channel Chat"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-mono font-bold text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.chatSubtitle ?? "Komunitas BIMCourse • Didampingi Instruktur Aktif"}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, chatSubtitle: e.target.value } })}
                    placeholder="Subjudul Channel"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.chatOnlineText ?? "1.240 Online"}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, chatOnlineText: e.target.value } })}
                    placeholder="Jumlah Online"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white"
                  />
                </div>

                {/* Student Message Editor */}
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Pertanyaan Siswa di Simulasi Chat</span>
                    <label className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer">
                      {uploadingMediaKey === "comm_student" ? "Mengunggah..." : "Unggah Foto Siswa"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) =>
                          handleCmsMediaUpload(e, "comm_student", (url) =>
                            setContent((prev) => ({
                              ...prev,
                              community: { ...prev.community, studentAvatar: url },
                            }))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={content.community.studentAvatar || DEFAULT_SITE_CONTENT.community.studentAvatar}
                        alt="Student"
                        className="w-7 h-7 rounded-full object-cover border border-gray-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={content.community.studentAvatar ?? ""}
                        onChange={(e) => setContent({ ...content, community: { ...content.community, studentAvatar: e.target.value } })}
                        placeholder="URL Avatar Siswa"
                        className="w-full px-2 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[10px] font-mono text-gray-800 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={content.community.studentName ?? "Fikri Ramadhan"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, studentName: e.target.value } })}
                      placeholder="Nama Siswa"
                      className="px-2.5 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={content.community.studentBadge ?? "Siswa BIMCourse"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, studentBadge: e.target.value } })}
                      placeholder="Label Siswa"
                      className="px-2.5 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={content.community.studentTime ?? "10:42 WIB"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, studentTime: e.target.value } })}
                      placeholder="Waktu"
                      className="px-2.5 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={content.community.studentQuestion ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, studentQuestion: e.target.value } })}
                    placeholder="Isi pertanyaan siswa..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                {/* Mentor Reply Editor */}
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Balasan Instruktur &amp; Lampiran File</span>
                    <label className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer">
                      {uploadingMediaKey === "comm_mentor" ? "Mengunggah..." : "Unggah Foto Mentor"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) =>
                          handleCmsMediaUpload(e, "comm_mentor", (url) =>
                            setContent((prev) => ({
                              ...prev,
                              community: { ...prev.community, mentorAvatar: url },
                            }))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={content.community.mentorAvatar || DEFAULT_SITE_CONTENT.community.mentorAvatar}
                        alt="Mentor"
                        className="w-7 h-7 rounded-full object-cover border border-gray-300 shrink-0"
                      />
                      <input
                        type="text"
                        value={content.community.mentorAvatar ?? ""}
                        onChange={(e) => setContent({ ...content, community: { ...content.community, mentorAvatar: e.target.value } })}
                        placeholder="URL Avatar Mentor"
                        className="w-full px-2 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[10px] font-mono text-gray-800 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={content.community.mentorName ?? "Ir. Hendra Wijaya, S.T."}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, mentorName: e.target.value } })}
                      placeholder="Nama Mentor"
                      className="px-2.5 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={content.community.mentorBadgeLabel ?? "INSTRUKTUR UTAMA"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, mentorBadgeLabel: e.target.value } })}
                      placeholder="Badge Mentor"
                      className="px-2.5 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={content.community.mentorTime ?? "10:48 WIB"}
                      onChange={(e) => setContent({ ...content, community: { ...content.community, mentorTime: e.target.value } })}
                      placeholder="Waktu"
                      className="px-2.5 py-1 rounded bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={content.community.mentorReply ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, mentorReply: e.target.value } })}
                    placeholder="Isi jawaban instruktur..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.mentorAttachment ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, mentorAttachment: e.target.value } })}
                    placeholder="Nama File Lampiran (misal: Detail_Clearance.rvt (2.4 MB))"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-800 dark:text-white"
                  />
                </div>

                {/* Live Sharing Bottom Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <input
                    type="text"
                    value={content.community.liveBannerTitle ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, liveBannerTitle: e.target.value } })}
                    placeholder="Judul Live Sharing"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.liveBannerSchedule ?? ""}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, liveBannerSchedule: e.target.value } })}
                    placeholder="Jadwal & Pemateri"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={content.community.liveBannerBadge ?? "Khusus Member"}
                    onChange={(e) => setContent({ ...content, community: { ...content.community, liveBannerBadge: e.target.value } })}
                    placeholder="Badge Kanan Banner"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 4 Pilar Mentoring */}
              <div className="space-y-4 pt-2">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  4 Pilar Mentoring Eksklusif
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pilar 1 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-gray-300">Pilar 1: Q&amp;A Kendala Modeling</span>
                    <input
                      type="text"
                      placeholder="Badge Pilar 1"
                      value={content.community?.pillar1Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar1Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Judul Pilar 1"
                      value={content.community?.pillar1Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar1Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Pilar 1"
                      value={content.community?.pillar1Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar1Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Pilar 2 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-gray-300">Pilar 2: Live Mentoring Rutin</span>
                    <input
                      type="text"
                      placeholder="Badge Pilar 2"
                      value={content.community?.pillar2Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar2Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Judul Pilar 2"
                      value={content.community?.pillar2Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar2Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Pilar 2"
                      value={content.community?.pillar2Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar2Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Pilar 3 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-gray-300">Pilar 3: Feedback 1-on-1 Mentor</span>
                    <input
                      type="text"
                      placeholder="Badge Pilar 3"
                      value={content.community?.pillar3Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar3Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Judul Pilar 3"
                      value={content.community?.pillar3Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar3Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Pilar 3"
                      value={content.community?.pillar3Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar3Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Pilar 4 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-gray-300">Pilar 4: Aset &amp; Info Loker</span>
                    <input
                      type="text"
                      placeholder="Badge Pilar 4"
                      value={content.community?.pillar4Badge || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar4Badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Judul Pilar 4"
                      value={content.community?.pillar4Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar4Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Pilar 4"
                      value={content.community?.pillar4Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          community: { ...content.community, pillar4Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: INSTRUCTORS HEADER */}
          {selectedSectionKey === "instructors" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">6. Header Tim Pengajar &amp; Mentor di Beranda</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Judul dan pengantar yang muncul tepat di atas deretan kartu pengajar.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.instructors ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.instructors ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("instructors")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.instructors ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Badge Pengajar
                  </label>
                  <input
                    type="text"
                    value={content.community.instructorsBadge}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, instructorsBadge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Judul Section Pengajar
                  </label>
                  <input
                    type="text"
                    value={content.community.instructorsTitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, instructorsTitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Subtitle Pengajar
                  </label>
                  <textarea
                    rows={2}
                    value={content.community.instructorsSubtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        community: { ...content.community, instructorsSubtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Banner to Instructors CRUD Sub-tab */}
              <div className="p-4 rounded-xl bg-[#B27D56]/15 border border-[#B27D56]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#E0A97D] shrink-0" />
                  <p className="text-xs text-gray-300">
                    Untuk menambah instruktur baru atau mengedit riwayat CV &amp; portofolio proyek lengkap, gunakan tab khusus pengajar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("instructors")}
                  className="px-4 py-2 rounded-xl bg-[#B27D56] hover:bg-[#B27D56]/80 text-white text-xs font-bold whitespace-nowrap cursor-pointer shadow-xs"
                >
                  Buka Data Instruktur &amp; CV &rarr;
                </button>
              </div>
            </div>
          )}

          {/* SECTION 7: QUIZ RECOMMENDER */}
          {selectedSectionKey === "quiz" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">7. Kuis Rekomendasi Jalur BIM 30 Detik</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Heading dan panduan langkah kuis rekomendasi interaktif.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.quiz ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.quiz ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("quiz")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.quiz ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Badge Kuis</label>
                  <input
                    type="text"
                    value={content.quiz?.badge || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Utama Kuis</label>
                  <input
                    type="text"
                    value={content.quiz?.title || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Subtitle Kuis</label>
                  <textarea
                    rows={2}
                    value={content.quiz?.subtitle || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Langkah 1 (Latar Belakang)</label>
                  <input
                    type="text"
                    value={content.quiz?.step1Heading || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), step1Heading: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Langkah 2 (Target Karier)</label>
                  <input
                    type="text"
                    value={content.quiz?.step2Heading || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), step2Heading: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Teks Tombol Submit Kuis</label>
                  <input
                    type="text"
                    value={content.quiz?.submitBtnText ?? "Lihat Rekomendasi Kelas Saya"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), submitBtnText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Pilihan Latar Belakang */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Opsi Latar Belakang ({(content.quiz?.backgrounds || DEFAULT_SITE_CONTENT.quiz.backgrounds || []).length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const curr = content.quiz?.backgrounds || DEFAULT_SITE_CONTENT.quiz.backgrounds || [];
                      setContent({
                        ...content,
                        quiz: {
                          ...(content.quiz || DEFAULT_SITE_CONTENT.quiz),
                          backgrounds: [...curr, { id: `bg_${Date.now()}`, label: "Profesi Baru", icon: "👷" }],
                        },
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Profesi</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(content.quiz?.backgrounds || DEFAULT_SITE_CONTENT.quiz.backgrounds || []).map((bg, idx) => (
                    <div key={bg.id || idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <input
                        type="text"
                        value={bg.icon}
                        onChange={(e) => {
                          const list = [...(content.quiz?.backgrounds || DEFAULT_SITE_CONTENT.quiz.backgrounds || [])];
                          list[idx] = { ...list[idx], icon: e.target.value };
                          setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), backgrounds: list } });
                        }}
                        className="w-10 text-center px-1 py-1 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-sm"
                      />
                      <input
                        type="text"
                        value={bg.label}
                        onChange={(e) => {
                          const list = [...(content.quiz?.backgrounds || DEFAULT_SITE_CONTENT.quiz.backgrounds || [])];
                          list[idx] = { ...list[idx], label: e.target.value };
                          setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), backgrounds: list } });
                        }}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = [...(content.quiz?.backgrounds || DEFAULT_SITE_CONTENT.quiz.backgrounds || [])];
                          list.splice(idx, 1);
                          setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), backgrounds: list } });
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Prioritas */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  Opsi Target Prioritas &amp; Hasil Rekomendasi
                </span>
                <div className="space-y-2">
                  {(content.quiz?.goals || DEFAULT_SITE_CONTENT.quiz.goals || []).map((g, idx) => (
                    <div key={g.id || idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <input
                        type="text"
                        value={g.label}
                        onChange={(e) => {
                          const list = [...(content.quiz?.goals || DEFAULT_SITE_CONTENT.quiz.goals || [])];
                          list[idx] = { ...list[idx], label: e.target.value };
                          setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), goals: list } });
                        }}
                        placeholder="Judul Target"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={g.desc}
                        onChange={(e) => {
                          const list = [...(content.quiz?.goals || DEFAULT_SITE_CONTENT.quiz.goals || [])];
                          list[idx] = { ...list[idx], desc: e.target.value };
                          setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), goals: list } });
                        }}
                        placeholder="Deskripsi Target"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">Kartu Rekomendasi Kelas:</span>
                  {(content.quiz?.recommendations || DEFAULT_SITE_CONTENT.quiz.recommendations || []).map((rec, idx) => (
                    <div key={rec.id || idx} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={rec.title}
                          onChange={(e) => {
                            const list = [...(content.quiz?.recommendations || DEFAULT_SITE_CONTENT.quiz.recommendations || [])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), recommendations: list } });
                          }}
                          placeholder="Judul Rekomendasi"
                          className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={rec.match}
                          onChange={(e) => {
                            const list = [...(content.quiz?.recommendations || DEFAULT_SITE_CONTENT.quiz.recommendations || [])];
                            list[idx] = { ...list[idx], match: e.target.value };
                            setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), recommendations: list } });
                          }}
                          placeholder="Kecocokan (misal: 98% Sangat Cocok)"
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                        />
                      </div>
                      <input
                        type="text"
                        value={rec.reason}
                        onChange={(e) => {
                          const list = [...(content.quiz?.recommendations || DEFAULT_SITE_CONTENT.quiz.recommendations || [])];
                          list[idx] = { ...list[idx], reason: e.target.value };
                          setContent({ ...content, quiz: { ...(content.quiz || DEFAULT_SITE_CONTENT.quiz), recommendations: list } });
                        }}
                        placeholder="Alasan rekomendasi..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: TESTIMONIALS */}
          {selectedSectionKey === "testimonials" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">8. Cerita Alumni &amp; Testimoni Industri</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Heading dan daftar ulasan alumni yang tampil di beranda.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.testimonials ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.testimonials ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("testimonials")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.testimonials ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Headings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Badge Testimoni</label>
                  <input
                    type="text"
                    value={content.testimonials.badge}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        testimonials: { ...content.testimonials, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Utama Testimoni</label>
                  <input
                    type="text"
                    value={content.testimonials.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        testimonials: { ...content.testimonials, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Subtitle Testimoni</label>
                  <textarea
                    rows={2}
                    value={content.testimonials.subtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        testimonials: { ...content.testimonials, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Testimonials Items List */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Daftar Kartu Ulasan ({content.testimonials.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddTestimonial}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Testimoni</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {content.testimonials.items.map((testi, i) => (
                    <div key={testi.id || i} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">Testimoni #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(i)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={testi.author}
                          onChange={(e) => handleUpdateTestimonial(i, "author", e.target.value)}
                          placeholder="Nama Alumni"
                          className="px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                        />
                        <input
                          type="text"
                          value={`${testi.role} • ${testi.company}`}
                          onChange={(e) => {
                            const parts = e.target.value.split("•").map((s) => s.trim());
                            handleUpdateTestimonial(i, "role", parts[0] || "");
                            handleUpdateTestimonial(i, "company", parts[1] || "");
                          }}
                          placeholder="Role • Perusahaan"
                          className="px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={testi.courseTaken}
                          onChange={(e) => handleUpdateTestimonial(i, "courseTaken", e.target.value)}
                          placeholder="Kelas Diikuti"
                          className="px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={testi.quote}
                        onChange={(e) => handleUpdateTestimonial(i, "quote", e.target.value)}
                        placeholder="Kutipan ulasan alumni..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10">
                        <img
                          src={testi.avatar}
                          alt={testi.author}
                          className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={testi.avatar}
                          onChange={(e) => handleUpdateTestimonial(i, "avatar", e.target.value)}
                          placeholder="URL Foto Avatar Alumni..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-800 dark:text-white"
                        />
                        <label className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingMediaKey === `testi_${i}` ? "Mengunggah..." : "Unggah Foto"}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) =>
                              handleCmsMediaUpload(e, `testi_${i}`, (url) =>
                                handleUpdateTestimonial(i, "avatar", url)
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: ENTERPRISE */}
          {selectedSectionKey === "enterprise" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">9. Pelatihan Perusahaan (Corporate Training)</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Solusi B2B untuk korporasi, kontraktor BUMN, dan konsultasi tender.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.enterprise ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.enterprise ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("enterprise")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.enterprise ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Headings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Badge Enterprise</label>
                  <input
                    type="text"
                    value={content.enterprise?.badge || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Utama</label>
                  <input
                    type="text"
                    value={content.enterprise?.title || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Subtitle / Pengantar</label>
                  <textarea
                    rows={2}
                    value={content.enterprise?.subtitle || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 3 Benefits */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  3 Manfaat Korporasi (Benefit Cards)
                </h5>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <label className="block text-[11px] font-bold text-gray-300">Benefit 1</label>
                    <input
                      type="text"
                      placeholder="Judul Benefit 1"
                      value={content.enterprise?.benefit1Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), benefit1Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Benefit 1"
                      value={content.enterprise?.benefit1Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), benefit1Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <label className="block text-[11px] font-bold text-gray-300">Benefit 2</label>
                    <input
                      type="text"
                      placeholder="Judul Benefit 2"
                      value={content.enterprise?.benefit2Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), benefit2Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Benefit 2"
                      value={content.enterprise?.benefit2Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), benefit2Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                    <label className="block text-[11px] font-bold text-gray-300">Benefit 3</label>
                    <input
                      type="text"
                      placeholder="Judul Benefit 3"
                      value={content.enterprise?.benefit3Title || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), benefit3Title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Deskripsi Benefit 3"
                      value={content.enterprise?.benefit3Desc || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), benefit3Desc: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form Texts */}
              <div className="pt-2 space-y-3">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Teks Kartu Formulir Konsultasi
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Judul Formulir</label>
                    <input
                      type="text"
                      value={content.enterprise?.formTitle || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), formTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Subtitle Formulir</label>
                    <input
                      type="text"
                      value={content.enterprise?.formSubtitle || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), formSubtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Teks Tombol Kirim</label>
                    <input
                      type="text"
                      value={content.enterprise?.formBtnText || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          enterprise: { ...(content.enterprise || DEFAULT_SITE_CONTENT.enterprise), formBtnText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: FAQ */}
          {selectedSectionKey === "faq" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">10. Tanya Jawab Umum (FAQ)</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Heading dan daftar pertanyaan yang sering diajukan calon peserta.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.faq ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.faq ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("faq")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.faq ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Headings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Badge FAQ</label>
                  <input
                    type="text"
                    value={content.faq.badge}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        faq: { ...content.faq, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Judul Utama FAQ</label>
                  <input
                    type="text"
                    value={content.faq.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        faq: { ...content.faq, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">Subtitle FAQ</label>
                  <textarea
                    rows={2}
                    value={content.faq.subtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        faq: { ...content.faq, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* FAQ Items */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Daftar Pertanyaan &amp; Jawaban ({content.faq.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {content.faq.items.map((faqItem, i) => (
                    <div key={faqItem.id || i} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300">FAQ #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(i)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faqItem.question}
                        onChange={(e) => handleUpdateFaq(i, "question", e.target.value)}
                        placeholder="Pertanyaan"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={faqItem.answer}
                        onChange={(e) => handleUpdateFaq(i, "answer", e.target.value)}
                        placeholder="Jawaban"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11: PRE-FOOTER CTA */}
          {selectedSectionKey === "cta" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">11. Pre-Footer Banner CTA (Penutup)</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Banner ajakan bergabung terakhir di atas footer dengan garansi kepuasan.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    content.sectionsVisibility.cta ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent font-bold" : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-bold"
                  }`}>
                    {content.sectionsVisibility.cta ? "SECTION AKTIF" : "SECTION TERSEMBUNYI"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("cta")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-gray-200 dark:border-transparent transition-colors cursor-pointer"
                  >
                    {content.sectionsVisibility.cta ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Badge Garansi / Highlight
                  </label>
                  <input
                    type="text"
                    value={content.cta?.badge || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cta: { ...(content.cta || DEFAULT_SITE_CONTENT.cta), badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Judul Utama CTA
                  </label>
                  <input
                    type="text"
                    value={content.cta?.title || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cta: { ...(content.cta || DEFAULT_SITE_CONTENT.cta), title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Paragraf Subtitle / Ajakan
                  </label>
                  <textarea
                    rows={2}
                    value={content.cta?.subtitle || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cta: { ...(content.cta || DEFAULT_SITE_CONTENT.cta), subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Teks Tombol CTA Utama
                  </label>
                  <input
                    type="text"
                    value={content.cta?.primaryBtnText || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cta: { ...(content.cta || DEFAULT_SITE_CONTENT.cta), primaryBtnText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Teks Tombol CTA Sekunder
                  </label>
                  <input
                    type="text"
                    value={content.cta?.secondaryBtnText || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cta: { ...(content.cta || DEFAULT_SITE_CONTENT.cta), secondaryBtnText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: FOOTER */}
          {selectedSectionKey === "footer" && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 dark:bg-zinc-500/20 dark:text-zinc-300 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 dark:text-white">12. Footer &amp; Informasi Kontak Resmi</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tagline brand, alamat, email, WhatsApp advisor, serta daftar tautan Kelas Populer &amp; Tautan Cepat.</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                  SELALU DITAMPILKAN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Tagline Brand di Footer
                  </label>
                  <textarea
                    rows={2}
                    value={content.footer?.tagline || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), tagline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Alamat Kantor / Studio
                  </label>
                  <input
                    type="text"
                    value={content.footer?.address || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), address: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Email Kontak / Dukungan
                  </label>
                  <input
                    type="text"
                    value={content.footer?.email || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), email: e.target.value },
                      })
                    }
                    placeholder="bim.courseacad@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Nomor WhatsApp / Phone Student Advisor
                  </label>
                  <input
                    type="text"
                    value={content.footer?.phone || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), phone: e.target.value },
                      })
                    }
                    placeholder="+62 815 2417 3386 (WhatsApp Student Advisor)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Footer Column 2: Kelas Populer */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kolom 2: Kelas Populer</span>
                    </h5>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Daftar tautan kelas di footer. Bisa disinkronkan langsung dari modul aktif atau diedit manual.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncFooterCourses}
                      disabled={syncingFooterCourses}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 dark:text-blue-300 dark:border-blue-500/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingFooterCourses ? "animate-spin" : ""}`} />
                      <span>{syncingFooterCourses ? "Menyinkronkan..." : "Ambil dari Kursus Aktif"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const current = content.footer?.popularCourses || DEFAULT_SITE_CONTENT.footer.popularCourses || [];
                        setContent({
                          ...content,
                          footer: {
                            ...(content.footer || DEFAULT_SITE_CONTENT.footer),
                            popularCourses: [...current, { label: "Kelas Baru", href: "/#courses" }],
                          },
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kelas</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Judul Kolom Kelas Populer
                  </label>
                  <input
                    type="text"
                    value={content.footer?.popularCoursesTitle ?? "Kelas Populer"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...(content.footer || DEFAULT_SITE_CONTENT.footer),
                          popularCoursesTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  {(content.footer?.popularCourses || DEFAULT_SITE_CONTENT.footer.popularCourses || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10"
                    >
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Nama Tampilan Kelas (misal: Revit Basic)"
                          value={item.label}
                          onChange={(e) => {
                            const list = [...(content.footer?.popularCourses || DEFAULT_SITE_CONTENT.footer.popularCourses || [])];
                            list[idx] = { ...list[idx], label: e.target.value };
                            setContent({
                              ...content,
                              footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), popularCourses: list },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="URL / Path (misal: /courses/revit-basic atau /#courses)"
                          value={item.href}
                          onChange={(e) => {
                            const list = [...(content.footer?.popularCourses || DEFAULT_SITE_CONTENT.footer.popularCourses || [])];
                            list[idx] = { ...list[idx], href: e.target.value };
                            setContent({
                              ...content,
                              footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), popularCourses: list },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(content.footer?.popularCourses || DEFAULT_SITE_CONTENT.footer.popularCourses || [])];
                            list.splice(idx, 1);
                            setContent({
                              ...content,
                              footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), popularCourses: list },
                            });
                          }}
                          title="Hapus Tautan"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Column 3: Tautan Cepat */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Kolom 3: Tautan Cepat</span>
                    </h5>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Tautan navigasi cepat ke bagian halaman atau URL lain di website.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setContent({
                          ...content,
                          footer: {
                            ...(content.footer || DEFAULT_SITE_CONTENT.footer),
                            quickLinks: DEFAULT_SITE_CONTENT.footer.quickLinks,
                          },
                        });
                        onShowToast("Tautan Cepat di-reset sesuai section asli website!");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 dark:bg-white/10 dark:hover:bg-white/15 dark:text-gray-200 dark:border-white/10 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Section Asli</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const current = content.footer?.quickLinks || DEFAULT_SITE_CONTENT.footer.quickLinks || [];
                        setContent({
                          ...content,
                          footer: {
                            ...(content.footer || DEFAULT_SITE_CONTENT.footer),
                            quickLinks: [...current, { label: "Tautan Baru", href: "/#courses" }],
                          },
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Tautan</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Judul Kolom Tautan Cepat
                  </label>
                  <input
                    type="text"
                    value={content.footer?.quickLinksTitle ?? "Tautan Cepat"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: {
                          ...(content.footer || DEFAULT_SITE_CONTENT.footer),
                          quickLinksTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  {(content.footer?.quickLinks || DEFAULT_SITE_CONTENT.footer.quickLinks || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10"
                    >
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Label Tautan (misal: Roadmap Karier BIM)"
                          value={item.label}
                          onChange={(e) => {
                            const list = [...(content.footer?.quickLinks || DEFAULT_SITE_CONTENT.footer.quickLinks || [])];
                            list[idx] = { ...list[idx], label: e.target.value };
                            setContent({
                              ...content,
                              footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), quickLinks: list },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="URL / Anchor (misal: /#roadmaps)"
                          value={item.href}
                          onChange={(e) => {
                            const list = [...(content.footer?.quickLinks || DEFAULT_SITE_CONTENT.footer.quickLinks || [])];
                            list[idx] = { ...list[idx], href: e.target.value };
                            setContent({
                              ...content,
                              footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), quickLinks: list },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(content.footer?.quickLinks || DEFAULT_SITE_CONTENT.footer.quickLinks || [])];
                            list.splice(idx, 1);
                            setContent({
                              ...content,
                              footer: { ...(content.footer || DEFAULT_SITE_CONTENT.footer), quickLinks: list },
                            });
                          }}
                          title="Hapus Tautan"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Bank Accounts Editor */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">Rekening Pembayaran (Transfer Bank)</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Daftar rekening tujuan pembayaran kelas di modal Checkout siswa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current =
                        content.payment?.bankAccounts || DEFAULT_SITE_CONTENT.payment?.bankAccounts || [];
                      setContent({
                        ...content,
                        payment: {
                          ...(content.payment || DEFAULT_SITE_CONTENT.payment),
                          bankAccounts: [
                            ...current,
                            {
                              id: `bank-${Date.now()}`,
                              bankName: "Nama Bank",
                              accountNumber: "",
                              accountHolder: "Eddy Tuasikal",
                            },
                          ],
                        },
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Rekening</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Instruksi Transfer di Modal Checkout
                  </label>
                  <input
                    type="text"
                    value={
                      content.payment?.instructionNote ??
                      DEFAULT_SITE_CONTENT.payment?.instructionNote ??
                      ""
                    }
                    onChange={(e) =>
                      setContent({
                        ...content,
                        payment: {
                          ...(content.payment || DEFAULT_SITE_CONTENT.payment || { bankAccounts: [] }),
                          instructionNote: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2.5">
                  {(
                    content.payment?.bankAccounts ||
                    DEFAULT_SITE_CONTENT.payment?.bankAccounts ||
                    []
                  ).map((bank, idx) => (
                    <div
                      key={bank.id || idx}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Nama Bank (mis. SeaBank)"
                          value={bank.bankName}
                          onChange={(e) => {
                            const list = [
                              ...(content.payment?.bankAccounts ||
                                DEFAULT_SITE_CONTENT.payment?.bankAccounts ||
                                []),
                            ];
                            list[idx] = { ...list[idx], bankName: e.target.value };
                            setContent({
                              ...content,
                              payment: {
                                ...(content.payment || DEFAULT_SITE_CONTENT.payment),
                                bankAccounts: list,
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Nomor Rekening"
                          value={bank.accountNumber}
                          onChange={(e) => {
                            const list = [
                              ...(content.payment?.bankAccounts ||
                                DEFAULT_SITE_CONTENT.payment?.bankAccounts ||
                                []),
                            ];
                            list[idx] = { ...list[idx], accountNumber: e.target.value };
                            setContent({
                              ...content,
                              payment: {
                                ...(content.payment || DEFAULT_SITE_CONTENT.payment),
                                bankAccounts: list,
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Atas Nama"
                          value={bank.accountHolder}
                          onChange={(e) => {
                            const list = [
                              ...(content.payment?.bankAccounts ||
                                DEFAULT_SITE_CONTENT.payment?.bankAccounts ||
                                []),
                            ];
                            list[idx] = { ...list[idx], accountHolder: e.target.value };
                            setContent({
                              ...content,
                              payment: {
                                ...(content.payment || DEFAULT_SITE_CONTENT.payment),
                                bankAccounts: list,
                              },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [
                              ...(content.payment?.bankAccounts ||
                                DEFAULT_SITE_CONTENT.payment?.bankAccounts ||
                                []),
                            ];
                            list.splice(idx, 1);
                            setContent({
                              ...content,
                              payment: {
                                ...(content.payment || DEFAULT_SITE_CONTENT.payment),
                                bankAccounts: list,
                              },
                            });
                          }}
                          title="Hapus Rekening"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Global Save Floating Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#181B22] border border-gray-200 dark:border-white/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Perubahan pada teks akan langsung diterapkan ke seluruh halaman website BIMCourse setelah disimpan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSaveContent()}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Publikasikan Perubahan Sekarang"}</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE MODAL: EDIT / ADD INSTRUCTOR WITH COMPLETE CV SECTIONS */}
      {instructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#181B22] border border-gray-200 dark:border-white/15 rounded-3xl w-full max-w-4xl p-6 sm:p-8 text-gray-900 dark:text-white shadow-2xl relative max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B27D56]/20 border border-[#B27D56]/40 flex items-center justify-center text-[#9A623C] dark:text-[#E0A97D]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
                    {editingInstructor ? `Edit Profil & CV: ${instructorForm.name || "Instruktur"}` : "Tambah Instruktur Baru"}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Semua data pendidikan, pengalaman kerja, keahlian, dan portofolio dapat diubah langsung.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInstructorModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center gap-2 py-3 border-b border-gray-200 dark:border-white/10 overflow-x-auto shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab("basic")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "basic" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>1. Profil &amp; Beranda</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("contact")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "contact" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>2. Kontak</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("education")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "education" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>3. Pendidikan ({instructorForm.education?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("experience")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "experience" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>4. Pengalaman Kerja ({instructorForm.workExperience?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("organization")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "organization" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>5. Organisasi &amp; Webinar</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("skills")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "skills" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>6. Keahlian &amp; Software</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("projects")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "projects" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>7. Portofolio Proyek ({instructorForm.projects?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("awards")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  modalTab === "awards" ? "bg-[#B27D56] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-950 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-transparent"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>8. Prestasi &amp; Sertifikat</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInstructor} className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* TAB 1: BASIC PROFILE */}
              {modalTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Nama Lengkap &amp; Gelar *
                      </label>
                      <input
                        type="text"
                        required
                        value={instructorForm.name}
                        onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                        placeholder="Contoh: Eddy Tuasikal, S.Ars"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Slug URL Halaman CV
                      </label>
                      <input
                        type="text"
                        value={instructorForm.slug || ""}
                        onChange={(e) => setInstructorForm({ ...instructorForm, slug: e.target.value })}
                        placeholder="eddy-tuasikal"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Jabatan / Spesialisasi *
                      </label>
                      <input
                        type="text"
                        required
                        value={instructorForm.role}
                        onChange={(e) => setInstructorForm({ ...instructorForm, role: e.target.value })}
                        placeholder="BIM Modeller & Architectural Designer"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Lencana Pengalaman (Badge Hijau)
                      </label>
                      <input
                        type="text"
                        value={instructorForm.experience}
                        onChange={(e) => setInstructorForm({ ...instructorForm, experience: e.target.value })}
                        placeholder="3 Tahun di Proyek Nasional & BUMN"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Afiliasi / Spesialisasi Singkat
                      </label>
                      <input
                        type="text"
                        value={instructorForm.affiliation}
                        onChange={(e) => setInstructorForm({ ...instructorForm, affiliation: e.target.value })}
                        placeholder="Eks Tim BIM MRT & High-Rise Specialist"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                      />
                    </div>
                  </div>

                  {/* Avatar Upload / URL */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Foto Profil Instruktur
                    </label>
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs">
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
                          onChange={(e) => setInstructorForm({ ...instructorForm, avatar: e.target.value })}
                          placeholder="URL gambar (https://...) atau path unggahan"
                          className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kutipan Komunitas */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Kutipan Bimbingan di Komunitas
                    </label>
                    <textarea
                      rows={2}
                      value={instructorForm.communityRole}
                      onChange={(e) => setInstructorForm({ ...instructorForm, communityRole: e.target.value })}
                      placeholder='Contoh: "Memandu audit BEP, strategi koordinasi multidisiplin, dan review kesiapan tender BIM."'
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                    />
                  </div>

                  {/* Tag Keahlian Cepat di Kartu Beranda */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Tag Singkat Kartu Beranda (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      placeholder="Contoh: Revit, AutoCAD, Navisworks, Enscape, SketchUp"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#B27D56]"
                    />
                  </div>

                  {/* Checkbox Visibility */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="instVisibility"
                      checked={instructorForm.isVisible !== false}
                      onChange={(e) => setInstructorForm({ ...instructorForm, isVisible: e.target.checked })}
                      className="w-4 h-4 rounded text-[#B27D56] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="instVisibility" className="text-xs text-gray-200 cursor-pointer">
                      Tampilkan kartu instruktur ini di beranda
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT */}
              {modalTab === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Email Resmi
                      </label>
                      <input
                        type="email"
                        value={instructorForm.email || ""}
                        onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                        placeholder="eddy.tuasikal18@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={instructorForm.phone || ""}
                        onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                        placeholder="+62 813 7070 4533"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Lokasi / Domisili
                      </label>
                      <input
                        type="text"
                        value={instructorForm.location || ""}
                        onChange={(e) => setInstructorForm({ ...instructorForm, location: e.target.value })}
                        placeholder="Gowa, Sulawesi Selatan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={instructorForm.linkedin || ""}
                        onChange={(e) => setInstructorForm({ ...instructorForm, linkedin: e.target.value })}
                        placeholder="https://www.linkedin.com/in/eddy-tuasikal"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Tautan Google Drive Portofolio PDF
                      </label>
                      <input
                        type="url"
                        value={instructorForm.portfolioLink || ""}
                        onChange={(e) => setInstructorForm({ ...instructorForm, portfolioLink: e.target.value })}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EDUCATION */}
              {modalTab === "education" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Riwayat Pendidikan Formal ({instructorForm.education?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pendidikan</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {instructorForm.education?.map((edu, edIdx) => (
                      <div key={edIdx} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">Pendidikan #{edIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteEducation(edIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Gelar Pendidikan</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleUpdateEducation(edIdx, "degree", e.target.value)}
                              placeholder="Bachelor of Architecture (S.Ars)"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Institusi / Universitas</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleUpdateEducation(edIdx, "institution", e.target.value)}
                              placeholder="Universitas Hasanuddin (Makassar, Indonesia)"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Periode Studi</label>
                            <input
                              type="text"
                              value={edu.period}
                              onChange={(e) => handleUpdateEducation(edIdx, "period", e.target.value)}
                              placeholder="Agu 2021 - Mei 2026"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">IPK / GPA</label>
                            <input
                              type="text"
                              value={edu.gpa || ""}
                              onChange={(e) => handleUpdateEducation(edIdx, "gpa", e.target.value)}
                              placeholder="3.79 / 4.00"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">
                              Capaian &amp; Catatan Studi (Satu poin per baris)
                            </label>
                            <textarea
                              rows={3}
                              value={(edu.honors || []).join("\n")}
                              onChange={(e) =>
                                handleUpdateEducation(
                                  edIdx,
                                  "honors",
                                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              placeholder="Konsentrasi Studi Struktur & Konstruksi&#10;2nd Runner Up Untar ADW 2024"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: WORK EXPERIENCE */}
              {modalTab === "experience" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Pengalaman Kerja &amp; Praktik Industri ({instructorForm.workExperience?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pengalaman</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {instructorForm.workExperience?.map((exp, eIdx) => (
                      <div key={eIdx} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">Pengalaman #{eIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(eIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Posisi / Role</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => handleUpdateExperience(eIdx, "role", e.target.value)}
                              placeholder="BIM Estimator"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Nama Perusahaan / Biro</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(eIdx, "company", e.target.value)}
                              placeholder="PT Midi Utama Indonesia Tbk"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Periode</label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => handleUpdateExperience(eIdx, "period", e.target.value)}
                              placeholder="Sep 2026 - Sekarang"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Lokasi</label>
                            <input
                              type="text"
                              value={exp.location || ""}
                              onChange={(e) => handleUpdateExperience(eIdx, "location", e.target.value)}
                              placeholder="Tangerang, Banten"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">
                              Poin Tanggung Jawab &amp; Prestasi (Satu poin per baris)
                            </label>
                            <textarea
                              rows={3}
                              value={(exp.highlights || []).join("\n")}
                              onChange={(e) =>
                                handleUpdateExperience(
                                  eIdx,
                                  "highlights",
                                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              placeholder="Perhitungan volume material berbasis BIM&#10;Koordinasi gambar kerja DED"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ORGANIZATIONS & WEBINARS */}
              {modalTab === "organization" && (
                <div className="space-y-6">
                  {/* Organizations */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Pengalaman Organisasi &amp; Kepanitiaan ({instructorForm.organizations?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOrganization}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Organisasi</span>
                      </button>
                    </div>

                    {instructorForm.organizations?.map((org, oIdx) => (
                      <div key={oIdx} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">Organisasi #{oIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrganization(oIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={org.role}
                            onChange={(e) => handleUpdateOrganization(oIdx, "role", e.target.value)}
                            placeholder="Jabatan (contoh: Staff Minat Ilmiah)"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={org.organization}
                            onChange={(e) => handleUpdateOrganization(oIdx, "organization", e.target.value)}
                            placeholder="Organisasi (contoh: HMA FT Unhas)"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={org.period}
                            onChange={(e) => handleUpdateOrganization(oIdx, "period", e.target.value)}
                            placeholder="Periode (contoh: 2023 - 2024)"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                        <input
                          type="text"
                          value={org.description || ""}
                          onChange={(e) => handleUpdateOrganization(oIdx, "description", e.target.value)}
                          placeholder="Deskripsi kegiatan atau tanggung jawab..."
                          className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Webinars */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Webinar, Kuliah Umum &amp; Pelatihan ({instructorForm.webinars?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddWebinar}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Webinar</span>
                      </button>
                    </div>

                    {instructorForm.webinars?.map((web, wIdx) => (
                      <div key={wIdx} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">Webinar #{wIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteWebinar(wIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={web.year}
                            onChange={(e) => handleUpdateWebinar(wIdx, "year", e.target.value)}
                            placeholder="Tahun"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={web.title}
                            onChange={(e) => handleUpdateWebinar(wIdx, "title", e.target.value)}
                            placeholder="Judul Acara / Tema Webinar"
                            className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={web.organizer}
                            onChange={(e) => handleUpdateWebinar(wIdx, "organizer", e.target.value)}
                            placeholder="Penyelenggara"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SKILLS MATRIX */}
              {modalTab === "skills" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Software BIM &amp; Desain (Pisahkan dengan koma)
                    </label>
                    <textarea
                      rows={2}
                      value={softwareSkillsInput}
                      onChange={(e) => setSoftwareSkillsInput(e.target.value)}
                      placeholder="Autodesk Revit, AutoCAD, Navisworks, SketchUp, Chaos Enscape, D5 Render, Canva, Microsoft Office"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Keahlian Teknis Arsitektur (Pisahkan dengan koma)
                    </label>
                    <textarea
                      rows={2}
                      value={technicalSkillsInput}
                      onChange={(e) => setTechnicalSkillsInput(e.target.value)}
                      placeholder="Architectural Design, BIM Modeling LOD 300 - 350, Interior Design, Tropical Sustainable Design, Daylight Simulation, BoQ / Cost Estimation, Working Drawing (DED)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                      Soft Skills &amp; Kolaborasi (Pisahkan dengan koma)
                    </label>
                    <textarea
                      rows={2}
                      value={softSkillsInput}
                      onChange={(e) => setSoftSkillsInput(e.target.value)}
                      placeholder="Problem Solving, Adaptability, Analytical Thinking, Team Collaboration, Project Coordination, Effective Communication, Time Management"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: PROJECTS */}
              {modalTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Daftar Karya Sayembara &amp; Proyek ({instructorForm.projects?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Proyek</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {instructorForm.projects?.map((proj, pIdx) => (
                      <div key={proj.id || pIdx} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">Proyek #{pIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(pIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
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
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
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
                                className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                              />
                              <input
                                type="text"
                                value={proj.category}
                                onChange={(e) => handleUpdateProject(pIdx, "category", e.target.value)}
                                placeholder="Sayembara Paviliun"
                                className="col-span-2 w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
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
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Penghargaan / Juara</label>
                            <input
                              type="text"
                              value={proj.award || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "award", e.target.value)}
                              placeholder="2nd Runner Up Untar 2024"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Anggota Tim Kolaborator</label>
                            <input
                              type="text"
                              value={proj.team || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "team", e.target.value)}
                              placeholder="Nurjannah, Ghifari Aulia Ramadhani, Eddy Tuasikal"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Tools / Software (Pisahkan Koma)</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Foto Sampul Utama / Gambar Render</label>
                            <input
                              type="text"
                              value={proj.image || ""}
                              onChange={(e) => handleUpdateProject(pIdx, "image", e.target.value)}
                              placeholder="/instructors/eddy/portfolio-page-3.png"
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Galeri Lembar Kerja (Pisahkan Koma)</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-400 mb-1">Deskripsi Konsep Desain</label>
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => handleUpdateProject(pIdx, "description", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: AWARDS & CERTIFICATES */}
              {modalTab === "awards" && (
                <div className="space-y-6">
                  {/* Achievements */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Penghargaan Sayembara ({instructorForm.achievements?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddAchievement}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Penghargaan</span>
                      </button>
                    </div>

                    {instructorForm.achievements?.map((ach, aIdx) => (
                      <div key={ach.id || aIdx} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
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
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={ach.event}
                            onChange={(e) => handleUpdateAchievement(aIdx, "event", e.target.value)}
                            placeholder="Nama Sayembara"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={ach.organizer}
                            onChange={(e) => handleUpdateAchievement(aIdx, "organizer", e.target.value)}
                            placeholder="Penyelenggara (contoh: UNTAR)"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={ach.year}
                            onChange={(e) => handleUpdateAchievement(aIdx, "year", e.target.value)}
                            placeholder="Tahun (contoh: 2024)"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Certificates */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Sertifikat Kompetensi &amp; Piagam ({instructorForm.certificates?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddCertificate}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Sertifikat</span>
                      </button>
                    </div>

                    {instructorForm.certificates?.map((cert, cIdx) => (
                      <div key={cert.id || cIdx} className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 shadow-2xs space-y-2">
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
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleUpdateCertificate(cIdx, "issuer", e.target.value)}
                            placeholder="Penerbit"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={cert.year}
                            onChange={(e) => handleUpdateCertificate(cIdx, "year", e.target.value)}
                            placeholder="Tahun"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={cert.image || ""}
                            onChange={(e) => handleUpdateCertificate(cIdx, "image", e.target.value)}
                            placeholder="Path gambar (/instructors/eddy/portfolio-page-16.png)"
                            className="px-3 py-1.5 rounded-lg bg-gray-50/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-2xs text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10 shrink-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Semua perubahan akan disimpan dan dipublikasikan langsung ke web.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInstructorModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-white dark:border-white/10 text-xs font-semibold cursor-pointer transition-colors"
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
