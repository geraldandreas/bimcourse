"use client";

import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  Building,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#14171d] border border-white/10 rounded-3xl p-8 space-y-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="h-6 w-36 rounded-lg bg-white/10" />
            </div>
            <div className="h-10 rounded-xl bg-white/5" />
            <div className="space-y-3">
              <div className="h-11 rounded-xl bg-white/10" />
              <div className="h-11 rounded-xl bg-white/10" />
            </div>
            <div className="h-12 rounded-full bg-amber-500/20" />
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");
  const confirmed = searchParams.get("confirmed");

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(urlError || null);
  const [successBanner, setSuccessBanner] = useState<string | null>(
    confirmed ? "Email Anda berhasil dikonfirmasi! Silakan login." : null
  );

  // Email Confirmation State
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
    message?: string;
  } | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (urlError) setErrorMsg(decodeURIComponent(urlError));
  }, [urlError]);

  // Standard Email/Password Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessBanner(null);
    setResendMsg(null);
    setUnconfirmedEmail(null);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister
      ? { name, email, password, organization, phone }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requireConfirmation) {
          setUnconfirmedEmail(data.email || email);
        }
        throw new Error(data.error || "Gagal autentikasi");
      }

      // Check if registration requires email confirmation
      if (isRegister && data.requireConfirmation) {
        setRegistrationSuccess({
          email: data.email || email,
          message: data.message,
        });
        setLoading(false);
        return;
      }

      const userRole = data.user?.role || "siswa";
      const destination =
        redirectPath === "/dashboard"
          ? userRole === "siswa" || userRole === "mahasiswa"
            ? "/profile?tab=edit"
            : `/dashboard/${userRole}`
          : redirectPath;
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  // Resend Email Confirmation
  const handleResendConfirmation = async (targetEmail: string) => {
    try {
      setResending(true);
      setResendMsg(null);
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMsg("Email konfirmasi berhasil dikirim ulang! Silakan cek kotak masuk atau spam.");
      } else {
        setErrorMsg(data.error || "Gagal mengirim ulang email konfirmasi.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setResending(false);
    }
  };

  // Direct Google Sign-In via Supabase OAuth (Production)
  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const redirectUrl = `${window.location.origin}/auth/confirm?redirect=${encodeURIComponent(redirectPath)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.warn("Google OAuth error:", err?.message);
      setErrorMsg(`Google OAuth: ${err?.message || "Gagal menghubungkan ke Google."}`);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Bar with Language Switcher & Back Link */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>{language === "en" ? "Back to Homepage" : "Kembali ke Beranda"}</span>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-8 pt-8 sm:pt-0">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1.5 border border-white/15 shadow-inner">
            <Image
              src="/logo.png"
              alt="BIMCourse"
              width={32}
              height={32}
              className="object-contain invert group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            BIMCourse
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/20">
              AEC PLATFORM
            </span>
          </span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-white">
          {registrationSuccess
            ? (language === "en" ? "Email Verification Required" : "Verifikasi Email Diperlukan")
            : isRegister
            ? t.auth.registerHeading
            : t.auth.loginHeading}
        </h2>
        <p className="mt-2 text-xs text-gray-400">
          {t.auth.subheading}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#14171d]/90 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Success Banner */}
          {successBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Resend Success Message */}
          {resendMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{resendMsg}</span>
            </div>
          )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>

                  {/* Action to resend verification if unconfirmed */}
                  {unconfirmedEmail && (
                    <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-gray-300">Belum terima email?</span>
                      <button
                        type="button"
                        onClick={() => handleResendConfirmation(unconfirmedEmail)}
                        disabled={resending}
                        className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer disabled:opacity-50"
                      >
                        {resending ? "Mengirim..." : "Kirim Ulang Link Konfirmasi"}
                      </button>
                    </div>
                  )}
                </div>
              )}

          {/* VIEW A: REGISTRATION SUCCESS - EMAIL CONFIRMATION REQUIRED */}
          {registrationSuccess ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{t.auth.confirmEmailTitle}</h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {t.auth.confirmEmailDesc}
                </p>
                <div className="mt-2 inline-block px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-300 font-mono text-xs font-semibold">
                  {registrationSuccess.email}
                </div>
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  {t.auth.confirmEmailInstruction}
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => handleResendConfirmation(registrationSuccess.email)}
                  disabled={resending}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  <span>{resending ? (language === "en" ? "Resending..." : "Mengirim Ulang...") : t.auth.resendBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(null);
                    setIsRegister(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {t.auth.confirmedBtn}
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: STANDARD LOGIN & REGISTER FORM */
            <>
              {/* Method 1: Google Sign-In */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer border border-gray-200"
                >
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>
                    {googleLoading
                      ? (language === "en" ? "Connecting Google Account..." : "Menghubungkan Akun Google...")
                      : isRegister
                      ? t.auth.googleRegisterBtn
                      : t.auth.googleBtn}
                  </span>
                </button>
                <p className="text-[11px] text-center text-gray-400 mt-2">
                  {t.auth.googleNote}
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#14171d] px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
                  {t.auth.orWithEmail}
                </span>
              </div>

              {/* Method 2: Email & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      {t.auth.nameLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.auth.namePlaceholder}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.auth.emailPlaceholder}
                      className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {t.auth.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={language === "en" ? "Min. 6 characters" : "Minimal 6 karakter"}
                      className="w-full px-4 py-3 pl-10 pr-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        {t.auth.orgLabel}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                        />
                        <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        {t.auth.phoneLabel}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t.auth.phonePlaceholder}
                          className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                      {language === "en"
                        ? "* After registration, a confirmation link will automatically be sent to your email."
                        : "* Setelah klik daftar, tautan konfirmasi akan otomatis dikirimkan ke email Anda."}
                    </p>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : isRegister ? (
                    t.auth.registerSubmit
                  ) : (
                    t.auth.loginSubmit
                  )}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-400">
                {isRegister ? (
                  <span>
                    {t.auth.haveAccount}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(false);
                        setErrorMsg(null);
                      }}
                      className="text-white font-bold hover:underline cursor-pointer"
                    >
                      {t.auth.signInHere}
                    </button>
                  </span>
                ) : (
                  <span>
                    {t.auth.noAccount}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(true);
                        setErrorMsg(null);
                      }}
                      className="text-white font-bold hover:underline cursor-pointer"
                    >
                      {t.auth.registerStudent}
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
