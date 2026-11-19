import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function PengajarLoading() {
  return (
    <DashboardSkeleton
      title="Ruang Kerja Pengajar"
      subtitle="Memuat silabus materi, review tugas capstone mahasiswa, & statistik kelas..."
      roleBadge="BIM INSTRUCTOR & MENTOR PORTAL"
      cardsCount={4}
    />
  );
}
