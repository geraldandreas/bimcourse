"use client";

import React, { useState } from "react";
import {
  Layers,
  Database,
  Building2,
  Cpu,
  Compass,
  CheckCircle2,
  Clock,
  DollarSign,
  Leaf,
  ShieldAlert,
  ArrowRight,
  GitBranch,
  Boxes,
  Workflow,
  Sparkles,
  ExternalLink,
  Code2,
  FolderGit2,
  Eye,
  FileCheck2,
} from "lucide-react";
import { CurriculumLesson } from "@/data/bimDocCurriculum";

interface VisualProps {
  lesson: CurriculumLesson;
}

export default function CurriculumVisual({ lesson }: VisualProps) {
  switch (lesson.visualType) {
    case "bim-lifecycle":
      return <BimLifecycleVisual />;
    case "nist-aec":
      return <NistAecVisual />;
    case "autodesk-stack":
      return <AutodeskStackVisual activeSoftware={lesson.metadata?.softwareKey} />;
    case "bim-levels":
      return <BimLevelsVisual />;
    case "bim-dimensions":
      return <BimDimensionsVisual />;
    case "revit-vs-cad":
      return <RevitVsCadVisual />;
    case "revit-competency":
      return <RevitCompetencyVisual />;
    case "revit-workflows":
      return <RevitWorkflowsVisual sub={lesson.metadata?.sub} />;
    default:
      return <BimLifecycleVisual />;
  }
}

