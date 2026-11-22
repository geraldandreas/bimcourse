"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
  ZoomIn,
  ArrowRight,
  Check
} from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.59 1.59 0 0 0-1.6 1.59c0 .88.72 1.59 1.6 1.59s1.6-.71 1.6-1.59a1.6 1.6 0 0 0-1.6-1.59Z" />
    </svg>
  );
}
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEFAULT_SITE_CONTENT, WebInstructor, InstructorProject, InstructorCertificate } from "@/data/defaultSiteContent";
import { COURSES } from "@/data/courses";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstructorCvPortfolioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const instructorId = resolvedParams.id;

  const [instructor, setInstructor] = useState<WebInstructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cv" | "projects" | "certificates" | "courses">("cv");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Fetch latest instructor content from API
    fetch("/api/site-content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const instructors: WebInstructor[] = data?.content?.instructors || DEFAULT_SITE_CONTENT.instructors;
        const found = instructors.find(
          (inst) =>
            inst.slug === instructorId ||
            inst.id === instructorId ||
            inst.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === instructorId
        );
        setInstructor(found || DEFAULT_SITE_CONTENT.instructors[0]);
      })
      .catch(() => {
        const found = DEFAULT_SITE_CONTENT.instructors.find(
          (inst) =>
            inst.slug === instructorId ||
            inst.id === instructorId ||
            inst.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === instructorId
        );
        setInstructor(found || DEFAULT_SITE_CONTENT.instructors[0]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [instructorId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-mono">Memuat Portofolio &amp; CV Instruktur...</p>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-between">
        <Navbar cartCount={0} />
        <div className="max-w-xl mx-auto text-center px-6 py-24">
          <h1 className="text-2xl font-bold mb-3">Instruktur Tidak Ditemukan</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Data instruktur yang Anda cari belum tersedia atau URL telah diperbarui.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter courses taught by this instructor
  const instructorCourses = COURSES.filter((c) =>
    c.instructor.name.toLowerCase().includes(instructor.name.toLowerCase()) ||
    instructor.name.toLowerCase().includes(c.instructor.name.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 bg-zinc-950 p-2 shadow-2xl">
            <img
              src={lightboxImage}
              alt="Enlarged Portfolio Detail"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar cartCount={0} />

      {/* Hero Header Profil */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 bg-gradient-to-b from-zinc-950 via-[#0E1015] to-[#09090B] text-white border-b border-white/10 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs & Share */}
          <div className="flex items-center justify-between gap-4 mb-8 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <Link href="/#instructors" className="hover:text-amber-400 transition-colors">
                Tim Pengajar
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-none">
                {instructor.name}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors cursor-pointer border border-white/10"
              title="Salin Tautan Profil"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Tautan Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>

          {/* Main Hero Card */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
            {/* Avatar & Experience Badge */}
            <div className="relative group shrink-0 mx-auto lg:mx-0">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden bg-zinc-900 border-2 border-amber-400/40 p-1 shadow-2xl relative">
                <img
                  src={instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"}
                  alt={instructor.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{instructor.experience || "BIM Specialist"}</span>
              </div>
            </div>

            {/* Title & Bio Details */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Instruktur Resmi BIMCourse • Praktisi Konstruksi Digital</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {instructor.name}
              </h1>

              <p className="text-base sm:text-lg font-semibold text-amber-400/90 mt-1.5">
                {instructor.role}
              </p>

              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl">
                {instructor.affiliation}
              </p>

              {/* Location & Quick Meta */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4 text-xs text-zinc-300">
                {instructor.location && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{instructor.location}</span>
                  </div>
                )}
                {instructor.education?.[0] && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {instructor.education[0].degree} - {instructor.education[0].institution.split("(")[0]}
                      {instructor.education[0].gpa ? ` (IPK ${instructor.education[0].gpa})` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Download, Drive, WhatsApp, Email) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
                {instructor.portfolioLink && (
                  <a
                    href={instructor.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Portofolio PDF (Drive)</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                )}

                {instructor.phone && (
                  <a
                    href={`https://wa.me/${instructor.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(instructor.name)},%20saya%20melihat%20portofolio%20dan%20CV%20Anda%20di%20BIMCourse`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Hubungi WhatsApp</span>
                  </a>
                )}

                {instructor.email && (
                  <a
                    href={`mailto:${instructor.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-all"
                  >
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>{instructor.email}</span>
                  </a>
                )}

                {instructor.linkedin && (
                  <a
                    href={instructor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-white text-xs font-medium border border-[#0077B5]/40 transition-all"
                  >
                    <LinkedinIcon className="w-4 h-4 text-[#0077B5]" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setActiveTab("cv")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "cv"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Curriculum Vitae (CV) &amp; Karir</span>
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "projects"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Portofolio Proyek &amp; Sayembara</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                {instructor.projects?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Prestasi &amp; Sertifikat</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                {instructor.certificates?.length || 0}
              </span>
            </button>

            {instructorCourses.length > 0 && (
              <button
                onClick={() => setActiveTab("courses")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Kelas Diajar di BIMCourse</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                  {instructorCourses.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* TAB 1: PORTOFOLIO PROYEK & SAYEMBARA */}
        {activeTab === "projects" && (
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  SELECTED WORKS &amp; COMPETITIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                  Karya Proyek Arsitektur &amp; Pemodelan BIM
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mt-1">
                  Kumpulan proyek sayembara nasional, perancangan ruang publik parametrik, hingga co-housing ramah lingkungan dengan pemodelan 3D dan simulasi daylight terintegrasi.
                </p>
              </div>

              {instructor.portfolioLink && (
                <a
                  href={instructor.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>Buka Dokumen PDF Portofolio 18 Halaman</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* List of Projects */}
            {instructor.projects && instructor.projects.length > 0 ? (
              <div className="space-y-16">
                {instructor.projects.map((proj, idx) => (
                  <article
                    key={proj.id || idx}
                    className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm hover:border-amber-400/40 transition-all"
                  >
                    <div className="p-6 sm:p-8 md:p-10">
                      {/* Project Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            {proj.category}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            Tahun {proj.year}
                          </span>
                        </div>

                        {proj.award && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-xs">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{proj.award}</span>
                          </div>
                        )}
                      </div>

                      {/* Project Title */}
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                        {proj.title}
                      </h3>

                      {proj.location && (
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{proj.location}</span>
                        </p>
                      )}

                      {proj.team && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Tim Sayembara:</span> {proj.team}
                        </p>
                      )}

                      {/* Software Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-4">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">Tools:</span>
                        {proj.tools.map((tool, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>

                      {/* Project Description */}
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-5 leading-relaxed">
                        {proj.description}
                      </p>

                      {/* Highlights / Technical Analyses */}
                      {proj.highlights && proj.highlights.length > 0 && (
                        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Poin Keunggulan &amp; Simulasi Teknis:</span>
                          </h4>
                          <ul className="space-y-2">
                            {proj.highlights.map((hl, hIdx) => (
                              <li key={hIdx} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{hl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Gallery Images (High Resolution extracted pages) */}
                      {proj.gallery && proj.gallery.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-amber-500" />
                              <span>Lembar Kerja Gambar &amp; Visualisasi ({proj.gallery.length} Halaman)</span>
                            </h4>
                            <span className="text-[11px] text-zinc-500">Klik gambar untuk memperbesar</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proj.gallery.map((imgSrc, imgIdx) => (
                              <div
                                key={imgIdx}
                                onClick={() => setLightboxImage(imgSrc)}
                                className="group/img relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-white/10 cursor-pointer shadow-sm hover:border-amber-400/60 transition-all"
                              >
                                <img
                                  src={imgSrc}
                                  alt={`${proj.title} - Lembar ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                                  <ZoomIn className="w-6 h-6" />
                                  <span className="text-xs font-semibold">Perbesar Lembar {imgIdx + 1}</span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-black/80 text-white px-2 py-0.5 rounded border border-white/10">
                                  Lembar {imgIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <p>Belum ada proyek yang ditambahkan.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: CURRICULUM VITAE (CV) & KARIR - 100% NATIVE WEB UI */}
        {activeTab === "cv" && (
          <div className="space-y-12">
            {/* CV Section Header */}
            <div className="border-b border-zinc-200 dark:border-white/10 pb-6">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 block mb-1">
                PROFESSIONAL RECORD &amp; QUALIFICATIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                Curriculum Vitae &amp; Rekam Jejak
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mt-1">
                Riwayat pendidikan formal, pengalaman praktik industri konstruksi &amp; BIM, kepanitiaan, hingga pelatihan keahlian berkelanjutan.
              </p>
            </div>

            {/* 1. Riwayat Pendidikan Formal */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10">
              <h3 className="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-amber-500" />
                <span>Riwayat Pendidikan Formal</span>
              </h3>

              <div className="space-y-4">
                {instructor.education && instructor.education.length > 0 ? (
                  instructor.education.map((edu, i) => (
                    <div
                      key={i}
                      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
                            {edu.degree}
                          </h4>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 mt-0.5">
                            {edu.institution}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {edu.gpa && (
                            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              IPK {edu.gpa}
                            </span>
                          )}
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                            {edu.period}
                          </span>
                        </div>
                      </div>

                      {edu.honors && edu.honors.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-white/10 space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                            Capaian &amp; Konsentrasi Studi:
                          </span>
                          {edu.honors.map((h, hIdx) => (
                            <div key={hIdx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Belum ada riwayat pendidikan yang ditambahkan.</p>
                )}
              </div>
            </div>

            {/* 2. Pengalaman Kerja & Praktik Industri */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10">
              <h3 className="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <span>Pengalaman Kerja &amp; Praktik Industri</span>
              </h3>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 sm:before:left-4 before:w-0.5 before:bg-zinc-300 dark:before:bg-white/10">
                {instructor.workExperience && instructor.workExperience.length > 0 ? (
                  instructor.workExperience.map((exp, i) => (
                    <div key={i} className="relative pl-9 sm:pl-11">
                      <div className="absolute left-1.5 sm:left-2 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900 shadow-sm" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-base font-bold text-gray-950 dark:text-white">
                          {exp.role}
                        </h4>
                        <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {exp.company} {exp.location ? `• ${exp.location}` : ""}
                      </p>

                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {exp.highlights.map((hl, hIdx) => (
                            <li key={hIdx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 pl-8">Belum ada riwayat kerja yang ditambahkan.</p>
                )}
              </div>
            </div>

            {/* 3. Pengalaman Organisasi & Kepanitiaan */}
            {instructor.organizations && instructor.organizations.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10">
                <h3 className="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span>Pengalaman Organisasi &amp; Kepanitiaan</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instructor.organizations.map((org, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-gray-950 dark:text-white">
                          {org.role}
                        </h4>
                        <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                          {org.period}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {org.organization}
                      </p>
                      {org.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
                          {org.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Webinar, Kuliah Umum & Pelatihan Terpilih */}
            {instructor.webinars && instructor.webinars.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10">
                <h3 className="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-amber-500" />
                  <span>Webinar, Kuliah Umum &amp; Pelatihan yang Diikuti</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {instructor.webinars.map((web, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            {web.year}
                          </span>
                          {web.type && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {web.type}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white leading-snug">
                          {web.title}
                        </h4>
                      </div>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-white/10">
                        {web.organizer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Matriks Keahlian & Kemahiran */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10">
              <h3 className="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Matriks Keahlian &amp; Software Kemahiran</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Software Skills */}
                <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                    Software BIM &amp; Desain
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {instructor.softwareSkills?.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Architecture Skills */}
                <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                    Keahlian Teknis Arsitektur
                  </h4>
                  <ul className="space-y-1.5">
                    {instructor.technicalSkills?.map((t, i) => (
                      <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Soft Skills */}
                <div className="p-5 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                    Soft Skills &amp; Kolaborasi
                  </h4>
                  <ul className="space-y-1.5">
                    {instructor.softSkills?.map((sk, i) => (
                      <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRESTASI & SERTIFIKAT */}
        {activeTab === "certificates" && (
          <div className="space-y-12">
            {/* Sayembara & Kompetisi */}
            <div>
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  AWARDS &amp; RECOGNITIONS
                </span>
                <h3 className="text-2xl font-black text-gray-950 dark:text-white">
                  Penghargaan Sayembara Arsitektur Nasional
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {instructor.achievements?.map((ach, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 hover:border-amber-400/40 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          {ach.year}
                        </span>
                        {ach.rank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                            {ach.rank}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-gray-950 dark:text-white leading-snug">
                        {ach.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                        {ach.event}
                      </p>
                    </div>

                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-4 pt-3 border-t border-zinc-200 dark:border-white/10">
                      Penyelenggara: {ach.organizer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates Gallery */}
            <div>
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  OFFICIAL CREDENTIALS
                </span>
                <h3 className="text-2xl font-black text-gray-950 dark:text-white">
                  Sertifikat &amp; Piagam Penghargaan
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Klik dokumen sertifikat di bawah untuk memperbesar resolusi tinggi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructor.certificates?.map((cert, i) => (
                  <div
                    key={i}
                    onClick={() => cert.image && setLightboxImage(cert.image)}
                    className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 hover:border-amber-400/60 transition-all shadow-sm flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {cert.image && (
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-white/10 mb-4">
                          <img
                            src={cert.image}
                            alt={cert.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-5 h-5" />
                          </div>
                        </div>
                      )}

                      <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {cert.year}
                      </span>
                      <h4 className="text-sm font-bold text-gray-950 dark:text-white mt-1 leading-snug">
                        {cert.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {cert.issuer}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Lihat Dokumen</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KELAS DI BIMCOURSE */}
        {activeTab === "courses" && (
          <div className="space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 block mb-1">
                ONLINE MENTORSHIP &amp; BOOTCAMP
              </span>
              <h3 className="text-2xl font-black text-gray-950 dark:text-white">
                Kelas &amp; Program yang Dibimbing oleh {instructor.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Ikuti kelas komprehensif, pelajari software BIM dari nol hingga mahir membuat model 3D dan dokumen DED siap kerja.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorCourses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm hover:border-amber-400/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-zinc-950">
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {c.badge && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                          {c.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        <span>{c.level}</span>
                        <span>•</span>
                        <span>{c.durationHours} Jam Materi</span>
                      </div>

                      <h4 className="text-base font-bold text-gray-950 dark:text-white leading-snug">
                        {c.title}
                      </h4>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                        {c.summary}
                      </p>

                      <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{c.rating}</span>
                        <span className="text-zinc-400 font-normal">({c.reviewsCount} review)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block line-through">
                          Rp {c.originalPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-sm font-extrabold text-gray-950 dark:text-white">
                          Rp {c.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <Link
                        href={`/courses/${c.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
                      >
                        <span>Lihat Silabus</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
