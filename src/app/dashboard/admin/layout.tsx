import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/admin");
  }

  if (user.role !== "superadmin" && user.role !== "admin") {
    if (user.role === "siswa" || (user.role as string) === "mahasiswa") {
      redirect("/profile");
    } else {
      redirect(`/dashboard/${user.role}`);
    }
  }

  return <>{children}</>;
}
