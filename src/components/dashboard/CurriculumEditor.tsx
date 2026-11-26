"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  Eye,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Edit3,
  HelpCircle,
  FileText,
  Clock,
  LayoutGrid,
  CheckSquare,
  ListOrdered,
  Shuffle,
  Award,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  X,
  FolderEdit,
  Settings,
  Image as ImageIcon,
  UploadCloud,
  MoveUp,
  MoveDown,
  ArrowUpDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Download,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import LessonContentRenderer from "@/components/learn/LessonContentRenderer";
import {
  CurriculumModule,
  CurriculumLesson,
  CurriculumSection,
  CurriculumResource,
  BIM_MODULES,
  BIM_RESOURCES,
  TabbedItem,
  SkillsCheckOption,
  PracticeOption,
  MatchPair,
  MatchOption,
  AssignmentBlockData,
} from "@/data/bimDocCurriculum";
import {
  VisualTabbedCardsEditor,
  VisualSkillsCheckEditor,
  VisualPracticeQuestionEditor,
  VisualLabCardEditor,
  VisualQuizIntroEditor,
  VisualMatchingEditor,
  VisualAssignmentBlockEditor,
} from "@/components/dashboard/VisualInteractiveBlockEditors";

interface CourseOption {
  id: string;
  title: string;
  slug: string;
  category: string;
}

