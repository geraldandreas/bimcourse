import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Siswa / Mahasiswa or any unauthorized role CANNOT access /dashboard
  if (user.role === "siswa" || (user.role as string) === "mahasiswa" || !["superadmin", "admin", "pengajar"].includes(user.role)) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0C0E12] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      <DashboardHeader user={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
