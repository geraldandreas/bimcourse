"use client";

import { useEffect, useRef } from "react";

interface HeroVideoBackgroundProps {
  videoUrl?: string;
  posterImageUrl?: string;
}

const isImageMedia = (url: string) =>
  /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url);

export default function HeroVideoBackground({
  videoUrl = "/hero-bg.mp4",
  posterImageUrl,
}: HeroVideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaSrc = videoUrl?.trim() || "/hero-bg.mp4";
  const showImageOnly = isImageMedia(mediaSrc);

  useEffect(() => {
    if (showImageOnly) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    video.load();

    const tryPlay = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          const onCanPlay = () => {
            video.play().catch(() => {});
            video.removeEventListener("canplay", onCanPlay);
          };
          video.addEventListener("canplay", onCanPlay);
        });
      }
    };

    tryPlay();

    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [mediaSrc, showImageOnly]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 bg-black"
    >
      {showImageOnly ? (
        <img
          src={mediaSrc}
          alt="Hero Background"
          className="w-full h-full object-cover object-center scale-105"
          aria-hidden="true"
        />
      ) : (
        <video
          key={mediaSrc}
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={posterImageUrl || undefined}
          className="w-full h-full object-cover object-center scale-105 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
          aria-hidden="true"
        >
          <source src={mediaSrc} type="video/mp4" />
        </video>
      )}

      {/* Dark Cinematic Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
    </div>
  );
}
