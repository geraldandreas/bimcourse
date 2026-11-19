export interface Course {
  id: string;
  title: string;
  slug: string;
  category: "modeling" | "coordination" | "automation" | "infrastructure" | "management";
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  durationHours: number;
  modulesCount: number;
  price: number;
  originalPrice: number;
  badge?: "Bestseller" | "Pilihan Industri" | "Baru" | "Populer";
  thumbnail: string;
  software: string[];
  instructor: {
    name: string;
    role: string;
    company: string;
    avatar: string;
  };
  summary: string;
  keyLearnings: string[];
  curriculum: {
    title: string;
    lessons: string[];
    duration: string;
  }[];
}

export const CATEGORIES = [
  { id: "all", label: "Semua Kategori" },
  { id: "modeling", label: "BIM Modeling (Revit/Tekla)" },
  { id: "coordination", label: "Clash & Coordination" },
  { id: "automation", label: "Dynamo & Otomasi" },
  { id: "infrastructure", label: "Sipil & Infrastruktur" },
  { id: "management", label: "ISO 19650 & BEP" },
] as const;

export const COURSES: Course[] = [
  {
    id: "cmvs58z5q000yquytb8ls3752",
    title: "Revit Basic",
    slug: "revit-basic",
    category: "modeling",
    level: "Beginner",
    rating: 4.9,
    reviewsCount: 152,
    studentsCount: 1250,
    durationHours: 40,
    modulesCount: 2,
    price: 749000,
    originalPrice: 1850000,
    badge: "Pilihan Industri",
    thumbnail: "/uploads/1793198698640-Doc_and_Marty_with_Sci-Fi_Remote-removebg-preview.png",
    software: ["Autodesk Revit"],
    instructor: {
      name: "Eddy Tuasikal, S.Ars",
      role: "Lead BIM Specialist",
      company: "PT Midi Utama Indonesia",
      avatar: "/uploads/1793242145121-WhatsApp_Image_2026-10-29_at_09_41_33.jpeg",
    },
    summary:
      "Pelajari konsep dasar Building Information Modeling (BIM) di industri AEC, pengenalan software Autodesk, hingga alur kerja pemodelan Autodesk Revit standar industri.",
    keyLearnings: [
      "Konsep dasar BIM & integrasi data di industri konstruksi AEC",
      "Pengenalan software utama ekosistem Autodesk BIM",
      "Tingkatan kematangan dan dimensi BIM (3D hingga 7D)",
      "Workflow pemodelan terstruktur dan standar kompetensi Revit",
    ],
    curriculum: [
      {
        title: "Bab 1: BIM & Industri AEC",
        duration: "2.5 jam",
        lessons: [
          "1.0 Introduction to BIM & AEC",
          "1.1 Software BIM Autodesk Populer",
          "1.2 Tingkatan & Dimensi BIM",
        ],
      },
      {
        title: "Bab 2: Pengenalan & Workflow Autodesk Revit",
        duration: "2.5 jam",
        lessons: [
          "2.0 What's Revit?",
          "2.1 Tingkatan Kompetensi Revit",
          "2.2 Alur Workflow Terstruktur",
        ],
      },
    ],
  },
];

