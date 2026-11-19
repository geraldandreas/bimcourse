"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import { AssignmentBlockData } from "@/data/bimDocCurriculum";

interface SubmissionItem {
  id: string;
  courseId: string;
  title: string;
  fileUrl: string;
  notes?: string | null;
  grade?: number | null;
  feedback?: string | null;
  status: "PENDING" | "APPROVED" | "REVISION" | string;
  createdAt: string;
  updatedAt?: string;
}

interface CiscoAssignmentBlockProps {
  courseId: string;
  courseSlug?: string;
  courseTitle?: string;
  lessonId: string;
  lessonCode: string;
  data: AssignmentBlockData;
  onSubmitted?: () => void;
}

export function CiscoAssignmentBlock({
  courseId,
  courseSlug,
  courseTitle,
  lessonId,
  lessonCode,
  data,
  onSubmitted,
}: CiscoAssignmentBlockProps) {
  const [submission, setSubmission] = useState<SubmissionItem | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReupload, setShowReupload] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // File & form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentNotes, setStudentNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [showRubric, setShowRubric] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExts = (data.allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc")
    .split(",")
    .map((s) => s.trim().toLowerCase());
  const maxSizeMb = data.maxSizeMb || 50;

  // Load existing student submission for this task
  const fetchMySubmission = async () => {
    try {
      setLoadingInitial(true);
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.submissions)) {
          // Match by title or course
          const found = json.submissions.find(
            (s: SubmissionItem) =>
              s.title === data.title ||
              s.title.toLowerCase().includes(lessonCode.toLowerCase())
          );
          if (found) {
            setSubmission(found);
            if (found.notes) setStudentNotes(found.notes);
          }
        }
      }
    } catch (err) {
      console.warn("Fetch submission error:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchMySubmission();
  }, [courseId, lessonCode, data.title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > maxSizeMb) {
      alert(`Ukuran file (${sizeInMb.toFixed(1)} MB) melebihi batas maksimum ${maxSizeMb} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setStatusMsg(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > maxSizeMb) {
      alert(`Ukuran file (${sizeInMb.toFixed(1)} MB) melebihi batas maksimum ${maxSizeMb} MB.`);
      return;
    }

    setSelectedFile(file);
    setStatusMsg(null);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !submission?.fileUrl) {
      alert("Silakan pilih file tugas yang ingin diunggah.");
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    setUploadProgress("Mengunggah berkas model...");

    try {
      let finalFileUrl = submission?.fileUrl || "";

      // If new file selected, upload first via /api/upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.url) {
          throw new Error(uploadJson.error || "Gagal mengunggah berkas ke server.");
        }
        finalFileUrl = uploadJson.url;
      }

      setUploadProgress("Menyimpan pengumpulan tugas ke instruktur...");

      // Submit to /api/submissions
      const subRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId || courseSlug,
          title: data.title,
          fileUrl: finalFileUrl,
          notes: studentNotes.trim() || undefined,
          submissionId: submission?.id || undefined,
        }),
      });

      const subJson = await subRes.json();
      if (!subRes.ok || !subJson.success) {
        throw new Error(subJson.error || "Gagal menyimpan pengumpulan tugas.");
      }

      setSubmission(subJson.submission);
      setSelectedFile(null);
      setShowReupload(false);
      setStatusMsg({
        type: "success",
        text: "Tugas berhasil dikumpulkan! Pengajar dan SuperAdmin akan segera mengevaluasi hasil kerja Anda.",
      });

      onSubmitted?.();
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Terjadi kesalahan saat mengumpulkan tugas.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const getStatusBadge = (status: string, grade?: number | null) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>DISETUJUI • NILAI {grade !== null && grade !== undefined ? `${grade}/100` : "LULUS"}</span>
          </span>
        );
      case "REVISION":
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>PERLU REVISI {grade !== null && grade !== undefined ? `• NILAI ${grade}/100` : ""}</span>
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>MENUNGGU PENILAIAN PENGAJAR</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border-2 border-rose-500/40 bg-white dark:bg-[#161B22] shadow-sm hover:shadow-md transition-all overflow-hidden font-sans">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border-b border-black/5 dark:border-white/5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              Tugas Mahasiswa
            </span>
            <span className="text-xs font-mono text-gray-500 dark:text-zinc-400">
              Modul {lessonCode}
            </span>
          </div>

          {submission && getStatusBadge(submission.status, submission.grade)}
        </div>

        <h3 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white leading-snug">
          {data.title}
        </h3>

        {data.instruction && (
          <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {data.instruction}
          </p>
        )}

        {/* Info Badges (Allowed extensions, Max Size, Due Date) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-gray-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 font-semibold">
            Format Berkas: <strong className="text-rose-600 dark:text-rose-400">{data.allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc"}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-gray-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 font-semibold">
            Maks. Ukuran: <strong>{maxSizeMb} MB</strong>
          </span>
          {data.dueDate && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-semibold">
              Tenggat: <strong>{data.dueDate}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Rubric Criteria Checklist Accordion */}
      {data.rubric && data.rubric.length > 0 && (
        <div className="px-5 sm:px-6 py-3 bg-gray-50/70 dark:bg-[#0D1117]/50 border-b border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => setShowRubric(!showRubric)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Kriteria Penilaian &amp; Rubrik BEP/LOD ({data.rubric.length} Poin)</span>
            </span>
            {showRubric ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showRubric && (
            <ul className="mt-2.5 space-y-1.5 pl-1 animate-in fade-in duration-200">
              {data.rubric.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-zinc-400 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Submission Status & Feedback Display */}
      <div className="p-5 sm:p-6 space-y-5">
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-700"
                : "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-700"
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

        {/* Existing Submission Details Card */}
        {submission && !showReupload && (
          <div className="p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-[#0D1117] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/5">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  Status Pengumpulan Anda
                </span>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-0.5">
                  Dikirim pada: {new Date(submission.createdAt).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File Anda</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowReupload(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{submission.status === "REVISION" ? "Kirim Revisi Tugas" : "Ganti File"}</span>
                </button>
              </div>
            </div>

            {/* Student Note */}
            {submission.notes && (
              <div className="text-xs text-gray-700 dark:text-zinc-300 bg-white dark:bg-[#161B22] p-3 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block mb-1">
                  Catatan Anda:
                </span>
                <p className="italic">"{submission.notes}"</p>
              </div>
            )}

            {/* Instructor Evaluation & Feedback Box */}
            {(submission.feedback || submission.grade !== null && submission.grade !== undefined) && (
              <div
                className={`p-4 rounded-2xl border ${
                  submission.status === "APPROVED"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Evaluasi &amp; Nilai dari Pengajar:
                  </span>
                  {submission.grade !== null && submission.grade !== undefined && (
                    <span className="text-sm font-black font-mono px-2.5 py-0.5 rounded-lg bg-white/70 dark:bg-black/40">
                      Nilai: {submission.grade}/100
                    </span>
                  )}
                </div>

                {submission.feedback ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                    {submission.feedback}
                  </p>
                ) : (
                  <p className="text-xs italic text-gray-500">
                    Tugas telah dinilai dan memenuhi standar kelulusan.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Form (Shown if not yet submitted OR user wants to re-upload) */}
        {(!submission || showReupload) && (
          <form onSubmit={handleSubmitTask} className="space-y-4">
            {showReupload && (
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Mengunggah Berkas Revisi Baru
                </span>
                <button
                  type="button"
                  onClick={() => setShowReupload(false)}
                  className="text-xs text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                selectedFile
                  ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10"
                  : "border-black/15 dark:border-white/15 hover:border-rose-500 bg-gray-50/50 dark:bg-[#0D1117]/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    Ukuran: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap Dikirim
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Klik untuk mengganti berkas lain
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Pilih Berkas Tugas atau Tarik ke Sini
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Mendukung format: {data.allowedFormats || ".rvt, .dwg, .pdf, .zip, .ifc"} (Maks. {maxSizeMb} MB)
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-xl bg-white dark:bg-[#21262D] border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-zinc-200 shadow-2xs">
                    Jelajahi File Komputer
                  </span>
                </div>
              )}
            </div>

            {/* Student Note Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Catatan Tambahan untuk Pengajar (Opsional):</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  Jelaskan software version, family types, atau asumsi teknis
                </span>
              </label>
              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                rows={3}
                placeholder="Contoh: Model dibuat dengan Autodesk Revit 2024. Telah dilengkapi 4 tipe family pintu parametrik dan 2 section view sesuai modul..."
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-y"
              />
            </div>

            {/* Action Bar & Progress */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-500 font-mono">
                {uploadProgress && (
                  <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {uploadProgress}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!selectedFile && !submission?.fileUrl)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirimkan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{submission ? "Perbarui Pengumpulan Tugas" : "Kirim Tugas ke Pengajar"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
