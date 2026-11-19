const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BimCourse database seed...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Superadmin User
  const superadmin = await prisma.user.create({
    data: {
      name: "BimCourse SuperAdmin",
      email: "superadmin@bimcourse.id",
      password: defaultPassword,
      role: "superadmin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      bio: "Chief Technology & Curriculum Officer at BimCourse AEC",
      organization: "BimCourse Core Team",
      phone: "+62 811-9988-771",
    },
  });

  // 2. Admin User
  const admin = await prisma.user.create({
    data: {
      name: "BimCourse Operations Admin",
      email: "admin@bimcourse.id",
      password: defaultPassword,
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      bio: "Academic Operations & Quality Assurance Manager",
      organization: "BimCourse Academic Ops",
      phone: "+62 812-4455-667",
    },
  });

  // 3. Pengajar (Instructor) User
  const pengajar = await prisma.user.create({
    data: {
      name: "Ir. Rian Wicaksono, M.T.",
      email: "pengajar@bimcourse.id",
      password: defaultPassword,
      role: "pengajar",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      bio: "BIM Manager Senior (12+ tahun pengalaman proyek high-rise & LRT)",
      organization: "PT Wijaya Karya (Persero) Tbk",
      phone: "+62 813-8822-110",
    },
  });

  // 4. Siswa (Student) User
  const siswa = await prisma.user.create({
    data: {
      name: "Dimas Pratama",
      email: "siswa@bimcourse.id",
      password: defaultPassword,
      role: "siswa",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
      bio: "Mahasiswa Teknik Sipil & Junior BIM Modeler",
      organization: "Universitas Indonesia",
      phone: "+62 857-1122-334",
    },
  });

  console.log("✅ 4 Core Demo Users created:");
  console.log("   - Superadmin : superadmin@bimcourse.id / password123");
  console.log("   - Admin      : admin@bimcourse.id / password123");
  console.log("   - Pengajar   : pengajar@bimcourse.id / password123");
  console.log("   - Siswa      : siswa@bimcourse.id / password123");

  // 5. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: "Mastering Revit Architecture: Desain Konseptual ke DED & BoQ",
      slug: "revit-architecture-mastery",
      category: "BIM Modeling",
      level: "Beginner",
      isFree: false,
      price: 499000,
      originalPrice: 1250000,
      durationHours: 24,
      labsCount: 12,
      learningMode: "Self-Paced Online",
      language: "Bahasa Indonesia",
      badge: "Course",
      summary: "Kuasai pemodelan arsitektur 3D LOD 300, scheduling material otomatis, hingga ekspor gambar kerja DED berstandar ISO 19650.",
      overview: "Pelajari seni pemodelan Building Information Modeling (BIM) dari dasar konseptual hingga siap cetak gambar kerja DED proyek nyata. Kursus ini mengupas tuntas teknik pembuatan dinding compound, curtain wall kustom, tangga kompleks, hingga otomasi volume BoQ (Bill of Quantities) yang akurat dan sinkron real-time.\n\nDirancang khusus agar Anda siap bersaing di proyek berskala nasional sesuai regulasi Kementerian PUPR dan standar internasional ISO 19650.",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      published: true,
      instructorId: pengajar.id,
      modules: {
        create: [
          {
            title: "Pengenalan Ekosistem BIM & Setup Proyek Revit",
            duration: "2 Jam 30 Menit",
            order: 1,
            lessons: {
              create: [
                { title: "Filosofi BIM vs CAD 2D Konvensional", duration: "18 Menit", isFree: true, order: 1 },
                { title: "Setup Project Template, Grids & Levels", duration: "25 Menit", isFree: true, order: 2 },
                { title: "Memahami Family System vs Loadable Family", duration: "32 Menit", isFree: false, order: 3 },
              ],
            },
          },
          {
            title: "Pemodelan Dinding, Pintu, Jendela & Curtain Wall",
            duration: "3 Jam 15 Menit",
            order: 2,
            lessons: {
              create: [
                { title: "Compound Walls & Layer Material Structure", duration: "30 Menit", isFree: false, order: 1 },
                { title: "Custom Curtain Wall & Spider Fitting", duration: "45 Menit", isFree: false, order: 2 },
              ],
            },
          },
          {
            title: "Otomasi BoQ (Bill of Quantities) & DED Sheet Setup",
            duration: "3 Jam 45 Menit",
            order: 3,
            lessons: {
              create: [
                { title: "Material Takeoff & Parameter Rumus Biaya", duration: "35 Menit", isFree: false, order: 1 },
                { title: "Setup Title Block & Ekspor PDF Multi-sheet", duration: "40 Menit", isFree: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Navisworks Manage: Clash Detection, Simulasi 4D & 5D Cost",
      slug: "navisworks-manage-coordination",
      category: "BIM Coordination",
      level: "Intermediate",
      isFree: false,
      price: 599000,
      originalPrice: 1450000,
      durationHours: 35,
      labsCount: 18,
      learningMode: "Instructor-Led",
      language: "Bahasa Indonesia",
      badge: "Specialization",
      summary: "Simulasi federated model multisektor (Arsitektur, Struktur, MEP), otomatisasi clash matrix, dan integrasi time-cost Microsoft Project.",
      overview: "Pelajari peran krusial seorang BIM Coordinator dalam mengawal koordinasi lintas disiplin di proyek high-rise dan infrastruktur. Modul ini mengajarkan cara menyatukan file NWC/NWD/NWF, menyusun clash matrix cerdas yang membedakan clash minor dan major, mengekspor laporan koordinasi BCF, hingga menyimulasikan time schedule 4D dan pergerakan biaya 5D.",
      thumbnail: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?q=80&w=800&auto=format&fit=crop",
      published: true,
      instructorId: pengajar.id,
      modules: {
        create: [
          {
            title: "Federated Model Setup & File Formats (NWC, NWD, NWF)",
            duration: "2 Jam",
            order: 1,
            lessons: {
              create: [
                { title: "Penyatuan Model Revit, IFC, dan DWG ke Navisworks", duration: "25 Menit", isFree: true, order: 1 },
                { title: "Navigation, Sectioning, dan Walkthrough Camera", duration: "30 Menit", isFree: false, order: 2 },
              ],
            },
          },
          {
            title: "Clash Detective & Matrix Toleransi Antardisiplin",
            duration: "3 Jam",
            order: 2,
            lessons: {
              create: [
                { title: "Konfigurasi Rule Set Clash MEP vs Struktur", duration: "40 Menit", isFree: false, order: 1 },
                { title: "Export BCF Report untuk Koordinasi Lapangan", duration: "35 Menit", isFree: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  const courseFree = await prisma.course.create({
    data: {
      title: "Dasar-Dasar BIM & Mandat PUPR: Pengantar Transformasi Digital AEC",
      slug: "pengantar-bim-dan-mandat-pupr",
      category: "BIM Management",
      level: "Beginner",
      isFree: true,
      price: 0,
      originalPrice: 350000,
      durationHours: 10,
      labsCount: 4,
      learningMode: "Self-Paced Online",
      language: "Bahasa Indonesia",
      badge: "Free Course",
      summary: "Pahami fundamental Building Information Modeling, standardisasi ISO 19650, Common Data Environment (CDE), dan regulasi wajib BIM di Indonesia secara cuma-cuma.",
      overview: "Kursus pengantar gratis ini dirancang untuk mahasiswa dan profesional konstruksi pemula untuk memahami lanskap industri digital AEC saat ini. Anda akan mempelajari mengapa industri konstruksi bertransisi dari CAD ke BIM, apa itu level LOD (100-500), bagaimana siklus Common Data Environment (CDE) bekerja, serta apa saja persyaratan mandat BIM pada tender pemerintah.",
      thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop",
      published: true,
      instructorId: pengajar.id,
      modules: {
        create: [
          {
            title: "Evolusi Industri Konstruksi & Paradigma BIM",
            duration: "2 Jam",
            order: 1,
            lessons: {
              create: [
                { title: "Apa itu Building Information Modeling?", duration: "15 Menit", isFree: true, order: 1 },
                { title: "Perbedaan BIM vs 2D/3D CAD Konvensional", duration: "20 Menit", isFree: true, order: 2 },
                { title: "Mengenal Dimensi BIM (3D, 4D, 5D, 6D, 7D)", duration: "25 Menit", isFree: true, order: 3 },
              ],
            },
          },
          {
            title: "Regulasi PUPR & Standar Global ISO 19650",
            duration: "2 Jam 30 Menit",
            order: 2,
            lessons: {
              create: [
                { title: "Penerapan Mandat BIM Permen PUPR di Indonesia", duration: "30 Menit", isFree: true, order: 1 },
                { title: "Konsep CDE (Common Data Environment) & BEP", duration: "35 Menit", isFree: true, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  const courseDraft = await prisma.course.create({
    data: {
      title: "Tekla Structures: Detailing Baja & Beton Pracetak LOD 400",
      slug: "tekla-structures-detailing",
      category: "BIM Structure",
      level: "Advanced",
      isFree: false,
      price: 749000,
      originalPrice: 1850000,
      durationHours: 40,
      labsCount: 20,
      learningMode: "Self-Paced Online",
      language: "Bahasa Indonesia",
      badge: "Course",
      summary: "Pemodelan sambungan baja baut/las, penulangan beton pracetak otomatis, dan ekspor file NC untuk mesin workshop.",
      overview: "Kuasai software pemodelan struktur baja dan beton terkemuka di dunia. Pelajari pembuatan model pabrikasi LOD 400, sambungan custom components, otomatisasi penulangan rebar, hingga pembuatan laporan Bill of Materials (BOM) akurat untuk manufaktur.",
      thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
      published: false,
      instructorId: pengajar.id,
    },
  });

  // 6. Create Enrollment for Siswa
  await prisma.enrollment.create({
    data: {
      userId: siswa.id,
      courseId: course1.id,
      status: "ACTIVE",
      progress: 65.0,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: siswa.id,
      courseId: course2.id,
      status: "ACTIVE",
      progress: 20.0,
    },
  });

  // 7. Create Assignment Submission for Pengajar to Review
  await prisma.assignmentSubmission.create({
    data: {
      userId: siswa.id,
      courseId: course1.id,
      title: "Tugas Modul 2: Pemodelan Ruko 3 Lantai Sesuai Template BEP",
      fileUrl: "https://example.com/files/ruko-3-lantai-dimas-pratama.rvt",
      notes: "Pak Rian, mohon dicek untuk sambungan curtain wall di lantai 2 apakah sudah memenuhi kaidah LOD 300.",
      status: "PENDING",
    },
  });

  // 8. Create Audit Logs for Superadmin
  await prisma.auditLog.create({
    data: {
      actorId: superadmin.id,
      action: "SYSTEM_INITIALIZED",
      target: "SYSTEM",
      details: "Inisialisasi platform BimCourse dengan 4 role RBAC dan kurikulum standar PUPR.",
      ipAddress: "127.0.0.1",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "COURSE_APPROVED",
      target: course1.id,
      details: "Persetujuan publikasi kelas 'Mastering Revit Architecture' oleh kurator.",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("🎉 BimCourse database successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