// 1. BIM Lifecycle & Digital Facility Wheel
function BimLifecycleVisual() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      title: "1. Perencanaan (Plan)",
      desc: "Feasibility study, analisis tapak spasial, dan konseptual desain awal berbasis kebutuhan klien.",
      badge: "LOD 100 - 200",
      accent: "from-blue-500 to-indigo-600",
    },
    {
      title: "2. Desain (Design)",
      desc: "Pemodelan parametrik arsitektur, struktur, & MEP terkoordinasi dengan deteksi clash sedini mungkin.",
      badge: "LOD 300 - 350",
      accent: "from-amber-500 to-yellow-500",
    },
    {
      title: "3. Konstruksi (Build)",
      desc: "Simulasi 4D jadwal kerja, 5D estimasi arus kas, fabrikasi komponen, dan logistik lapangan presisi.",
      badge: "LOD 400 As-Built",
      accent: "from-emerald-500 to-teal-600",
    },
    {
      title: "4. Operasi (Operate)",
      desc: "Manajemen fasilitas 7D, sensor IoT operasional, data garansi, dan siklus pemeliharaan aset gedung.",
      badge: "LOD 500 Digital Twin",
      accent: "from-purple-500 to-violet-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Workflow className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            Siklus Hidup Bangunan BIM
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-700 dark:text-zinc-300">
          Digital Facility Lifecycle
        </span>
      </div>

      {/* 4 Interactive Stages */}
      <div className="grid grid-cols-2 gap-2">
        {stages.map((stg, idx) => {
          const isActive = activeStage === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStage(idx)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? "border-amber-500 dark:border-amber-400 bg-amber-500/5 dark:bg-amber-400/10 shadow-sm"
                  : "border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isActive ? "text-amber-600 dark:text-amber-300" : "text-gray-900 dark:text-white"}`}>
                  {stg.title}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
              </div>
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 line-clamp-2 leading-tight">
                {stg.desc}
              </p>
              <div className="mt-2 text-[9px] font-mono font-bold text-gray-400 dark:text-zinc-500">
                {stg.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Geometric vs Non-Geometric Indicator */}
      <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Informasi Geometris (3D Shape)</span>
        </div>
        <span className="font-bold text-amber-500">+</span>
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Informasi Non-Geometris (Data/Spec)</span>
        </div>
      </div>
    </div>
  );
}

// 2. NIST & AEC Multidisciplinary Network
function NistAecVisual() {
  const disciplines = [
    { role: "Arsitektur", icon: Building2, desc: "Bentuk massa, ruang, fungsi estetika & DED denah." },
    { role: "Struktur", icon: Boxes, desc: "Pondasi, balok, kolom beton/baja & perhitungan beban." },
    { role: "MEP Enjiniring", icon: Cpu, desc: "Pipa plumbing, ducting HVAC, dan kabel elektrikal." },
    { role: "Kontraktor & QS", icon: DollarSign, desc: "Simulasi 4D jadwal, 5D estimasi biaya & logistik." },
  ];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            Jejaring Multidisiplin Industri AEC
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
          Standar NIST
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {disciplines.map((d, i) => {
          const Icon = d.icon;
          return (
            <div
              key={i}
              className="p-3 rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/60 dark:bg-white/5 flex items-start gap-2.5"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-amber-500 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-950 dark:text-white leading-tight">
                  {d.role}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug">
                  {d.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* NIST Quote Box */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border border-amber-500/30 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fokus Efisiensi Standar NIST:</span>
        </div>
        <p className="text-[11px] text-gray-700 dark:text-zinc-300 leading-relaxed italic">
          "Kolaborasi multidisiplin sejak tahap desain mengantisipasi potensi masalah, mengurangi pemborosan waktu pengerjaan ulang (rework), dan menekan biaya konstruksi hingga miliaran rupiah."
        </p>
      </div>
    </div>
  );
}

// 3. Autodesk BIM Software Stack
function AutodeskStackVisual({ activeSoftware }: { activeSoftware?: string }) {
  const [selected, setSelected] = useState<string>(activeSoftware || "revit");

  const softwares = [
    {
      id: "revit",
      name: "Autodesk Revit",
      badge: "Fokus Kursus",
      color: "from-blue-600 to-cyan-500",
      role: "Parametric 3D BIM Modeling",
      description:
        "Software utama untuk arsitektur, struktur, dan MEP. Model terpusat dengan dokumentasi DED otomatis dan sinkronisasi dua arah.",
      features: ["LOD 100 - 400", "BIM 3D Parametrik", "Material Schedule", "Central Model"],
    },
    {
      id: "navisworks",
      name: "Autodesk Navisworks",
      badge: "Clash & 4D",
      color: "from-blue-500 to-indigo-600",
      role: "Federated Model & Coordination",
      description:
        "Solusi peninjauan gabungan model multi-disiplin untuk deteksi tabrakan (clash detection) serta simulasi 4D waktu dan 5D biaya.",
      features: ["Clash Detective", "TimeLiner 4D", "Quantification 5D", "BCF Export"],
    },
    {
      id: "civil3d",
      name: "Autodesk Civil 3D",
      badge: "Infrastruktur",
      color: "from-teal-600 to-emerald-500",
      role: "Civil & Infrastructure Design",
      description:
        "Perangkat lunak khusus teknik sipil untuk perancangan jalan raya, pemodelan topografi permukaan bumi, dan perhitungan galian-timbunan tanah.",
      features: ["TIN Surface", "Corridor Modeling", "Cut & Fill Volumes", "Pipa & Utilitas"],
    },
    {
      id: "acc",
      name: "Autodesk Construction Cloud (ACC)",
      badge: "Cloud CDE",
      color: "from-amber-500 to-orange-600",
      role: "Common Data Environment (CDE)",
      description:
        "Platform cloud untuk kolaborasi lapangan real-time, manajemen dokumen standar ISO 19650, review desain, dan sinkronisasi model proyek.",
      features: ["ISO 19650 CDE", "Revit Cloud Worksharing", "Field Issue Tracking", "Version History"],
    },
  ];

  const current = softwares.find((s) => s.id === selected) || softwares[0];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            Software Autodesk BIM Populer
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">Pilih Software:</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5">
        {softwares.map((sw) => (
          <button
            key={sw.id}
            type="button"
            onClick={() => setSelected(sw.id)}
            className={`py-2 px-1.5 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
              selected === sw.id
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400"
            }`}
          >
            <div className="truncate">{sw.name.replace("Autodesk ", "")}</div>
          </button>
        ))}
      </div>

      {/* Selected Card View */}
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
              {current.role}
            </span>
            <h4 className="text-base font-extrabold text-gray-950 dark:text-white">
              {current.name}
            </h4>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {current.badge}
          </span>
        </div>

        <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
          {current.description}
        </p>

        <div className="pt-2 border-t border-black/5 dark:border-white/5">
          <p className="text-[10px] font-mono uppercase font-bold text-gray-400 dark:text-zinc-500 mb-1.5">
            Fitur Utama Industri:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {current.features.map((feat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 text-gray-800 dark:text-zinc-200"
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. BIM Levels 0 - 3
function BimLevelsVisual() {
  const [activeLevel, setActiveLevel] = useState<number>(2);

  const levels = [
    {
      level: "Level 0",
      title: "2D CAD Design",
      status: "Metode Tradisional",
      desc: "Gambar dua dimensi dibuat dengan drafting terpisah (AutoCAD). Pertukaran gambar manual via kertas / PDF cetak.",
      tech: "2D DWG, Printout Kertas, Manual Coordination",
      color: "border-gray-400 text-gray-500",
    },
    {
      level: "Level 1",
      title: "Basic 3D Models",
      status: "Fase Transisi",
      desc: "Model 3D digunakan untuk visualisasi awal atau konsep, tetapi dokumentasi izin kerja masih mengandalkan 2D terpisah tanpa kolaborasi cerdas.",
      tech: "3D Visuals + 2D Drafting Terpisah",
      color: "border-blue-500 text-blue-500",
    },
    {
      level: "Level 2",
      title: "Collaborative 3D BIM",
      status: "Standar Proyek Saat Ini",
      desc: "Masing-masing disiplin (Arsitektur, Struktur, MEP) membuat model 3D sendiri, lalu bertukar file secara berkala melalui Common Data Environment (CDE) dan format IFC.",
      tech: "Revit Central Models, IFC, CDE Cloud, Navisworks Clash",
      color: "border-amber-500 text-amber-500",
    },
    {
      level: "Level 3",
      title: "Integrated Project Delivery",
      status: "Masa Depan / Full iBIM",
      desc: "Semua pihak berkolaborasi secara simultan pada satu model cloud terpadu seumur hidup bangunan (desain, konstruksi, hingga operasi fasilitas).",
      tech: "Single Cloud Model, IoT Live Sensor, Smart Contracts, Digital Twin",
      color: "border-emerald-500 text-emerald-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            BIM Maturity Levels (0 - 3)
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
          Mandat Pemerintah & BUMN
        </span>
      </div>

      {/* Level Buttons Ladder */}
      <div className="grid grid-cols-4 gap-1.5">
        {levels.map((lvl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveLevel(idx)}
            className={`py-2 px-1 rounded-xl text-center transition-all border cursor-pointer ${
              activeLevel === idx
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm font-bold"
                : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400 text-xs"
            }`}
          >
            <div className="text-[11px] font-mono">{lvl.level}</div>
          </button>
        ))}
      </div>

      {/* Active Level Detail */}
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-2">
            <span className="font-mono text-amber-500">{levels[activeLevel].level}:</span>
            <span>{levels[activeLevel].title}</span>
          </h4>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300">
            {levels[activeLevel].status}
          </span>
        </div>

        <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
          {levels[activeLevel].desc}
        </p>

        <div className="pt-2 border-t border-black/5 dark:border-white/5 text-[11px] font-mono text-gray-500 dark:text-zinc-400">
          <span className="font-bold text-gray-700 dark:text-zinc-300">Teknologi: </span>
          {levels[activeLevel].tech}
        </div>
      </div>
    </div>
  );
}

// 5. BIM Dimensions (3D - 7D)
function BimDimensionsVisual() {
  const [activeDim, setActiveDim] = useState<string>("3d");

  const dimensions = [
    {
      id: "3d",
      code: "3D",
      title: "Geometrical View (Shape)",
      icon: Boxes,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      desc: "Representasi tiga dimensi konstruksi. Mengidentifikasi kesalahan desain spasial sedini mungkin dan memungkinkan pembaruan model secara real-time.",
      useCases: ["Model Arsitektur & Struktur", "Clash Detection Fisik", "Visualisasi Rendering Klien"],
    },
    {
      id: "4d",
      code: "4D",
      title: "Scheduling (Time)",
      icon: Clock,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      desc: "Visualisasi kemajuan proyek yang dikaitkan langsung dengan jadwal pekerjaan Microsoft Project / Primavera untuk memastikan selesai tepat waktu.",
      useCases: ["Simulasi Urutan Pengecoran", "Mitigasi Keterlambatan", "Visualisasi Progres Rencana vs Aktual"],
    },
    {
      id: "5d",
      code: "5D",
      title: "Estimating (Cost)",
      icon: DollarSign,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      desc: "Analisis dan estimasi anggaran biaya akurat berdasarkan ekstraksi volume material langsung dari model parametrik tanpa kalkulasi manual.",
      useCases: ["Quantity Take-Off (QTO)", "Arus Kas Proyek (Cashflow)", "Evaluasi Biaya Varian Perubahan"],
    },
    {
      id: "6d",
      code: "6D",
      title: "Sustainability (Green)",
      icon: Leaf,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      desc: "Mengintegrasikan analisis energi, pencahayaan alami, jejak karbon, dan dampak lingkungan pada tahap pra-konstruksi.",
      useCases: ["Simulasi Beban Termal Gedung", "Analisis Radiasi Matahari", "Sertifikasi Green Building (LEED)"],
    },
    {
      id: "7d",
      code: "7D",
      title: "Facility Management",
      icon: ShieldAlert,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      desc: "Mengintegrasikan informasi operasional dan perawatan aset gedung sepanjang masa pakainya, termasuk manual suku cadang dan data garansi.",
      useCases: ["Jadwal Pemeliharaan AC & Lift", "Data Garansi Komponen", "Digital Twin Operasional Gedung"],
    },
  ];

  const current = dimensions.find((d) => d.id === activeDim) || dimensions[0];
  const Icon = current.icon;

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Boxes className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            Dimensi BIM (3D s/d 7D)
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">Klik dimensi:</span>
      </div>

      {/* Dim Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {dimensions.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveDim(d.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
              activeDim === d.id
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                : "border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400"
            }`}
          >
            <span>{d.code}</span>
          </button>
        ))}
      </div>

      {/* Selected Dim View */}
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${current.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
              BIM {current.code} Dimension
            </span>
            <h4 className="text-sm font-extrabold text-gray-950 dark:text-white">
              {current.title}
            </h4>
          </div>
        </div>

        <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
          {current.desc}
        </p>

        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
          <p className="text-[10px] font-mono uppercase font-bold text-gray-400 dark:text-zinc-500">
            Aplikasi Praktis:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {current.useCases.map((uc, i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 text-[10px] text-gray-800 dark:text-zinc-200 font-medium"
              >
                • {uc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Revit vs 2D Drafting CAD
function RevitVsCadVisual() {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            Perbandingan Konseptual
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
          Drafting 2D vs Revit BIM
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CAD Drafting */}
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              Drafting Konvensional (CAD)
            </span>
            <span className="text-[10px] font-mono text-rose-600">Manual</span>
          </div>
          <p className="text-[11px] text-gray-700 dark:text-zinc-300 leading-snug">
            Gambar denah, tampak, dan potongan dibuat terpisah satu per satu.
          </p>
          <ul className="text-[10px] text-gray-600 dark:text-zinc-400 space-y-1 pt-1 border-t border-rose-500/20 font-mono">
            <li>✕ Revisi denah harus ubah tampak manual</li>
            <li>✕ Rawan human-error & ketidakcocokan dimensi</li>
            <li>✕ Kalkulasi BoQ dihitung manual di Excel</li>
          </ul>
        </div>

        {/* Autodesk Revit BIM */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Autodesk Revit (BIM)
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">Terintegrasi</span>
          </div>
          <p className="text-[11px] text-gray-700 dark:text-zinc-300 leading-snug">
            Satu model 3D terpusat. Denah, tampak, dan potongan adalah sudut pandang (views) dinamis.
          </p>
          <ul className="text-[10px] text-gray-700 dark:text-zinc-300 space-y-1 pt-1 border-t border-emerald-500/20 font-mono">
            <li>✓ Geser pintu di denah = tampak & 3D otomatis update</li>
            <li>✓ Tabel volume BoQ tersinkronisasi dua arah</li>
            <li>✓ Terhindar dari revisi berulang di lapangan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 7. Revit Competency (6 Levels)
function RevitCompetencyVisual() {
  const competencies = [
    { tier: "Beginner", items: ["User Interface Revit", "Project Setup (Grids & Levels)"] },
    { tier: "Basic", items: ["Architectural Modeling", "Structural Modeling"] },
    { tier: "Basic+", items: ["Annotation & Detail Tags", "Documentation & Sheet Setup"] },
    { tier: "Intermediate", items: ["Quantity Take-Off (QTO)", "Schedule & Cost Estimation"] },
    { tier: "Advance", items: ["Worksharing (Central/Local)", "Coordination & Linked Models"] },
    { tier: "Profesional", items: ["Dynamo Visual Programming", "Parametric Family Design"] },
  ];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Workflow className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            6 Jenjang Tingkatan Penguasaan Revit
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
          Roadmap Praktisi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {competencies.map((comp, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/60 dark:bg-white/5 flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 text-gray-800 dark:text-zinc-200 text-[10px] font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-extrabold text-gray-950 dark:text-white">
                  {comp.tier}
                </span>
              </div>
              <div className="mt-1.5 space-y-0.5 pl-7">
                {comp.items.map((it, i) => (
                  <p key={i} className="text-[11px] text-gray-600 dark:text-zinc-400">
                    • {it}
                  </p>
                ))}
              </div>
            </div>
            {idx >= 3 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold shrink-0">
                Lanjutan
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. Revit 2-Sub Workflows
function RevitWorkflowsVisual({ sub }: { sub?: any }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#12151B]/90 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
            2 Sub Utama Alur Belajar Revit
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
          Terstruktur & Terarah
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sub 1 */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            sub === 1 || sub === "notes"
              ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-400/5"
              : "border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300">
              SUB 1: FONDASI & PEMODELAN
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
            Beginner — Basic — Basic+
          </h4>
          <ul className="text-[11px] text-gray-600 dark:text-zinc-400 space-y-1 font-mono">
            <li>1. User Interface Revit</li>
            <li>2. Project Setup (Levels/Grids)</li>
            <li>3. Architectural Modeling</li>
            <li>4. Structural Modeling</li>
            <li>5. Annotation & Tags</li>
            <li>6. Documentation & Sheets</li>
          </ul>
        </div>

        {/* Sub 2 */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            sub === 2 || sub === "notes"
              ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-400/5"
              : "border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              SUB 2: MANAJEMEN & OTOMASI
            </span>
          </div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
            Intermediate — Advance — Profesional
          </h4>
          <ul className="text-[11px] text-gray-600 dark:text-zinc-400 space-y-1 font-mono">
            <li>1. Quantity Take-Off (QTO)</li>
            <li>2. Schedule & Cost Matrix</li>
            <li>3. Worksharing (Central File)</li>
            <li>4. Coordination (Linked Models)</li>
            <li>5. Dynamo Plugin Otomasi</li>
            <li>6. Parametric Family Design</li>
          </ul>
        </div>
      </div>

      {/* Notes footer */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span className="leading-snug">
          <strong>Notes Penting:</strong> Sebaiknya dipelajari sesuai urutan alur yang telah tertera untuk kemudahan dalam proses pemahaman dan pembentukan kapabilitas praktis.
        </span>
      </div>
    </div>
  );
}
