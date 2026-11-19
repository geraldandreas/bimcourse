import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function SuperadminLoading() {
  return (
    <DashboardSkeleton
      title="SuperAdmin Control Hub"
      subtitle="Memuat metrik platform, manajemen pengguna, verifikasi pembayaran, & katalog kursus..."
      roleBadge="SUPERADMIN WORKSPACE"
      cardsCount={4}
    />
  );
}
