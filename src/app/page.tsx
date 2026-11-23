"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, ArrowRight, ArrowUpRight, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, FloatElement, HoverCard } from "@/components/animations/MotionWrappers";
import Navbar from "@/components/Navbar";
import HeroVideoBackground from "@/components/HeroVideoBackground";
import CourseCatalog from "@/components/CourseCatalog";
import CareerRoadmap from "@/components/CareerRoadmap";
import CommunitySection from "@/components/CommunitySection";
import QuizRecommender from "@/components/QuizRecommender";
import TestimonialsSection from "@/components/TestimonialsSection";
import EnterpriseSection from "@/components/EnterpriseSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import ContinueLearningSection from "@/components/ContinueLearningSection";
import type { Course } from "@/data/courses";
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from "@/data/defaultSiteContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const { language, t } = useLanguage();
  const [cartCount, setCartCount] = useState(0);
  const [heroVideoOpen, setHeroVideoOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.content) {
          setSiteContent(data.content);
        }
      })
      .catch(() => {});
  }, []);

  const handleEnrollSuccess = (_course: Course) => {
    setCartCount((prev) => prev + 1);
  };

  const scrollToCourses = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById("courses");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] font-sans text-gray-900 dark:text-zinc-100 relative transition-colors duration-300">
      {/* Background Shapes with Clean Subtle Ambient Radiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[60%] bg-gradient-to-br from-zinc-100/60 dark:from-amber-500/10 to-transparent rounded-full blur-[110px] opacity-70 dark:opacity-30" />
        <div className="absolute top-[25%] right-[-10%] w-[45%] h-[50%] bg-gradient-to-bl from-zinc-100/50 dark:from-amber-600/10 to-transparent rounded-full blur-[110px] opacity-60 dark:opacity-30" />
        <div className="absolute bottom-[-10%] left-[15%] w-[65%] h-[55%] bg-gradient-to-tr from-zinc-100/60 dark:from-zinc-800/20 to-transparent rounded-full blur-[130px] opacity-60 dark:opacity-20" />
      </div>

      {/* Navigation */}
      <Navbar onSearchClick={scrollToCourses} cartCount={cartCount} />

      {/* Hero Section with Cinematic Video Background (Hazael Cut) */}
      {siteContent.sectionsVisibility.hero !== false && (
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-black text-white px-6 lg:px-8 pt-24 pb-16">
          <HeroVideoBackground />

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            {/* Sub-badge */}
            <FloatElement amplitude={4} duration={4}>
              <FadeIn delay={0.05} direction="down">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 backdrop-blur-md border border-amber-400/35 text-xs font-semibold text-amber-200 mb-6 shadow-[0_0_20px_rgba(245,180,50,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{language === "en" ? t.hero.subBadge : siteContent.hero.badge}</span>
                </div>
              </FadeIn>
            </FloatElement>

            <FadeIn delay={0.15} direction="up">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.06] mb-5 text-white drop-shadow-2xl">
                {siteContent.hero.titleLine1}<br />
                <span className="text-white drop-shadow-sm">{siteContent.hero.titleLine2}</span>
              </h1>
            </FadeIn>

            {/* Accent Line with Luxury Gold Gradient */}
            <FadeIn delay={0.2} direction="up">
              <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full mx-auto mb-6 shadow-[0_0_25px_rgba(245,180,50,0.7)]" />
            </FadeIn>

            <FadeIn delay={0.25} direction="up">
              <p className="text-gray-200 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-normal drop-shadow-md">
                {language === "en" ? t.hero.description : siteContent.hero.description}
              </p>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <motion.a
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href="#courses"
                  onClick={scrollToCourses}
                  className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black rounded-full font-black text-sm transition-all shadow-[0_4px_25px_rgba(245,180,50,0.35)] hover:shadow-[0_6px_35px_rgba(245,180,50,0.55)] group cursor-pointer"
                >
                  {language === "en" ? t.hero.primaryCta : (siteContent.hero.primaryCtaText || "Eksplor Semua Kelas")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setHeroVideoOpen(true)}
                  className="flex items-center justify-center gap-3 px-7 py-4 w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:border-amber-400/40 rounded-full font-bold text-sm text-white shadow-xl hover:bg-white/20 transition-all cursor-pointer"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    <Play className="w-3 h-3 fill-amber-400 ml-0.5 text-amber-400" />
                  </span>
                  {language === "en" ? t.hero.secondaryCta : (siteContent.hero.secondaryCtaText || "Tonton Video Pengenalan")}
                </motion.button>
              </div>
            </FadeIn>

          </div>
        </section>
      )}

      {/* Continue Learning Section for Logged-In Enrolled Students */}
      <ContinueLearningSection />

      {/* Feature Pillar Bento Cards Section - Clean, High Contrast, Zero Overlap */}
      {siteContent.sectionsVisibility.features !== false && (
      <section className="relative z-10 w-full bg-white dark:bg-[#09090B] pt-20 md:pt-28 pb-28 border-b border-black/10 dark:border-white/10 transition-colors duration-300">
        <StaggerContainer className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Kurikulum Praktik */}
          <StaggerItem>
            <HoverCard lift={-6} scale={1.01} className="h-full">
              <a
                href="#courses"
                onClick={scrollToCourses}
                className="bg-[#111316] dark:bg-zinc-900/90 rounded-[32px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden border border-white/10 hover:border-white/30 dark:border-white/10 dark:hover:border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/35 text-[11px] font-bold uppercase tracking-wider text-amber-300 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {language === "en" ? t.features.card1Badge : (siteContent.features?.card1Badge || t.features.card1Badge)}
                    </span>
                    <span className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-gray-400 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-black group-hover:border-amber-400 transition-all shadow-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Title & Description with Clear Contrast & Breathing Room */}
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug mb-3">
                    {language === "en" ? <>Skills for<br />Real Opportunities</> : (siteContent.features?.card1Title || "Skills for Real Opportunities")}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                    {language === "en" ? t.features.card1Desc : (siteContent.features?.card1Desc || t.features.card1Desc)}
                  </p>
                </div>

                {/* Dedicated Framed Visual Area (Separated from text - No Overlap) */}
                <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-[#1A1D24] relative h-48 flex flex-col justify-between p-4 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop"
                    alt="Engineering Software & 3D BIM Modeling"
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-[#111316]/50 to-transparent" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/15 text-gray-200">
                      {language === "en" ? "ISO 19650 & Mandate" : (siteContent.features?.card1Tag1 || "ISO 19650 & Mandat PUPR")}
                    </span>
                    <span className="text-[10px] font-extrabold text-black bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 rounded-full shadow-xs">
                      {siteContent.features?.card1Tag2 || "LOD 200 - 400"}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <p className="text-[11px] font-semibold text-gray-300 mb-2">
                      {language === "en" ? "Industry Software Stack:" : "Stack Software Industri:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-xs text-white text-[10px] font-bold border border-white/10">Revit</span>
                      <span className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-xs text-white text-[10px] font-bold border border-white/10">Navisworks</span>
                      <span className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-xs text-white text-[10px] font-bold border border-white/10">Tekla</span>
                      <span className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-xs text-white text-[10px] font-bold border border-white/10">Dynamo</span>
                    </div>
                  </div>
                </div>
              </a>
            </HoverCard>
          </StaggerItem>

          {/* Card 2: Peta Jalan Karier */}
          <StaggerItem>
            <HoverCard lift={-6} scale={1.01} className="h-full">
              <a
                href="#roadmaps"
                className="bg-zinc-50 dark:bg-zinc-900 rounded-[32px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden border border-zinc-200 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-amber-400/50 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer h-full"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/25 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 shadow-xs">
                      {language === "en" ? t.features.card2Badge : (siteContent.features?.card2Badge || t.features.card2Badge)}
                    </span>
                    <span className="w-10 h-10 rounded-full border border-black/15 dark:border-white/15 flex items-center justify-center text-gray-700 dark:text-zinc-300 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-black group-hover:border-amber-400 transition-all shadow-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 dark:text-white leading-snug mb-3">
                    {language === "en" ? <>Your Goals<br />Our Support</> : (siteContent.features?.card2Title || "Your Goals, Our Support")}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {language === "en" ? t.features.card2Desc : (siteContent.features?.card2Desc || t.features.card2Desc)}
                  </p>
                </div>

                {/* Dedicated Framed Visual Area (Progress Stepper UI) */}
                <div className="mt-8 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-4 relative h-48 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2.5">
                    <span className="text-[11px] font-bold text-gray-900 dark:text-zinc-100">
                      {language === "en" ? "Competency Level & Progression" : "Level Kompetensi & Progresi"}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700">
                      {language === "en" ? "100% Guided" : "Terarah 100%"}
                    </span>
                  </div>

                  <div className="space-y-2 py-1">
                    <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-bold">1</span>
                        <span className="font-semibold text-gray-800 dark:text-zinc-200">
                          {siteContent.features?.card2Step1 || "BIM Modeler (Dasar s/d LOD 300)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-bold">2</span>
                        <span className="font-semibold text-gray-800 dark:text-zinc-200">
                          {siteContent.features?.card2Step2 || "BIM Coordinator (Clash & 4D Time)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black flex items-center justify-center text-[10px] font-bold">3</span>
                        <span className="font-semibold text-gray-800 dark:text-zinc-200">
                          {siteContent.features?.card2Step3 || "BIM Manager (BEP & ISO 19650)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </HoverCard>
          </StaggerItem>

          {/* Card 3: Komunitas BIMCourse Bersama Instruktur */}
          <StaggerItem>
            <HoverCard lift={-6} scale={1.01} className="h-full">
              <a
                href="#community"
                className="bg-[#111316] dark:bg-zinc-900/90 rounded-[32px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden border border-white/10 hover:border-amber-400/40 dark:border-white/10 dark:hover:border-amber-400/40 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/35 text-[11px] font-bold uppercase tracking-wider text-amber-300 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {language === "en" ? t.features.card3Badge : (siteContent.features?.card3Badge || t.features.card3Badge)}
                    </span>
                    <span className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-gray-400 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-500 group-hover:text-black group-hover:border-amber-400 transition-all shadow-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Title & Description Focused on Connecting with BIMCourse Community & Instructors */}
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug mb-3">
                    {language === "en" ? <>Connect with<br />Instructors &amp; Experts</> : (siteContent.features?.card3Title || "Terhubung Bersama Instruktur & Praktisi")}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                    {language === "en" ? t.features.card3Desc : (siteContent.features?.card3Desc || t.features.card3Desc)}
                  </p>
                </div>

                {/* Dedicated Framed Visual Area (Live Instructor Mentoring Simulation) */}
                <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-[#16191F] p-4 relative h-48 flex flex-col justify-between shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop"
                          alt="Instruktur Hendra"
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-black"
                        />
                        <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop"
                          alt="Instruktur Budi"
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-black"
                        />
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=80&auto=format&fit=crop"
                          alt="Instruktur Dewi"
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-black"
                        />
                      </div>
                      <span className="text-[10px] text-gray-300 font-medium">
                        {language === "en" ? "Instructors On Standby" : "Instruktur Standby"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                      {language === "en" ? "Active Every Day" : "Aktif Setiap Hari"}
                    </span>
                  </div>

                  {/* Chat Simulation Snippet */}
                  <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 my-auto">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
                      <span className="font-bold text-white">{siteContent.features?.card3ChatAuthor || t.features.chatAuthor}</span>
                      <span>•</span>
                      <span>{siteContent.features?.card3ChatRole || t.features.chatRole}</span>
                    </div>
                    <p className="text-[11px] text-gray-200 line-clamp-2 leading-relaxed">
                      &ldquo;{siteContent.features?.card3ChatQuote || t.features.chatQuote}&rdquo;
                    </p>
                  </div>

                  {/* Bottom Tags */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                    <span>{t.features.membersTag}</span>
                    <span className="text-amber-400 group-hover:text-amber-300 font-bold flex items-center gap-1 transition-colors">
                      {siteContent.features?.card3LinkText || t.features.card3Link} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </a>
            </HoverCard>
          </StaggerItem>
        </StaggerContainer>
      </section>
      )}

      {/* Interactive Course Catalog with Filter & Modal */}
      {siteContent.sectionsVisibility.courses !== false && (
        <CourseCatalog
          content={siteContent.courses}
          onEnrollSuccess={handleEnrollSuccess}
        />
      )}

      {/* Interactive Career Roadmaps */}
      {siteContent.sectionsVisibility.roadmaps !== false && (
        <CareerRoadmap content={siteContent.roadmaps} />
      )}

      {/* Section 03: Komunitas BIMCourse Bersama Instruktur & Praktisi */}
      {siteContent.sectionsVisibility.community !== false && (
        <CommunitySection
          content={siteContent.community}
          instructors={siteContent.instructors}
          showInstructors={siteContent.sectionsVisibility.instructors !== false}
        />
      )}

      {/* Interactive 30-Second Quiz Recommender */}
      {siteContent.sectionsVisibility.quiz !== false && (
        <QuizRecommender content={siteContent.quiz} />
      )}

      {/* Testimonials */}
      {siteContent.sectionsVisibility.testimonials !== false && (
        <TestimonialsSection content={siteContent.testimonials} />
      )}

      {/* Enterprise Training Section */}
      {siteContent.sectionsVisibility.enterprise !== false && (
        <EnterpriseSection content={siteContent.enterprise} />
      )}

      {/* FAQ Section */}
      {siteContent.sectionsVisibility.faq !== false && (
        <FaqSection content={siteContent.faq} />
      )}

      {/* High-Converting Pre-Footer CTA */}
      {siteContent.sectionsVisibility.cta !== false && (
        <section className="relative z-10 w-full bg-white dark:bg-[#09090B] py-24 border-t border-black/10 dark:border-white/10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <FadeIn direction="up">
              <div className="bg-gradient-to-br from-[#111316] via-[#1a1710] to-[#251e10] dark:from-zinc-900 dark:via-[#1a160d] dark:to-black rounded-[40px] p-8 md:p-14 text-white text-center flex flex-col items-center relative overflow-hidden shadow-2xl border border-amber-400/25 dark:border-amber-400/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-400/25 via-yellow-500/15 to-transparent rounded-full blur-[90px] pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-xs font-semibold text-amber-200 mb-4 border border-amber-400/35">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  {language === "en" ? t.cta.guarantee : (siteContent.cta?.badge || t.cta.guarantee)}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-2xl">
                  {language === "en" ? t.cta.title : (siteContent.cta?.title || t.cta.title)}
                </h2>
                <p className="text-gray-300 text-sm md:text-base max-w-xl mb-8 leading-relaxed">
                  {language === "en" ? t.cta.desc : (siteContent.cta?.subtitle || t.cta.desc)}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    href="#courses"
                    onClick={scrollToCourses}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm transition-all shadow-[0_4px_25px_rgba(245,180,50,0.35)] hover:shadow-[0_6px_35px_rgba(245,180,50,0.55)] flex items-center gap-2 cursor-pointer"
                  >
                    {language === "en" ? t.cta.primaryBtn : (siteContent.cta?.primaryBtnText || t.cta.primaryBtn)}
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    href="#roadmaps"
                    className="px-8 py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all border border-white/10 cursor-pointer"
                  >
                    {language === "en" ? t.cta.secondaryBtn : (siteContent.cta?.secondaryBtnText || t.cta.secondaryBtn)}
                  </motion.a>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer content={siteContent.footer} />

      {/* Hero Video Preview Modal */}
      {heroVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setHeroVideoOpen(false)}
          />
          <div className="relative z-10 w-full max-w-3xl bg-black rounded-3xl overflow-hidden border border-white/15 p-6 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <span className="text-sm font-bold text-gray-200">
                {language === "en" ? "Showcase Video: Meet the BIMCourse Ecosystem" : "Showcase Video: Mengenal Ekosistem BIMCourse"}
              </span>
              <button
                onClick={() => setHeroVideoOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-gray-950 rounded-2xl overflow-hidden border border-white/10 relative flex items-center justify-center">
              <video
                src="/hero-bg.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
