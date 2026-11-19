"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ShieldAlert, Lock, EyeOff } from "lucide-react";

interface AntiScreenshotShieldProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userName?: string | null;
  enabled?: boolean;
}

export default function AntiScreenshotShield({
  children,
  userEmail,
  userName,
  enabled = true,
}: AntiScreenshotShieldProps) {
  const [isBlackout, setIsBlackout] = useState(false);
  const [blackoutReason, setBlackoutReason] = useState<string>("Layar Dilindungi");

  const blackoutTriggeredAtRef = useRef<number>(0);

  const clearSystemClipboard = useCallback(() => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("").catch(() => {});
      }
    } catch {}
  }, []);

  const triggerBlackout = useCallback((reason = "Tangkapan Layar Dinonaktifkan") => {
    blackoutTriggeredAtRef.current = Date.now();
    setIsBlackout(true);
    setBlackoutReason(reason);
    clearSystemClipboard();
    // PERMANENT: No setTimeout auto-dismiss! Stays solid black until student explicitly clicks the button!
  }, [clearSystemClipboard]);

  useEffect(() => {
    if (!enabled) return;

    // 1. WINDOW BLUR (Triggers instantly when macOS screenshot crosshair or external app steals focus)
    const handleBlur = () => {
      triggerBlackout("Layar Dilindungi (Aplikasi Eksternal / Screenshot Terdeteksi)");
    };

    // 2. WINDOW FOCUS
    const handleFocus = () => {
      // Do NOT auto-restore! Remains black until student deliberately clicks the dismiss button
    };

    // 3. VISIBILITY CHANGE (Tab switch or window minimized)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerBlackout("Layar Dilindungi");
      }
    };

    // 4. KEYBOARD SHORTCUTS INTERCEPTION
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.key === "Meta" || e.code === "MetaLeft" || e.code === "MetaRight";
      const isShift = e.shiftKey || e.key === "Shift" || e.code === "ShiftLeft" || e.code === "ShiftRight";
      const isAlt = e.altKey || e.key === "Alt" || e.code === "AltLeft" || e.code === "AltRight";
      const isCtrl = e.ctrlKey || e.key === "Control" || e.code === "ControlLeft" || e.code === "ControlRight";

      // 1. NEVER block Developer / Responsive / Console shortcuts:
      // Cmd + Option + J, Cmd + Option + I, F12, Device toolbar, etc.
      if (isAlt) return;
      if (["j", "J", "i", "I", "c", "C", "m", "M", "r", "R"].includes(e.key)) return;
      if (["KeyJ", "KeyI", "KeyC", "KeyM", "KeyR", "F12"].includes(e.code)) return;

      // 2. Mac screenshot combinations: Cmd + Shift
      if (isMeta && isShift) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout("Tangkapan Layar macOS Dinonaktifkan");
        return false;
      }

      // 3. Mac screenshot combinations with numbers 3, 4, 5
      if (isMeta && ["3", "4", "5", "$", "%"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout("Tangkapan Layar macOS Dinonaktifkan");
        return false;
      }

      // 4. Windows Snipping Tool combinations: Win + Shift + S or Ctrl + Shift + S
      if ((isMeta && isShift) || (isCtrl && isShift && (e.key === "s" || e.key === "S" || e.code === "KeyS"))) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout("Tangkapan Layar Dinonaktifkan");
        return false;
      }

      // 5. PrintScreen key (Windows / Linux)
      if (e.key === "PrintScreen" || e.keyCode === 44 || e.code === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout("Tangkapan Layar PrintScreen Dinonaktifkan");
        return false;
      }

      // 6. Browser Print: Ctrl + P / Cmd + P
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P" || e.code === "KeyP")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout("Pencetakan Dokumen Dinonaktifkan");
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Never auto-remove blackout on keyUp!
      if (e.key === "PrintScreen" || e.keyCode === 44 || e.code === "PrintScreen") {
        triggerBlackout("Tangkapan Layar PrintScreen Dinonaktifkan");
      }
    };

    // 5. CONTEXT MENU & COPY PREVENTION
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      clearSystemClipboard();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Attach high-priority capture-phase listeners
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [enabled, triggerBlackout, clearSystemClipboard]);

  // Click on blackout button to dismiss when student has canceled screenshot and is ready to read
  const handleDismissBlackout = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Cooldown protection: Ignore clicks within 1200ms of blackout trigger
    // (Prevents screenshot crosshair drag/click from instantly dismissing the shield)
    if (Date.now() - blackoutTriggeredAtRef.current < 1200) {
      return;
    }
    clearSystemClipboard();
    setIsBlackout(false);
  };

  return (
    <div
      className="relative w-full h-full select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* 1. PRINT PROTECTION STYLES (Prints and PDF exports render 100% pure pitch-black) */}
      <style jsx global>{`
        @media print {
          html,
          body,
          #__next,
          main,
          div,
          section,
          article,
          p,
          span,
          h1,
          h2,
          h3,
          img,
          svg {
            background-color: #000000 !important;
            color: #000000 !important;
            visibility: hidden !important;
            display: none !important;
          }
          body::before {
            content: "" !important;
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: #000000 !important;
            z-index: 999999999 !important;
          }
        }
      `}</style>

      {/* 2. DYNAMIC WATERMARK (Anti-Camera phone recording/photography) */}
      {(userEmail || userName) && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-10 overflow-hidden flex flex-wrap gap-24 p-12 opacity-[0.035] dark:opacity-[0.045] select-none"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="transform -rotate-24 text-[11px] font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap tracking-wider"
            >
              BIMCourse AEC • {userEmail || userName} • Terlindungi Hak Cipta
            </div>
          ))}
        </div>
      )}

      {/* 3. NORMAL CONTENT (Hidden when blackout is active so nothing can be captured beneath) */}
      <div
        className={
          isBlackout
            ? "invisible opacity-0 pointer-events-none transition-opacity duration-75"
            : "visible opacity-100 transition-opacity duration-150"
        }
      >
        {children}
      </div>

      {/* 4. SOLID PITCH BLACK BLACKOUT OVERLAY (Dark screen per user request: 'gelap pas di ss') */}
      {isBlackout && (
        <div
          id="anti-screenshot-blackout"
          role="alert"
          aria-live="assertive"
          className="fixed inset-0 z-[99999999] bg-black flex flex-col items-center justify-center text-center p-6 select-none"
          style={{
            backgroundColor: "#000000",
            color: "#FFFFFF",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999999,
          }}
        >
          <div className="max-w-md space-y-4 p-8 rounded-3xl bg-[#080808] border border-white/10 shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg">
              <EyeOff className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Layar Dilindungi BIMCourse AEC
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tangkapan layar (*screenshot*) dan perekaman layar dinonaktifkan demi perlindungan hak cipta materi kurikulum.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDismissBlackout}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold font-mono transition-all border border-white/20 shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Klik di sini untuk melanjutkan belajar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
