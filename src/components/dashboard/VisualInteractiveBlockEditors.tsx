"use client";

import React, { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  FileText,
  LayoutGrid,
  CheckSquare,
  Shuffle,
  Award,
  CheckCircle2,
  XCircle,
  Info,
  RotateCcw,
  Play,
  Download,
  Sparkles,
  X,
  UploadCloud,
  MoveUp,
  MoveDown,
} from "lucide-react";
import {
  TabbedBlockData,
  SkillsCheckData,
  PracticeQuestionData,
  LabCardData,
  QuizIntroData,
  QuizQuestion,
  QuizQuestionType,
  QuizOption,
  MatchingActivityData,
  AssignmentBlockData,
  TabbedItem,
  SkillsCheckOption,
  PracticeOption,
  MatchPair,
  MatchOption,
} from "@/data/bimDocCurriculum";

// =========================================================================
// 1. VISUAL TABBED CARDS EDITOR (Matches NetAcad Screenshot 1)
// =========================================================================
export function VisualTabbedCardsEditor({
  data,
  onChange,
  onRemove,
}: {
  data: TabbedBlockData;
  onChange: (updater: (prev: TabbedBlockData) => TabbedBlockData) => void;
  onRemove: () => void;
}) {
  const [activeTabId, setActiveTabId] = useState<string>(data.tabs[0]?.id || "");
  const activeTab = data.tabs.find((t) => t.id === activeTabId) || data.tabs[0];

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const nextNum = data.tabs.length + 1;
    onChange((prev) => ({
      ...prev,
      tabs: [
        ...prev.tabs,
        {
          id: newId,
          title: `Konsep ${String.fromCharCode(64 + nextNum)}`,
          content: "Tuliskan penjelasan detail konsep ini di sini...",
          points: ["Poin penting implementasi", "Standar kerja"],
        },
      ],
    }));
    setActiveTabId(newId);
  };

  const handleRemoveTab = (tabId: string) => {
    if (data.tabs.length <= 1) {
      alert("Minimal harus ada 1 tab.");
      return;
    }
    const remaining = data.tabs.filter((t) => t.id !== tabId);
    onChange((prev) => ({ ...prev, tabs: remaining }));
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0]?.id || "");
    }
  };

  const handleAddPoint = () => {
    if (!activeTab) return;
    const points = activeTab.points || [];
    onChange((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === activeTab.id ? { ...t, points: [...points, "Poin baru"] } : t
      ),
    }));
  };

  const handleRemovePoint = (index: number) => {
    if (!activeTab || !activeTab.points) return;
    const newPoints = activeTab.points.filter((_, idx) => idx !== index);
    onChange((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === activeTab.id ? { ...t, points: newPoints } : t)),
    }));
  };

  return (
    <div className="rounded-2xl border-2 border-[#00BCEB]/40 bg-white dark:bg-[#161B22] p-5 shadow-sm space-y-4 font-sans relative">
      {/* Top Banner Control */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#E0F7FE] dark:bg-[#0369A1]/20 text-[#00BCEB]">
            <LayoutGrid className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Tabbed Concept Cards (Mode Visual Interaktif)
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            • Klik teks untuk mengedit langsung
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* Header Text Input (Styled like big title) */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
          Judul Header Topik:
        </label>
        <input
          type="text"
          value={data.header || ""}
          onChange={(e) => onChange((prev) => ({ ...prev, header: e.target.value }))}
          placeholder="Contoh: 1.1.4 Threat Actors"
          className="w-full text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:border-[#00BCEB] focus:outline-none pb-1"
        />
      </div>

      {/* Intro Text Input */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
          Kalimat Pengantar:
        </label>
        <textarea
          rows={2}
          value={data.intro || ""}
          onChange={(e) => onChange((prev) => ({ ...prev, intro: e.target.value }))}
          placeholder="Before you can understand how an ethical hacker... Select each for more information."
          className="w-full text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-transparent border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-2.5 focus:border-[#00BCEB] focus:outline-none"
        />
      </div>

      {/* The Actual Real NetAcad Tabs Row */}
      <div className="pt-2">
        <div className="flex flex-wrap items-end gap-1.5 sm:gap-2 border-b-2 border-[#00BCEB] dark:border-[#38BDF8]">
          {data.tabs.map((tab) => {
            const isActive = tab.id === (activeTab?.id || data.tabs[0]?.id);
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group px-3 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t-2 border-x-2 cursor-pointer relative -mb-[2px] flex items-center gap-2 ${
                  isActive
                    ? "bg-[#E0F7FE] dark:bg-[#0369A1]/30 border-[#00BCEB] dark:border-[#38BDF8] text-gray-950 dark:text-white shadow-xs z-10 font-extrabold"
                    : "bg-white dark:bg-[#161B22] border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <input
                  type="text"
                  value={tab.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      tabs: prev.tabs.map((t) => (t.id === tab.id ? { ...t, title: newTitle } : t)),
                    }));
                  }}
                  className="bg-transparent border-none p-0 focus:outline-none font-bold min-w-[80px] max-w-[140px] text-center"
                  placeholder="Nama Tab"
                  onClick={(e) => e.stopPropagation()}
                />
                {data.tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTab(tab.id);
                    }}
                    className="opacity-40 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-0.5"
                    title="Hapus tab ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddTab}
            className="px-3 py-1.5 mb-1 rounded-lg bg-gray-100 hover:bg-[#00BCEB]/10 hover:text-[#00BCEB] dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Tambah Tab Baru"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Tab</span>
          </button>
        </div>

        {/* Connected Active Box (Identical to NetAcad content pane) */}
        {activeTab && (
          <div className="p-5 sm:p-6 rounded-b-2xl border-2 border-t-0 border-[#00BCEB] dark:border-[#38BDF8] bg-white dark:bg-[#161B22] shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00BCEB] uppercase">
                Konten Aktif untuk Tab: "{activeTab.title}"
              </span>
            </div>

            {/* Content Textarea */}
            <textarea
              rows={3}
              value={activeTab.content}
              onChange={(e) => {
                const newContent = e.target.value;
                onChange((prev) => ({
                  ...prev,
                  tabs: prev.tabs.map((t) => (t.id === activeTab.id ? { ...t, content: newContent } : t)),
                }));
              }}
              placeholder="Tuliskan isi paragraf yang akan muncul saat tab ini diklik oleh siswa..."
              className="w-full text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-gray-50/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#00BCEB]"
            />

            {/* Bullet Points */}
            <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                  Poin-Poin Penting Bullet (Opsional):
                </span>
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="text-xs font-bold text-[#00BCEB] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Poin</span>
                </button>
              </div>

              {activeTab.points?.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[#00BCEB] font-bold text-base">•</span>
                  <input
                    type="text"
                    value={pt}
                    onChange={(e) => {
                      const newPt = e.target.value;
                      onChange((prev) => ({
                        ...prev,
                        tabs: prev.tabs.map((t) =>
                          t.id === activeTab.id
                            ? {
                                ...t,
                                points: t.points?.map((p, pIdx) => (pIdx === idx ? newPt : p)),
                              }
                            : t
                        ),
                      }));
                    }}
                    className="flex-1 text-xs text-gray-800 dark:text-zinc-200 bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#00BCEB]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(idx)}
                    className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 2. VISUAL SKILLS CHECK EDITOR (Matches NetAcad Screenshot 2)
// =========================================================================
export function VisualSkillsCheckEditor({
  data,
  onChange,
  onRemove,
}: {
  data: SkillsCheckData;
  onChange: (updater: (prev: SkillsCheckData) => SkillsCheckData) => void;
  onRemove: () => void;
}) {
  const handleAddOption = () => {
    const newId = `opt-${Date.now()}`;
    onChange((prev) => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "Pilihan opsi baru", isCorrect: false }],
    }));
  };

  const handleRemoveOption = (id: string) => {
    if (data.options.length <= 1) {
      alert("Minimal harus ada 1 opsi.");
      return;
    }
    onChange((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== id),
    }));
  };

  const handleToggleCorrect = (id: string) => {
    onChange((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)),
    }));
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-[#161B22] p-5 shadow-sm space-y-4 font-sans relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
            <CheckSquare className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Skills Check Card List (Mode Visual)
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* Subtitle Input */}
      <input
        type="text"
        value={data.subtitle || ""}
        onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
        placeholder="Please answer the following questions after you have completed the lesson."
        className="w-full text-xs text-gray-500 dark:text-zinc-400 font-medium bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 pb-1"
      />

      {/* Title Input */}
      <input
        type="text"
        value={data.title || "Skills Check"}
        onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Skills Check"
        className="w-full text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 pb-1"
      />

      {/* Question & Instruction */}
      <div className="space-y-1">
        <textarea
          rows={2}
          value={data.question}
          onChange={(e) => onChange((prev) => ({ ...prev, question: e.target.value }))}
          placeholder="Tuliskan pertanyaan evaluasi kompetensi siswa..."
          className="w-full text-sm font-semibold text-gray-900 dark:text-zinc-100 bg-gray-50/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          value={data.instruction || "(Choose all that apply.)"}
          onChange={(e) => onChange((prev) => ({ ...prev, instruction: e.target.value }))}
          placeholder="(Choose all that apply.)"
          className="w-full text-xs text-gray-500 dark:text-zinc-400 bg-transparent border-none p-0 focus:outline-none"
        />
      </div>

      {/* Actual Visual Option Cards */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Daftar Pilihan Opsi & Pengaturan Kunci Jawaban:</span>
          <span>Centang kotak untuk menandai kunci jawaban benar</span>
        </div>

        {data.options.map((opt) => {
          const isCorrect = Boolean(opt.isCorrect);
          return (
            <div
              key={opt.id}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3.5 transition-all ${
                isCorrect
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                  : "border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Interactive Checkbox toggle for correct answer */}
                <button
                  type="button"
                  onClick={() => handleToggleCorrect(opt.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    isCorrect
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-400 dark:border-zinc-600 bg-white dark:bg-[#0D1117]"
                  }`}
                  title="Klik untuk mengubah kunci jawaban benar/salah"
                >
                  {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      options: prev.options.map((o) =>
                        o.id === opt.id ? { ...o, text: newText } : o
                      ),
                    }));
                  }}
                  placeholder="Teks pilihan jawaban..."
                  className="flex-1 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 bg-transparent border-none focus:outline-none"
                />
              </div>

              {/* Status Badge & Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleCorrect(opt.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-all ${
                    isCorrect
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {isCorrect ? "✓ Kunci Benar (Guru)" : "Pilihan Pengecoh"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt.id)}
                  className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Hapus opsi ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddOption}
          className="w-full py-2 rounded-xl border border-dashed border-gray-300 dark:border-white/15 hover:border-emerald-500 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Pilihan Jawaban</span>
        </button>
      </div>

      {/* Note for Instructor */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-emerald-600" />
        <span>
          <strong>Kunci Jawaban Aman:</strong> Tanda "Kunci Benar" hanya muncul di dashboard pengajar ini. Di modul belajar siswa, kunci jawaban tidak akan terlihat sehingga siswa harus menjawab sendiri.
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// 3. VISUAL PRACTICE QUESTION EDITOR (Matches NetAcad Screenshot 3)
// =========================================================================
export function VisualPracticeQuestionEditor({
  data,
  onChange,
  onRemove,
}: {
  data: PracticeQuestionData;
  onChange: (updater: (prev: PracticeQuestionData) => PracticeQuestionData) => void;
  onRemove: () => void;
}) {
  const handleAddOption = () => {
    const newId = `p-opt-${Date.now()}`;
    onChange((prev) => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "Opsi latihan baru", isCorrect: false }],
    }));
  };

  const handleRemoveOption = (id: string) => {
    if (data.options.length <= 1) {
      alert("Minimal harus ada 1 opsi.");
      return;
    }
    onChange((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== id),
    }));
  };

  const handleToggleCorrect = (id: string) => {
    onChange((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)),
    }));
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-500/40 bg-white dark:bg-[#161B22] p-5 shadow-sm space-y-4 font-sans relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
            <HelpCircle className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Practice Question & Feedback (Mode Visual)
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* Header Input */}
      <input
        type="text"
        value={data.header || ""}
        onChange={(e) => onChange((prev) => ({ ...prev, header: e.target.value }))}
        placeholder="Contoh: 1.2.4 Practice - Types of Penetration Tests"
        className="w-full text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-indigo-500 pb-1"
      />

      {/* Question & Instruction */}
      <div className="space-y-1">
        <textarea
          rows={2}
          value={data.question}
          onChange={(e) => onChange((prev) => ({ ...prev, question: e.target.value }))}
          placeholder="Tuliskan pertanyaan studi kasus / skenario praktikum..."
          className="w-full text-sm font-medium text-gray-800 dark:text-zinc-200 bg-gray-50/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={data.instruction || "(Choose all that apply.)"}
          onChange={(e) => onChange((prev) => ({ ...prev, instruction: e.target.value }))}
          placeholder="(Choose three.)"
          className="w-full text-xs text-gray-500 dark:text-zinc-400 bg-transparent border-none p-0 focus:outline-none"
        />
      </div>

      {/* Options List */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Opsi Pilihan & Kunci Evaluasi:</span>
          <span>Centang kotak untuk mengatur jawaban benar</span>
        </div>

        {data.options.map((opt) => {
          const isCorrect = Boolean(opt.isCorrect);
          return (
            <div
              key={opt.id}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3.5 transition-all ${
                isCorrect
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs"
                  : "border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleCorrect(opt.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    isCorrect
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-400 dark:border-zinc-600 bg-white dark:bg-[#0D1117]"
                  }`}
                  title="Klik untuk menandai kunci jawaban"
                >
                  {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      options: prev.options.map((o) =>
                        o.id === opt.id ? { ...o, text: newText } : o
                      ),
                    }));
                  }}
                  placeholder="Teks opsi pilihan..."
                  className="flex-1 text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-100 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleCorrect(opt.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-all ${
                    isCorrect
                      ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
                      : "bg-gray-200 dark:bg-white/10 text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {isCorrect ? "✓ KUNCI BENAR" : "Opsi Salah"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt.id)}
                  className="p-1 text-gray-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddOption}
          className="w-full py-2 rounded-xl border border-dashed border-gray-300 dark:border-white/15 hover:border-indigo-500 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Opsi Pertanyaan</span>
        </button>
      </div>

      {/* Buttons Bar Preview */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          disabled
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#00BCEB] text-white opacity-80 cursor-default"
        >
          Submit (Tombol Siswa)
        </button>
        <button
          type="button"
          disabled
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-xs font-bold text-gray-700 dark:text-zinc-300 opacity-80 cursor-default"
        >
          Show feedback
        </button>
      </div>

      {/* Feedback Panel (Editable in place) */}
      <div className="p-4 rounded-xl border border-blue-400 bg-blue-50/60 dark:bg-blue-950/20 text-xs sm:text-sm space-y-2">
        <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Pembahasan Materi / Feedback untuk Siswa (Editable):</span>
        </div>
        <textarea
          rows={3}
          value={data.explanation || ""}
          onChange={(e) => onChange((prev) => ({ ...prev, explanation: e.target.value }))}
          placeholder="Tuliskan penjelasan lengkap yang akan muncul setelah siswa menekan tombol Submit & Show feedback..."
          className="w-full text-xs text-blue-950 dark:text-blue-200 bg-white dark:bg-black/30 border border-blue-300 dark:border-blue-700 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notice */}
      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-indigo-600" />
        <span>
          Kunci jawaban &amp; pembahasan ini hanya terlihat oleh Anda saat menyusun silabus. Siswa di LMS harus menjawab soal terlebih dahulu sebelum melihat pembahasan ini.
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// 4. VISUAL LAB EXERCISE CARD EDITOR (Matches NetAcad Screenshot 4)
// =========================================================================
export function VisualLabCardEditor({
  data,
  onChange,
  onRemove,
}: {
  data: LabCardData;
  onChange: (updater: (prev: LabCardData) => LabCardData) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-amber-500/40 bg-white dark:bg-[#161B22] p-5 shadow-sm space-y-4 font-sans relative">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600">
            <FileText className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Lab Exercise Card (Mode Visual)
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* The Actual Lab Card Preview with Inline Editing */}
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0D1117] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-3 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white shrink-0">
            <FileText className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Judul Lab (e.g. Lab - Pemodelan Compound Wall di Revit)"
              className="w-full text-sm sm:text-base font-bold text-gray-950 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={data.description || ""}
              onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Instruksi singkat praktikum lab..."
              className="w-full text-xs text-gray-500 dark:text-zinc-400 bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <input
            type="text"
            value={data.duration || "45 Menit"}
            onChange={(e) => onChange((prev) => ({ ...prev, duration: e.target.value }))}
            placeholder="45 Menit"
            className="w-20 text-[11px] font-mono text-center text-gray-700 dark:text-zinc-300 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-1 px-1.5 focus:outline-none"
          />

          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00BCEB] text-white text-xs font-bold opacity-90 cursor-default"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Mulai Lab</span>
          </button>
        </div>
      </div>

      {/* Optional File Download Link */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
          Link Lembar Kerja / File PDF / .RVT (Opsional):
        </label>
        <input
          type="text"
          value={data.fileUrl || ""}
          onChange={(e) => onChange((prev) => ({ ...prev, fileUrl: e.target.value }))}
          placeholder="https://... atau /files/lab-guide.pdf"
          className="w-full text-xs text-gray-800 dark:text-zinc-200 bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
        />
      </div>
    </div>
  );
}

// =========================================================================
// 5. VISUAL QUIZ INTRO EDITOR (Matches NetAcad Screenshot 5)
// =========================================================================
export function VisualQuizIntroEditor({
  data,
  onChange,
  onRemove,
}: {
  data: QuizIntroData;
  onChange: (updater: (prev: QuizIntroData) => QuizIntroData) => void;
  onRemove: () => void;
}) {
  const questions = data.questions || [];

  const handleAddQuestion = (type: QuizQuestionType) => {
    const newId = `q-${Date.now()}-${questions.length + 1}`;
    let newQuestion: QuizQuestion;

    if (type === "multiple_choice") {
      newQuestion = {
        id: newId,
        type: "multiple_choice",
        prompt: "Tuliskan butir pertanyaan pilihan ganda di sini...",
        options: [
          { id: `opt-1`, text: "Opsi A", isCorrect: true },
          { id: `opt-2`, text: "Opsi B", isCorrect: false },
          { id: `opt-3`, text: "Opsi C", isCorrect: false },
          { id: `opt-4`, text: "Opsi D", isCorrect: false },
        ],
        weight: 10,
      };
    } else if (type === "essay") {
      newQuestion = {
        id: newId,
        type: "essay",
        prompt: "Tuliskan butir soal uraian/esai yang harus dijawab oleh mahasiswa...",
        sampleAnswer: "Kriteria penilaian atau kunci jawaban acuan pengajar...",
        weight: 20,
      };
    } else {
      newQuestion = {
        id: newId,
        type: "file_upload",
        prompt: "Tuliskan instruksi penugasan praktik yang file hasil kerjanya wajib diunggah oleh mahasiswa...",
        allowedFormats: ".rvt, .dwg, .pdf, .zip, .ifc",
        maxSizeMb: 50,
        sampleAnswer: "Pastikan model 3D memuat grid level terdefinisi dan penamaan elemen sesuai standar BIM.",
        weight: 30,
      };
    }

    const updated = [...questions, newQuestion];
    onChange((prev) => ({
      ...prev,
      questions: updated,
      questionsCount: updated.length,
    }));
  };

  const handleUpdateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...patch };
    onChange((prev) => ({ ...prev, questions: updated }));
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onChange((prev) => ({
      ...prev,
      questions: updated,
      questionsCount: updated.length,
    }));
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onChange((prev) => ({ ...prev, questions: updated }));
  };

  // Multiple Choice Option Helpers
  const handleAddOption = (qIndex: number) => {
    const q = questions[qIndex];
    const curOptions = q.options || [];
    const newOpt: QuizOption = {
      id: `opt-${Date.now()}-${curOptions.length + 1}`,
      text: `Opsi Baru ${curOptions.length + 1}`,
      isCorrect: curOptions.length === 0,
    };
    handleUpdateQuestion(qIndex, { options: [...curOptions, newOpt] });
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const q = questions[qIndex];
    const curOptions = [...(q.options || [])];
    curOptions[optIndex] = { ...curOptions[optIndex], text };
    handleUpdateQuestion(qIndex, { options: curOptions });
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    const curOptions = (q.options || []).map((opt, i) => ({
      ...opt,
      isCorrect: i === optIndex,
    }));
    handleUpdateQuestion(qIndex, { options: curOptions });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    const curOptions = (q.options || []).filter((_, i) => i !== optIndex);
    handleUpdateQuestion(qIndex, { options: curOptions });
  };

  const mcCount = questions.filter((q) => q.type === "multiple_choice").length;
  const essayCount = questions.filter((q) => q.type === "essay").length;
  const uploadCount = questions.filter((q) => q.type === "file_upload").length;

  return (
    <div className="rounded-2xl border-2 border-purple-500/40 bg-white dark:bg-[#161B22] p-5 shadow-sm space-y-6 font-sans relative">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600">
            <Award className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Quiz Assessment &amp; Evaluasi (Mode Visual)
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* Centered Title Input */}
      <div className="space-y-1 text-center">
        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">
          Judul Ujian / Kuis:
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Quiz - Pengenalan Ekosistem BIM"
          className="w-full text-xl sm:text-2xl font-light text-center text-gray-800 dark:text-zinc-100 tracking-tight bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-purple-500 pb-1"
        />
      </div>

      {/* Authentic Gray Instructions Box with Green (i) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#EBEBEB] dark:bg-[#1C2128] border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
          <div className="w-5 h-5 rounded-full bg-[#5CB85C] text-white flex items-center justify-center text-xs font-bold shrink-0">
            i
          </div>
          <span>Instructions (Aturan &amp; Ketentuan Kuis):</span>
        </div>

        <div className="pl-7 space-y-2 text-xs sm:text-sm text-gray-700 dark:text-zinc-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span>The exam consists of</span>
            <input
              type="number"
              value={data.questionsCount || questions.length || 15}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, questionsCount: Number(e.target.value) }))
              }
              className="w-16 px-2 py-0.5 rounded bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-center font-bold"
            />
            <span>questions and</span>
            <input
              type="number"
              value={data.passRatePercent || 75}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, passRatePercent: Number(e.target.value) }))
              }
              className="w-16 px-2 py-0.5 rounded bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 text-center font-bold"
            />
            <span>% is required to pass.</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span>You have</span>
            <input
              type="text"
              value={data.attempts || "unlimited attempts"}
              onChange={(e) => onChange((prev) => ({ ...prev, attempts: e.target.value }))}
              className="w-40 px-2 py-0.5 rounded bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 font-bold"
            />
            <span>to pass the exam.</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span>You have</span>
            <input
              type="text"
              value={data.timeLimit || "no time limit"}
              onChange={(e) => onChange((prev) => ({ ...prev, timeLimit: e.target.value }))}
              className="w-36 px-2 py-0.5 rounded bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 font-bold"
            />
            <span>per attempt to pass the exam.</span>
          </div>
        </div>
      </div>

      {/* QUESTION BUILDER SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <h3 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-500" />
              <span>Butir Soal &amp; Penugasan ({questions.length})</span>
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-gray-500 dark:text-zinc-400">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                {mcCount} Pilihan Ganda (Auto)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                {essayCount} Uraian
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                {uploadCount} Upload File
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleAddQuestion("multiple_choice")}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Pilihan Ganda</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddQuestion("essay")}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Uraian (Esai)</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddQuestion("file_upload")}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Upload Berkas</span>
            </button>
          </div>
        </div>

        {/* Empty state */}
        {questions.length === 0 && (
          <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
              Belum ada butir soal yang dibuat untuk kuis ini.
            </p>
            <p className="text-[11px] text-gray-500 max-w-md mx-auto">
              Gunakan tombol di atas untuk menambahkan butir soal pilihan ganda (dinilai otomatis oleh sistem), esai uraian, atau tugas upload berkas praktik.
            </p>
          </div>
        )}

        {/* Question Cards List */}
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={q.id || qIdx}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                q.type === "multiple_choice"
                  ? "bg-blue-50/30 dark:bg-blue-950/10 border-blue-500/30"
                  : q.type === "essay"
                  ? "bg-amber-50/30 dark:bg-amber-950/10 border-amber-500/30"
                  : "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-500/30"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white font-mono font-black text-xs flex items-center justify-center">
                    {qIdx + 1}
                  </span>

                  <select
                    value={q.type}
                    onChange={(e) =>
                      handleUpdateQuestion(qIdx, {
                        type: e.target.value as QuizQuestionType,
                        options:
                          e.target.value === "multiple_choice" && !q.options
                            ? [
                                { id: "opt-1", text: "Opsi A", isCorrect: true },
                                { id: "opt-2", text: "Opsi B", isCorrect: false },
                              ]
                            : q.options,
                      })
                    }
                    className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="multiple_choice">Pilihan Ganda (Sistem Auto-Grade)</option>
                    <option value="essay">Uraian / Esai (Manual Review)</option>
                    <option value="file_upload">Upload Berkas / Praktik (Manual Review)</option>
                  </select>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
                    <span>Bobot:</span>
                    <input
                      type="number"
                      value={q.weight ?? 10}
                      onChange={(e) =>
                        handleUpdateQuestion(qIdx, { weight: Number(e.target.value) })
                      }
                      className="w-12 px-1.5 py-0.5 rounded bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 text-center font-bold"
                    />
                    <span>poin</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={qIdx === 0}
                    onClick={() => handleMoveQuestion(qIdx, "up")}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Geser ke atas"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={qIdx === questions.length - 1}
                    onClick={() => handleMoveQuestion(qIdx, "down")}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Geser ke bawah"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                    title="Hapus soal ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Prompt Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-gray-500 dark:text-zinc-400">
                  Pertanyaan / Instruksi Soal:
                </label>
                <textarea
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => handleUpdateQuestion(qIdx, { prompt: e.target.value })}
                  placeholder="Tuliskan butir soal atau instruksi tugas di sini..."
                  className="w-full text-xs text-gray-900 dark:text-white bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* TYPE: MULTIPLE CHOICE */}
              {q.type === "multiple_choice" && (
                <div className="p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Kunci Jawaban &amp; Opsi Pilihan (Tandai lingkaran hijau pada jawaban yang benar):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Opsi</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(q.options || []).map((opt, optIdx) => (
                      <div
                        key={opt.id || optIdx}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                          opt.isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
                            : "bg-white dark:bg-[#161B22] border-black/5 dark:border-white/5"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-gray-400 hover:border-emerald-400 bg-transparent"
                          }`}
                          title={opt.isCorrect ? "Kunci Jawaban Benar" : "Jadikan Kunci Jawaban Benar"}
                        >
                          {opt.isCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Teks Opsi ${String.fromCharCode(65 + optIdx)}...`}
                          className="flex-1 text-xs bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white"
                        />

                        {opt.isCorrect && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            BENAR
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={(q.options || []).length <= 2}
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                          className="p-1 text-gray-400 hover:text-rose-500 disabled:opacity-20 cursor-pointer"
                          title="Hapus opsi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE: ESSAY */}
              {q.type === "essay" && (
                <div className="p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-amber-500/20 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Kunci Jawaban / Kriteria Penilaian Acuan Pengajar (Opsional):</span>
                  </div>
                  <textarea
                    rows={2}
                    value={q.sampleAnswer || ""}
                    onChange={(e) => handleUpdateQuestion(qIdx, { sampleAnswer: e.target.value })}
                    placeholder="Contoh poin penting jawaban siswa yang harus ada: definisi Family, parameter Instance vs Type..."
                    className="w-full text-xs text-gray-900 dark:text-white bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-gray-500 italic">
                    * Catatan ini hanya terlihat oleh Superadmin &amp; Pengajar saat membuka lembar koreksi tugas siswa.
                  </p>
                </div>
              )}

              {/* TYPE: FILE UPLOAD */}
              {q.type === "file_upload" && (
                <div className="p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-emerald-500/20 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-gray-500 dark:text-zinc-400">
                        Format File Yang Diizinkan:
                      </label>
                      <input
                        type="text"
                        value={q.allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc"}
                        onChange={(e) => handleUpdateQuestion(qIdx, { allowedFormats: e.target.value })}
                        placeholder=".rvt, .dwg, .pdf, .zip"
                        className="w-full text-xs text-gray-900 dark:text-white bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-gray-500 dark:text-zinc-400">
                        Batas Ukuran File Maksimum:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={q.maxSizeMb ?? 50}
                          onChange={(e) => handleUpdateQuestion(qIdx, { maxSizeMb: Number(e.target.value) })}
                          className="w-24 text-xs text-gray-900 dark:text-white bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        />
                        <span className="text-xs font-bold text-gray-500">MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-gray-500 dark:text-zinc-400">
                      Instruksi Kelulusan Berkas &amp; Acuan Penilai:
                    </label>
                    <textarea
                      rows={2}
                      value={q.sampleAnswer || ""}
                      onChange={(e) => handleUpdateQuestion(qIdx, { sampleAnswer: e.target.value })}
                      placeholder="Contoh: Pastikan elevasi level 1 & 2 terkunci, penamaan file: TUGAS1_[NAMA]..."
                      className="w-full text-xs text-gray-900 dark:text-white bg-white dark:bg-[#161B22] border border-black/10 dark:border-white/10 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Centered Green Pill Button Preview */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled
          className="px-10 py-3 rounded-full bg-[#5CB85C] text-white font-bold text-sm tracking-wide shadow-md opacity-90 cursor-default"
        >
          Start (Tombol Mulai Siswa)
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 6. VISUAL MATCHING PAIRS EDITOR (Matches NetAcad Screenshot 6)
// =========================================================================
export function VisualMatchingEditor({
  data,
  onChange,
  onRemove,
}: {
  data: MatchingActivityData;
  onChange: (updater: (prev: MatchingActivityData) => MatchingActivityData) => void;
  onRemove: () => void;
}) {
  const handleAddCategory = () => {
    const nextIdx = data.categories.length + 1;
    const badge = String.fromCharCode(64 + nextIdx); // "A", "B", "C"...
    const newCatId = `cat-${Date.now()}`;
    const defaultOptId = data.options[0]?.id || "";

    onChange((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: newCatId,
          category: `Kategori Baru ${badge}`,
          badge,
          correctOptionId: defaultOptId,
        },
      ],
    }));
  };

  const handleRemoveCategory = (catId: string) => {
    if (data.categories.length <= 1) {
      alert("Minimal harus ada 1 kategori.");
      return;
    }
    onChange((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId),
    }));
  };

  const handleAddOption = () => {
    const newOptId = `opt-m-${Date.now()}`;
    onChange((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: newOptId,
          text: "Deskripsi pilihan aktivitas yang sesuai...",
        },
      ],
    }));
  };

  const handleRemoveOption = (optId: string) => {
    if (data.options.length <= 1) {
      alert("Minimal harus ada 1 opsi.");
      return;
    }
    onChange((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== optId),
    }));
  };

  return (
    <div className="rounded-2xl border-2 border-teal-500/40 bg-white dark:bg-[#161B22] p-5 shadow-sm space-y-4 font-sans relative">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600">
            <Shuffle className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Matching Activity (Pasangkan 2 Kolom - Mode Visual)
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* Header & Instruction */}
      <input
        type="text"
        value={data.header || ""}
        onChange={(e) => onChange((prev) => ({ ...prev, header: e.target.value }))}
        placeholder="Contoh: 2.3.2 Practice - Pasangkan Dimensi BIM"
        className="w-full text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight bg-transparent border-b border-dashed border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-teal-500 pb-1"
      />

      <input
        type="text"
        value={data.instruction || ""}
        onChange={(e) => onChange((prev) => ({ ...prev, instruction: e.target.value }))}
        placeholder="Instruksi: Pasangkan setiap kategori di kolom kiri dengan opsi yang sesuai di kolom kanan."
        className="w-full text-xs text-gray-600 dark:text-zinc-300 bg-transparent border-none p-0 focus:outline-none"
      />

      {/* 2-Column Visual Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Left Column: Categories + Correct Pairing Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Kolom 1: Categories (Kategori)
            </h4>
            <button
              type="button"
              onClick={handleAddCategory}
              className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Kategori</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#00BCEB] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {cat.badge || String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={cat.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      onChange((prev) => ({
                        ...prev,
                        categories: prev.categories.map((c) =>
                          c.id === cat.id ? { ...c, category: newCat } : c
                        ),
                      }));
                    }}
                    placeholder="Nama Kategori (e.g. Level 2 BIM)"
                    className="flex-1 text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 bg-transparent border-none focus:outline-none"
                  />
                  {data.categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Pairing Key Selector */}
                <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    ✓ Kunci Pasangan:
                  </span>
                  <select
                    value={cat.correctOptionId}
                    onChange={(e) => {
                      const optId = e.target.value;
                      onChange((prev) => ({
                        ...prev,
                        categories: prev.categories.map((c) =>
                          c.id === cat.id ? { ...c, correctOptionId: optId } : c
                        ),
                      }));
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-[#0D1117] border border-emerald-500/30 text-[11px] font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none"
                  >
                    {data.options.map((opt, oIdx) => (
                      <option key={opt.id} value={opt.id}>
                        Opsi #{oIdx + 1}: {opt.text.slice(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Kolom 2: Options (Pilihan Jawaban)
            </h4>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Opsi</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.options.map((opt, idx) => (
              <div
                key={opt.id}
                className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 flex items-start gap-2.5"
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-zinc-500 shrink-0 mt-1" />
                <textarea
                  rows={2}
                  value={opt.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    onChange((prev) => ({
                      ...prev,
                      options: prev.options.map((o) =>
                        o.id === opt.id ? { ...o, text: newText } : o
                      ),
                    }));
                  }}
                  placeholder="Deskripsi opsi / aktivitas..."
                  className="flex-1 text-xs text-gray-800 dark:text-zinc-200 bg-transparent border-none focus:outline-none resize-none"
                />
                {data.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt.id)}
                    className="text-gray-400 hover:text-rose-500 cursor-pointer p-0.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Buttons Bar */}
      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-3">
        <button
          type="button"
          disabled
          className="px-5 py-2 rounded-xl bg-[#00BCEB] text-white text-xs font-bold opacity-80 cursor-default"
        >
          Check Answers (Tombol Siswa)
        </button>
        <span className="text-xs font-bold text-gray-500">Score: ? / {data.categories.length}</span>
        <button
          type="button"
          disabled
          className="p-2 rounded-xl text-gray-400 opacity-80 cursor-default ml-auto"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-teal-600" />
        <span>
          Di modul siswa, kolom opsi akan otomatis diacak urutannya. Siswa harus mengklik kategori lalu mengklik opsi untuk memasangkan, dan kunci pasangan yang Anda tentukan di atas akan digunakan sistem untuk menghitung skor kelulusan secara otomatis.
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// 7. VISUAL ASSIGNMENT SUBMISSION BLOCK EDITOR (Pengumpulan Tugas Siswa)
// =========================================================================
export function VisualAssignmentBlockEditor({
  data,
  onChange,
  onRemove,
}: {
  data: AssignmentBlockData;
  onChange: (updater: (prev: AssignmentBlockData) => AssignmentBlockData) => void;
  onRemove: () => void;
}) {
  const [newRubricPoint, setNewRubricPoint] = useState("");

  const handleAddRubric = () => {
    if (!newRubricPoint.trim()) return;
    onChange((prev) => ({
      ...prev,
      rubric: [...(prev.rubric || []), newRubricPoint.trim()],
    }));
    setNewRubricPoint("");
  };

  const handleRemoveRubric = (index: number) => {
    onChange((prev) => ({
      ...prev,
      rubric: (prev.rubric || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161B22] border-2 border-rose-500/30 dark:border-rose-500/30 space-y-5 shadow-sm">
      {/* Block Header */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Pengumpulan Tugas Siswa (Mode Visual Interaktif)
            </h4>
            <p className="text-[11px] text-gray-500">
              Siswa dapat mengunggah file tugas langsung di halaman topik ini
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Blok</span>
        </button>
      </div>

      {/* Title & Instructions Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">
            Judul Tugas / Proyek:
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Contoh: Tugas Mandiri: Pemodelan Grid & Level Revit LOD 300"
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">
            Petunjuk & Ketentuan Pengerjaan:
          </label>
          <textarea
            rows={3}
            value={data.instruction || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, instruction: e.target.value }))
            }
            placeholder="Tuliskan instruksi apa yang harus dikerjakan siswa, parameter apa yang dinilai, serta instruksi penamaan file..."
            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-rose-500 leading-relaxed"
          />
        </div>

        {/* Formats & Max Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">
              Format File yang Diizinkan:
            </label>
            <input
              type="text"
              value={data.allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc"}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, allowedFormats: e.target.value }))
              }
              placeholder=".rvt, .dwg, .pdf, .zip, .ifc"
              className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1">
              Batas Maksimal Ukuran File (MB):
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={data.maxSizeMb || 50}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  maxSizeMb: Number(e.target.value) || 50,
                }))
              }
              className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Rubric Points (Optional) */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase text-gray-500 mb-1.5">
            Kriteria Penilaian / Poin Evaluasi (Opsional):
          </label>
          <div className="space-y-2 mb-2">
            {(data.rubric || []).map((point, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-black/5 dark:border-white/5 text-xs text-gray-800 dark:text-zinc-200"
              >
                <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="flex-1">{point}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRubric(idx)}
                  className="text-gray-400 hover:text-rose-500 cursor-pointer p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newRubricPoint}
              onChange={(e) => setNewRubricPoint(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddRubric();
                }
              }}
              placeholder="Tambah kriteria penilaian (misal: Grid berjarak 6 meter presisi)..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddRubric}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Pratinjau Tampilan di Siswa:</span>
        </div>
        <p className="text-gray-700 dark:text-zinc-300">
          Siswa akan melihat kotak upload tugas lengkap dengan tombol browse file, indikator progres upload, dan kotak catatan untuk instruktur. Tugas yang diunggah akan otomatis tercatat di dashboard Pengajar &amp; Superadmin.
        </p>
      </div>
    </div>
  );
}

