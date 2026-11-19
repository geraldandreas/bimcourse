export interface WebInstructor {
  id: string;
  name: string;
  role: string;
  experience: string;
  affiliation: string;
  expertise: string[];
  avatar: string;
  communityRole: string;
  isVisible: boolean;
}

export interface WebTestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  courseTaken: string;
}

export interface WebFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteContentConfig {
  sectionsVisibility: {
    hero: boolean;
    features: boolean;
    courses: boolean;
    roadmaps: boolean;
    community: boolean;
    instructors: boolean;
    quiz: boolean;
    testimonials: boolean;
    enterprise: boolean;
    faq: boolean;
    cta: boolean;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    statsRating: string;
    statsStudents: string;
    primaryCtaText: string;
    secondaryCtaText: string;
  };
  community: {
    badge: string;
    title: string;
    subtitle: string;
    activeMembersText: string;
    mentorBadgeText: string;
    cardHeading: string;
    cardDescription: string;
    instructorsBadge: string;
    instructorsTitle: string;
    instructorsSubtitle: string;
  };
  instructors: WebInstructor[];
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    items: WebTestimonialItem[];
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: WebFaqItem[];
  };
}

export const DEFAULT_SITE_CONTENT: SiteContentConfig = {
  sectionsVisibility: {
    hero: true,
    features: true,
    courses: true,
    roadmaps: true,
    community: true,
    instructors: true,
    quiz: true,
    testimonials: true,
    enterprise: true,
    faq: true,
    cta: true,
  },
  hero: {
    badge: "Platform Edukasi BIM Terdepan • Mengacu Mandat BIM PUPR & ISO 19650",
    titleLine1: "Learn Today",
    titleLine2: "Build Tomorrow",
    description:
      "Kuasai software arsitektur & rekayasa konstruksi digital dari praktisi teruji. Dari pemula hingga siap lolos tender dan berkarier di proyek berskala nasional.",
    statsRating: "4.94 / 5.0",
    statsStudents: "18,500+ Mahasiswa & Insinyur Telah Bergabung",
    primaryCtaText: "Eksplor Semua Kelas",
    secondaryCtaText: "Tonton Video Pengenalan",
  },
  community: {
    badge: "Ekosistem Belajar Kolaboratif",
    title: "Terhubung Langsung dengan Instruktur & Komunitas AEC Terbesar",
    subtitle:
      "Belajar BIM tidak boleh membuat Anda frustrasi sendirian saat menghadapi software crash, error family, atau standar BEP proyek. Di BIMCourse, Anda didampingi langsung oleh para praktisi teruji yang siap membantu Anda berkembang.",
    activeMembersText: "18.500+ Member Aktif",
    mentorBadgeText: "Mentor BUMN & Konsultan",
    cardHeading: "Bukan Sekadar Nonton Video, Tapi Berproses Bareng Praktisinya",
    cardDescription:
      "Setiap member BIMCourse mendapatkan akses seumur hidup ke grup diskusi eksklusif bersama instruktur. Anda bisa melampirkan file .rvt, .nwc, atau .dyn untuk dibedah solusinya.",
    instructorsBadge: "TIM PENGAJAR & MENTOR PRAKTISI",
    instructorsTitle: "Belajar Langsung dari Pelaku Industri Nyata",
    instructorsSubtitle:
      "Bukan sekadar akademisi, instruktur Anda adalah engineer dan arsitek aktif yang setiap hari memegang proyek infrastruktur dan gedung berskala nasional.",
  },
  instructors: [
    {
      id: "inst-1",
      name: "Ir. Hendra Wijaya, S.T., M.Eng.",
      role: "Senior BIM Manager & Auditor",
      experience: "12+ Tahun di Proyek Nasional & BUMN",
      affiliation: "Eks Tim BIM MRT & High-Rise Specialist",
      expertise: ["BIM Management", "ISO 19650", "Federated Model", "CDE"],
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      communityRole:
        "Memandu audit BEP, strategi koordinasi multidisiplin, dan review kesiapan tender BIM.",
      isVisible: true,
    },
    {
      id: "inst-2",
      name: "Budi Santoso, S.T., IPM",
      role: "Principal Structural BIM Specialist",
      experience: "10+ Tahun di Konsultan Struktur Internasional",
      affiliation: "Praktisi Struktur Baja & Precast Berat",
      expertise: ["Tekla Structures", "Revit Structure", "Rebar LOD 400", "Shop Drawing"],
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
      communityRole:
        "Mendampingi pemodelan pembesian detail LOD 400, shop drawing, dan volume rebar otomatis.",
      isVisible: true,
    },
    {
      id: "inst-3",
      name: "Dewi Anggraini, S.T., M.Ars.",
      role: "Architectural BIM Coordinator",
      experience: "8+ Tahun di Konsultan Arsitektur Global",
      affiliation: "Healthcare & Masterplan BIM Lead",
      expertise: ["Revit Architecture", "Parametric Family", "LOD 350", "Enscape"],
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      communityRole:
        "Membantu troubleshooting family parametrik kompleks, view template, dan standarisasi visual.",
      isVisible: true,
    },
    {
      id: "inst-4",
      name: "Rian Pratama, S.T.",
      role: "MEP BIM Lead & Computational Specialist",
      experience: "9+ Tahun di Fasilitas Industrial & MEP",
      affiliation: "Industrial Plant & Data Center Specialist",
      expertise: ["Revit MEP", "Navisworks Manage", "Dynamo Scripting", "Clash Detection"],
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
      communityRole:
        "Memandu clash detection otomatis, routing pipa/ducting efisien, dan script Dynamo harian.",
      isVisible: true,
    },
  ],
  testimonials: {
    badge: "Cerita Alumni",
    title: "Dipercaya Ribuan Praktisi AEC",
    subtitle:
      "Lihat bagaimana alumni BIMCourse bertransformasi dari drafter 2D menjadi BIM Coordinator dan memenangkan tender proyek skala nasional.",
    items: [
      {
        id: "testi-1",
        quote:
          "Dulu saya bingung bagaimana cara modeling rebar detail LOD 400 di Revit. Setelah ikut kelas dan bimbingan mentor BIMCourse, saya berhasil menyelesaikan proyek permodelan jembatan bentang panjang dan lolos seleksi BIM Engineer BUMN.",
        author: "Rizky Ramadhan, S.T.",
        role: "Junior BIM Modeler",
        company: "Konsultan Rekayasa Konstruksi",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        courseTaken: "Mastering Revit Architecture & Navisworks Pro",
      },
      {
        id: "testi-2",
        quote:
          "Materi ISO 19650 di sini sangat aplikatif, bukan cuma teori dokumen. Template BEP dan CDE framework yang diajarkan langsung kami terapkan di kantor untuk standar tender internasional.",
        author: "Ar. Nadia Paramitha, IAI",
        role: "Studio Principal & BIM Coordinator",
        company: "Archipelago Design Lab",
        avatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
        courseTaken: "BIM Management Standar ISO 19650",
      },
      {
        id: "testi-3",
        quote:
          "Automasi Dynamo menghemat 70% waktu kerja rutin saya untuk renumbering sheet dan room tag. Mentornya sabar membimbing bahkan untuk script yang error saat saya kerjakan proyek kantor.",
        author: "Fendi Wicaksono",
        role: "Architectural Drafter & BIM Specialist",
        company: "PT Total Bangun Persada (Alumni)",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        courseTaken: "Dynamo Visual Programming for Revit",
      },
    ],
  },
  faq: {
    badge: "Pusat Bantuan",
    title: "Sering Ditanyakan (FAQ)",
    subtitle:
      "Informasi seputar spesifikasi software, sistem kelas, sertifikat, dan pendampingan.",
    items: [
      {
        id: "faq-1",
        question: "Apakah saya perlu memiliki laptop spesifikasi tinggi untuk mulai belajar?",
        answer:
          "Untuk kelas pemula dasar (LOD 200), laptop dengan RAM 8GB dan prosesor Intel Core i5 / AMD Ryzen 5 sudah memadai. Untuk level mahir seperti Federated Model di Navisworks atau Tekla Rebar LOD 400, kami merekomendasikan RAM minimal 16GB dengan kartu grafis (GPU) dedicated seperti NVIDIA GTX/RTX.",
      },
      {
        id: "faq-2",
        question: "Apakah peserta akan mendapatkan lisensi software resmi?",
        answer:
          "Kami memberikan panduan lengkap dan berkas verifikasi resmi untuk mengaktifkan Autodesk Education License (gratis 1 tahun resmi dari Autodesk untuk mahasiswa/pengajar) serta lisensi trial praktisi industri.",
      },
      {
        id: "faq-3",
        question: "Apakah sertifikat BIMCourse diakui di industri konstruksi?",
        answer:
          "Ya. Sertifikat kelulusan BIMCourse dilengkapi dengan Unique Credential ID, daftar kompetensi teknis LOD yang dikuasai, dan portofolio capstone model yang dapat diverifikasi langsung oleh HRD atau tim rekrutmen konsultan/kontraktor.",
      },
      {
        id: "faq-4",
        question: "Bagaimana sistem pendampingan jika saya mengalami error pada software?",
        answer:
          "Anda memiliki akses tanpa batas ke grup diskusi eksklusif bersama mentor. Anda bisa screenshot atau mengirimkan file .rvt/.nwc Anda untuk dibantu solusinya dalam 24 jam kerja.",
      },
    ],
  },
};
