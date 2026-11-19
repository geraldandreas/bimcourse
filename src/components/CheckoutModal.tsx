"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  Copy,
  Upload,
  QrCode,
  CreditCard,
  Building2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CourseCheckoutData {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  level: string;
}

interface CheckoutModalProps {
  course: CourseCheckoutData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckoutModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const router = useRouter();
  const { language } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "BANK_TRANSFER">("QRIS");
  const [senderName, setSenderName] = useState("");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !course) return null;

  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Mohon unggah berkas foto atau screenshot bukti transfer (JPG / PNG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 5MB.");
      return;
    }

    setErrorMsg(null);
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile && !proofPreview) {
      setErrorMsg("Harap unggah screenshot bukti transfer pembayaran terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let uploadedProofUrl = proofPreview;

      // 1. Try uploading file to backend storage if a real file exists
      if (proofFile) {
        try {
          const formData = new FormData();
          formData.append("file", proofFile);
          formData.append("folder", "payment-proofs");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData?.url) {
              uploadedProofUrl = uploadData.url;
            }
          }
        } catch (uploadErr) {
          console.warn("Direct upload error, falling back to base64 preview:", uploadErr);
        }
      }

      // 2. Submit Transaction
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
          paymentMethod,
          proofUrl: uploadedProofUrl,
          senderName: senderName.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim bukti pembayaran.");
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121418] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col text-white shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#16191f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Checkout & Aktivasi Kelas</h2>
              <p className="text-[11px] text-zinc-400">Pendaftaran Modul & Verifikasi Mandat PUPR / SKKNI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold mb-2">
                  STATUS: MENUNGGU VERIFIKASI ADMIN
                </span>
                <h3 className="text-xl font-bold text-white">Bukti Pembayaran Berhasil Dikirim!</h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Terima kasih! Bukti transfer untuk kelas <strong className="text-white">"{course.title}"</strong> telah masuk ke antrean verifikasi SuperAdmin.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left text-xs text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Estimasi Verifikasi: 5 - 15 Menit</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Begitu admin memverifikasi transfer Anda, modul kelas dan dataset proyek akan otomatis terbuka penuh di tab <strong>"Kelas Diikuti"</strong> di halaman Profil Anda.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/profile?tab=transactions");
                    router.refresh();
                  }}
                  className="w-full py-3 px-5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Cek Status di Profil Saya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Normal Checkout View */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Course Summary Card */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-4 items-center">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl object-cover ring-1 ring-white/15 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                      {course.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {course.level}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{course.title}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-extrabold text-white">
                      Rp {course.price.toLocaleString("id-ID")}
                    </span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-xs text-zinc-500 line-through">
                        Rp {course.originalPrice.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Switcher */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2.5">
                  Pilih Metode Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      paymentMethod === "QRIS"
                        ? "bg-white/15 border-white text-white shadow-md ring-1 ring-white/30"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">QRIS Instant</p>
                      <p className="text-[10px] text-zinc-400">Semua E-Wallet & Bank</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "bg-white/15 border-white text-white shadow-md ring-1 ring-white/30"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Transfer Bank</p>
                      <p className="text-[10px] text-zinc-400">BCA & Mandiri Manual</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Payment Instructions (QRIS / Bank) */}
              {paymentMethod === "QRIS" ? (
                <div className="p-5 rounded-2xl bg-[#16181f] border border-white/10 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-rose-600/20 text-rose-300 border border-rose-500/30">
                      QRIS NASIONAL
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">NMID: ID102938192839</span>
                  </div>

                  {/* QRIS Code Graphic */}
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-xl flex flex-col items-center justify-center relative">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BIMCourse-Payment-CourseID"
                      alt="QRIS BIMCourse"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-2 py-1 rounded bg-black/85 text-[9px] font-bold font-mono tracking-wider text-white border border-white/20">
                        BIMCOURSE
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white">
                      Total Tagihan: <span className="text-emerald-400 font-mono">Rp {course.price.toLocaleString("id-ID")}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      Scan kode QRIS di atas menggunakan GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin' Mandiri, BRImo, atau aplikasi perbankan lainnya.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#16181f] border border-white/10 space-y-3">
                  <p className="text-xs font-bold text-zinc-300">Rekening Tujuan Pembayaran:</p>

                  {/* BCA */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Bank Central Asia (BCA)</p>
                      <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">8040-1289-9182</p>
                      <p className="text-[10px] text-zinc-400">a.n. PT BIMCOURSE TEKNOLOGI INDONESIA</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("804012899182", "BCA")}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedBank === "BCA" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank === "BCA" ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>

                  {/* Mandiri */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Bank Mandiri</p>
                      <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">137-00-2918291-2</p>
                      <p className="text-[10px] text-zinc-400">a.n. PT BIMCOURSE TEKNOLOGI INDONESIA</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("1370029182912", "MANDIRI")}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedBank === "MANDIRI" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank === "MANDIRI" ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Form Upload Bukti Transfer */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                    Unggah Bukti Transfer / Screenshot Pembayaran <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {proofPreview ? (
                    <div className="relative p-3 rounded-2xl bg-white/5 border border-white/15 flex items-center gap-4">
                      <img
                        src={proofPreview}
                        alt="Preview Bukti"
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Bukti transfer terpilih</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {proofFile ? proofFile.name : "Screenshot Pembayaran"}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-zinc-300 hover:text-white underline mt-1 cursor-pointer"
                        >
                          Ganti foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-center cursor-pointer space-y-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 text-white flex items-center justify-center mx-auto transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-zinc-200">
                        Klik untuk memilih foto / screenshot struk bukti transfer
                      </p>
                      <p className="text-[10px] text-zinc-400">Mendukung format PNG, JPG, JPEG (Maks. 5MB)</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      {language === "en" ? "Sender / Account Name (Optional)" : "Nama Pengirim Rekening / E-Wallet (Opsional)"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === "en" ? "Account holder or sender name" : "Nama pemilik rekening / pengirim"}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      {language === "en" ? "Additional Notes (Optional)" : "Catatan Tambahan (Opsional)"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === "en" ? "Transfer notes or reference time" : "Keterangan atau jam transfer"}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA Bar */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-zinc-400 block">Total yang Harus Dibayar:</span>
                  <span className="text-lg font-black text-white font-mono">
                    Rp {course.price.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || (!proofFile && !proofPreview)}
                  className="py-3 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Mengirim Bukti...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Bukti Pembayaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