export default function CurriculumEditor({
  initialSlug = "revit-basic",
  userRole = "superadmin",
}: {
  initialSlug?: string;
  userRole?: string;
}) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug);
  const [modules, setModules] = useState<CurriculumModule[]>(BIM_MODULES);
  const [resources, setResources] = useState<CurriculumResource[]>(BIM_RESOURCES);
  const [curriculumTab, setCurriculumTab] = useState<"modules" | "resources">("modules");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active module & lesson selected in editor
  const [activeModId, setActiveModId] = useState<string>("mod-1");
  const [activeSecId, setActiveSecId] = useState<string>("sec-1-0");
  const [activeLessonId, setActiveLessonId] = useState<string>("les-1-0-1");

  // Editor View Mode: "topic" (rich lesson authoring) or "module" (module name, duration, and sections)
  const [editorMode, setEditorMode] = useState<"topic" | "module">("topic");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [tempSectionTitle, setTempSectionTitle] = useState<string>("");

  // Resource Editor States
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<CurriculumResource>({
    id: "",
    title: "",
    description: "",
    fileType: "PDF Document",
    fileSize: "Online",
    url: "",
    isExternal: false,
  });
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  // MS Word Style Image Tool States
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSourceMode, setImageSourceMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [imageAlign, setImageAlign] = useState<"center" | "left" | "right">("center");
  const [imageSize, setImageSize] = useState<"medium" | "full" | "small">("medium");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Content Editor vs Live Preview tab: "edit" or "preview"
  const [lessonContentTab, setLessonContentTab] = useState<"edit" | "preview">("edit");

  // Fetch available courses
  useEffect(() => {
    fetch("/api/courses", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { courses: [] }))
      .then((data) => {
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          const list = data.courses.map((c: any) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            category: c.category,
          }));
          setCourses(list);
          if (!list.some((c: any) => c.slug === selectedSlug)) {
            setSelectedSlug(list[0]?.slug || initialSlug);
          }
        }
      })
      .catch(() => {});
  }, [initialSlug, selectedSlug]);

  // Fetch curriculum & resources for selected course slug
  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);
    fetch(`/api/curriculum/${selectedSlug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { modules: BIM_MODULES, resources: [] }))
      .then((data) => {
        if (Array.isArray(data.modules)) {
          setModules(data.modules);
          setActiveModId(data.modules[0]?.id || "mod-1");
          setActiveSecId(data.modules[0]?.sections?.[0]?.id || "sec-1-0");
          setActiveLessonId(data.modules[0]?.sections?.[0]?.lessons?.[0]?.id || "les-1-0-1");
        }
        if (Array.isArray(data.resources)) {
          setResources(data.resources);
        } else {
          setResources([]);
        }
      })
      .catch(() => {
        setModules(BIM_MODULES);
        setResources([]);
      })
      .finally(() => setLoading(false));
  }, [selectedSlug]);

  // Find active elements
  const currentModule = modules.find((m) => m.id === activeModId) || modules[0];
  const currentSection =
    currentModule?.sections.find((s) => s.id === activeSecId) || currentModule?.sections[0];
  const currentLesson =
    currentSection?.lessons.find((l) => l.id === activeLessonId) || currentSection?.lessons[0];

  // Helper to update active lesson
  const updateCurrentLesson = (updater: (prev: CurriculumLesson) => CurriculumLesson) => {
    if (!currentLesson) return;
    setModules((prevModules) =>
      prevModules.map((m) => {
        if (m.id !== currentModule?.id) return m;
        return {
          ...m,
          sections: m.sections.map((s) => {
            if (s.id !== currentSection?.id) return s;
            return {
              ...s,
              lessons: s.lessons.map((l) => {
                if (l.id !== currentLesson.id) return l;
                return updater(l);
              }),
            };
          }),
        };
      })
    );
  };

  // Helper to update active module details (Title, Code, Duration, Summary)
  const updateCurrentModule = (updater: (prev: CurriculumModule) => CurriculumModule) => {
    if (!currentModule) return;
    setModules((prevModules) =>
      prevModules.map((m) => (m.id === currentModule.id ? updater(m) : m))
    );
  };

  // Add new module
  const handleAddModule = () => {
    const nextIdx = modules.length + 1;
    const newModId = `mod-${Date.now()}`;
    const newSecId = `sec-${Date.now()}`;
    const newLesId = `les-${Date.now()}`;

    const newMod: CurriculumModule = {
      id: newModId,
      code: String(nextIdx),
      title: `Modul ${nextIdx}: Judul Modul Baru`,
      duration: "2 Jam",
      summary: "Deskripsi singkat tentang kompetensi modul ini.",
      sections: [
        {
          id: newSecId,
          code: `${nextIdx}.0`,
          title: `${nextIdx}.0 Pengenalan & Konsep`,
          lessons: [
            {
              id: newLesId,
              code: `${nextIdx}.0.1`,
              title: "Topik Pertama",
              subtitle: "Pengantar materi pembelajaran",
              category: `${nextIdx}.0 Pengenalan`,
              readTime: "5 Menit",
              summary: "Ringkasan pembelajaran topik ini.",
              paragraphs: [
                "Tuliskan penjelasan materi pembelajaran secara lengkap di sini. Anda juga dapat menambahkan blok pembelajaran interaktif di bawah.",
              ],
              keyTakeaways: ["Poin penting pertama", "Poin penting kedua"],
            },
          ],
        },
      ],
    };

    setModules([...modules, newMod]);
    setActiveModId(newModId);
    setActiveSecId(newSecId);
    setActiveLessonId(newLesId);
    setEditorMode("module");
  };

  // Delete a module
  const handleDeleteModule = (modId: string) => {
    const mod = modules.find((m) => m.id === modId);
    if (!confirm(`Hapus seluruh "${mod?.title || "Modul ini"}" beserta seluruh sub-bab dan topiknya?`)) return;
    const remaining = modules.filter((m) => m.id !== modId);
    if (remaining.length === 0) {
      alert("Minimal harus ada 1 modul dalam kurikulum.");
      return;
    }
    setModules(remaining);
    setActiveModId(remaining[0].id);
    setActiveSecId(remaining[0].sections[0]?.id || "");
    setActiveLessonId(remaining[0].sections[0]?.lessons[0]?.id || "");
    setEditorMode("module");
  };

  // Add new section to module
  const handleAddSection = (modId: string) => {
    const mod = modules.find((m) => m.id === modId);
    if (!mod) return;
    const nextSecNum = mod.sections.length;
    const newSecId = `sec-${Date.now()}`;
    const newLesId = `les-${Date.now()}`;
    const newSection: CurriculumSection = {
      id: newSecId,
      code: `${mod.code}.${nextSecNum}`,
      title: `${mod.code}.${nextSecNum} Sub-Bab Baru`,
      lessons: [
        {
          id: newLesId,
          code: `${mod.code}.${nextSecNum}.1`,
          title: "Topik Pertama",
          subtitle: "Pengantar topik baru",
          category: `${mod.code}.${nextSecNum} Sub-Bab Baru`,
          readTime: "5 Menit",
          summary: "Ringkasan konsep topik ini.",
          paragraphs: ["Tuliskan materi pembelajaran terstruktur di sini."],
          keyTakeaways: ["Poin penting"],
        },
      ],
    };
    setModules((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, sections: [...m.sections, newSection] } : m))
    );
    setActiveModId(modId);
    setActiveSecId(newSecId);
    setActiveLessonId(newLesId);
  };

  // Update section title
  const handleUpdateSectionTitle = (modId: string, secId: string, newTitle: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          sections: m.sections.map((s) => (s.id === secId ? { ...s, title: newTitle } : s)),
        };
      })
    );
  };

  // Delete section
  const handleDeleteSection = (modId: string, secId: string) => {
    const mod = modules.find((m) => m.id === modId);
    if (!mod) return;
    if (mod.sections.length <= 1) {
      alert("Modul harus memiliki minimal 1 sub-bab.");
      return;
    }
    if (!confirm("Hapus sub-bab ini beserta seluruh topik di dalamnya?")) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          sections: m.sections.filter((s) => s.id !== secId),
        };
      })
    );
  };

  // Add new lesson inside specific section or module (supports adding e.g. 1.0.5 or 1.1.2)
  const handleAddLessonToSection = (modId: string, targetSectionId?: string) => {
    const mod = modules.find((m) => m.id === modId);
    if (!mod || mod.sections.length === 0) return;

    let targetSec = mod.sections.find((s) => s.id === targetSectionId);
    if (!targetSec && activeSecId) {
      targetSec = mod.sections.find((s) => s.id === activeSecId);
    }
    if (!targetSec) {
      targetSec = mod.sections[0];
    }

    // Determine next code from existing lesson numbers in this section
    const secCode = targetSec.code || `${mod.code}.0`;
    const existingNums = targetSec.lessons
      .map((l) => {
        const parts = l.code.split(".");
        const last = parseInt(parts[parts.length - 1], 10);
        return isNaN(last) ? 0 : last;
      })
      .filter((n) => n > 0);
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextLessonIdx = maxNum + 1;
    const newLesId = `les-${Date.now()}`;

    const newLes: CurriculumLesson = {
      id: newLesId,
      code: `${secCode}.${nextLessonIdx}`,
      title: `Topik ${nextLessonIdx}`,
      subtitle: "",
      category: targetSec.title,
      readTime: "5 Menit",
      summary: "",
      paragraphs: ["Tuliskan materi pembelajaran terstruktur di sini."],
    };

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          sections: m.sections.map((s) => {
            if (s.id !== targetSec!.id) return s;
            return {
              ...s,
              lessons: [...s.lessons, newLes],
            };
          }),
        };
      })
    );

    setActiveModId(modId);
    setActiveSecId(targetSec.id);
    setActiveLessonId(newLesId);
    setEditorMode("topic");
  };

  const handleAddLessonForModule = (modId: string) => {
    handleAddLessonToSection(modId, activeSecId || undefined);
  };

  // Add new lesson inside current section
  const handleAddLesson = () => {
    if (!currentSection || !currentModule) return;
    handleAddLessonToSection(currentModule.id, currentSection.id);
  };

  // Move lesson order up or down inside section
  const handleMoveLessonOrder = (secId: string, lessonId: string, direction: "up" | "down") => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        sections: m.sections.map((s) => {
          if (s.id !== secId) return s;
          const idx = s.lessons.findIndex((l) => l.id === lessonId);
          if (idx === -1) return s;
          const targetIdx = direction === "up" ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= s.lessons.length) return s;
          const updated = [...s.lessons];
          const temp = updated[idx];
          updated[idx] = updated[targetIdx];
          updated[targetIdx] = temp;
          return { ...s, lessons: updated };
        }),
      }))
    );
  };

  // Sort lessons in a section naturally by their code (e.g. 1.0.1, 1.0.2, 1.0.5)
  const handleSortLessonsByCode = (secId: string) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        sections: m.sections.map((s) => {
          if (s.id !== secId) return s;
          const sorted = [...s.lessons].sort((a, b) =>
            a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" })
          );
          return { ...s, lessons: sorted };
        }),
      }))
    );
  };

  // Move lesson to another section
  const handleMoveLessonToSection = (lessonId: string, targetSectionId: string) => {
    if (!currentModule || !currentLesson) return;
    const targetSection = currentModule.sections.find((s) => s.id === targetSectionId);
    if (!targetSection) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== currentModule.id) return m;
        const cleanedSections = m.sections.map((s) => ({
          ...s,
          lessons: s.lessons.filter((l) => l.id !== lessonId),
        }));
        return {
          ...m,
          sections: cleanedSections.map((s) => {
            if (s.id !== targetSectionId) return s;
            return {
              ...s,
              lessons: [...s.lessons, { ...currentLesson, category: targetSection.title }],
            };
          }),
        };
      })
    );
    setActiveSecId(targetSectionId);
  };

  // Upload image file for MS Word style insertion
  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setUploadedFileName(cleanName);
        // Only set caption if caption is currently empty
        if (!imageCaption.trim()) {
          setImageCaption(cleanName);
        }
      } else {
        alert(data.error || "Gagal mengunggah gambar. Silakan coba lagi.");
      }
    } catch {
      alert("Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Insert image tag into current lesson's paragraphs
  const handleInsertImageToContent = () => {
    if (!imageUrl.trim()) {
      alert("Masukkan URL gambar atau unggah file gambar terlebih dahulu.");
      return;
    }

    const cleanCaption = imageCaption.trim();
    const tag = `![${cleanCaption}|${imageAlign}|${imageSize}](${imageUrl.trim()})`;

    updateCurrentLesson((prev) => ({
      ...prev,
      paragraphs: [...(prev.paragraphs || []), tag],
    }));

    setImageUrl("");
    setImageCaption("");
    setUploadedFileName("");
    setShowImageModal(false);
  };

  // Helper to parse image info from a paragraph string
  const parseImageParagraph = (text: string) => {
    const trimmed = text.trim();
    const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (!match) return null;

    const altPart = match[1] || "";
    const url = match[2]?.trim() || "";

    const parts = altPart.split("|").map((p) => p.trim());
    const caption = parts[0] || "";
    let align: "left" | "right" | "center" = "center";
    let size: "small" | "medium" | "full" = "medium";

    for (const part of parts.slice(1)) {
      const lower = part.toLowerCase();
      if (lower === "left" || lower === "kiri") align = "left";
      else if (lower === "right" || lower === "kanan") align = "right";
      else if (lower === "center" || lower === "tengah") align = "center";
      else if (lower === "small" || lower === "kecil") size = "small";
      else if (lower === "medium" || lower === "sedang") size = "medium";
      else if (lower === "full" || lower === "large" || lower === "besar" || lower === "penuh") size = "full";
    }

    return { caption, align, size, url };
  };

  // Parse all images present in the current lesson's paragraphs
  const lessonImages = useMemo(() => {
    if (!currentLesson?.paragraphs) return [];
    const list: {
      index: number;
      caption: string;
      align: "left" | "right" | "center";
      size: "small" | "medium" | "full";
      url: string;
    }[] = [];
    currentLesson.paragraphs.forEach((p, idx) => {
      const parsed = parseImageParagraph(p);
      if (parsed) {
        list.push({ ...parsed, index: idx });
      }
    });
    return list;
  }, [currentLesson?.paragraphs]);

  // Update a specific image paragraph by index
  const handleUpdateImageParagraph = (
    paraIndex: number,
    updates: {
      caption?: string;
      align?: "left" | "right" | "center";
      size?: "small" | "medium" | "full";
      url?: string;
    }
  ) => {
    if (!currentLesson) return;
    const currentParas = [...(currentLesson.paragraphs || [])];
    const existing = parseImageParagraph(currentParas[paraIndex] || "");
    if (!existing) return;

    const newCaption = updates.caption !== undefined ? updates.caption : existing.caption;
    const newAlign = updates.align !== undefined ? updates.align : existing.align;
    const newSize = updates.size !== undefined ? updates.size : existing.size;
    const newUrl = updates.url !== undefined ? updates.url : existing.url;

    currentParas[paraIndex] = `![${newCaption.trim()}|${newAlign}|${newSize}](${newUrl.trim()})`;

    updateCurrentLesson((prev) => ({
      ...prev,
      paragraphs: currentParas,
    }));
  };

  // Delete an image from paragraphs
  const handleDeleteImageParagraph = (paraIndex: number) => {
    if (!confirm("Hapus gambar ini dari materi topik?")) return;
    updateCurrentLesson((prev) => ({
      ...prev,
      paragraphs: (prev.paragraphs || []).filter((_, idx) => idx !== paraIndex),
    }));
  };

  // Delete current lesson
  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm("Hapus topik materi ini dari kurikulum?")) return;
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        sections: m.sections.map((s) => ({
          ...s,
          lessons: s.lessons.filter((l) => l.id !== lessonId),
        })),
      }))
    );
  };

  // Save changes to API (modules + resources)
  const handleSaveCurriculum = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/curriculum/${selectedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules, resources }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");

      setStatusMsg({
        type: "success",
        text: "Kurikulum modul dan dokumen acuan/resources berhasil disimpan ke sistem!",
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Terjadi kesalahan saat menyimpan kurikulum.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // RESOURCE MANAGEMENT HELPERS
  // =========================================================================
  const handleOpenAddResource = () => {
    setEditingResourceId(null);
    setResourceForm({
      id: `res-${Date.now()}`,
      title: "",
      description: "",
      fileType: "Revit Model (.RVT)",
      fileSize: "10 MB",
      url: "",
      isExternal: false,
    });
    setResourceModalOpen(true);
  };

  const handleOpenEditResource = (res: CurriculumResource) => {
    setEditingResourceId(res.id);
    setResourceForm({ ...res });
    setResourceModalOpen(true);
  };

  const handleDeleteResource = (id: string) => {
    const target = resources.find((r) => r.id === id);
    if (!confirm(`Hapus dokumen acuan "${target?.title || "ini"}"?`)) return;
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUploadResourceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResource(true);
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

      setResourceForm((prev) => ({
        ...prev,
        url: data.url,
        fileSize: `${sizeMb} MB`,
        fileType: `${ext} File`,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        isExternal: false,
      }));
    } catch (err: any) {
      alert("Gagal mengunggah file acuan: " + (err.message || "Kesalahan server"));
    } finally {
      setIsUploadingResource(false);
    }
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.title.trim()) {
      alert("Judul dokumen acuan wajib diisi.");
      return;
    }
    if (!resourceForm.url.trim()) {
      alert("URL atau file dokumen acuan wajib diisi.");
      return;
    }

    if (editingResourceId) {
      setResources((prev) =>
        prev.map((r) => (r.id === editingResourceId ? resourceForm : r))
      );
    } else {
      setResources((prev) => [...prev, resourceForm]);
    }

    setResourceModalOpen(false);
  };

  // =========================================================================
  // INTERACTIVE BLOCKS TOGGLE HELPERS
  // =========================================================================
  const addTabbedBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      tabbedBlock: {
        header: `${prev.code} Konsep Kunci`,
        intro: "Pilih salah satu tab di bawah untuk melihat penjelasan detail masing-masing konsep.",
        tabs: [
          {
            id: `tab-1`,
            title: "Konsep A",
            content: "Penjelasan lengkap mengenai aspek pertama dalam konsep ini.",
            points: ["Karakteristik penting", "Implementasi industri"],
          },
          {
            id: `tab-2`,
            title: "Konsep B",
            content: "Penjelasan lengkap aspek kedua secara mendalam.",
            points: ["Standar kerja", "Dokumentasi"],
          },
        ],
      },
    }));
  };

  const addSkillsCheckBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      skillsCheck: {
        title: "Skills Check",
        subtitle: "Jawablah pertanyaan evaluasi berikut setelah mempelajari materi.",
        question: "Manakah opsi berikut yang merupakan standar terbaik dalam penerapan materi ini? (Pilih yang sesuai.)",
        instruction: "(Pilih semua yang berlaku.)",
        options: [
          { id: "opt-1", text: "Penerapan Single Source of Truth terpusat", isCorrect: true },
          { id: "opt-2", text: "Koordinasi berkala lintas disiplin via CDE", isCorrect: true },
          { id: "opt-3", text: "Drafting manual tanpa integrasi parameter", isCorrect: false },
        ],
      },
    }));
  };

  const addPracticeQuestionBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      practiceQuestion: {
        header: `${prev.code} Practice - Uji Pemahaman Mandiri`,
        question: "Dalam skenario proyek konstruksi gedung tinggi, tim enjiniring ditugaskan mengidentifikasi clash utilitas sebelum pelaksanaan lapangan. Fitur apa yang paling tepat digunakan?",
        instruction: "(Pilih jawaban yang paling tepat.)",
        options: [
          { id: "p-opt-1", text: "Clash Detective & Matrix Toleransi di Navisworks", isCorrect: true },
          { id: "p-opt-2", text: "Drafting 2D terpisah di software konvensional", isCorrect: false },
          { id: "p-opt-3", text: "Kalkulasi manual pada kertas cetak", isCorrect: false },
        ],
        explanation: "Navisworks Clash Detective memungkinkan federated model multisektor dianalisis secara otomatis untuk mendeteksi benturan sebelum konstruksi dimulai.",
      },
    }));
  };

  const addLabCardBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      labCard: {
        title: `Lab - Latihan Praktik ${prev.title}`,
        description: "Buka software Autodesk Revit dan ikuti lembar kerja panduan langkah demi langkah.",
        duration: "45 Menit",
      },
    }));
  };

  const addQuizIntroBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      quizIntro: {
        title: `Quiz - Evaluasi Pembelajaran ${prev.title}`,
        questionsCount: 3,
        passRatePercent: 75,
        attempts: "unlimited attempts",
        timeLimit: "no time limit",
        questions: [
          {
            id: `q-${Date.now()}-1`,
            type: "multiple_choice",
            prompt: "Apa fungsi utama dari Level (Elevasi Lantai) pada Autodesk Revit Architecture?",
            options: [
              { id: "opt-1", text: "Menentukan referensi ketinggian horizontal untuk elemen dinding, lantai, dan plafon", isCorrect: true },
              { id: "opt-2", text: "Mengatur rotasi sudut matahari pada rendering bayangan", isCorrect: false },
              { id: "opt-3", text: "Menghapus elemen 3D yang duplikat secara otomatis", isCorrect: false },
              { id: "opt-4", text: "Menghubungkan sheet gambar ke printer eksternal", isCorrect: false },
            ],
            weight: 30,
          },
          {
            id: `q-${Date.now()}-2`,
            type: "essay",
            prompt: "Jelaskan perbedaan mendasar antara parameter 'Type Properties' dan 'Instance Properties' pada Family Revit beserta contoh penerapannya!",
            sampleAnswer: "Type Properties mempengaruhi seluruh elemen bertipe sama dalam satu model proyek (misal dimensi pintu tipe 90x210 cm). Instance Properties hanya mempengaruhi elemen spesifik yang sedang dipilih (misal Sill Height elevasi kusen pintu tersebut dari lantai).",
            weight: 35,
          },
          {
            id: `q-${Date.now()}-3`,
            type: "file_upload",
            prompt: "Unggah file proyek Revit (.rvt) atau ekspor PDF denah hasil pemodelan Anda sesuai modul ini untuk dievaluasi oleh pengajar.",
            allowedFormats: ".rvt, .dwg, .pdf, .zip, .ifc",
            maxSizeMb: 50,
            sampleAnswer: "Pastikan grid sejajar, level terkunci, penamaan family rapi, dan dinding terhubung ke Level 2.",
            weight: 35,
          },
        ],
      },
    }));
  };

  const addMatchingActivityBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      matchingActivity: {
        header: `${prev.code} Practice - Pasangkan Kategori & Opsi yang Tepat`,
        instruction: "Pasangkan setiap kategori di kolom kiri dengan aktivitas atau definisi yang sesuai di kolom kanan.",
        categories: [
          { id: "cat-1", category: "Level 2 Collaborative BIM", badge: "A", correctOptionId: "opt-m-1" },
          { id: "cat-2", category: "BIM 4D Scheduling", badge: "B", correctOptionId: "opt-m-2" },
          { id: "cat-3", category: "BIM 5D Estimating", badge: "C", correctOptionId: "opt-m-3" },
        ],
        options: [
          { id: "opt-m-1", text: "Model 3D mandiri disiplin terkoordinasi via CDE format terbuka (IFC)." },
          { id: "opt-m-2", text: "Simulasi urutan waktu konstruksi yang dikaitkan dengan jadwal proyek." },
          { id: "opt-m-3", text: "Ekstraksi volume material langsung untuk analisis anggaran biaya proyek." },
        ],
      },
    }));
  };

  const addAssignmentBlock = () => {
    updateCurrentLesson((prev) => ({
      ...prev,
      assignmentBlock: {
        title: `Tugas Praktik: ${prev.title}`,
        instruction: "Unggah file hasil pemodelan / tugas Anda sesuai dengan kriteria yang ditentukan. Pengajar akan memberikan nilai dan evaluasi langsung.",
        allowedFormats: ".rvt, .dwg, .pdf, .zip, .ifc",
        maxSizeMb: 50,
        rubric: [
          "Ketepatan hierarki family & parameter BIM",
          "Kerapian pemodelan & penamaan grid/level",
          "Kesesuaian dengan dokumen acuan kerja",
        ],
      },
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Course Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/30 uppercase tracking-wider">
              Editor Silabus Kursus
            </span>
            <span className="text-xs text-gray-500">• Akses {userRole}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white mt-1">
            Editor Modul & Kurikulum LMS Interaktif
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Tulis dan kelola modul pembelajaran sendiri di web, ubah nama bab modul, dan tambahkan blok interaktif pembelajaran (Tabbed Cards, Skills Check, Practice Question, Lab Exercise, Quiz, dan Matching Pairs).
          </p>
        </div>

        {/* Course Picker & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
              Pilih Kelas Kursus:
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
              {!courses.some((c) => c.slug === selectedSlug) && (
                <option value={selectedSlug}>Revit Architecture Mastery (Default)</option>
              )}
            </select>
          </div>

          <Link
            href={`/courses/${selectedSlug}/learn`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-bold text-gray-800 dark:text-zinc-200 transition-colors shadow-2xs self-end"
          >
            <Eye className="w-4 h-4 text-amber-500" />
            <span>Pratinjau di LMS</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>

          <button
            type="button"
            onClick={handleSaveCurriculum}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold transition-all shadow-md active:scale-95 self-end cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? "Menyimpan..." : "Simpan Kurikulum"}</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-600"
              : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-600"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Sub-Tab Navigation: Modul & Silabus vs Dokumen Acuan & Resources */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#161B22] border border-black/10 dark:border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setCurriculumTab("modules")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            curriculumTab === "modules"
              ? "bg-white dark:bg-[#21262D] text-gray-950 dark:text-white shadow-xs border border-black/5 dark:border-white/10"
              : "text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Struktur Modul & Silabus ({modules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurriculumTab("resources")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            curriculumTab === "resources"
              ? "bg-white dark:bg-[#21262D] text-gray-950 dark:text-white shadow-xs border border-black/5 dark:border-white/10"
              : "text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>Dokumen Acuan & Resources ({resources.length})</span>
        </button>
      </div>

      {/* VIEW 1: MODULES & TOPICS AUTHORING */}
      {curriculumTab === "modules" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: MODULES & TOPICS OUTLINE TREE */}
          <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Struktur Modul Silabus</span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Total {modules.length} modul kurikulum
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddModule}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 cursor-pointer transition-colors"
              title="Tambah Modul / Bab Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Modul</span>
            </button>
          </div>

          {/* Module Tree List */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {modules.map((mod) => {
              const isModActive = mod.id === activeModId;
              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isModActive
                      ? "border-amber-500/40 bg-amber-500/[0.02]"
                      : "border-black/10 dark:border-white/10 bg-gray-50/60 dark:bg-[#0D1117]"
                  }`}
                >
                  {/* Module Header with Quick Actions */}
                  <div className="p-2.5 bg-gray-100/90 dark:bg-white/5 flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModId(mod.id);
                        setEditorMode("module");
                      }}
                      className="flex items-center gap-2 truncate text-left cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
                      title="Klik untuk mengedit judul & data modul ini"
                    >
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-gray-800 dark:text-zinc-200 shrink-0">
                        Modul {mod.code}
                      </span>
                      <span className="text-xs font-extrabold text-gray-950 dark:text-white truncate">
                        {mod.title}
                      </span>
                      {mod.isFinalModule && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                          AKHIR
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModId(mod.id);
                          setEditorMode("module");
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="Edit Nama & Data Modul"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="Hapus Modul Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sections & Lessons */}
                  <div className="p-2 space-y-2">
                    {mod.sections.map((sec) => (
                      <div key={sec.id} className="space-y-1">
                        <div className="px-2 py-1 flex items-center justify-between gap-1 group/sec">
                          {editingSectionId === sec.id ? (
                            <div className="flex items-center gap-1 w-full">
                              <input
                                type="text"
                                value={tempSectionTitle}
                                onChange={(e) => setTempSectionTitle(e.target.value)}
                                className="text-[10px] font-mono font-bold uppercase tracking-wider py-0.5 px-1.5 rounded bg-white dark:bg-[#161B22] border border-amber-400 text-gray-900 dark:text-white w-full"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateSectionTitle(mod.id, sec.id, tempSectionTitle);
                                  setEditingSectionId(null);
                                }}
                                className="p-1 text-emerald-500 hover:text-emerald-400"
                                title="Simpan nama sub-bab"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSectionId(null)}
                                className="p-1 text-gray-400 hover:text-gray-200"
                                title="Batal"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider truncate">
                                {sec.title}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAddLessonToSection(mod.id, sec.id)}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center gap-0.5 cursor-pointer"
                                  title={`Tambah topik baru di ${sec.title}`}
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Topik</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSortLessonsByCode(sec.id)}
                                  className="p-1 text-gray-400 hover:text-amber-500 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                  title="Urutkan topik berdasarkan kode angka"
                                >
                                  <ArrowUpDown className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSectionId(sec.id);
                                    setTempSectionTitle(sec.title);
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-amber-500"
                                  title="Ganti nama sub-bab"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(mod.id, sec.id)}
                                  className="p-0.5 text-gray-400 hover:text-rose-500"
                                  title="Hapus sub-bab"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {sec.lessons.map((les) => {
                          const isCurrent = les.id === currentLesson?.id && editorMode === "topic";
                          return (
                            <div
                              key={les.id}
                              className={`w-full group/les p-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                                isCurrent
                                  ? "bg-amber-500/15 border border-amber-500/40 text-gray-950 dark:text-white font-bold shadow-2xs"
                                  : "hover:bg-white dark:hover:bg-white/10 text-gray-700 dark:text-zinc-300"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveModId(mod.id);
                                  setActiveSecId(sec.id);
                                  setActiveLessonId(les.id);
                                  setEditorMode("topic");
                                }}
                                className="flex-1 text-left truncate mr-2 cursor-pointer flex items-center min-w-0"
                              >
                                <span className="font-mono text-amber-600 dark:text-amber-400 mr-1.5 shrink-0 font-bold">
                                  {les.code}
                                </span>
                                <span className="truncate">{les.title}</span>
                              </button>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover/les:opacity-100 transition-opacity shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveLessonOrder(sec.id, les.id, "up")}
                                  className="p-1 text-gray-400 hover:text-amber-500 rounded hover:bg-black/5 dark:hover:bg-white/10"
                                  title="Pindah urutan ke atas"
                                >
                                  <MoveUp className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveLessonOrder(sec.id, les.id, "down")}
                                  className="p-1 text-gray-400 hover:text-amber-500 rounded hover:bg-black/5 dark:hover:bg-white/10"
                                  title="Pindah urutan ke bawah"
                                >
                                  <MoveDown className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(les.id)}
                                  className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-black/5 dark:hover:bg-white/10"
                                  title="Hapus topik ini"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              {isCurrent && (
                                <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddLessonForModule(mod.id)}
                        className="flex-1 py-1.5 px-2 rounded-lg border border-dashed border-gray-300 dark:border-white/10 hover:border-amber-400 text-[11px] font-bold text-gray-600 dark:text-zinc-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Tambah Topik Materi Baru di Modul Ini"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Topik Baru</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSection(mod.id)}
                        className="py-1.5 px-2.5 rounded-lg border border-dashed border-gray-300 dark:border-white/10 hover:border-amber-400 text-[11px] font-bold text-gray-600 dark:text-zinc-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Tambah Sub-Bab Baru di Modul Ini"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Sub-Bab</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RICH LESSON & MODULE AUTHORING WORKSPACE */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 p-6 shadow-sm space-y-6">
          {/* View Mode Switcher: Topik vs Modul */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setEditorMode("topic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  editorMode === "topic"
                    ? "bg-white dark:bg-[#161B22] text-gray-950 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Edit Topik: {currentLesson?.code || "Materi"}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorMode("module")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  editorMode === "module"
                    ? "bg-white dark:bg-[#161B22] text-gray-950 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Edit Modul {currentModule?.code}: {currentModule?.title}</span>
              </button>
            </div>

            {editorMode === "topic" && currentLesson && (
              <button
                type="button"
                onClick={() => handleDeleteLesson(currentLesson.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                title="Hapus Topik Ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Topik</span>
              </button>
            )}

            {editorMode === "module" && currentModule && (
              <button
                type="button"
                onClick={() => handleDeleteModule(currentModule.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                title="Hapus Seluruh Modul Ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Modul Ini</span>
              </button>
            )}
          </div>

          {/* VIEW A: DEDICATED MODULE EDITOR */}
          {editorMode === "module" && currentModule && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pengaturan Data Modul Silabus
                </span>
                <h3 className="text-base font-black text-gray-950 dark:text-white mt-0.5">
                  Modul {currentModule.code}: {currentModule.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Ubah nama modul, nomor bab, durasi total pembelajaran, dan kelola daftar sub-bab di bawah ini.
                </p>
              </div>

              {/* Form: Kode Modul, Judul Modul, Durasi */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Nomor / Kode Modul
                  </label>
                  <input
                    type="text"
                    value={currentModule.code}
                    onChange={(e) =>
                      updateCurrentModule((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="Contoh: 1 atau 2"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Nama / Judul Modul
                  </label>
                  <input
                    type="text"
                    value={currentModule.title}
                    onChange={(e) =>
                      updateCurrentModule((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Contoh: BIM & Industri AEC / Pemodelan Struktur"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Total Durasi
                  </label>
                  <input
                    type="text"
                    value={currentModule.duration || "2 Jam"}
                    onChange={(e) =>
                      updateCurrentModule((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    placeholder="Contoh: 2 Jam"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Ringkasan Modul */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                  Ringkasan / Target Kompetensi Modul
                </label>
                <textarea
                  rows={3}
                  value={currentModule.summary || ""}
                  onChange={(e) =>
                    updateCurrentModule((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder="Jelaskan ringkasan kompetensi yang akan dicapai siswa pada modul ini..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Akhir Modul / Syarat Pengajuan Sertifikat Toggle */}
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-extrabold text-gray-950 dark:text-white">
                      Jadikan Akhir Modul Kursus (Syarat Pengajuan Sertifikat)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-zinc-300">
                    Saat siswa menuntaskan sub-bab terakhir di modul ini &amp; lulus semua kuis, tombol &ldquo;Ajukan Sertifikat&rdquo; ke SuperAdmin akan otomatis muncul.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2.5 cursor-pointer shrink-0 select-none px-3 py-2 rounded-xl bg-white dark:bg-[#161B22] border border-emerald-500/30 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={Boolean(currentModule.isFinalModule)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setModules((prev) =>
                        prev.map((m) =>
                          m.id === currentModule.id
                            ? { ...m, isFinalModule: checked }
                            : checked
                            ? { ...m, isFinalModule: false }
                            : m
                        )
                      );
                    }}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {currentModule.isFinalModule ? "Modul Terakhir Aktif" : "Tandai Akhir Modul"}
                  </span>
                </label>
              </div>

              {/* Sub-Bab / Sections Management */}
              <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-wider font-mono">
                      Sub-Bab / Kategori Topik ({currentModule.sections.length})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Kelola kelompok topik materi dalam modul ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSection(currentModule.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sub-Bab</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {currentModule.sections.map((sec, sIdx) => (
                    <div
                      key={sec.id}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-gray-400 shrink-0">
                          #{sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) =>
                            handleUpdateSectionTitle(currentModule.id, sec.id, e.target.value)
                          }
                          className="flex-1 p-2 rounded-xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-gray-400">
                          {sec.lessons.length} Topik
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(currentModule.id, sec.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Sub-Bab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  Perubahan akan tersimpan permanen saat Anda klik tombol <strong>Simpan Kurikulum</strong> di kanan atas.
                </span>
                <button
                  type="button"
                  onClick={() => setEditorMode("topic")}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Lanjut Edit Topik Pembelajaran →
                </button>
              </div>
            </div>
          )}

          {/* VIEW B: TOPIC & RICH LESSON EDITOR */}
          {editorMode === "topic" && currentLesson && (
            <div className="space-y-6">
              {/* Basic Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Kode Topik
                  </label>
                  <input
                    type="text"
                    value={currentLesson.code}
                    onChange={(e) =>
                      updateCurrentLesson((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="1.1.4"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Judul Topik
                  </label>
                  <input
                    type="text"
                    value={currentLesson.title}
                    onChange={(e) =>
                      updateCurrentLesson((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Contoh: Definisi BIM (Building Information Modeling)"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Estimasi Waktu
                  </label>
                  <input
                    type="text"
                    value={currentLesson.readTime || "5 Menit"}
                    onChange={(e) =>
                      updateCurrentLesson((prev) => ({ ...prev, readTime: e.target.value }))
                    }
                    placeholder="5 Menit"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Sub-Bab Dropdown Selector */}
                <div className="sm:col-span-12 space-y-1">
                  <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Sub-Bab / Kategori Topik (Pindahkan Topik ke Sub-Bab Lain)
                  </label>
                  <select
                    value={currentSection?.id || ""}
                    onChange={(e) => handleMoveLessonToSection(currentLesson.id, e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {currentModule?.sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtitle / Intro Prompt */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                  Sub-Judul / Pengantar Topik
                </label>
                <input
                  type="text"
                  value={currentLesson.subtitle || ""}
                  onChange={(e) =>
                    updateCurrentLesson((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  placeholder="Pengantar materi sebelum pembahasan mendalam..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Summary Callout */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                  Ringkasan / Highlight Box (Summary)
                </label>
                <textarea
                  rows={2}
                  value={currentLesson.summary}
                  onChange={(e) =>
                    updateCurrentLesson((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder="Ringkasan singkat yang akan ditampilkan dalam kotak highlight di materi..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Rich Lesson Content & MS Word Style Images Workspace */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/5 dark:border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-mono font-bold text-gray-700 dark:text-zinc-200 uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Isi Materi Pembelajaran (Teks & Gambar Bebas)</span>
                    </label>
                  </div>

                  {/* Mode Toggle: Edit vs Preview Siswa */}
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-gray-100 dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => setLessonContentTab("edit")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        lessonContentTab === "edit"
                          ? "bg-white dark:bg-[#161B22] text-gray-950 dark:text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Edit3 className="w-3 h-3 text-amber-500" />
                      <span>Mode Edit Teks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonContentTab("preview")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        lessonContentTab === "preview"
                          ? "bg-white dark:bg-[#161B22] text-gray-950 dark:text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Eye className="w-3 h-3 text-emerald-500" />
                      <span>Pratinjau Tampilan Siswa</span>
                    </button>
                  </div>
                </div>

                {lessonContentTab === "edit" ? (
                  <div className="space-y-2">
                    {/* Formatting Toolbar */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5 p-2 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowImageModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Sisipkan gambar dengan posisi rata kiri, kanan, atau tengah"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Sisipkan Gambar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentLesson((prev) => ({
                              ...prev,
                              paragraphs: [...(prev.paragraphs || []), "**Teks Tebal**"],
                            }));
                          }}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:border-amber-400 transition-colors"
                          title="Tambah format tebal"
                        >
                          B (Tebal)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentLesson((prev) => ({
                              ...prev,
                              paragraphs: [...(prev.paragraphs || []), "• Poin penting materi..."],
                            }));
                          }}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:border-amber-400 transition-colors"
                          title="Tambah poin bullet"
                        >
                          • Bullet
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentLesson((prev) => ({
                              ...prev,
                              paragraphs: [...(prev.paragraphs || []), "### Sub-Judul Baru"],
                            }));
                          }}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:border-amber-400 transition-colors"
                          title="Tambah sub-judul bagian"
                        >
                          H3 (Sub-Judul)
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-gray-400">
                        {currentLesson.paragraphs?.length || 0} Paragraf / Elemen
                      </span>
                    </div>

                    {/* Freeform Writing Textarea */}
                    <textarea
                      rows={8}
                      value={currentLesson.paragraphs?.join("\n\n") || ""}
                      onChange={(e) =>
                        updateCurrentLesson((prev) => ({
                          ...prev,
                          paragraphs: e.target.value.split("\n\n").filter((p) => p.trim().length > 0),
                        }))
                      }
                      placeholder="Tuliskan materi pembelajaran terstruktur di sini. Anda bebas menambahkan teks dan menyisipkan gambar di posisi manapun..."
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs sm:text-sm leading-relaxed text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans"
                    />

                    {/* Visual Image Manager (if there are images in currentLesson.paragraphs) */}
                    {lessonImages.length > 0 && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-transparent border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-amber-500" />
                            <h4 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider">
                              Pengaturan Keterangan & Gambar ({lessonImages.length} Gambar di Topik Ini)
                            </h4>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                            Ubah keterangan teks, posisi, atau ukuran gambar di bawah ini
                          </span>
                        </div>

                        <div className="space-y-3">
                          {lessonImages.map((img, i) => (
                            <div
                              key={img.index}
                              className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] shadow-2xs flex flex-col md:flex-row gap-3.5 items-start md:items-center justify-between"
                            >
                              {/* Thumbnail & Caption Input */}
                              <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                                <div className="w-16 h-16 rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-gray-100 dark:bg-black/30 shrink-0 flex items-center justify-center relative group">
                                  <img
                                    src={img.url}
                                    alt={img.caption || `Gambar #${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute top-1 left-1 bg-black/75 text-white text-[9px] font-mono font-bold px-1 rounded">
                                    #{i + 1}
                                  </span>
                                </div>

                                <div className="flex-1 min-w-[200px] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">
                                      Keterangan Gambar #{i + 1}:
                                    </label>
                                    {img.caption ? (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateImageParagraph(img.index, { caption: "" })}
                                        className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                                        title="Kosongkan keterangan agar tidak ada teks di bawah gambar"
                                      >
                                        Hapus Keterangan
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic font-medium">Tanpa Keterangan (Bersih)</span>
                                    )}
                                  </div>

                                  <input
                                    type="text"
                                    value={img.caption}
                                    onChange={(e) => handleUpdateImageParagraph(img.index, { caption: e.target.value })}
                                    placeholder="Tulis keterangan di sini (kosongkan jika tanpa teks)..."
                                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  />
                                </div>
                              </div>

                              {/* Quick Align & Size & Delete Buttons */}
                              <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
                                {/* Alignment Selector */}
                                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImageParagraph(img.index, { align: "left" })}
                                    className={`p-1.5 rounded flex items-center gap-1 font-bold cursor-pointer ${
                                      img.align === "left"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                    }`}
                                    title="Rata Kiri (Teks mengalir di kanan)"
                                  >
                                    <AlignLeft className="w-3 h-3" />
                                    <span className="hidden sm:inline">Kiri</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImageParagraph(img.index, { align: "center" })}
                                    className={`p-1.5 rounded flex items-center gap-1 font-bold cursor-pointer ${
                                      img.align === "center"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                    }`}
                                    title="Rata Tengah (Blok terpisah)"
                                  >
                                    <AlignCenter className="w-3 h-3" />
                                    <span className="hidden sm:inline">Tengah</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImageParagraph(img.index, { align: "right" })}
                                    className={`p-1.5 rounded flex items-center gap-1 font-bold cursor-pointer ${
                                      img.align === "right"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                    }`}
                                    title="Rata Kanan (Teks mengalir di kiri)"
                                  >
                                    <AlignRight className="w-3 h-3" />
                                    <span className="hidden sm:inline">Kanan</span>
                                  </button>
                                </div>

                                {/* Size Selector */}
                                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImageParagraph(img.index, { size: "small" })}
                                    className={`px-2 py-1 rounded font-bold cursor-pointer ${
                                      img.size === "small"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                    }`}
                                    title="Ukuran Kecil (32%)"
                                  >
                                    Kecil
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImageParagraph(img.index, { size: "medium" })}
                                    className={`px-2 py-1 rounded font-bold cursor-pointer ${
                                      img.size === "medium"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                    }`}
                                    title="Ukuran Sedang (50%)"
                                  >
                                    Sedang
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImageParagraph(img.index, { size: "full" })}
                                    className={`px-2 py-1 rounded font-bold cursor-pointer ${
                                      img.size === "full"
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                                    }`}
                                    title="Ukuran Penuh (100%)"
                                  >
                                    Penuh
                                  </button>
                                </div>

                                {/* Delete Image */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImageParagraph(img.index)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Hapus gambar ini dari materi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Helper Callout */}
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-gray-600 dark:text-zinc-400 space-y-1">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Tips Penataan Gambar & Teks (Seperti di Microsoft Word):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                        <span className="p-1 rounded bg-black/5 dark:bg-white/5">
                          <strong>Kiri:</strong> !&#91;Caption|left|medium&#93;(url)
                        </span>
                        <span className="p-1 rounded bg-black/5 dark:bg-white/5">
                          <strong>Kanan:</strong> !&#91;Caption|right|medium&#93;(url)
                        </span>
                        <span className="p-1 rounded bg-black/5 dark:bg-white/5">
                          <strong>Tengah:</strong> !&#91;Caption|center|full&#93;(url)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Student Preview */
                  <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#0D1117] border border-black/10 dark:border-white/10 shadow-sm space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-extrabold">
                          Pratinjau Live Siswa
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {currentLesson.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLessonContentTab("edit")}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Kembali ke Editor Teks
                      </button>
                    </div>

                    {currentLesson.summary && (
                      <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border-l-4 border-amber-500 dark:border-amber-400 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {currentLesson.summary}
                      </div>
                    )}

                    <LessonContentRenderer paragraphs={currentLesson.paragraphs || []} />
                  </div>
                )}
              </div>

              {/* IMAGE INSERTION MODAL (MS WORD STYLE) */}
              {showImageModal && (
                <div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                  onClick={() => setShowImageModal(false)}
                >
                  <div
                    className="max-w-lg w-full bg-white dark:bg-[#161B22] rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 p-6 space-y-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
                          Sisipkan Gambar Materi
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowImageModal(false)}
                        className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Source Mode Tabs: Upload vs URL */}
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode("upload")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          imageSourceMode === "upload"
                            ? "bg-white dark:bg-[#161B22] text-gray-950 dark:text-white shadow-xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                        <span>Unggah File dari Komputer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceMode("url")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          imageSourceMode === "url"
                            ? "bg-white dark:bg-[#161B22] text-gray-950 dark:text-white shadow-xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        <span>Tautan / URL Gambar</span>
                      </button>
                    </div>

                    {/* Source Input */}
                    {imageSourceMode === "upload" ? (
                      <div className="space-y-2">
                        <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                          Pilih File Gambar (PNG, JPG, SVG, WebP)
                        </label>
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-center space-y-2 hover:border-amber-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImageFile}
                            disabled={isUploadingImage}
                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:opacity-90 cursor-pointer"
                          />
                          {isUploadingImage && (
                            <p className="text-xs font-bold text-amber-600 animate-pulse">
                              Sedang mengunggah gambar...
                            </p>
                          )}
                          {imageUrl && !isUploadingImage && (
                            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
                              <Check className="w-4 h-4" />
                              <span>Gambar berhasil diunggah!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                          URL Gambar (Direct Image Link)
                        </label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... atau URL gambar lainnya"
                          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    )}

                    {/* Image Preview if available */}
                    {imageUrl && (
                      <div className="max-h-36 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 p-1 bg-gray-50 dark:bg-black/20 text-center">
                        <img
                          src={imageUrl}
                          alt="Pratinjau"
                          className="max-h-32 w-auto mx-auto object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* Alignment / Text Wrap Selector (Like MS Word) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                        Posisi & Aliran Teks (Text Wrapping):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setImageAlign("center")}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            imageAlign === "center"
                              ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                              : "border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300"
                          }`}
                        >
                          <AlignCenter className="w-4 h-4" />
                          <span className="text-[11px] font-bold">Rata Tengah</span>
                          <span className="text-[9px] text-gray-400 leading-tight">
                            Lebar penuh / terpisah
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImageAlign("left")}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            imageAlign === "left"
                              ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                              : "border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300"
                          }`}
                        >
                          <AlignLeft className="w-4 h-4" />
                          <span className="text-[11px] font-bold">Rata Kiri</span>
                          <span className="text-[9px] text-gray-400 leading-tight">
                            Teks mengalir di kanan
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImageAlign("right")}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            imageAlign === "right"
                              ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                              : "border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300"
                          }`}
                        >
                          <AlignRight className="w-4 h-4" />
                          <span className="text-[11px] font-bold">Rata Kanan</span>
                          <span className="text-[9px] text-gray-400 leading-tight">
                            Teks mengalir di kiri
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                        Ukuran Gambar:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setImageSize("small")}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            imageSize === "small"
                              ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400"
                              : "border-black/10 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                          }`}
                        >
                          Kecil (32%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSize("medium")}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            imageSize === "medium"
                              ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400"
                              : "border-black/10 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                          }`}
                        >
                          Sedang (50%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSize("full")}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            imageSize === "full"
                              ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400"
                              : "border-black/10 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                          }`}
                        >
                          Penuh (100%)
                        </button>
                      </div>
                    </div>

                    {/* Caption Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                          Keterangan Gambar (Caption):
                        </label>
                        <div className="flex items-center gap-2">
                          {uploadedFileName && imageCaption !== uploadedFileName && (
                            <button
                              type="button"
                              onClick={() => setImageCaption(uploadedFileName)}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                              title="Gunakan nama file sebagai keterangan gambar"
                            >
                              Gunakan Nama File
                            </button>
                          )}
                          {imageCaption && (
                            <button
                              type="button"
                              onClick={() => setImageCaption("")}
                              className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                            >
                              Hapus Keterangan (Tanpa Teks)
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        placeholder="Contoh: Gambar 1.1 Diagram Alur Kerja BIM (Kosongkan jika tanpa teks)"
                        className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-tight">
                        Teks ini akan muncul sebagai keterangan di bawah gambar. Kosongkan jika Anda ingin menampilkan gambar saja tanpa teks keterangan.
                      </p>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowImageModal(false)}
                        className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleInsertImageToContent}
                        disabled={!imageUrl || isUploadingImage}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Sisipkan Gambar ke Materi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* INTERACTIVE BLOCKS TOOLBAR */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#00BCEB]/50 bg-[#E0F7FE]/20 dark:bg-[#0369A1]/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00BCEB]" />
                    <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Tambahkan Blok Interaktif Pembelajaran:
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">
                    Klik untuk menyisipkan blok interaktif
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={addTabbedBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-[#00BCEB] text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutGrid className="w-4 h-4 text-[#00BCEB] shrink-0" />
                    <span>Tabbed Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={addSkillsCheckBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-[#00BCEB] text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Skills Check</span>
                  </button>

                  <button
                    type="button"
                    onClick={addPracticeQuestionBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-[#00BCEB] text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Practice & Feedback</span>
                  </button>

                  <button
                    type="button"
                    onClick={addLabCardBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-[#00BCEB] text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Lab Exercise Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={addQuizIntroBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-[#00BCEB] text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Quiz Assessment</span>
                  </button>

                  <button
                    type="button"
                    onClick={addMatchingActivityBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-[#00BCEB] text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4 text-teal-500 shrink-0" />
                    <span>Matching Pairs</span>
                  </button>

                  <button
                    type="button"
                    onClick={addAssignmentBlock}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 hover:border-rose-500 text-left transition-all text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer sm:col-span-3 bg-rose-500/[0.04]"
                  >
                    <UploadCloud className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Upload Tugas Siswa (Capstone / Tugas Mahasiswa)</span>
                  </button>
                </div>
              </div>

              {/* ACTIVE INTERACTIVE BLOCKS EDITORS (WYSIWYG LIVE PREVIEW) */}
              <div className="space-y-6">
                {currentLesson.tabbedBlock && (
                  <VisualTabbedCardsEditor
                    data={currentLesson.tabbedBlock}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        tabbedBlock: updater(prev.tabbedBlock!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, tabbedBlock: undefined }))
                    }
                  />
                )}

                {currentLesson.skillsCheck && (
                  <VisualSkillsCheckEditor
                    data={currentLesson.skillsCheck}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        skillsCheck: updater(prev.skillsCheck!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, skillsCheck: undefined }))
                    }
                  />
                )}

                {currentLesson.practiceQuestion && (
                  <VisualPracticeQuestionEditor
                    data={currentLesson.practiceQuestion}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        practiceQuestion: updater(prev.practiceQuestion!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, practiceQuestion: undefined }))
                    }
                  />
                )}

                {currentLesson.labCard && (
                  <VisualLabCardEditor
                    data={currentLesson.labCard}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        labCard: updater(prev.labCard!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, labCard: undefined }))
                    }
                  />
                )}

                {currentLesson.quizIntro && (
                  <VisualQuizIntroEditor
                    data={currentLesson.quizIntro}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        quizIntro: updater(prev.quizIntro!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, quizIntro: undefined }))
                    }
                  />
                )}

                {currentLesson.matchingActivity && (
                  <VisualMatchingEditor
                    data={currentLesson.matchingActivity}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        matchingActivity: updater(prev.matchingActivity!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, matchingActivity: undefined }))
                    }
                  />
                )}

                {currentLesson.assignmentBlock && (
                  <VisualAssignmentBlockEditor
                    data={currentLesson.assignmentBlock}
                    onChange={(updater) =>
                      updateCurrentLesson((prev) => ({
                        ...prev,
                        assignmentBlock: updater(prev.assignmentBlock!),
                      }))
                    }
                    onRemove={() =>
                      updateCurrentLesson((prev) => ({ ...prev, assignmentBlock: undefined }))
                    }
                  />
                )}
              </div>

            </div>
          )}

          {!currentLesson && editorMode === "topic" && (
            <div className="py-20 text-center text-xs text-gray-400">
              Pilih salah satu topik materi di sebelah kiri untuk mulai menulis dan mengedit silabus.
            </div>
          )}
        </div>
      </div>
    )}

      {/* VIEW 2: DOKUMEN ACUAN & RESOURCES MANAGEMENT */}
      {curriculumTab === "resources" && (
        <div className="rounded-3xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                  Resources &amp; Dokumen Acuan
                </span>
                <span className="text-xs text-gray-500">• Total {resources.length} Berkas</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white mt-1">
                Kelola Berkas Referensi Kursus
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
                Unggah file referensi model (.rvt), template proyek (.rte), gambar CAD (.dwg), standar dokumen BEP (.pdf), atau tautan Google Docs. Berkas yang Anda kelola di sini akan muncul langsung di tab <strong>Resources</strong> pada LMS siswa dan dapat diunduh langsung.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleOpenAddResource}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Dokumen Baru</span>
              </button>
            </div>
          </div>

          {/* Resources Grid */}
          {resources.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-zinc-700" />
              <p className="font-semibold">Belum ada dokumen acuan yang diunggah untuk kelas ini.</p>
              <button
                type="button"
                onClick={handleOpenAddResource}
                className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-sm"
              >
                Unggah Dokumen Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50/60 dark:bg-[#0D1117] hover:border-emerald-500/50 transition-all space-y-3 shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-gray-700 dark:text-zinc-300">
                        {res.fileType} • {res.fileSize}
                      </span>
                      {res.isExternal ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          Tautan Cloud / External
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Berkas Terunggah
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-gray-950 dark:text-white leading-snug">
                      {res.title}
                    </h4>

                    {res.description && (
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                        {res.description}
                      </p>
                    )}

                    <div className="text-[11px] font-mono text-gray-400 truncate">
                      {res.url}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {res.url && res.url !== "#" ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={res.title}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 hover:border-emerald-500 text-xs font-bold text-gray-800 dark:text-zinc-200 transition-colors shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Unduh / Uji Berkas</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">URL belum disetel</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditResource(res)}
                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        title="Edit Dokumen"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-2 rounded-xl hover:bg-rose-500/15 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Save Reminder */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Perubahan daftar dokumen akan otomatis tersinkronisasi ke tampilan LMS siswa saat Anda klik <strong>Simpan Kurikulum</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveCurriculum}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
            >
              {saving ? "Menyimpan..." : "Simpan Dokumen Acuan"}
            </button>
          </div>
        </div>
      )}

      {/* RESOURCE ADD / EDIT MODAL */}
      {resourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black text-gray-950 dark:text-white">
                  {editingResourceId ? "Edit Dokumen Acuan" : "Tambah Dokumen Acuan Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResourceModalOpen(false)}
                className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4">
              {/* Mode: Upload Berkas Langsung vs Tautan Eksternal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                  Metode Sumber Berkas:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResourceForm((prev) => ({ ...prev, isExternal: false }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2 cursor-pointer ${
                      !resourceForm.isExternal
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                        : "border-black/10 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    <Upload className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Upload File Komputer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResourceForm((prev) => ({ ...prev, isExternal: true }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2 cursor-pointer ${
                      resourceForm.isExternal
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300"
                        : "border-black/10 dark:border-white/10 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Tautan URL Cloud</span>
                  </button>
                </div>
              </div>

              {/* Direct File Upload Dropzone */}
              {!resourceForm.isExternal && (
                <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2 text-center">
                  <input
                    type="file"
                    id="resourceFileInput"
                    className="hidden"
                    onChange={handleUploadResourceFile}
                  />
                  <label
                    htmlFor="resourceFileInput"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#21262D] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-800 dark:text-zinc-200 shadow-2xs hover:border-emerald-500 transition-all"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-500" />
                    <span>{isUploadingResource ? "Mengunggah berkas..." : "Pilih File (.rvt, .rte, .dwg, .pdf, .zip)"}</span>
                  </label>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Ukuran maksimum 100MB. File otomatis tersimpan di server aman.
                  </p>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                  Judul Dokumen / Nama Berkas <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  placeholder="Contoh: Template Proyek Autodesk Revit (.RTE) Standar AEC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                  Keterangan Singkat:
                </label>
                <textarea
                  rows={2}
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  placeholder="Jelaskan isi file ini dan bagaimana mahasiswa harus menggunakannya..."
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* 2-Columns: File Type & File Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                    Tipe Berkas:
                  </label>
                  <input
                    type="text"
                    value={resourceForm.fileType}
                    onChange={(e) => setResourceForm({ ...resourceForm, fileType: e.target.value })}
                    placeholder="Contoh: RTE File / PDF"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                    Ukuran Berkas:
                  </label>
                  <input
                    type="text"
                    value={resourceForm.fileSize}
                    onChange={(e) => setResourceForm({ ...resourceForm, fileSize: e.target.value })}
                    placeholder="Contoh: 18.4 MB / Online"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">
                  URL Unduhan / Tautan Dokumen <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                  placeholder="https://... atau /uploads/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {editingResourceId ? "Simpan Perubahan" : "Tambahkan ke Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
