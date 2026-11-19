"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  FileText,
  UploadCloud,
  Download,
  Award,
  CheckSquare,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export interface ParsedQuizAnswer {
  questionId: string;
  type: "multiple_choice" | "essay" | "file_upload";
  prompt: string;
  weight?: number;
  sampleAnswer?: string;
  studentAnswer?: string;
  isCorrect?: boolean;
  correctOptionId?: string;
  correctOptionText?: string;
  studentOptionText?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ParsedQuizData {
  type: "quiz";
  quizTitle: string;
  mcScore?: number;
  totalMC?: number;
  correctMC?: number;
  hasManualReview?: boolean;
  totalQuestions?: number;
  passRatePercent?: number;
  answers: ParsedQuizAnswer[];
}

export function parseQuizNotes(notes?: string | null): ParsedQuizData | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith('{"type":"quiz"')) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && parsed.type === "quiz" && Array.isArray(parsed.answers)) {
      return parsed as ParsedQuizData;
    }
  } catch {}
  return null;
}

export function QuizSubmissionReviewSheet({ data }: { data: ParsedQuizData }) {
  return (
    <div className="space-y-4">
      {/* Quiz Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {data.quizTitle || "Lembar Kuis & Evaluasi"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30">
              Auto-Grade PG: {data.mcScore ?? 0}% ({data.correctMC ?? 0}/{data.totalMC ?? 0} Benar)
            </span>
            {data.hasManualReview && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                Memerlukan Koreksi Pengajar
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Answers List */}
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {data.answers.map((ans, idx) => (
          <div
            key={ans.questionId || idx}
            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-2 text-xs"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white font-mono font-bold text-[11px] flex items-center justify-center">
                  {idx + 1}
                </span>

                {ans.type === "multiple_choice" && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    <span>Pilihan Ganda</span>
                  </span>
                )}

                {ans.type === "essay" && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Uraian / Esai</span>
                  </span>
                )}

                {ans.type === "file_upload" && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Berkas</span>
                  </span>
                )}
              </div>

              {ans.type === "multiple_choice" && (
                ans.isCorrect ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Benar (Auto)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1 font-mono">
                    <XCircle className="w-3 h-3" /> Salah (Auto)
                  </span>
                )
              )}
            </div>

            {/* Prompt */}
            <p className="font-semibold text-gray-900 dark:text-white">
              {ans.prompt}
            </p>

            {/* MULTIPLE CHOICE DETAILS */}
            {ans.type === "multiple_choice" && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Pilihan Siswa:</span>
                  <span
                    className={`font-bold ${
                      ans.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {ans.studentOptionText || ans.studentAnswer || "(Kosong)"}
                  </span>
                </div>
                {!ans.isCorrect && ans.correctOptionText && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Kunci Benar:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {ans.correctOptionText}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ESSAY DETAILS */}
            {ans.type === "essay" && (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-black/20 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 block font-bold">
                    Jawaban Tertulis Siswa:
                  </span>
                  <p className="text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {ans.studentAnswer || "(Tidak ada jawaban tertulis)"}
                  </p>
                </div>
                {ans.sampleAnswer && (
                  <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] text-gray-600 dark:text-zinc-400">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                      Kriteria Acuan Pengajar:
                    </span>
                    <span>{ans.sampleAnswer}</span>
                  </div>
                )}
              </div>
            )}

            {/* FILE UPLOAD DETAILS */}
            {ans.type === "file_upload" && (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-black/20 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 block font-bold">
                      Berkas Hasil Pengerjaan Siswa:
                    </span>
                    <p className="font-mono text-gray-800 dark:text-zinc-200">
                      {ans.fileName || "File Model Siswa"}
                    </p>
                  </div>

                  {ans.fileUrl ? (
                    <a
                      href={ans.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh File</span>
                    </a>
                  ) : (
                    <span className="text-rose-500 text-xs italic">Siswa belum mengunggah file.</span>
                  )}
                </div>

                {ans.sampleAnswer && (
                  <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-gray-600 dark:text-zinc-400">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      Instruksi Kelulusan Berkas:
                    </span>
                    <span>{ans.sampleAnswer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
