import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/superadmin");
  }

  if (user.role !== "superadmin") {
    if (user.role === "siswa" || (user.role as string) === "mahasiswa") {
      redirect("/profile");
    } else {
      redirect(`/dashboard/${user.role}`);
    }
  }

  return <>{children}</>;
}
