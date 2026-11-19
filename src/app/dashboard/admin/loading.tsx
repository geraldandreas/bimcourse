import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function AdminLoading() {
  return (
    <DashboardSkeleton
      title="Admin Operations"
      subtitle="Memuat persetujuan kelas, katalog modul, dan aktivitas operasional..."
      roleBadge="ADMIN PORTAL"
      cardsCount={4}
    />
  );
}
