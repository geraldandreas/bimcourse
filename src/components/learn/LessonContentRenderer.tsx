"use client";

import React, { useState } from "react";
import { ZoomIn, X, ExternalLink, Image as ImageIcon } from "lucide-react";

interface LessonContentRendererProps {
  paragraphs: string[];
  className?: string;
}

interface ParsedImage {
  caption: string;
  align: "left" | "right" | "center";
  size: "small" | "medium" | "large" | "full";
  url: string;
}

export default function LessonContentRenderer({
  paragraphs,
  className = "",
}: LessonContentRendererProps) {
  const [zoomImageUrl, setZoomImageUrl] = useState<{ url: string; caption?: string } | null>(null);

  if (!paragraphs || paragraphs.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-gray-400 italic">
        Belum ada materi teks yang dituliskan untuk topik ini.
      </div>
    );
  }

  // Helper to parse image syntax: ![caption|align|size](url)
  const parseImageParagraph = (text: string): ParsedImage | null => {
    const trimmed = text.trim();
    // Regex matches ![alt](url)
    const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (!match) return null;

    const altPart = match[1] || "";
    const url = match[2]?.trim() || "";

    const parts = altPart.split("|").map((p) => p.trim());
    const caption = parts[0] || "";
    let align: "left" | "right" | "center" = "center";
    let size: "small" | "medium" | "large" | "full" = "medium";

    // Detect align
    for (const part of parts.slice(1)) {
      const lower = part.toLowerCase();
      if (lower === "left" || lower === "kiri") align = "left";
      else if (lower === "right" || lower === "kanan") align = "right";
      else if (lower === "center" || lower === "tengah") align = "center";
      else if (lower === "small" || lower === "kecil") size = "small";
      else if (lower === "medium" || lower === "sedang") size = "medium";
      else if (lower === "large" || lower === "besar") size = "large";
      else if (lower === "full" || lower === "penuh") size = "full";
    }

    return { caption, align, size, url };
  };

  // Helper to format inline bold, italic, code
  const renderFormattedText = (text: string) => {
    // If it's a heading ###
    if (text.startsWith("### ")) {
      return (
        <h4 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white pt-4 pb-1 clear-both tracking-tight">
          {text.replace(/^###\s*/, "")}
        </h4>
      );
    }
    if (text.startsWith("## ")) {
      return (
        <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white pt-5 pb-2 clear-both tracking-tight border-b border-black/5 dark:border-white/5">
          {text.replace(/^##\s*/, "")}
        </h3>
      );
    }

    // Bullet points
    if (text.startsWith("• ") || text.startsWith("- ") || text.startsWith("* ")) {
      const cleanBullet = text.replace(/^([•\-\*])\s*/, "");
      return (
        <li className="flex items-start gap-2.5 my-1.5 text-gray-700 dark:text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
          <span className="leading-relaxed">{parseInlineMarkdown(cleanBullet)}</span>
        </li>
      );
    }

    return (
      <p className="text-gray-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base my-3">
        {parseInlineMarkdown(text)}
      </p>
    );
  };

  // Inline markdown parser (bold **text**, italic *text*, code `code`)
  const parseInlineMarkdown = (str: string): React.ReactNode => {
    // Split by bold **
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-gray-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-gray-900 dark:text-zinc-100">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className={`prose-reader flow-root font-sans ${className}`}>
      {paragraphs.map((para, idx) => {
        const image = parseImageParagraph(para);

        if (image) {
          // Render image figure with MS Word wrapping behavior
          let containerClasses = "";
          let imgClasses = "";

          if (image.align === "left") {
            // Float Left (Text flows on the right)
            const widthClass =
              image.size === "small"
                ? "sm:max-w-[32%]"
                : image.size === "large"
                ? "sm:max-w-[60%]"
                : "sm:max-w-[46%]";
            containerClasses = `float-left mr-5 sm:mr-7 mb-4 max-w-full ${widthClass} clear-left rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] p-2 shadow-sm`;
            imgClasses = "w-full h-auto rounded-xl object-cover";
          } else if (image.align === "right") {
            // Float Right (Text flows on the left)
            const widthClass =
              image.size === "small"
                ? "sm:max-w-[32%]"
                : image.size === "large"
                ? "sm:max-w-[60%]"
                : "sm:max-w-[46%]";
            containerClasses = `float-right ml-5 sm:ml-7 mb-4 max-w-full ${widthClass} clear-right rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] p-2 shadow-sm`;
            imgClasses = "w-full h-auto rounded-xl object-cover";
          } else {
            // Center / Full Width Block
            const maxWClass =
              image.size === "small"
                ? "max-w-md mx-auto"
                : image.size === "medium"
                ? "max-w-2xl mx-auto"
                : "max-w-full";
            containerClasses = `my-6 clear-both ${maxWClass} rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] p-2.5 sm:p-3 shadow-sm text-center`;
            imgClasses = "max-h-[520px] w-auto mx-auto rounded-xl object-contain";
          }

          return (
            <figure key={idx} className={containerClasses}>
              <div
                className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-50 dark:bg-black/30"
                onClick={() => setZoomImageUrl({ url: image.url, caption: image.caption })}
                title="Klik untuk memperbesar gambar"
              >
                <img
                  src={image.url}
                  alt={image.caption || "Gambar materi modul"}
                  className={`${imgClasses} transition-transform duration-200 group-hover:scale-[1.01]`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
                  <ZoomIn className="w-4 h-4" />
                  <span>Perbesar</span>
                </div>
              </div>

              {image.caption && image.caption.trim().length > 0 && image.caption.trim() !== "none" && image.caption.trim() !== "-" && (
                <figcaption className="text-xs text-gray-500 dark:text-zinc-400 mt-2 text-center italic font-medium px-2 leading-relaxed">
                  {parseInlineMarkdown(image.caption)}
                </figcaption>
              )}
            </figure>
          );
        }

        // Normal paragraph or heading or bullet
        return <React.Fragment key={idx}>{renderFormattedText(para)}</React.Fragment>;
      })}

      {/* Clear floats at the end of the document */}
      <div className="clear-both" />

      {/* Lightbox Modal for Zooming Images */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="max-w-5xl w-full bg-white dark:bg-[#161B22] rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate pr-4">
                {zoomImageUrl.caption || "Pratinjau Gambar Penuh"}
              </span>
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center overflow-auto rounded-2xl bg-black/5 dark:bg-black/40 p-2">
              <img
                src={zoomImageUrl.url}
                alt={zoomImageUrl.caption || "Gambar besar"}
                className="max-h-[70vh] max-w-full object-contain rounded-xl"
              />
            </div>
            {zoomImageUrl.caption && (
              <p className="text-xs text-center text-gray-500 dark:text-zinc-400 italic">
                {zoomImageUrl.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
