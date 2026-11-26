"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  Users,
  Building2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  MessageSquare,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface SubscriberItem {
  id: string;
  email: string;
  subscribedAt: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
}

interface BroadcastItem {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  recipientsCount: number;
  sentBy?: string;
}

interface ConsultationInquiry {
  id: string;
  companyName: string;
  email: string;
  participants: string;
  notes?: string;
  method: "whatsapp" | "email";
  status: "BARU" | "DIPROSES" | "SELESAI";
  createdAt: string;
}

export default function NewsletterLeadsManager() {
  const [subTab, setSubTab] = useState<"newsletter" | "consultation">("newsletter");

  // Newsletter state
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [lastMailtoUrl, setLastMailtoUrl] = useState<string | null>(null);

  // Consultation Leads state
  const [inquiries, setInquiries] = useState<ConsultationInquiry[]>([]);
  const [loadingInq, setLoadingInq] = useState(true);
  const [searchInq, setSearchInq] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const OFFICIAL_EMAIL = "bim.courseacad@gmail.com";
  const OFFICIAL_WHATSAPP = "6281524173386";

  // Fetch newsletter subscribers & broadcasts
  const fetchNewsletterData = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/newsletter");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error("Fetch newsletter error:", err);
    } finally {
      setLoadingNews(false);
    }
  };

  // Fetch consultation inquiries
  const fetchInquiriesData = async () => {
    setLoadingInq(true);
    try {
      const res = await fetch("/api/consultation");
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error("Fetch inquiries error:", err);
    } finally {
      setLoadingInq(false);
    }
  };

  useEffect(() => {
    fetchNewsletterData();
    fetchInquiriesData();
  }, []);

  // Copy all emails
  const handleCopyAllEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === "ACTIVE")
      .map((s) => s.email)
      .join(", ");

    if (!activeEmails) {
      alert("Belum ada email subscriber aktif.");
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single email
  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete subscriber
  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Hapus ${email} dari daftar subscriber buletin?`)) return;

    try {
      const res = await fetch(`/api/newsletter?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || "Gagal menghapus subscriber.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus subscriber.");
    }
  };

  // Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      alert("Harap isi subjek dan pesan broadcast.");
      return;
    }

    setBroadcasting(true);
    setBroadcastSuccess(null);
    try {
      const res = await fetch("/api/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: broadcastSubject,
          message: broadcastMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastSuccess(
          data.message || `Broadcast berhasil disiapkan untuk ${data.totalRecipients} subscriber!`
        );
        setLastMailtoUrl(data.mailtoUrl);
        setBroadcasts((prev) => [data.broadcast, ...prev]);
        setBroadcastSubject("");
        setBroadcastMessage("");
      } else {
        alert(data.error || "Gagal menyiapkan broadcast.");
      }
    } catch {
      alert("Terjadi kesalahan saat memproses broadcast.");
    } finally {
      setBroadcasting(false);
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (
    id: string,
    newStatus: "BARU" | "DIPROSES" | "SELESAI"
  ) => {
    try {
      const res = await fetch("/api/consultation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
      } else {
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch {
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Hapus data konsultasi ini?")) return;

    try {
      const res = await fetch(`/api/consultation?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert(data.error || "Gagal menghapus data.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const filteredInquiries = inquiries.filter((inq) => {
    const matchSearch =
      inq.companyName.toLowerCase().includes(searchInq.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchInq.toLowerCase()) ||
      inq.participants.toLowerCase().includes(searchInq.toLowerCase());
    const matchStatus = statusFilter === "ALL" || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeSubsCount = subscribers.filter((s) => s.status === "ACTIVE").length;
  const newInqCount = inquiries.filter((i) => i.status === "BARU").length;

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab("newsletter")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === "newsletter"
                ? "bg-amber-500 text-black shadow-md font-black"
                : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Buletin BIM Tech Digest</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                subTab === "newsletter"
                  ? "bg-black/20 text-black font-extrabold"
                  : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300"
              }`}
            >
              {activeSubsCount} Subscriber
            </span>
          </button>

          <button
            onClick={() => setSubTab("consultation")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === "consultation"
                ? "bg-emerald-600 text-white shadow-md font-black"
                : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Konsultasi In-House (Enterprise)</span>
            {newInqCount > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500 text-white font-black animate-pulse">
                {newInqCount} Baru
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                {inquiries.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{OFFICIAL_EMAIL}</span>
          </span>
          <span className="text-xs font-mono font-bold bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>+62 815 2417 3386</span>
          </span>
        </div>
      </div>

      {/* TAB 1: NEWSLETTER MANAGER */}
      {subTab === "newsletter" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Total Pelanggan Aktif
                </span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-gray-950 dark:text-white">
                {activeSubsCount}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Menerima update mingguan BIM Tech Digest
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Riwayat Broadcast Terkirim
                </span>
                <Send className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-gray-950 dark:text-white">
                {broadcasts.length}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Informasi & pengumuman yang telah disebarkan
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-1">
                  Aksi Cepat Distribusi Email
                </span>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Salin semua alamat subscriber untuk pengiriman via Gmail / Mail Client.
                </p>
              </div>
              <button
                onClick={handleCopyAllEmails}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-xs"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Semua Email (BCC)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Broadcast Composer */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-950 dark:text-white">
                  Sebar Info ke Seluruh Pelanggan Buletin (Broadcast)
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Kirim update modul baru, regulasi PUPR, jadwal webinar, atau tips BIM langsung ke {activeSubsCount} email subscriber.
                </p>
              </div>
            </div>

            {broadcastSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{broadcastSuccess}</span>
                </div>
                {lastMailtoUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={lastMailtoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka &amp; Kirim via Gmail / Mail App (BCC Otomatis)</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 block mb-1.5">
                  Judul / Subjek Broadcast Buletin: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: [BIM Tech Digest #1] Rilis Template Family Revit LOD 300 & Regulasi PUPR 2026"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/15 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-950 text-gray-950 dark:text-white font-medium placeholder:text-gray-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 block mb-1.5">
                  Isi Pesan / Berita Broadcast: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder={`Tulis isi pengumuman, materi, tautan video, atau berita BIM yang ingin disebarkan kepada seluruh subscriber...\n\nContoh:\nHalo Sobat BIM,\n\nMinggu ini kami baru saja memperbarui modul pelatihan Revit LOD 300 serta standar penamaan file ISO 19650.\nSimak selengkapnya di web bimcourse.id!`}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/15 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white dark:bg-zinc-950 text-gray-950 dark:text-white font-normal placeholder:text-gray-400 shadow-2xs resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  Target pengiriman: <span className="font-bold text-gray-900 dark:text-white">{activeSubsCount} Subscriber</span> • Pengirim resmi: <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{OFFICIAL_EMAIL}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={broadcasting || activeSubsCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs transition-all flex items-center gap-2 shadow-[0_2px_12px_rgba(245,180,50,0.35)] cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{broadcasting ? "Menyiapkan Broadcast..." : "Sebar Info ke Subscriber"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Broadcast History Table */}
          {broadcasts.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="text-sm font-black text-gray-950 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Riwayat Broadcast Buletin</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Subjek / Judul</th>
                      <th className="py-2.5 px-3">Jumlah Penerima</th>
                      <th className="py-2.5 px-3">Pengirim</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium text-gray-900 dark:text-gray-200">
                    {broadcasts.map((bc) => (
                      <tr key={bc.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-gray-500">
                          {new Date(bc.sentAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3 font-bold max-w-xs truncate">{bc.subject}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 text-[11px]">
                            {bc.recipientsCount} Subscriber
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-500 text-[11px]">{bc.sentBy || "SuperAdmin"}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              alert(`Isi Pesan:\n\n${bc.message}`);
                            }}
                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Lihat Pesan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscriber List Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-gray-950 dark:text-white">
                  Daftar Email Pelanggan Buletin ({subscribers.length})
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Seluruh pembaca yang mendaftar melalui kolom BIM Tech Digest di footer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari email subscriber..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/15 text-xs bg-white dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-2xs"
                  />
                </div>
                <button
                  onClick={fetchNewsletterData}
                  title="Muat Ulang"
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingNews ? (
              <div className="space-y-3 py-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-11 rounded-xl bg-gray-100 dark:bg-white/5" />
                ))}
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                {searchEmail ? "Tidak ada email yang cocok dengan pencarian." : "Belum ada pelanggan buletin yang terdaftar."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Alamat Email</th>
                      <th className="py-3 px-3">Tanggal Bergabung</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium text-gray-900 dark:text-gray-200">
                    {filteredSubscribers.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold font-mono text-gray-950 dark:text-white">
                          {sub.email}
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                          {new Date(sub.subscribedAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-300"
                            }`}
                          >
                            {sub.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleCopyEmail(sub.id, sub.email)}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === sub.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors inline-flex cursor-pointer"
                            title="Hapus Subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENTERPRISE CONSULTATION LEADS */}
      {subTab === "consultation" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Total Permintaan Masuk
                </span>
                <Building2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-gray-950 dark:text-white">
                {inquiries.length}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Calon klien program pelatihan korporasi
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Menunggu Respon (BARU)
                </span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {newInqCount}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Perlu tindak lanjut silabus &amp; proposal harga
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Saluran Masuk
                </span>
                <Share2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-center gap-4 text-xs font-bold mt-1">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{inquiries.filter((i) => i.method === "whatsapp").length} WhatsApp</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{inquiries.filter((i) => i.method === "email").length} Email</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-2">
                Notifikasi otomatis disinkronkan ke <span className="font-mono text-gray-900 dark:text-white font-bold">{OFFICIAL_EMAIL}</span>
              </p>
            </div>
          </div>

          {/* Leads Filter & Search */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-gray-950 dark:text-white">
                  Permintaan Konsultasi &amp; Proposal In-House ({filteredInquiries.length})
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Klien korporasi yang meminta silabus khusus, audit BEP ISO 19650, atau paket harga tim.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/15 text-xs bg-white dark:bg-zinc-950 text-gray-900 dark:text-white font-bold shadow-2xs"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="BARU">Status: BARU</option>
                  <option value="DIPROSES">Status: DIPROSES</option>
                  <option value="SELESAI">Status: SELESAI</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari perusahaan / PIC / tim..."
                    value={searchInq}
                    onChange={(e) => setSearchInq(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/15 text-xs bg-white dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>

                <button
                  onClick={fetchInquiriesData}
                  title="Muat Ulang"
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingInq ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 animate-pulse space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-2 flex-1 min-w-[200px]">
                        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="h-3 w-64 rounded bg-slate-100 dark:bg-white/5" />
                      </div>
                      <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
                    </div>
                    <div className="h-12 w-full rounded-lg bg-slate-100 dark:bg-white/5" />
                  </div>
                ))}
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                {searchInq || statusFilter !== "ALL"
                  ? "Tidak ada leads yang sesuai filter pencarian."
                  : "Belum ada permintaan konsultasi in-house training yang masuk."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => {
                  const mailtoReply = `mailto:${inq.email}?subject=Tindak Lanjut Proposal BIM In-House Training - ${encodeURIComponent(inq.companyName)}&body=Halo Bapak/Ibu PIC ${encodeURIComponent(inq.companyName)},\n\nTerima kasih atas minat Anda pada program BIMCourse for Enterprise.\nKami telah meninjau kebutuhan tim Anda untuk: ${encodeURIComponent(inq.participants)}.\n\nBerikut kami lampirkan silabus dan draf penawaran kerja sama pelatihan...\n\nSalam hormat,\nTim Enterprise BIMCourse\n${OFFICIAL_EMAIL}`;

                  return (
                    <div
                      key={inq.id}
                      className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-950 dark:text-white">
                            {inq.companyName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              inq.status === "BARU"
                                ? "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
                                : inq.status === "DIPROSES"
                                ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                            }`}
                          >
                            {inq.status}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                              inq.method === "whatsapp"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400"
                            }`}
                          >
                            {inq.method === "whatsapp" ? (
                              <MessageSquare className="w-2.5 h-2.5" />
                            ) : (
                              <Mail className="w-2.5 h-2.5" />
                            )}
                            <span>Via {inq.method.toUpperCase()}</span>
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-gray-500">
                          {new Date(inq.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">
                            Email PIC / Perusahaan:
                          </span>
                          <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {inq.email}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">
                            Jumlah &amp; Komposisi Peserta:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {inq.participants}
                          </span>
                        </div>

                        {inq.notes && (
                          <div className="md:col-span-3 pt-2 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">
                              Catatan Kebutuhan / Fokus Silabus:
                            </span>
                            <span className="text-gray-700 dark:text-zinc-300 italic">
                              &ldquo;{inq.notes}&rdquo;
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Ubah Status:</span>
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "BARU")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              inq.status === "BARU"
                                ? "bg-rose-500 text-white border-rose-500"
                                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-white/10"
                            }`}
                          >
                            Baru
                          </button>
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "DIPROSES")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              inq.status === "DIPROSES"
                                ? "bg-amber-500 text-black border-amber-500"
                                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-white/10"
                            }`}
                          >
                            Diproses
                          </button>
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "SELESAI")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              inq.status === "SELESAI"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-white/10"
                            }`}
                          >
                            Selesai
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={mailtoReply}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Balas Email</span>
                          </a>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