export const ROADMAPS = [
  {
    id: "modeler",
    title: "BIM Modeler Track",
    subtitle: "Untuk Arsitek, Drafter 2D & Fresh Graduate",
    duration: "6 - 8 Minggu",
    targetRole: "Junior to Mid BIM Modeler (Arsitektur / Struktur / MEP)",
    salaryRange: "Rp 6.000.000 - Rp 11.000.000 / bln",
    steps: [
      {
        phase: "Tahap 1",
        title: "Dasar Parametric 3D & Revit Fundamentals",
        description: "Transisi dari mindset CAD 2D ke model parametrik cerdas. Menguasai grid, level, wall compound, dan standard families.",
        deliverable: "Model Rumah Tinggal 2 Lantai (LOD 200)",
      },
      {
        phase: "Tahap 2",
        title: "Detailed Modeling & Custom Families (LOD 300)",
        description: "Membuat elemen fasad, curtain wall, dan komponen parametrik custom dengan parameter dimensi fleksibel.",
        deliverable: "Parametric Family Library siap pakai",
      },
      {
        phase: "Tahap 3",
        title: "DED Documentation & Automated BoQ",
        description: "Pengaturan view templates, schedules quantity take-off, callouts, hingga penerbitan sheet DED siap konstruksi.",
        deliverable: "Set Lengkap Dokumen DED & BoQ Volume",
      },
    ],
  },
  {
    id: "coordinator",
    title: "BIM Coordinator Track",
    subtitle: "Untuk Site Engineer, Lead Drafter & Konsultan Pengawas",
    duration: "8 - 10 Minggu",
    targetRole: "BIM Coordinator / Multi-discipline Lead",
    salaryRange: "Rp 12.000.000 - Rp 20.000.000 / bln",
    steps: [
      {
        phase: "Tahap 1",
        title: "Multi-Disciplinary Model Federation",
        description: "Menggabungkan model Arsitektur, Struktur, dan MEP dalam satu koordinat georeferensi yang presisi di Navisworks & ACC.",
        deliverable: "Federated Master Model Proyek Gedung",
      },
      {
        phase: "Tahap 2",
        title: "Clash Matrix & Resolution Management",
        description: "Merumuskan kriteria toleransi benturan antar sistem pipa vs balok vs plafon dan menerbitkan laporan BCF ke tim kontraktor.",
        deliverable: "Clash Report Matrix & Issue Tracker BCF",
      },
      {
        phase: "Tahap 3",
        title: "4D Schedule Integration & Constructability Review",
        description: "Menghubungkan timeline Microsoft Project ke elemen 3D untuk simulasi tahapan kerja dan deteksi bottleneck logistik lapangan.",
        deliverable: "Simulasi 4D TimeLiner & Presentasi Evaluasi",
      },
    ],
  },
  {
    id: "manager",
    title: "BIM Manager & Digital Lead",
    subtitle: "Untuk Project Manager, Senior Architect & Principal",
    duration: "10 - 12 Minggu",
    targetRole: "BIM Manager / Head of Digital Engineering",
    salaryRange: "Rp 22.000.000 - Rp 40.000.000+ / bln",
    steps: [
      {
        phase: "Tahap 1",
        title: "ISO 19650 Governance & Information Delivery",
        description: "Menguasai siklus manajemen informasi standar internasional: OIR, AIR, PIR, dan penyusunan EIR untuk dokumen tender.",
        deliverable: "Dokumen Template EIR Proyek Standar ISO",
      },
      {
        phase: "Tahap 2",
        title: "BEP Drafting, MIDP & Resource Allocation",
        description: "Merancang dokumen BIM Execution Plan resmi pre & post-contract, matrix tanggung jawab RACI, dan jadwal pengiriman data MIDP.",
        deliverable: "Dokumen Master BEP Siap Tender BUMN",
      },
      {
        phase: "Tahap 3",
        title: "CDE Architecture, Audit & As-Built Handover",
        description: "Menyiapkan cloud infrastructure (ACC/Trimble), protokol keamanan data, proses audit kepatuhan model, dan serah terima AIM.",
        deliverable: "CDE Deployment Plan & Audit Checklist",
      },
    ],
  },
];

