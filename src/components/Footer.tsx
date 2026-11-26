"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from "@/data/defaultSiteContent";

interface FooterProps {
  content?: SiteContentConfig["footer"];
  sectionsVisibility?: SiteContentConfig["sectionsVisibility"];
}

export default function Footer({
  content: contentProp,
  sectionsVisibility: sectionsVisibilityProp,
}: FooterProps) {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [fetchedFooter, setFetchedFooter] = useState<SiteContentConfig["footer"] | null>(null);
  const [fetchedVisibility, setFetchedVisibility] = useState<
    SiteContentConfig["sectionsVisibility"] | null
  >(null);

  useEffect(() => {
    if (!contentProp || !sectionsVisibilityProp) {
      fetch("/api/site-content", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.content?.footer && !contentProp) {
            setFetchedFooter(data.content.footer);
          }
          if (data?.content?.sectionsVisibility && !sectionsVisibilityProp) {
            setFetchedVisibility(data.content.sectionsVisibility);
          }
        })
        .catch(() => {});
    }
  }, [contentProp, sectionsVisibilityProp]);

  const content = contentProp || fetchedFooter || DEFAULT_SITE_CONTENT.footer;
  const vis =
    sectionsVisibilityProp ||
    fetchedVisibility ||
    DEFAULT_SITE_CONTENT.sectionsVisibility;

  const isHrefVisible = (href: string) => {
    const h = (href || "").toLowerCase();
    if (h.includes("#courses") || h.startsWith("/courses")) return vis.courses !== false;
    if (h.includes("#roadmaps")) return vis.roadmaps !== false;
    if (h.includes("#community") || h.includes("#projects")) return vis.community !== false;
    if (h.includes("#instructors")) return vis.community !== false && vis.instructors !== false;
    if (h.includes("#quiz")) return vis.quiz !== false;
    if (h.includes("#testimonials")) return vis.testimonials !== false;
    if (h.includes("#enterprise")) return vis.enterprise !== false;
    if (h.includes("#faq")) return vis.faq !== false;
    return true;
  };

  const footerEmail =
    content?.email && content.email !== "halo@bimcourse.id"
      ? content.email
      : "bim.courseacad@gmail.com";

  const footerPhone =
    content?.phone &&
    !content.phone.includes("821 1900 8890") &&
    !content.phone.includes("813 7070 4533")
      ? content.phone
      : "+62 815 2417 3386 (WhatsApp Student Advisor)";

  const waDigitsMatch = footerPhone.replace(/\D/g, "");
  const waHref = waDigitsMatch
    ? `https://wa.me/${waDigitsMatch.startsWith("0") ? "62" + waDigitsMatch.slice(1) : waDigitsMatch}`
    : "https://wa.me/6281524173386";

  const rawPopularCourses =
    content?.popularCourses && content.popularCourses.length > 0
      ? content.popularCourses
      : DEFAULT_SITE_CONTENT.footer.popularCourses || [];

  const popularCourses =
    vis.courses === false ? [] : rawPopularCourses.filter((item) => isHrefVisible(item.href));

  const rawQuickLinks =
    content?.quickLinks && content.quickLinks.length > 0
      ? content.quickLinks
      : DEFAULT_SITE_CONTENT.footer.quickLinks || [];

  const quickLinks = rawQuickLinks.filter((item) => isHrefVisible(item.href));

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        setFeedbackMsg(
          data.message ||
            (language === "en"
              ? "Thank you for subscribing! Check your inbox for updates."
              : "Terima kasih! Anda telah berlangganan buletin BIM Tech Digest.")
        );
      } else {
        alert(data.error || "Gagal berlangganan. Silakan periksa kembali email Anda.");
      }
    } catch {
      setSubscribed(true);
      setFeedbackMsg(
        language === "en" ? "Thank you for subscribing!" : "Terima kasih telah berlangganan!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative z-10 bg-[#0F1115] dark:bg-black text-white pt-20 pb-12 border-t border-amber-400/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-1 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="BIMCourse Logo"
                  width={28}
                  height={28}
                  className="object-contain invert"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                BIMCourse
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {language === "en" ? t.footer.tagline : (content?.tagline || t.footer.tagline)}
            </p>

            <div className="pt-2 text-xs text-gray-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400/70 shrink-0" />
                <span>{content?.address || "Jakarta Selatan & BSD City, Indonesia"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400/70 shrink-0" />
                <a
                  href={`mailto:${footerEmail}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {footerEmail}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400/70 shrink-0" />
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  {footerPhone}
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: Program Kelas (Hidden if courses section is hidden or all links filtered out) */}
          {popularCourses.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 mb-4">
                {language === "en"
                  ? "Popular Courses"
                  : content?.popularCoursesTitle || "Kelas Populer"}
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                {popularCourses.map((item, idx) => (
                  <li key={`${item.label}-${idx}`}>
                    <Link
                      href={item.href || "/#courses"}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 3: Jalur Karier & Resource (Hidden links whose sections are disabled) */}
          {quickLinks.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 mb-4">
                {language === "en"
                  ? t.footer.quickLinks
                  : content?.quickLinksTitle || t.footer.quickLinks}
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                {quickLinks.map((item, idx) => (
                  <li key={`${item.label}-${idx}`}>
                    <Link
                      href={item.href || "/#courses"}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 mb-4">
              BIM Tech Digest
            </h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              {language === "en"
                ? "Get free modules, BIM regulation updates, and practical weekly AEC tips."
                : "Dapatkan modul gratis, update regulasi BIM PUPR & tips praktis setiap minggu."}
            </p>

            {subscribed ? (
              <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{feedbackMsg || (language === "en" ? "Thank you for subscribing!" : "Terima kasih telah berlangganan!")}</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  {language === "en"
                    ? "Official digest & updates dispatched via bim.courseacad@gmail.com"
                    : "Update info & buletin resmi dikirim via bim.courseacad@gmail.com"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="email.anda@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black shadow-[0_2px_15px_rgba(245,180,50,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === "en" ? "Registering..." : "Mendaftarkan..."}</span>
                    </>
                  ) : (
                    <>
                      {language === "en" ? "Subscribe Digest" : "Langganan Buletin"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-500 text-center">
                  Official updates: <span className="text-amber-400/90 font-mono">bim.courseacad@gmail.com</span>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} BIMCourse Indonesia. {t.footer.rights}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300">{language === "en" ? "Privacy Policy" : "Kebijakan Privasi"}</a>
            <a href="#" className="hover:text-gray-300">{language === "en" ? "Terms & Conditions" : "Syarat & Ketentuan"}</a>
            <a href="/verify-certificate" className="hover:text-gray-300">{language === "en" ? "Certificate Verification" : "Verifikasi Sertifikat"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
