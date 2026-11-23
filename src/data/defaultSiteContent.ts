export interface InstructorProject {
  id: string;
  title: string;
  year: string;
  category: string;
  location?: string;
  team?: string;
  tools: string[];
  description: string;
  highlights?: string[];
  image?: string;
  gallery?: string[];
  award?: string;
  link?: string;
}

export interface InstructorEducation {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  gpa?: string;
  honors?: string[];
}

export interface InstructorExperience {
  id?: string;
  role: string;
  company: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface InstructorAchievement {
  id?: string;
  year: string;
  title: string;
  event: string;
  organizer: string;
  rank?: string;
}

export interface InstructorCertificate {
  id?: string;
  year: string;
  title: string;
  issuer: string;
  credentialUrl?: string;
  image?: string;
}

export interface InstructorOrganization {
  id?: string;
  role: string;
  organization: string;
  period: string;
  description?: string;
}

export interface InstructorWebinar {
  id?: string;
  year: string;
  title: string;
  organizer: string;
  type?: string;
}

export interface WebInstructor {
  id: string;
  slug?: string;
  name: string;
  role: string;
  experience: string;
  affiliation: string;
  expertise: string[];
  avatar: string;
  communityRole: string;
  isVisible: boolean;
  // CV & Portfolio Extensions
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolioLink?: string;
  bio?: string;
  education?: InstructorEducation[];
  workExperience?: InstructorExperience[];
  projects?: InstructorProject[];
  achievements?: InstructorAchievement[];
  certificates?: InstructorCertificate[];
  organizations?: InstructorOrganization[];
  webinars?: InstructorWebinar[];
  softwareSkills?: { name: string; category?: string }[];
  technicalSkills?: string[];
  softSkills?: string[];
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
  features: {
    badge: string;
    title: string;
    subtitle: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card1Tag1: string;
    card1Tag2: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    card2Step1: string;
    card2Step2: string;
    card2Step3: string;
    card3Badge: string;
    card3Title: string;
    card3Desc: string;
    card3ChatAuthor: string;
    card3ChatRole: string;
    card3ChatQuote: string;
    card3LinkText: string;
  };
  courses: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  roadmaps: {
    badge: string;
    title: string;
    subtitle: string;
  };
  community: {
    badge: string;
    title: string;
    subtitle: string;
    activeMembersText: string;
    mentorBadgeText: string;
    cardHeading: string;
    cardDescription: string;
    pillar1Badge: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Badge: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Badge: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Badge: string;
    pillar4Title: string;
    pillar4Desc: string;
    instructorsBadge: string;
    instructorsTitle: string;
    instructorsSubtitle: string;
  };
  instructors: WebInstructor[];
  quiz: {
    badge: string;
    title: string;
    subtitle: string;
    step1Heading: string;
    step2Heading: string;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    items: WebTestimonialItem[];
  };
  enterprise: {
    badge: string;
    title: string;
    subtitle: string;
    benefit1Title: string;
    benefit1Desc: string;
    benefit2Title: string;
    benefit2Desc: string;
    benefit3Title: string;
    benefit3Desc: string;
    formTitle: string;
    formSubtitle: string;
    formBtnText: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: WebFaqItem[];
  };
  cta: {
    badge: string;
    title: string;
    subtitle: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  footer: {
    tagline: string;
    address: string;
    email: string;
    phone: string;
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
  features: {
    badge: "Keunggulan Ekosistem BIMCourse",
    title: "Metode Teruji untuk Akselerasi Karier Konstruksi Digital",
    subtitle:
      "Kurikulum praktis, roadmap terarah, dan bimbingan langsung dari praktisi industri.",
    card1Badge: "Standar Industri Terkini",
    card1Title: "Skills for Real Opportunities",
    card1Desc:
      "Kurikulum kami mengacu langsung pada Permen PUPR No. 22/2018 dan ISO 19650. Anda tidak hanya belajar klik software, tapi memahami alur kerja tender riil.",
    card1Tag1: "ISO 19650 & Mandat PUPR",
    card1Tag2: "LOD 200 - 400",
    card2Badge: "Jalur Karier Spesifik",
    card2Title: "Your Goals, Our Support",
    card2Desc:
      "Dapatkan panduan langkah demi langkah dari pemula hingga siap lolos uji kompetensi atau promosi jabatan sebagai BIM Coordinator & Manager.",
    card2Step1: "BIM Modeler (Dasar s/d LOD 300)",
    card2Step2: "BIM Coordinator (Clash & 4D Time)",
    card2Step3: "BIM Manager (BEP & ISO 19650)",
    card3Badge: "Bimbingan Mentor Aktif",
    card3Title: "Terhubung Bersama Instruktur & Praktisi",
    card3Desc:
      "Tanya jawab langsung saat error modeling atau butuh review portfolio. Mentor kami adalah engineer dan arsitek aktif dari konsultan ternama.",
    card3ChatAuthor: "Eddy Tuasikal, S.Ars",
    card3ChatRole: "Lead BIM Specialist",
    card3ChatQuote:
      "Family Revit kamu sudah rapi parameternya, tinggal perbaiki penamaan sub-kategori sesuai BEP tender.",
    card3LinkText: "Gabung Komunitas",
  },
  courses: {
    badge: "Kurikulum Praktisi Terakreditasi",
    title: "Katalog Kelas Spesialisasi BIM",
    subtitle:
      "Dari pemula hingga BIM Manager. Kurikulum berbasis proyek nyata, standar ISO 19650, dan studi kasus kontraktor terkemuka.",
    searchPlaceholder: "Cari Revit, Navisworks, Dynamo...",
  },
  roadmaps: {
    badge: "Roadmap Spesialisasi Karier",
    title: "Peta Jalan Karier BIM Terstruktur",
    subtitle:
      "Jangan buang waktu belajar tanpa arah. Pilih jalur yang sesuai dengan latar belakang dan target posisi impian Anda di industri arsitektur & konstruksi.",
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
    pillar1Badge: "Q&A Tanpa Batas",
    pillar1Title: "Diskusi & Troubleshooting Kendala Modeling",
    pillar1Desc:
      "Mengalami error family Revit, kendala export IFC, atau crash script Dynamo? Tanyakan langsung di forum. Instruktur dan mentor aktif merespon dengan screenshot, tips, dan file solusi nyata.",
    pillar2Badge: "Live Mentoring Rutin",
    pillar2Title: "Sesi Bedah Model & Sharing Proyek Nyata",
    pillar2Desc:
      "Ikuti webinar live dan sesi bedah model rutin setiap bulan. Instruktur membongkar studi kasus asli dari proyek infrastruktur, gedung tinggi, dan bandara langsung di software BIM.",
    pillar3Badge: "Feedback 1-on-1",
    pillar3Title: "Review Portofolio & Capstone Langsung Mentor",
    pillar3Desc:
      "Pastikan hasil model dan gambar kerja Anda siap diajukan ke perusahaan impian atau klien tender. Dapatkan feedback konstruktif atas ketepatan LOD, parameter, dan kerapian model Anda.",
    pillar4Badge: "Aset & Peluang",
    pillar4Title: "Library Family BIM, Template & Info Loker Eksklusif",
    pillar4Desc:
      "Akses ratusan family Revit terstandar, template proyek siap pakai, serta jejaring loker BIM Modeler dan Coordinator yang dibagikan secara eksklusif antar member & relasi instruktur.",
    instructorsBadge: "TIM PENGAJAR & MENTOR ",
    instructorsTitle: "Belajar Langsung dari Pelaku Industri Nyata",
    instructorsSubtitle:
      "Bukan sekadar akademisi, instruktur Anda adalah engineer dan arsitek aktif yang setiap hari memegang proyek infrastruktur dan gedung berskala nasional.",
  },
  quiz: {
    badge: "AI Career Pathfinder",
    title: "Bingung Mulai Belajar dari Mana?",
    subtitle:
      "Jawab 2 pertanyaan singkat ini. Kami rekomendasikan kelas yang paling efektif untuk target karier Anda.",
    step1Heading: "Pilih Latar Belakang / Profesi Anda Saat Ini:",
    step2Heading: "Apa Target Utama Anda?",
  },
  enterprise: {
    badge: "Solusi Korporasi & Kontraktor",
    title: "BIMCourse for Enterprise",
    subtitle:
      "Akselerasi kesiapan digital tim teknik Anda menyambut mandat BIM dari Kementerian PUPR dan BUMN. Latih tim arsitektur, struktur, dan MEP dalam satu ekosistem kolaboratif standar ISO 19650.",
    benefit1Title: "In-House Training & Custom Case Study",
    benefit1Desc:
      "Materi disesuaikan dengan template Revit, standard family, dan proyek riil yang sedang ditangani perusahaan Anda.",
    benefit2Title: "ISO 19650 BEP & CDE Framework Audit",
    benefit2Desc:
      "Konsultasi penyusunan dokumen tender BIM Execution Plan dan standardisasi penamaan file multi-disiplin.",
    benefit3Title: "Corporate Analytics Dashboard",
    benefit3Desc:
      "Pantau progress belajar tim engineer & drafter dengan laporan kelulusan dan evaluasi portfolio berkala.",
    formTitle: "Diskusikan Kebutuhan Tim Anda",
    formSubtitle:
      "Tim konsultan kami akan menghubungi Anda dalam waktu 1x24 jam untuk demo kurikulum dan penawaran khusus.",
    formBtnText: "Kirim Permintaan Konsultasi",
  },
  cta: {
    badge: "Garansi Kepuasan Belajar",
    title: "Siap Naik Level di Era Konstruksi Digital?",
    subtitle:
      "Bergabung sekarang dan dapatkan akses seumur hidup ke materi, update software berkala, dan komunitas alumni terbaik di Indonesia.",
    primaryBtnText: "Mulai Belajar Sekarang",
    secondaryBtnText: "Lihat Peta Jalan Karier",
  },
  footer: {
    tagline:
      "Platform edukasi teknologi BIM terdepan di Indonesia. Berstandar ISO 19650 dan didampingi langsung oleh praktisi berpengalaman.",
    address: "Jakarta Selatan & BSD City, Indonesia",
    email: "halo@bimcourse.id",
    phone: "+62 821 1900 8890 (WhatsApp Student Advisor)",
  },
  instructors: [
    {
      id: "inst-1",
      slug: "eddy-tuasikal",
      name: "Eddy Tuasikal, S.Ars",
      role: "BIM Modeller & Architectural Designer",
      experience: "3 Tahun di Proyek Nasional & BUMN",
      affiliation: "Eks Tim BIM MRT & High-Rise Specialist",
      expertise: [
        "BIM Management",
        "ISO 19650",
        "Federated Model",
        "CDE",
        "Autodesk Revit",
        "Navisworks",
        "Enscape",
      ],
      avatar:
        "https://uybkpfcnbotlofbwzvxx.supabase.co/storage/v1/object/public/uploads/1794155212128-WhatsApp_Image_2026-10-29_at_09_41_33__1_.jpeg",
      communityRole:
        "Memandu audit BEP, strategi koordinasi multidisiplin, dan review kesiapan tender BIM.",
      isVisible: true,
      email: "eddy.tuasikal18@gmail.com",
      phone: "+62 813 7070 4533",
      location: "Romang Lompoa, Kec. Bontomarannu, Kab. Gowa, Sulawesi Selatan",
      linkedin: "https://www.linkedin.com/in/eddy-tuasikal",
      portfolioLink:
        "https://drive.google.com/file/d/1J5p2Ev_K4_qgxFCv89rBD6bnnKx4OI8f/view?usp=sharing",
      bio: "Lulusan Sarjana Arsitektur Universitas Hasanuddin dengan konsentrasi studi Bahan Bangunan, Struktur, dan Konstruksi (LBE). Berfokus pada Architectural Design, Interior Design, Tropical Sustainable Architecture, dan sangat antusias terhadap teknologi BIM. Mahir mengoperasikan software desain standar industri seperti Autodesk Revit, AutoCAD, Navisworks, Enscape, SketchUp, dan D5 Render untuk menerjemahkan konsep desain konseptual menjadi gambar kerja detail (DED) berstandar tinggi.",
      education: [
        {
          degree: "Bachelor of Architecture (S.Ars)",
          institution: "Universitas Hasanuddin (Makassar, Indonesia)",
          period: "Agu 2021 - Mei 2026",
          gpa: "3.79 / 4.00",
          honors: [
            "Konsentrasi Studi Struktur & Konstruksi (LBE)",
            "2nd Runner Up Architectural Design Week Competition Untar 2024",
            "Top 15 Finalist Residential Texture Design Competition UTY 2024",
            "Peserta Sayembara Desain Arsitektur Undip 2024",
          ],
        },
      ],
      workExperience: [
        {
          role: "BIM Estimator",
          company: "PT Midi Utama Indonesia Tbk",
          period: "Sep 2026 - Sekarang",
          location: "Tangerang, Banten",
          highlights: [
            "Perhitungan volume material (Quantity Take-Off/BoQ) berbasis model BIM 3D",
            "Sinkronisasi estimasi biaya proyek dengan jadwal konstruksi",
          ],
        },
        {
          role: "Principal, Conceptor & Estimator",
          company: "Freelancer Architectural Design & BIM Coordinator",
          period: "Jan 2025 - Sekarang",
          location: "Makassar, Sulawesi Selatan",
          highlights: [
            "Menyelesaikan berbagai proyek arsitektur dan renovasi dari tahap konsep hingga gambar kerja DED",
            "Membuat gambar teknis 2D dan visualisasi 3D fotorealistik untuk membantu klien dalam pengambilan keputusan desain",
            "Menyusun Rencana Anggaran Biaya (RAB) akurat berdasarkan gambar kerja dan spesifikasi material teknis",
            "Manajemen proyek secara mandiri memastikan ketepatan jadwal dan kualitas standar konstruksi",
          ],
        },
        {
          role: "Architectural Intern",
          company: "Dinas PUTRPP Cipta Karya Kab. Maros",
          period: "Sep 2024 - Des 2024",
          location: "Maros, Sulawesi Selatan",
          highlights: [
            "Membantu penyusunan gambar desain gedung dan infrastruktur sesuai standar teknis pemerintah",
            "Melakukan pengawasan pekerjaan konstruksi lapangan dengan membandingkan kondisi riil terhadap gambar kerja & RKS",
            "Dokumentasi progres proyek melalui foto berkala, catatan lapangan, dan laporan monitoring fisik",
            "Koordinasi bersama pengawas lapangan, konsultan, dan kontraktor untuk kelancaran pelaksanaan proyek",
          ],
        },
      ],
      organizations: [
        {
          role: "Staff Departemen Minat Ilmiah & Bakat",
          organization:
            "Himpunan Mahasiswa Arsitektur (HMA) Fakultas Teknik Universitas Hasanuddin",
          period: "Agu 2023 - Mei 2024",
          description:
            "Mempersiapkan sarana dan mengimplementasikan program kerja pengembangan minat bakat serta keilmuan arsitektur mahasiswa.",
        },
        {
          role: "Staff Divisi Publikasi & Dokumentasi",
          organization:
            "Kepanitiaan Archiray IX - Departemen Arsitektur Universitas Hasanuddin",
          period: "Feb 2023 - Mei 2023",
          description:
            "Mengelola dokumentasi visual, materi publikasi, dan persiapan teknis event tahunan arsitektur berskala nasional.",
        },
      ],
      webinars: [
        {
          year: "2024",
          title: "Webinar 'Innovations in Eco-Friendly Architecture'",
          organizer: "Ecobuild Indonesia",
          type: "Webinar Nasional",
        },
        {
          year: "2024",
          title: "Webinar 'Designing the Future Heritage: Heritage and Management'",
          organizer: "Magister Arsitektur Fakultas Teknik Universitas Tarumanagara",
          type: "Webinar Nasional",
        },
        {
          year: "2023",
          title: "Kuliah Umum 'Prospects for Architect Professional Education (PPAR) in Indonesia'",
          organizer: "Kampus Fakultas Teknik Universitas Hasanuddin",
          type: "Kuliah Umum",
        },
        {
          year: "2022",
          title: "Webinar Nasional Archiray VIII 'Perception of Space: New Living Spaces'",
          organizer: "Departemen Arsitektur Universitas Hasanuddin",
          type: "Webinar Nasional",
        },
        {
          year: "2021",
          title: "Webinar 'Adaptive Housing'",
          organizer: "Departemen Arsitektur Universitas Hasanuddin",
          type: "Webinar",
        },
      ],
      achievements: [
        {
          year: "2024",
          title: "2nd Runner Up (Juara 3)",
          event:
            "Architectural Design Week Competition 'Enlighted Space Light in Space'",
          organizer: "Universitas Tarumanagara (UNTAR)",
          rank: "Juara 3 Nasional",
        },
        {
          year: "2024",
          title: "Top 15 Finalist",
          event:
            "Residential Texture Design Competition 'Waste as Design'",
          organizer: "Universitas Teknologi Yogyakarta (UTY)",
          rank: "Top 15 Finalis",
        },
        {
          year: "2024",
          title: "Peserta Terpilih Sayembara Desain Arsitektur",
          event:
            "Architectural Design Competition 'Humanization of Urban Space in Industry 5.0'",
          organizer: "Universitas Diponegoro (UNDIP)",
          rank: "Peserta Terpilih",
        },
      ],
      projects: [
        {
          id: "proj-aura",
          title: "Aura Pavilion",
          year: "2024",
          category: "Sayembara Paviliun & Ruang Publik",
          location: "Tebet Eco Park (Zona Community Lawn), Jakarta Selatan",
          team: "Nurjannah, Ghifari Aulia Ramadhani, Eddy Tuasikal",
          tools: ["Autodesk Revit", "SketchUp", "Chaos Enscape"],
          award: "2nd Runner Up - Untar Architectural Design Week 2024",
          description:
            "Desain paviliun ruang publik yang mengintegrasikan aspek estetika pencahayaan alami, struktur kanopi parametrik organik ramah lingkungan, dan ruang komunal interaktif bertingkat.",
          highlights: [
            "Analisis pencahayaan daylight simulasi matahari posisi 22 Desember (09.00 - 16.00 WIB)",
            "Struktur kanopi peneduh organik dengan area sirkulasi lantai dasar dan lantai layang (Lt. 1 & Lt. 2)",
            "Detail potongan melintang, perspektif malam fotorealistik, dan denah komunal",
          ],
          image: "/instructors/eddy/portfolio-page-3.png",
          gallery: [
            "/instructors/eddy/portfolio-page-3.png",
            "/instructors/eddy/portfolio-page-4.png",
            "/instructors/eddy/portfolio-page-5.png",
            "/instructors/eddy/portfolio-page-6.png",
            "/instructors/eddy/portfolio-page-14.png",
          ],
        },
        {
          id: "proj-breathe",
          title: "The Breathe House",
          year: "2024",
          category: "Co-Housing & Sustainable Residence",
          location: "Mergangsan, Kota Yogyakarta, D.I. Yogyakarta",
          team: "Muh. Nurul Ikhsan, Ghifari Aulia Ramadhani, Eddy Tuasikal",
          tools: ["Autodesk Revit", "SketchUp", "Chaos Enscape"],
          award: "Top 15 Finalist - Sayembara Texture UTY 2024",
          description:
            "Konsep hunian komunal ramah lingkungan perkotaan yang menjawab tantangan kepadatan kota dengan prinsip gerakan zero anorganik 5R, Rainwater Harvesting terintegrasi, dan Food Estate sayuran mandiri.",
          highlights: [
            "Sistem Rainwater Harvesting dengan filtrasi air tanah untuk efisiensi penggunaan sumber daya air",
            "Ruang Food Estate hidroponik di lantai 3 (sayuran kubis, tomat, wortel, jahe) untuk ketahanan pangan keluarga",
            "Fasad bata terakota bernafas untuk sirkulasi silang dan kenyamanan termal tropis",
          ],
          image: "/instructors/eddy/portfolio-page-7.png",
          gallery: [
            "/instructors/eddy/portfolio-page-7.png",
            "/instructors/eddy/portfolio-page-8.png",
            "/instructors/eddy/portfolio-page-9.png",
          ],
        },
        {
          id: "proj-ombrello",
          title: "D' Ombrello Park",
          year: "2024",
          category: "Co-Park & Smart Urban Architecture",
          location: "Jl. Selamet Riyadi, Ujung Pandang, Makassar, Sulawesi Selatan",
          team: "Muh. Nurul Ikhsan, Diky Mukti Agung Laksoono, Eddy Tuasikal",
          tools: ["SketchUp", "Chaos Enscape"],
          award: "Sayembara Undip DISCO 7th 2024",
          description:
            "Taman publik adaptif berkonsep Sustainable Architecture yang menggabungkan kanopi payung pintar bersolar panel, mesin penetral CO2, dan air purifier mandiri energi untuk ruang hijau sehat.",
          highlights: [
            "Smart Umbrella Canopy dengan sel surya terbarukan dan sistem pembersih udara mandiri",
            "Zoning sirkulasi taman: Jogging track terbuka, floral area tematik, dan reading/resting space",
            "Orientasi tapak adaptif iklim tropis pesisir Makassar",
          ],
          image: "/instructors/eddy/portfolio-page-10.png",
          gallery: [
            "/instructors/eddy/portfolio-page-10.png",
            "/instructors/eddy/portfolio-page-11.png",
            "/instructors/eddy/portfolio-page-12.png",
          ],
        },
      ],
      certificates: [
        {
          year: "2024",
          title: "2nd Runner Up - Architectural Design Week 2024",
          issuer: "Universitas Tarumanagara (UNTAR)",
          image: "/instructors/eddy/portfolio-page-16.png",
        },
        {
          year: "2024",
          title: "Top 15 Finalist - Sayembara Texture 2024 'Waste as Design'",
          issuer: "Universitas Teknologi Yogyakarta (UTY)",
          image: "/instructors/eddy/portfolio-page-16.png",
        },
        {
          year: "2024",
          title: "Piagam Penghargaan Peserta - DISCO 7th",
          issuer: "Universitas Diponegoro (UNDIP)",
          image: "/instructors/eddy/portfolio-page-16.png",
        },
        {
          year: "2024",
          title:
            "Certificate of Participation - Innovations in Eco-Friendly Architecture",
          issuer: "Ecobuild Indonesia",
          image: "/instructors/eddy/portfolio-page-17.png",
        },
        {
          year: "2024",
          title: "Certificate of Appreciation - Designing the Future Heritage",
          issuer: "Magister Arsitektur Universitas Tarumanagara",
          image: "/instructors/eddy/portfolio-page-17.png",
        },
      ],
      softwareSkills: [
        { name: "Autodesk Revit", category: "BIM & CAD" },
        { name: "AutoCAD", category: "BIM & CAD" },
        { name: "Navisworks", category: "BIM & Coordination" },
        { name: "SketchUp", category: "3D Modeling" },
        { name: "Chaos Enscape", category: "Rendering & Visualization" },
        { name: "D5 Render", category: "Rendering & Visualization" },
        { name: "Canva", category: "Graphic Design" },
        { name: "Microsoft Office", category: "Productivity" },
      ],
      technicalSkills: [
        "Architectural Design",
        "BIM Modeling LOD 300 - 350",
        "Interior Design",
        "Tropical Sustainable Design",
        "Daylight Simulation",
        "BoQ / Cost Estimation",
        "Working Drawing (DED)",
        "Freehand Sketching",
      ],
      softSkills: [
        "Problem Solving",
        "Adaptability",
        "Analytical Thinking",
        "Team Collaboration",
        "Project Coordination",
        "Effective Communication",
        "Time Management",
      ],
    },
    {
      id: "inst-2",
      slug: "hazael-randy",
      name: "Hazael Randy Aprilian, S.Ars",
      role: "Principal Structural BIM Specialist",
      experience: "10+ Tahun di Konsultan Struktur Internasional",
      affiliation: "Praktisi Struktur Baja & Precast Berat",
      expertise: [
        "Tekla Structures",
        "Revit Structure",
        "Rebar LOD 400",
        "Shop Drawing",
      ],
      avatar:
        "https://uybkpfcnbotlofbwzvxx.supabase.co/storage/v1/object/public/uploads/1794155364866-Tangkapan_Layar_2026-11-08_pukul_23_28_17.png",
      communityRole:
        "Mendampingi pemodelan pembesian detail LOD 400, shop drawing, dan volume rebar otomatis.",
      isVisible: true,
      bio: "Praktisi dan konsultan Structural BIM Specialist dengan pengalaman mendalam pada pemodelan pembesian rebar detail LOD 400, fabrikasi struktur baja bentang panjang, dan koordinasi multidisciplinary CDE.",
      technicalSkills: [
        "Structural BIM LOD 400",
        "Tekla Structures",
        "Steel Detailing",
        "Precast Connection",
        "Rebar Scheduling",
      ],
      softwareSkills: [
        { name: "Tekla Structures", category: "BIM Structure" },
        { name: "Revit Structure", category: "BIM Structure" },
        { name: "AutoCAD", category: "CAD" },
        { name: "Navisworks Manage", category: "Coordination" },
      ],
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