export const TESTIMONIALS = [
  {
    quote: "Sebelumnya saya drafter AutoCAD 2D biasa. Setelah ikut bootcamp Revit & Navisworks di BIMCourse, portofolio saya tembus seleksi BIM Modeler untuk proyek MRT Jakarta Fase 2. Materinya sangat aplikatif!",
    author: "Rizky Ramadhan, S.T.",
    role: "Junior BIM Modeler",
    company: "Konsultan Rekayasa Konstruksi",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    courseTaken: "Mastering Revit Architecture & Navisworks Pro",
  },
  {
    quote: "Materi ISO 19650 dan BEP dari Mas Kevin benar-benar membuka mata. Waktu kantor kami ikut tender proyek BUMN di IKN, dokumen BEP yang kami susun langsung lolos evaluasi teknis tahap satu.",
    author: "Ar. Nadia Paramitha, IAI",
    role: "Studio Principal & BIM Coordinator",
    company: "Archipelago Design Lab",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    courseTaken: "BIM Management Standar ISO 19650",
  },
  {
    quote: "Kursus Dynamo di sini ngebantu banget. Dulu saya butuh 3 hari buat atur penomoran 800 pintu dan ruangan di proyek hotel. Sekarang pakai script Dynamo yang diajarin cuma butuh 4 menit!",
    author: "Fendi Wicaksono",
    role: "Architectural Drafter & BIM Specialist",
    company: "PT Total Bangun Persada (Alumni)",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
    courseTaken: "Dynamo Visual Programming for Revit",
  },
];

export const CAPSTONE_PROJECTS = [
  {
    title: "Menara Sudirman 45-Lantai: LOD 350 Multidisiplin",
    category: "High-Rise Commercial",
    software: ["Revit", "Navisworks", "Enscape"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    highlights: ["2,400+ resolved clashes", "Automated BoQ Bill of Quantities", "4D Erection Sequence"],
    lod: "LOD 350",
  },
  {
    title: "Stasiun Sentral LRT: Precast & Rebar Detailing",
    category: "Public Transportation",
    software: ["Tekla Structures", "Trimble Connect"],
    image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop",
    highlights: ["Full Bar Bending Schedules", "Precast Segment Erection Plans", "Zero Clearance Errors"],
    lod: "LOD 400",
  },
  {
    title: "Interchange Tol & Koridor Lereng Perbukitan",
    category: "Highway & Earthwork",
    software: ["Civil 3D", "InfraWorks"],
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?q=80&w=800&auto=format&fit=crop",
    highlights: ["Balance Cut & Fill Analysis", "Drone LiDAR Point Cloud Mesh", "Drainage Catchment Simulation"],
    lod: "Civil BIM",
  },
];

export const FAQS = [
  {
    question: "Apakah saya perlu memiliki laptop spesifikasi tinggi untuk mulai belajar?",
    answer: "Untuk tingkat awal (Revit Architecture dasar), laptop dengan RAM 16GB, prosesor Intel i5/AMD Ryzen 5, dan GPU diskrit 4GB sudah mencukupi. Di kelas kami juga diajarkan tips optimasi model (worksets, simplify geometry) agar laptop tidak lag saat memuat proyek skala menengah.",
  },
  {
    question: "Apakah peserta akan mendapatkan lisensi software resmi?",
    answer: "Kami membimbing seluruh peserta untuk mendaftar Autodesk Education Access resmi secara legal (bagi mahasiswa/dosen) atau memanfaatkan free trial 30-hari resmi dari Autodesk & Trimble untuk pengerjaan capstone project.",
  },
  {
    question: "Apakah sertifikat BIMCourse diakui di industri konstruksi?",
    answer: "Ya, sertifikat kelulusan kami dilengkapi dengan ID verifikasi unik, portfolio link proyek capstone yang telah dievaluasi oleh instruktur praktisi, dan silabus yang merujuk pada kompetensi SKKNI BIM Indonesia serta standar ISO 19650.",
  },
  {
    question: "Bagaimana sistem pendampingan jika saya mengalami error pada software?",
    answer: "Setiap kelas memiliki forum diskusi komunitas eksklusif di Discord/Telegram, sesi Q&A mingguan bersama instruktur, dan review tugas 1-on-1 untuk memastikan kendala teknis dan workflow Anda terselesaikan.",
  },
];
