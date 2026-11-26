"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Award, CheckCircle2, Search, AlertCircle, Printer, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface VerifiedCert {
  id: string;
  certificateNo: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  ceoName: string;
  ceoTitle: string;
  grade: string;
  standards: string;
  issuedDate: string;
  status: string;
}

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [query, setQuery] = useState(initialId);
  const [cert, setCert] = useState<VerifiedCert | null>(null);
  const [loading, setLoading] = useState(Boolean(initialId));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performLookup = async (idToFind: string) => {
    const clean = idToFind.trim();
    if (!clean) return;
    setLoading(true);
    setErrorMsg(null);
    setCert(null);
    try {
      const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(clean)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.certificate) {
        setErrorMsg(data.error || "Sertifikat tidak ditemukan atau belum diterbitkan.");
      } else {
        setCert(data.certificate);
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server verifikasi sertifikat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      performLookup(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#09090B] text-gray-900 dark:text-white">
      <Navbar solidBg />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              Verifikasi Sertifikat Resmi BIMCourse
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1">
              Masukkan Nomor Sertifikat (Credential ID) untuk memvalidasi keaslian sertifikat lulusan BIMCourse Academy.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Contoh: BC-2026-123456"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 text-sm font-mono text-gray-950 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? "Memverifikasi..." : "Cek Keaslian"}
          </button>
        </form>

        {/* Loading Skeleton */}
        {loading && (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#14171E] border border-gray-200 dark:border-white/10 space-y-6 animate-pulse">
            <div className="h-6 w-48 rounded-full bg-gray-200 dark:bg-white/10 mx-auto" />
            <div className="h-10 w-72 rounded-xl bg-gray-200 dark:bg-white/10 mx-auto" />
            <div className="h-4 w-full max-w-md rounded bg-gray-100 dark:bg-white/5 mx-auto" />
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="h-14 rounded-xl bg-gray-100 dark:bg-white/5" />
              <div className="h-14 rounded-xl bg-gray-100 dark:bg-white/5" />
              <div className="h-14 rounded-xl bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMsg && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Sertifikat Tidak Ditemukan</p>
              <p className="text-xs opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Verified Paper Display */}
        {!loading && cert && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>TERVERIFIKASI ASLI • DITERBITKAN RESMI OLEH BIMCOURSE ACADEMY</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
            </div>

            <div
              id="certificate-paper"
              className="relative p-8 sm:p-12 rounded-3xl bg-white border-4 border-amber-500/40 shadow-2xl text-center space-y-6 text-gray-900"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center p-2 border border-zinc-200">
                  <Image src="/logo.png" alt="BIMCourse Logo" width={36} height={36} className="object-contain" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-widest text-gray-950 uppercase font-mono">
                  BIMCOURSE ACADEMY
                </h2>
                <span className="text-[10px] tracking-widest text-gray-500 uppercase font-mono">
                  Center for Building Information Modeling &amp; Architectural Engineering Excellence
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs sm:text-sm text-gray-500 font-mono tracking-wider block uppercase">
                  SERTIFIKAT KOMPETENSI RESMI
                </span>
                <p className="text-xs text-gray-500 mt-1 italic">Diberikan dengan bangga kepada:</p>
                <h1 className="text-2xl sm:text-4xl font-black text-gray-950 mt-2 tracking-tight uppercase border-b-2 border-zinc-300 inline-block px-8 pb-2">
                  {cert.studentName}
                </h1>
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Telah berhasil menyelesaikan seluruh kurikulum berstandar industri dan lulus evaluasi akhir pada program spesialisasi:
                </p>
                <h4 className="text-base sm:text-lg font-bold text-amber-700">{cert.courseTitle}</h4>
                <p className="text-[11px] font-mono text-gray-500">{cert.standards}</p>
                <div className="pt-1 flex items-center justify-center gap-4 text-[11px] font-mono text-gray-600">
                  <span>Predikat: <strong>{cert.grade}</strong></span>
                  <span>•</span>
                  <span>
                    Terbit:{" "}
                    <strong>
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(cert.issuedDate))}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-zinc-200 text-xs">
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-gray-800 border-b border-gray-300 pb-1 mx-auto max-w-[180px]">
                    {cert.instructorName}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block">
                    Instruktur BIM Profesional
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center p-1 bg-amber-50">
                    <div className="w-13 h-13 rounded-full bg-amber-400 text-black flex flex-col items-center justify-center text-[8px] font-bold tracking-tighter">
                      <span>OFFICIAL</span>
                      <span>VERIFIED</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-700 mt-1 font-bold">
                    ID: {cert.certificateNo}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-col items-center justify-end min-h-[64px] border-b border-gray-300 pb-1 mx-auto max-w-[190px]">
                    <img
                      src="/ceo-signature.png"
                      alt={`Tanda Tangan ${cert.ceoName}`}
                      className="h-14 w-auto object-contain mix-blend-multiply"
                    />
                    <span className="font-bold text-xs text-gray-900 mt-0.5">{cert.ceoName}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block">
                    {cert.ceoTitle || "Chief Executive Officer"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] flex items-center justify-center">
          <div className="w-full max-w-2xl p-8 rounded-3xl bg-white dark:bg-[#14171E] animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-12 w-full rounded-xl bg-gray-100 dark:bg-white/5" />
          </div>
        </div>
      }
    >
      <VerifyCertificateContent />
    </Suspense>
  );
}
