"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Compass,
  GraduationCap,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    organization?: string | null;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const roleMeta: Record<
    string,
    { label: string; badge: string; icon: any; color: string }
  > = {
    superadmin: {
      label: "SuperAdmin Workspace",
      badge: "SUPERADMIN",
      icon: ShieldCheck,
      color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    },
    admin: {
      label: "Admin Operations",
      badge: "ADMIN",
      icon: UserCheck,
      color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    },
    pengajar: {
      label: "Instructor Portal",
      badge: "PENGAJAR",
      icon: Compass,
      color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    siswa: {
      label: "Student LMS Portal",
      badge: "SISWA",
      icon: GraduationCap,
      color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    },
  };

  const currentMeta = roleMeta[user.role] || roleMeta.siswa;
  const RoleIcon = currentMeta.icon;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#12151B]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand + Role Badge */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center p-1 border border-black/10 dark:border-white/15">
              <Image
                src="/logo.png"
                alt="BIMCourse"
                width={24}
                height={24}
                className="object-contain dark:invert"
              />
            </div>
            <span className="font-bold text-lg text-gray-950 dark:text-white hidden sm:inline-block">
              BIMCourse
            </span>
          </Link>

          <span className="text-gray-300 dark:text-gray-600 hidden sm:inline-block">/</span>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${currentMeta.color}`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{currentMeta.badge}</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline-block">
              {currentMeta.label}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle + User Profile + View Website + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-xs font-bold font-mono">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline text-xs font-bold font-mono">Dark</span>
              </>
            )}
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-100/80 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-xs">
            <img
              src={
                user.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
              }
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20"
            />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-gray-900 dark:text-white max-w-[140px] truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[140px] truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* View Website */}
          <Link
            href="/"
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Lihat Website Utama"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
