import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function SiswaLoading() {
  return (
    <DashboardSkeleton
      title="Portal Belajar Mahasiswa"
      subtitle="Memuat modul aktif, progress kurikulum, dan pengumpulan tugas..."
      roleBadge="STUDENT PORTAL"
      cardsCount={3}
    />
  );
}
