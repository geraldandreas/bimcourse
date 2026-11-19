"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useCart } from "@/lib/cart/CartContext";

interface NavbarProps {
  onSearchClick?: () => void;
  cartCount?: number;
  solidBg?: boolean;
}

export default function Navbar({ onSearchClick, cartCount = 0, solidBg = false }: NavbarProps) {
  const { cartCount: liveCartCount, setIsCartOpen } = useCart();
  const effectiveCartCount = cartCount || liveCartCount;

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    id?: string;
    name: string;
    role: string;
    avatar?: string | null;
    email?: string;
  } | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch logged in user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const isSolid = solidBg || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isSolid
          ? "bg-white/95 dark:bg-[#0F1115]/95 backdrop-blur-md border-b border-black/10 dark:border-white/10 py-3.5 shadow-xs dark:shadow-xl"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center p-1.5 shadow-inner transition-colors ${
              isSolid
                ? "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15"
                : "bg-white/10 border border-white/15"
            }`}
          >
            <Image
              src="/logo.png"
              alt="BIMCourse Logo"
              width={28}
              height={28}
              className={`object-contain group-hover:scale-105 transition-transform ${
                isSolid ? "dark:invert" : "invert"
              }`}
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-xl font-bold tracking-tight flex items-center gap-1.5 transition-colors ${
                isSolid ? "text-gray-950 dark:text-white" : "text-white"
              }`}
            >
              BIMCourse
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/35">
                AEC
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          className={`hidden md:flex items-center gap-4 lg:gap-6 xl:gap-7 text-xs lg:text-sm font-medium transition-colors ${
            isSolid
              ? "text-zinc-600 dark:text-gray-300"
              : "text-gray-300"
          }`}
        >
          <Link
            href="/#courses"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {t.navbar.courses}
          </Link>
          <Link
            href="/#roadmaps"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {t.navbar.roadmaps}
          </Link>
          <Link
            href="/#community"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {t.navbar.community}
          </Link>
          <Link
            href="/#quiz"
            className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{t.navbar.quiz}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          </Link>
          <Link
            href="/#enterprise"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {t.navbar.enterprise}
          </Link>
          <Link
            href="/#faq"
            className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {t.navbar.faq}
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Search & Cart (Only when logged in) */}
          {user && (
            <>
              <button
                onClick={onSearchClick}
                type="button"
                className={`p-2 rounded-full transition-colors shrink-0 ${
                  isSolid
                    ? "text-zinc-700 hover:text-black hover:bg-black/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title={t.navbar.searchTitle}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 rounded-full transition-colors hidden sm:flex items-center shrink-0 cursor-pointer ${
                  isSolid
                    ? "text-zinc-700 hover:text-black hover:bg-black/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title={t.navbar.cartTitle}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {effectiveCartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black text-[10px] font-black flex items-center justify-center shadow-xs">
                    {effectiveCartCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Theme & Language Switchers (Desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <ThemeToggle isDarkBg={!isSolid} />
            <div className="hidden sm:inline-flex">
              <LanguageSwitcher isDarkBg={!isSolid} />
            </div>
          </div>

          {/* User state / Login */}
          {user ? (
            user.role === "siswa" || user.role === "mahasiswa" ? (
              <div className="hidden sm:flex items-center shrink-0">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-semibold group ${
                    isSolid
                      ? "bg-black/5 hover:bg-black/10 border border-black/10 text-gray-900 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:border-white/15 dark:text-white shadow-xs"
                      : "bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white shadow-sm"
                  }`}
                  title="Lihat Profil Saya"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`;
                      }}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/30"
                    />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isSolid
                          ? "bg-zinc-200 text-zinc-900 dark:bg-white/20 dark:text-white"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span
                    className={`font-semibold max-w-[100px] truncate transition-colors ${
                      isSolid
                        ? "text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-zinc-300"
                        : "text-white group-hover:text-zinc-300"
                    }`}
                  >
                    {user.name}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
                    isSolid
                      ? "bg-black/5 text-zinc-800 border border-black/10 dark:bg-white/10 dark:text-zinc-200 dark:border-white/15"
                      : "bg-white/10 text-zinc-200 border border-white/15"
                  }`}
                >
                  {user.role}
                </span>
                <Link
                  href={`/dashboard/${user.role}`}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md active:scale-95 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>{t.navbar.dashboard}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black text-xs sm:text-sm font-black rounded-full hover:from-amber-300 hover:to-yellow-400 transition-all shadow-[0_2px_15px_rgba(245,180,50,0.3)] active:scale-95 hidden sm:inline-flex items-center gap-1.5 shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.navbar.login}</span>
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isSolid
                ? "text-zinc-700 hover:text-black hover:bg-black/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-6 py-5 space-y-4 shadow-xl dark:shadow-2xl animate-in fade-in slide-in-from-top-2 ${
            isSolid
              ? "bg-white dark:bg-[#0F1115] border-black/10 dark:border-white/10"
              : "bg-[#0F1115] border-white/10"
          }`}
        >
          {/* Mobile Controls Row */}
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isSolid
                ? "border-black/10 dark:border-white/10"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <ThemeToggle isDarkBg={false} />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t.navbar.langSwitch}:
              </span>
            </div>
            <LanguageSwitcher isDarkBg={false} />
          </div>

          <div className="flex flex-col space-y-3 text-base font-medium text-gray-800 dark:text-gray-200">
            <a
              href="#courses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-black dark:hover:text-white transition-colors"
            >
              {t.navbar.courses}
            </a>
            <a
              href="#roadmaps"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-black dark:hover:text-white transition-colors"
            >
              {t.navbar.roadmaps}
            </a>
            <a
              href="#community"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-black dark:hover:text-white transition-colors"
            >
              {t.navbar.community}
            </a>
            <a
              href="#quiz"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-black dark:hover:text-white transition-colors"
            >
              {t.navbar.quiz}
            </a>
            <a
              href="#enterprise"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-black dark:hover:text-white transition-colors"
            >
              {t.navbar.enterprise}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-black dark:hover:text-white transition-colors"
            >
              {t.navbar.faq}
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {user ? (
              user.role === "siswa" || user.role === "mahasiswa" ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`;
                        }}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-white/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-bold text-white truncate">{user.name}</div>
                      <div className="text-xs text-zinc-400 truncate">
                        {t.navbar.profile}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  {/* Mobile Cart Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Keranjang Pembelian</div>
                        <div className="text-xs text-gray-400">Checkout &amp; bayar kursus</div>
                      </div>
                    </div>
                    {effectiveCartCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-white text-black font-bold text-xs font-mono">
                        {effectiveCartCount}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-mono">Kosong</span>
                    )}
                  </button>
                </div>
              ) : (
                <Link
                  href={`/dashboard/${user.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-white text-black font-bold text-sm shadow-md hover:bg-zinc-200"
                >
                  {t.navbar.dashboard} ({user.role.toUpperCase()})
                </Link>
              )
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 shadow-md"
              >
                {t.navbar.login}
              </Link>
            )}

            {/* Mobile Theme & Language Selector */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Tampilan &amp; Bahasa</span>
              <div className="flex items-center gap-2">
                <ThemeToggle isDarkBg={false} />
                <LanguageSwitcher isDarkBg={false} variant="minimal" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
