"use client";

import { Quote, Star } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/animations/MotionWrappers";
import { DEFAULT_SITE_CONTENT, WebTestimonialItem } from "@/data/defaultSiteContent";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TestimonialsSectionProps {
  content?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    items?: WebTestimonialItem[];
  };
}

export default function TestimonialsSection({
  content = DEFAULT_SITE_CONTENT.testimonials,
}: TestimonialsSectionProps) {
  const { language, t } = useLanguage();
  const items = content?.items && content.items.length > 0
    ? content.items
    : DEFAULT_SITE_CONTENT.testimonials.items;

  return (
    <section className="relative z-10 w-full bg-white dark:bg-[#09090B] border-b border-black/10 dark:border-white/10 py-24 scroll-mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Indicator Divider */}
        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-xs">05</span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            {language === "en" ? "ALUMNI STORIES & TESTIMONIALS" : (content?.badge || "CERITA ALUMNI & TESTIMONI")}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:border-white/10" />
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 hidden sm:inline">SECTION 05 / 07</span>
        </div>

        <FadeIn direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/35 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              {language === "en" ? t.testimonials.badge : (content?.badge || "Cerita Alumni")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-950 dark:text-white mb-4">
              {language === "en" ? t.testimonials.title : (content?.title || "Dipercaya Ribuan Praktisi AEC")}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base">
              {language === "en"
                ? t.testimonials.subtitle
                : (content?.subtitle ||
                  "Lihat bagaimana alumni BIMCourse bertransformasi dari drafter 2D menjadi BIM Coordinator dan memenangkan tender proyek skala nasional.")}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <StaggerItem key={item.id || idx}>
              <HoverCard lift={-6} scale={1.01} className="h-full">
                <div
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-400/40 transition-all relative flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <Quote className="w-8 h-8 text-amber-400/50 dark:text-amber-400/30" />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed italic mb-6">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-6 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"}
                        alt={item.author}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {item.author}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                          {item.role}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-500">
                          {item.company}
                        </p>
                      </div>
                    </div>

                    {item.courseTaken && (
                      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10">
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 block mb-0.5">
                          {t.testimonials.completedCourse}
                        </span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 line-clamp-1">
                          {item.courseTaken}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
