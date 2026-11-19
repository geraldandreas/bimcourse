"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Clock, BookOpen, Star, Users, CheckCircle, ChevronDown, ChevronUp, ShieldCheck, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Course } from "@/data/courses";

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onEnroll: (course: Course) => void;
}

export default function CourseDetailModal({ course, onClose, onEnroll }: CourseDetailModalProps) {
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!course) return null;

  const toggleModule = (idx: number) => {
    setOpenModuleIndex(openModuleIndex === idx ? null : idx);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-zinc-900 text-gray-950 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/10 my-auto max-h-[90vh] flex flex-col transition-colors">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            {course.badge && (
              <span className="px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider">
                {course.badge}
              </span>
            )}
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
              Level: {course.level}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Main Info */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950 dark:text-white mb-3">
              {course.title}
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
              {course.summary}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs md:text-sm text-gray-600 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-semibold text-black dark:text-white">
                <Star className="w-4 h-4 fill-black text-black dark:fill-white dark:text-white" />
                {course.rating} ({course.reviewsCount} review)
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                {course.studentsCount.toLocaleString("id-ID")} peserta terdaftar
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                {course.durationHours} Jam Materi Video
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                {course.modulesCount} Modul & Capstone Project
              </span>
            </div>

            {/* Software badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Software:</span>
              {course.software.map((sw) => (
                <span
                  key={sw}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium border border-transparent dark:border-white/10"
                >
                  {sw}
                </span>
              ))}
            </div>
          </div>

          {/* Video Preview Player Dummy */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group border border-zinc-200 dark:border-white/10">
            {!isPlayingVideo ? (
              <>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                    <div>
                      <p className="text-white text-sm font-semibold">Tonton Video Cuplikan Silabus (3:45)</p>
                      <p className="text-gray-300 text-xs">Simulasi studi kasus nyata, software setup & preview file latihan</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 animate-pulse">
                  <Play className="w-7 h-7 text-white fill-white" />
                </div>
                <p className="text-sm font-semibold mb-1">Preview Video Interaktif BIMCourse</p>
                <p className="text-xs text-gray-400 max-w-md mb-4">
                  Player video streaming resolusi 1080p dengan kecepatan 0.5x - 2.0x, subtitle Bahasa Indonesia & shortcut navigasi keyboard.
                </p>
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="text-xs text-gray-400 underline hover:text-white cursor-pointer"
                >
                  Kembali ke thumbnail
                </button>
              </div>
            )}
          </div>

          {/* Key Learnings */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-6 border border-zinc-200 dark:border-white/10">
            <h3 className="text-base font-bold text-gray-950 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-black dark:text-white" />
              Yang Akan Anda Kuasai di Kelas Ini:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
              {course.keyLearnings.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-3">
              Silabus & Struktur Kurikulum ({course.curriculum.length} Modul Terstruktur)
            </h3>
            <div className="space-y-3">
              {course.curriculum.map((mod, idx) => {
                const isOpen = openModuleIndex === idx;
                return (
                  <div
                    key={mod.title}
                    className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-950"
                  >
                    <button
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs flex items-center justify-center">
                          0{idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">{mod.duration}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 border-t border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-zinc-900/40 space-y-2">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-center justify-between text-xs text-gray-700 dark:text-zinc-300 py-1.5 border-b border-black/[0.03] dark:border-white/5 last:border-0"
                          >
                            <span className="flex items-center gap-2">
                              <Play className="w-3 h-3 text-zinc-600 dark:text-zinc-400 shrink-0" />
                              {lesson}
                            </span>
                            <span className="text-gray-400 dark:text-zinc-500 font-mono">Video + File Latihan</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor Profile */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-zinc-800 shrink-0 shadow-sm"
            />
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-400 font-bold">Instruktur Praktisi</p>
              <h4 className="text-lg font-bold text-gray-950 dark:text-white">{course.instructor.name}</h4>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{course.instructor.role}</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">{course.instructor.company}</p>
            </div>
          </div>
        </div>

        {/* Footer Checkout Bar */}
        <div className="p-6 bg-white dark:bg-zinc-950 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-950 dark:text-white">
                {formatPrice(course.price)}
              </span>
              <span className="text-sm text-gray-400 dark:text-zinc-500 line-through">
                {formatPrice(course.originalPrice)}
              </span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 px-2 py-0.5 rounded">
                Hemat 60%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              Akses Selamanya • Sertifikat Terverifikasi • Grup Diskusi Khusus
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/courses/${course.slug}`}
              className="px-4 py-3 rounded-full border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-zinc-800 text-xs md:text-sm font-semibold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              Halaman Detail Kursus
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-white/15 text-xs md:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex-1 sm:flex-initial cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => onEnroll(course)}
              className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs md:text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 flex-1 sm:flex-initial cursor-pointer"
            >
              Daftar Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
