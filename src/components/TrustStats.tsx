"use client";

import { Award, Users, CheckCircle2, TrendingUp } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";

export default function TrustStats() {
  const companies = [
    { name: "PT Wijaya Karya (WIKA)", tag: "BUMN Karya" },
    { name: "PT PP (Persero) Tbk", tag: "General Contractor" },
    { name: "PT Hutama Karya", tag: "Jalan Tol & Infra" },
    { name: "Total Bangun Persada", tag: "High-Rise Building" },
    { name: "PT Adhi Karya Tbk", tag: "Transit & LRT" },
    { name: "Konsultan Perencana IAI", tag: "Architecture" },
  ];

  const stats = [
    {
      icon: Users,
      value: "18,500+",
      label: "Alumni Terlatih",
      sublabel: "Arsitek, Insinyur Sipil & MEP di seluruh Indonesia",
    },
    {
      icon: TrendingUp,
      value: "94%",
      label: "Kenaikan Karier",
      sublabel: "Promosi jabatan atau diterima di posisi BIM dalam 6 bulan",
    },
    {
      icon: Award,
      value: "ISO 19650",
      label: "Standar Internasional",
      sublabel: "Kurikulum mengacu mandat BIM PUPR & SKKNI Nasional",
    },
    {
      icon: CheckCircle2,
      value: "4.94 / 5.0",
      label: "Rating Kepuasan",
      sublabel: "Dari 3,400+ ulasan terverifikasi peserta kelas",
    },
  ];

  return (
    <section className="relative z-10 w-full bg-white dark:bg-[#09090B] border-y border-black/10 dark:border-white/10 py-16 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      {/* Client Logos / Tags */}
      <FadeIn direction="up">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-600 dark:text-zinc-400 mb-6">
            Dipercaya oleh praktisi dan profesional dari perusahaan AEC terdepan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            {companies.map((c) => (
              <div
                key={c.name}
                className="px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xs flex items-center gap-2 text-xs md:text-sm font-medium text-gray-800 dark:text-zinc-200 hover:border-amber-400/60 dark:hover:border-amber-400/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{c.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal">({c.tag})</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Numerical Stats */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.label}>
              <HoverCard lift={-4} scale={1.01} className="h-full">
                <div
                  className="bg-white dark:bg-zinc-900/90 rounded-2xl p-6 border border-zinc-200 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-amber-400/60 dark:hover:border-amber-400/40 hover:shadow-lg transition-all group h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-zinc-800 border border-amber-200/50 dark:border-white/10 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-4 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-black group-hover:border-amber-400 transition-all shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                      {s.value}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-200 mb-1">{s.label}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{s.sublabel}</p>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
      </div>
    </section>
  );
}
