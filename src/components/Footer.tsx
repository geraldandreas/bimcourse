"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
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
              {t.footer.tagline}
            </p>

            <div className="pt-2 text-xs text-gray-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400/70" />
                Jakarta Selatan &amp; BSD City, Indonesia
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400/70" />
                halo@bimcourse.id
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400/70" />
                +62 821 1900 8890 (WhatsApp Student Advisor)
              </p>
            </div>
          </div>

          {/* Column 2: Program Kelas */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 mb-4">
              {language === "en" ? "Popular Courses" : "Kelas Populer"}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">Revit Architecture LOD 300</a></li>
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">Navisworks Clash Detective</a></li>
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">Dynamo Algorithmic Design</a></li>
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">Civil 3D Infrastruktur Tol</a></li>
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">Tekla Detailing Baja Precast</a></li>
              <li><a href="#courses" className="hover:text-amber-400 transition-colors">BIM Management ISO 19650</a></li>
            </ul>
          </div>

          {/* Column 3: Jalur Karier & Resource */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#roadmaps" className="hover:text-amber-400 transition-colors">Roadmap BIM Modeler</a></li>
              <li><a href="#roadmaps" className="hover:text-amber-400 transition-colors">Roadmap BIM Coordinator</a></li>
              <li><a href="#roadmaps" className="hover:text-amber-400 transition-colors">Roadmap BIM Manager</a></li>
              <li><a href="#community" className="hover:text-amber-400 transition-colors">{t.navbar.community}</a></li>
              <li><a href="#quiz" className="hover:text-amber-400 transition-colors">{t.navbar.quiz}</a></li>
              <li><a href="#enterprise" className="hover:text-amber-400 transition-colors">{t.navbar.enterprise}</a></li>
            </ul>
          </div>

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
              <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                {language === "en" ? "Thank you for subscribing!" : "Terima kasih telah berlangganan!"}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="email.anda@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black shadow-[0_2px_15px_rgba(245,180,50,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {language === "en" ? "Subscribe Digest" : "Langganan Buletin"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
            <a href="#" className="hover:text-gray-300">{language === "en" ? "Certificate Verification" : "Verifikasi Sertifikat"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
