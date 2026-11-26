"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#14171d] border border-white/10 rounded-3xl p-8 text-center space-y-4 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto" />
            <div className="h-6 w-48 rounded-lg bg-white/10 mx-auto" />
            <div className="h-3.5 w-64 rounded bg-white/5 mx-auto" />
          </div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Menghubungkan akun Anda ke BIMCourse...");

  useEffect(() => {
    let isHandled = false;

    const syncAndRedirect = async (user: any) => {
      if (isHandled || !user || !user.email) return;
      isHandled = true;

      try {
        setStatus("loading");
        setMessage("Menyiapkan akun Mahasiswa Anda...");
        const syncRes = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0],
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          }),
        });

        if (syncRes.ok) {
          setStatus("success");
          const targetUrl = searchParams.get("redirect") || "/profile?tab=edit";
          setMessage("Berhasil masuk! Mengalihkan ke halaman tujuan...");
          setTimeout(() => {
            router.push(targetUrl);
            router.refresh();
          }, 800);
        } else {
          const data = await syncRes.json();
          throw new Error(data.error || "Gagal sinkronisasi sesi akun.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Gagal memproses sesi otentikasi.");
      }
    };

    // 1. Listen for Supabase auth state change (catches hash fragment tokens automatically)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !isHandled) {
        await syncAndRedirect(session.user);
      }
    });

    // 2. Check if a session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user && !isHandled) {
        syncAndRedirect(data.session.user);
      }
    });

    // 3. Check query parameters
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (code && !isHandled) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (data?.user && !isHandled) {
          syncAndRedirect(data.user);
        } else {
          // Server-side callback fallback
          fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`).then((res) => {
            if (res.ok) {
              setStatus("success");
              router.push("/profile");
              router.refresh();
            }
          });
        }
      });
    }

    if (tokenHash && type && !isHandled) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any }).then(({ data, error }) => {
        if (data?.user && !isHandled) {
          syncAndRedirect(data.user);
        } else {
          fetch(
            `/api/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`
          ).then((res) => {
            if (res.ok) {
              setStatus("success");
              router.push("/profile");
              router.refresh();
            }
          });
        }
      });
    }

    // Fallback timeout: if after 4 seconds nothing has triggered, display error
    const timer = setTimeout(() => {
      if (!isHandled) {
        setStatus("error");
        setMessage("Sesi otentikasi tidak ditemukan atau telah kedaluwarsa. Silakan coba masuk kembali.");
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      authListener?.subscription?.unsubscribe();
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#14171d] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        {status === "loading" && (
          <div className="space-y-3 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 mx-auto" />
            <div className="h-2 w-32 rounded-full bg-amber-400/30 mx-auto" />
          </div>
        )}

        {status === "success" && (
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        )}

        {status === "error" && (
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
        )}

        <h2 className="text-xl font-bold text-white">
          {status === "loading"
            ? "Memproses Konfirmasi"
            : status === "success"
            ? "Konfirmasi Berhasil"
            : "Konfirmasi Gagal"}
        </h2>

        <p className="text-xs text-gray-300 leading-relaxed">{message}</p>

        {status === "error" && (
          <div className="pt-2">
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all cursor-pointer"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
