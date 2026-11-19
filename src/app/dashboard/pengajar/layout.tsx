import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function PengajarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/pengajar");
  }

  if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "pengajar") {
    redirect("/profile");
  }

  return <>{children}</>;
}
