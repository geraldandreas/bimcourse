export type Language = "id" | "en";

export const translations = {
  id: {
    // Navbar
    navbar: {
      courses: "Katalog Kelas",
      roadmaps: "Jalur Karier",
      community: "Komunitas",
      quiz: "Tes Jalur BIM",
      enterprise: "Untuk Perusahaan",
      faq: "FAQ",
      searchTitle: "Cari Kelas BIM",
      cartTitle: "Keranjang Pembelian",
      login: "Masuk",
      register: "Daftar",
      dashboard: "Buka Dashboard",
      profile: "Profil Saya",
      logout: "Keluar",
      langSwitch: "Bahasa",
    },

    // Profile Page
    profilePage: {
      badge: "PORTAL PROFIL SISWA",
      title: "Profil Saya & Sertifikat",
      subtitle: "Kelola portofolio, akses materi kelas aktif, kumpul tugas, dan verifikasi sertifikat resmi Anda.",
      tabCourses: "Kelas Diikuti",
      tabCertificates: "Cek Sertifikat",
      tabAssignments: "Tugas & Capstone",
      tabEdit: "Edit Profil",
      changeAvatar: "Ganti Foto Profil",
      uploadingPhoto: "Mengunggah foto...",
      photoUpdated: "Foto profil berhasil diperbarui!",
      editSuccess: "Profil berhasil disimpan!",
      saveBtn: "Simpan Perubahan",
      savingBtn: "Menyimpan...",
      fullName: "Nama Lengkap",
      emailLabel: "Alamat Email",
      phoneLabel: "Nomor WhatsApp / HP",
      orgLabel: "Kampus / Instansi / Perusahaan",
      bioLabel: "Bio Singkat",
      bioPlaceholder: "Ceritakan latar belakang arsitektur atau fokus BIM Anda...",
      noCourses: "Belum ada kelas yang diikuti.",
      exploreCourses: "Eksplor Katalog Kelas",
      continueLearning: "Lanjutkan Belajar",
      modulesCount: "Modul Silabus",
      progressLabel: "Kemajuan Belajar",
      verifiedCertificate: "Sertifikat Resmi Terverifikasi",
      viewCertificate: "Lihat Sertifikat",
      downloadPdf: "Cetak / Unduh PDF",
      copyLink: "Salin Link Verifikasi",
      linkCopied: "Link verifikasi berhasil disalin!",
      close: "Tutup",
      issuedOn: "Diterbitkan pada",
      credentialId: "ID Kredensial",
      standards: "Standar Kompetensi",
      logout: "Keluar Akun",
      memberSince: "Bergabung sejak",
      completedBadge: "Selesai",
      inProgressBadge: "Sedang Berjalan",
      uploadTaskBtn: "Kumpul Tugas Portofolio",
      statusPending: "MENUNGGU REVIEW",
      statusApproved: "LOLOS VERIFIKASI",
      statusRevision: "PERLU REVISI",
      feedbackTitle: "Catatan Masukan dari Mentor:",
      noSubmissions: "Belum ada tugas portofolio yang dikumpulkan.",
      tabTransactions: "Transaksi & Bayar",
      verifiedBadge: "Terverifikasi",
      completeProfileTitle: "Lengkapi Profil Mahasiswa Anda",
      completeProfileDesc: "Nomor WhatsApp dan nama instansi/kampus Anda diperlukan untuk penerbitan sertifikat kelulusan BIM berlisensi & konfirmasi pemesanan kelas.",
      completeProfileBtn: "Lengkapi Sekarang",
      pendingPaymentTitle: "Pembayaran Kelas Sedang Diverifikasi SuperAdmin",
      pendingPaymentDesc: "Bukti transfer pembayaran ({count} kelas) telah diterima dan sedang diperiksa admin (estimasi 5-15 menit). Modul kelas & video materi akan aktif otomatis setelah diverifikasi.",
      checkStatusBtn: "Cek Status Transaksi",
      editSubtitle: "Perbarui nama lengkap, institusi, dan kontak Anda agar tercetak presisi di sertifikat kelulusan.",
      emailCannotChange: "Email akun tidak dapat diubah karena terhubung dengan sertifikasi resmi.",
      photoFormatHint: "Format JPG, PNG atau WebP (Maksimum 5MB)",
      transactionsTitle: "Riwayat Transaksi & Pembayaran",
      ordersCount: "Pesanan",
      transactionsDesc: "Status verifikasi pembayaran transfer manual / QRIS untuk pendaftaran kelas BIMCourse.",
      exploreMoreCourses: "+ Jelajahi Kelas Lain",
      noTransactions: "Belum Ada Transaksi Pembayaran",
      noTransactionsDesc: "Anda belum mendaftar atau memesan kursus. Pilih modul spesialisasi BIM di katalog kami untuk memulai.",
      openCatalog: "Buka Katalog Kelas",
      transferAmount: "Nominal Transfer",
      senderLabel: "Pengirim",
      timeLabel: "Waktu",
      statusPendingAdmin: "Menunggu Verifikasi Admin",
      statusApprovedActive: "Disetujui & Kelas Aktif",
      statusRejected: "Pembayaran Ditolak",
      classesCount: "Kelas",
      certificatesCount: "Terverifikasi",
      pendingBadge: "Menunggu",
      cancelBtn: "Batal",
      certSubTitle: "Sertifikat kelulusan resmi BIMCourse dilengkapi Credential ID unik berstandar SKKNI BIM & ISO 19650 untuk portofolio profesional Anda.",
      noCertificatesTitle: "Belum Ada Sertifikat yang Diterbitkan",
      noCertificatesDesc: "Selesaikan materi silabus hingga 100% atau submit tugas capstone pada kelas yang Anda ikuti untuk membuka sertifikat digital resmi.",
      viewActiveCourses: "Lihat Kelas yang Sedang Berjalan",
    },

    // Hero Section
    hero: {
      subBadge: "Platform Edukasi BIM Terdepan • Mengacu Mandat BIM PUPR & ISO 19650",
      titleLine1: "Learn Today",
      titleLine2: "Build Tomorrow",
      description:
        "Kuasai software arsitektur & rekayasa konstruksi digital dari praktisi teruji. Dari pemula hingga siap lolos tender dan berkarier di proyek berskala nasional.",
      primaryCta: "Eksplor Semua Kelas",
      secondaryCta: "Tonton Video Pengenalan",
      ratingScore: "4.94 / 5.0",
      studentsCount: "18,500+ Mahasiswa & Insinyur Telah Bergabung",
    },

    // 3 Feature Pillar Bento Cards
    features: {
      card1Badge: "Kurikulum Praktik",
      card1Title: "Kuasai Software & Standar Mandat BIM Nasional",
      card1Desc:
        "Kurikulum berbasis studi kasus proyek nyata mulai dari LOD 200 hingga LOD 400. Template proyek resmi dan file latihan siap pakai.",
      card1Link: "Eksplor Modul",
      card2Badge: "Peta Jalan Karier",
      card2Title: "Jalur Karier Jelas dari Modeler ke Manager",
      card2Desc:
        "Panduan tahapan kompetensi terstruktur untuk mencapai posisi bergaji tinggi di industri konstruksi nasional & multinasional.",
      card2Link: "Pelajari Jalur",
      card3Badge: "Komunitas & Mentor",
      card3Title: "Terhubung dengan Komunitas BIMCourse Bersama Instruktur",
      card3Desc:
        "Tanya jawab kendala modeling, review file capstone, dan sesi bedah model rutin setiap minggu bersama praktisi aktif BUMN & konsultan.",
      card3Link: "Buka Komunitas",
      chatQuote:
        "Untuk clash pipa MEP vs Balok Struktur, pastikan elevasi invert pipa disesuaikan sebelum submit federated model ya.",
      chatAuthor: "Pak Hendra (Senior BIM Manager)",
      chatRole: "Mentor BIMCourse",
      membersTag: "18.500+ Member AEC",
    },

    // Community Section
    community: {
      badge: "Ekosistem Belajar Kolaboratif",
      title: "Terhubung Langsung dengan Instruktur & Komunitas AEC Terbesar",
      subtitle:
        "Belajar BIM tidak boleh membuat Anda frustrasi sendirian saat menghadapi software crash, error family, atau standar BEP proyek. Di BIMCourse, Anda didampingi langsung oleh para praktisi teruji yang siap membantu Anda berkembang.",
      activeMembers: "18.500+ Member Aktif",
      mentorBadge: "Mentor BUMN & Konsultan",
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
      liveBadge: "Live Sesi Mentoring Setiap Minggu",
      cardHeading: "Bukan Sekadar Nonton Video, Tapi Berproses Bareng Praktisinya",
      cardDesc:
        "Setiap member BIMCourse mendapatkan akses seumur hidup ke grup diskusi eksklusif bersama instruktur. Anda bisa melampirkan file .rvt, .nwc, atau .dyn untuk dibedah solusinya.",
      bullet1: "Forum tanya-jawab aktif 7 hari seminggu bersama mentor & sesama praktisi",
      bullet2: "Sesi bedah file model & konsultasi capstone sebelum diserahkan",
      bullet3: "Jaringan alumni yang tersebar di BUMN, Konsultan Internasional, dan Kontraktor Tier-1",
      joinBtn: "Pilih Modul & Bergabung",
      instantAccess: "Akses langsung diberikan otomatis setelah registrasi kelas.",
      instructorsBadge: "TIM PENGAJAR & MENTOR PRAKTISI",
      instructorsTitle: "Belajar Langsung dari Pelaku Industri Nyata",
      instructorsSubtitle:
        "Bukan sekadar akademisi, instruktur Anda adalah engineer dan arsitek aktif yang setiap hari memegang proyek infrastruktur dan gedung berskala nasional.",
    },

    // Course Catalog
    courses: {
      badge: "KATALOG KURSUS",
      title: "Modul Spesialisasi BIM Berstandar Industri",
      subtitle:
        "Kurikulum komprehensif mengacu pada mandat BIM PUPR dan alur kerja ISO 19650 untuk mencetak talenta konstruksi digital siap kerja.",
      searchPlaceholder: "Cari kursus, software (Revit, Tekla, Navisworks)...",
      allCategory: "Semua Kategori",
      filterAll: "Semua",
      filterFree: "Gratis",
      filterPaid: "Berbayar",
      duration: "Durasi",
      labs: "Hands-on Labs",
      viewDetails: "Lihat Silabus & Detail",
      enrollNow: "Daftar Kelas",
      enrolled: "Sudah Terdaftar",
    },

    // Career Roadmaps
    roadmaps: {
      badge: "PETA JALAN KARIER",
      title: "Peta Jalan Karier Profesional BIM",
      subtitle:
        "Rancang masa depan karier Anda di industri konstruksi digital dengan panduan kompetensi LOD bertahap.",
    },

    // Quiz Recommender
    quiz: {
      badge: "DIAGNOSTIK 30 DETIK",
      title: "Bingung Memulai dari Mana? Temukan Jalur Belajar Anda",
      subtitle:
        "Jawab 3 pertanyaan singkat untuk mendapatkan rekomendasi modul dan software yang paling tepat sesuai latar belakang Anda.",
      startBtn: "Mulai Kuis 30 Detik",
    },

    // Testimonials
    testimonials: {
      badge: "CERITA ALUMNI & TESTIMONI",
      title: "Dipercaya Ribuan Praktisi AEC",
      subtitle:
        "Lihat bagaimana alumni BIMCourse bertransformasi dari drafter 2D menjadi BIM Coordinator dan memenangkan tender proyek skala nasional.",
      completedCourse: "Kelas yang Diselesaikan:",
    },

    // Enterprise
    enterprise: {
      badge: "SOLUSI KORPORASI",
      title: "Pelatihan Perusahaan & Audit Standar ISO 19650",
      subtitle:
        "Tingkatkan kapabilitas digital tim engineer, drafter, dan project manager perusahaan Anda dengan kurikulum custom in-house.",
    },

    // FAQ
    faq: {
      badge: "PERTANYAAN UMUM (FAQ)",
      title: "Sering Ditanyakan (FAQ)",
      subtitle:
        "Informasi seputar spesifikasi software, sistem kelas, sertifikat, dan pendampingan.",
    },

    // CTA Section
    cta: {
      guarantee: "Garansi Kepuasan & Akses Selamanya",
      title: "Siap Naik Level di Era Konstruksi Digital?",
      desc:
        "Dapatkan akses penuh ke seluruh rekaman kelas, template Revit berstandar, file latihan federated model, serta bimbingan portofolio profesional.",
      primaryBtn: "Mulai Belajar Sekarang (Diskon 60%)",
      secondaryBtn: "Pelajari Jalur Karier",
    },

    // Footer
    footer: {
      tagline:
        "Platform Edukasi Building Information Modeling & Konstruksi Digital Terdepan di Indonesia.",
      quickLinks: "Tautan Cepat",
      coursesTitle: "Program Belajar",
      contactTitle: "Kontak & Konsultasi",
      rights: "Hak Cipta Dilindungi Undang-Undang.",
    },

    // Auth & Login
    auth: {
      loginHeading: "Masuk ke Ekosistem BIMCourse",
      registerHeading: "Daftar Akun Siswa Baru",
      subheading: "Satu akun untuk akses modul ISO 19650, portfolio capstone, dan sertifikasi.",
      googleBtn: "Masuk dengan Google",
      googleRegisterBtn: "Daftar Instan dengan Google",
      googleNote: "Daftar via Google tanpa perlu konfirmasi email.",
      orWithEmail: "atau dengan email & password",
      nameLabel: "Nama Lengkap",
      emailLabel: "Alamat Email",
      passwordLabel: "Password",
      orgLabel: "Instansi / Universitas / Perusahaan",
      phoneLabel: "Nomor WhatsApp",
      loginSubmit: "Masuk ke Dashboard",
      registerSubmit: "Daftar Akun Baru",
      haveAccount: "Sudah memiliki akun?",
      noAccount: "Belum punya akun?",
      signInHere: "Masuk di sini",
      registerStudent: "Daftar sebagai Siswa",
      confirmEmailTitle: "Konfirmasi Email Dikirim!",
      confirmEmailDesc: "Kami telah mengirimkan tautan verifikasi akun ke:",
      confirmEmailInstruction:
        "Silakan buka kotak masuk atau folder spam email Anda, lalu klik tombol konfirmasi untuk mengaktifkan akun.",
      resendBtn: "Kirim Ulang Email Konfirmasi",
      confirmedBtn: "Sudah Konfirmasi? Masuk Sekarang",
      namePlaceholder: "Nama lengkap Anda",
      emailPlaceholder: "nama@perusahaan.co.id",
      orgPlaceholder: "Instansi / Universitas / Perusahaan",
      phonePlaceholder: "+62 812 3456 7890",
    },

    // Shopping Cart Drawer
    cart: {
      title: "Keranjang Pembelian",
      readyToCheckout: "Siap untuk checkout & aktivasi modul",
      emptyTitle: "Keranjang Anda Kosong",
      emptySubtitle: "Pilih modul spesialisasi BIM yang ingin Anda pelajari untuk melanjutkan proses pembayaran.",
      recommendedTitle: "Rekomendasi Modul Terpopuler:",
      select: "Pilih",
      coursesCount: "Kursus",
      totalCourses: "Total Kursus",
      adminFee: "Biaya Administrasi & Server",
      free: "GRATIS",
      totalPayment: "Total Pembayaran",
      trustVerification: "Verifikasi QRIS & Bank",
      trustAccess: "Akses Modul Instan",
      checkoutBtn: "Checkout & Pembayaran",
      removeTooltip: "Hapus dari keranjang",
    },
  },

  en: {
    // Navbar
    navbar: {
      courses: "Course Catalog",
      roadmaps: "Career Roadmaps",
      community: "Community",
      quiz: "BIM Path Quiz",
      enterprise: "For Enterprise",
      faq: "FAQ",
      searchTitle: "Search BIM Courses",
      cartTitle: "Shopping Cart",
      login: "Sign In",
      register: "Register",
      dashboard: "Open Dashboard",
      profile: "My Profile",
      logout: "Log Out",
      langSwitch: "Language",
    },

    // Profile Page
    profilePage: {
      badge: "STUDENT PROFILE PORTAL",
      title: "My Profile & Certificates",
      subtitle: "Manage portfolio, access active courses, submit assignments, and verify your official credentials.",
      tabCourses: "Enrolled Courses",
      tabCertificates: "Certificates",
      tabAssignments: "Capstone & Tasks",
      tabEdit: "Edit Profile",
      changeAvatar: "Change Avatar Photo",
      uploadingPhoto: "Uploading photo...",
      photoUpdated: "Profile photo successfully updated!",
      editSuccess: "Profile successfully saved!",
      saveBtn: "Save Changes",
      savingBtn: "Saving...",
      fullName: "Full Name",
      emailLabel: "Email Address",
      phoneLabel: "Phone / WhatsApp Number",
      orgLabel: "University / Company / Institution",
      bioLabel: "Short Bio",
      bioPlaceholder: "Tell us about your architectural background or BIM interests...",
      noCourses: "No enrolled courses yet.",
      exploreCourses: "Explore Course Catalog",
      continueLearning: "Continue Learning",
      modulesCount: "Syllabus Modules",
      progressLabel: "Learning Progress",
      verifiedCertificate: "Verified Official Certificate",
      viewCertificate: "View Certificate",
      downloadPdf: "Print / Download PDF",
      copyLink: "Copy Verification Link",
      linkCopied: "Verification link copied to clipboard!",
      close: "Close",
      issuedOn: "Issued on",
      credentialId: "Credential ID",
      standards: "Competency Standards",
      logout: "Log Out",
      memberSince: "Member since",
      completedBadge: "Completed",
      inProgressBadge: "In Progress",
      uploadTaskBtn: "Submit Capstone Project",
      statusPending: "AWAITING REVIEW",
      statusApproved: "APPROVED",
      statusRevision: "REVISION REQUIRED",
      feedbackTitle: "Instructor Feedback & Notes:",
      noSubmissions: "No capstone assignments submitted yet.",
      tabTransactions: "Billing & Orders",
      verifiedBadge: "Verified",
      completeProfileTitle: "Complete Your Student Profile",
      completeProfileDesc: "Your WhatsApp number and institution/campus name are required for licensed BIM certificate issuance & course confirmation.",
      completeProfileBtn: "Complete Now",
      pendingPaymentTitle: "Course Payment is Being Verified by Admin",
      pendingPaymentDesc: "Payment transfer proof ({count} course) has been received and is being verified by admin (est. 5-15 mins). Course modules will activate automatically upon approval.",
      checkStatusBtn: "Check Order Status",
      editSubtitle: "Update your full name, institution, and contact details to ensure accurate printing on your certificate.",
      emailCannotChange: "Account email cannot be changed as it is linked to official certificate credentials.",
      photoFormatHint: "JPG, PNG or WebP format (Max 5MB)",
      transactionsTitle: "Billing & Order History",
      ordersCount: "Orders",
      transactionsDesc: "Payment verification status for your manual transfer / QRIS course registrations.",
      exploreMoreCourses: "+ Explore Other Courses",
      noTransactions: "No Payment Transactions Yet",
      noTransactionsDesc: "You haven't enrolled or ordered any courses yet. Choose a BIM specialization module from our catalog to get started.",
      openCatalog: "Open Course Catalog",
      transferAmount: "Transfer Amount",
      senderLabel: "Sender",
      timeLabel: "Time",
      statusPendingAdmin: "Awaiting Admin Verification",
      statusApprovedActive: "Approved & Course Active",
      statusRejected: "Payment Rejected",
      classesCount: "Courses",
      certificatesCount: "Verified",
      pendingBadge: "Pending",
      cancelBtn: "Cancel",
      certSubTitle: "Official BIMCourse graduation certificates equipped with unique Credential IDs aligned with SKKNI BIM & ISO 19650 standards for your professional portfolio.",
      noCertificatesTitle: "No Certificates Issued Yet",
      noCertificatesDesc: "Complete syllabus lessons up to 100% or submit a capstone project in your enrolled courses to unlock official digital certificates.",
      viewActiveCourses: "View Enrolled Courses",
    },

    // Hero Section
    hero: {
      subBadge: "Leading BIM Education Platform • Compliant with PUPR BIM Mandate & ISO 19650",
      titleLine1: "Learn Today",
      titleLine2: "Build Tomorrow",
      description:
        "Master digital architectural & construction engineering software from verified practitioners. From beginner to tender-ready and top AEC career opportunities.",
      primaryCta: "Explore All Courses",
      secondaryCta: "Watch Intro Video",
      ratingScore: "4.94 / 5.0",
      studentsCount: "18,500+ Students & Engineers Have Joined",
    },

    // 3 Feature Pillar Bento Cards
    features: {
      card1Badge: "Hands-on Curriculum",
      card1Title: "Master Software & National BIM Standards",
      card1Desc:
        "Case-study driven curriculum from LOD 200 to LOD 400. Official project templates and ready-to-use dataset files.",
      card1Link: "Explore Modules",
      card2Badge: "Career Roadmap",
      card2Title: "Clear Career Path from Modeler to Manager",
      card2Desc:
        "Structured competency progression to reach high-paying positions across domestic and international construction firms.",
      card2Link: "View Roadmaps",
      card3Badge: "Community & Mentors",
      card3Title: "Connect with the BIMCourse Community & Instructors",
      card3Desc:
        "Q&A for modeling bottlenecks, capstone file reviews, and regular model breakdown sessions with active SOE & consultant specialists.",
      card3Link: "Open Community",
      chatQuote:
        "For MEP pipe vs Structural Beam clashes, make sure invert pipe elevation is adjusted before submitting the federated model.",
      chatAuthor: "Ir. Hendra (Senior BIM Manager)",
      chatRole: "BIMCourse Mentor",
      membersTag: "18,500+ AEC Members",
    },

    // Community Section
    community: {
      badge: "Collaborative Learning Ecosystem",
      title: "Connect Directly with Instructors & the Largest AEC Community",
      subtitle:
        "Learning BIM shouldn't leave you frustrated alone when facing software crashes, family errors, or project BEP standards. At BIMCourse, you are guided directly by verified practitioners ready to help you thrive.",
      activeMembers: "18,500+ Active Members",
      mentorBadge: "SOE & Consultant Mentors",
      pillar1Badge: "Unlimited Q&A",
      pillar1Title: "Modeling Troubleshooting & Technical Discussion",
      pillar1Desc:
        "Experiencing Revit family errors, IFC export issues, or Dynamo script crashes? Ask in our forum. Instructors actively respond with screenshots, tips, and verified solution files.",
      pillar2Badge: "Regular Live Mentoring",
      pillar2Title: "Model Breakdown Sessions & Real Project Sharing",
      pillar2Desc:
        "Join monthly live webinars and model dissection sessions. Instructors deconstruct real-world case studies from infrastructure, high-rise, and airport projects directly in BIM software.",
      pillar3Badge: "1-on-1 Feedback",
      pillar3Title: "Portfolio & Capstone Review with Mentors",
      pillar3Desc:
        "Ensure your model output and shop drawings are ready for prospective employers or tender clients. Receive constructive feedback on LOD accuracy, parameters, and model neatness.",
      pillar4Badge: "Assets & Opportunities",
      pillar4Title: "BIM Family Library, Templates & Exclusive Jobs",
      pillar4Desc:
        "Access hundreds of standardized Revit families, project templates, and exclusive job openings for BIM Modelers and Coordinators shared across members and instructor networks.",
      liveBadge: "Live Mentoring Sessions Every Week",
      cardHeading: "Not Just Watching Videos, but Growing with Real Practitioners",
      cardDesc:
        "Every BIMCourse member receives lifetime access to an exclusive discussion group with instructors. Attach your .rvt, .nwc, or .dyn files for hands-on solution walkthroughs.",
      bullet1: "Active 7-day-a-week Q&A forum with mentors and fellow engineers",
      bullet2: "Model file breakdown sessions & capstone review before final submission",
      bullet3: "Alumni network spanning SOEs, International Consultants, and Tier-1 Contractors",
      joinBtn: "Choose Module & Join",
      instantAccess: "Instant access granted automatically upon course registration.",
      instructorsBadge: "TEACHING TEAM & PRACTICING MENTORS",
      instructorsTitle: "Learn Directly from Real Industry Experts",
      instructorsSubtitle:
        "Not just academics, your instructors are active engineers and architects handling national infrastructure and high-rise projects daily.",
    },

    // Course Catalog
    courses: {
      badge: "COURSE CATALOG",
      title: "Industry-Standard BIM Specialization Modules",
      subtitle:
        "Comprehensive curriculum aligned with national BIM mandates and ISO 19650 workflows to build job-ready digital construction talent.",
      searchPlaceholder: "Search courses, software (Revit, Tekla, Navisworks)...",
      allCategory: "All Categories",
      filterAll: "All",
      filterFree: "Free",
      filterPaid: "Paid",
      duration: "Duration",
      labs: "Hands-on Labs",
      viewDetails: "View Syllabus & Details",
      enrollNow: "Enroll Now",
      enrolled: "Already Enrolled",
    },

    // Career Roadmaps
    roadmaps: {
      badge: "CAREER ROADMAP",
      title: "Professional BIM Career Roadmaps",
      subtitle:
        "Plan your future career in digital construction with structured LOD competency stages.",
    },

    // Quiz Recommender
    quiz: {
      badge: "30-SECOND DIAGNOSTIC",
      title: "Unsure Where to Start? Discover Your Learning Path",
      subtitle:
        "Answer 3 quick questions to receive personalized module and software recommendations tailored to your background.",
      startBtn: "Start 30-Second Quiz",
    },

    // Testimonials
    testimonials: {
      badge: "ALUMNI STORIES & TESTIMONIALS",
      title: "Trusted by Thousands of AEC Practitioners",
      subtitle:
        "See how BIMCourse alumni transitioned from 2D drafters to BIM Coordinators and won national project tenders.",
      completedCourse: "Course Completed:",
    },

    // Enterprise
    enterprise: {
      badge: "ENTERPRISE SOLUTIONS",
      title: "Corporate Training & ISO 19650 Standard Audits",
      subtitle:
        "Elevate the digital capabilities of your engineers, drafters, and project managers with tailored in-house training.",
    },

    // FAQ
    faq: {
      badge: "HELP CENTER (FAQ)",
      title: "Frequently Asked Questions (FAQ)",
      subtitle:
        "Essential information regarding software specifications, learning format, certificates, and mentoring.",
    },

    // CTA Section
    cta: {
      guarantee: "Satisfaction Guarantee & Lifetime Access",
      title: "Ready to Level Up in the Digital Construction Era?",
      desc:
        "Get full access to all course recordings, standardized Revit templates, federated model exercise files, and professional portfolio mentorship.",
      primaryBtn: "Start Learning Now (60% Off)",
      secondaryBtn: "Explore Career Roadmaps",
    },

    // Footer
    footer: {
      tagline:
        "Leading Building Information Modeling & Digital Construction Education Platform in Indonesia.",
      quickLinks: "Quick Links",
      coursesTitle: "Learning Programs",
      contactTitle: "Contact & Consultation",
      rights: "All Rights Reserved.",
    },

    // Auth & Login
    auth: {
      loginHeading: "Sign In to BIMCourse Ecosystem",
      registerHeading: "Register New Student Account",
      subheading: "One account for ISO 19650 modules, capstone portfolio, and verified certification.",
      googleBtn: "Sign In with Google",
      googleRegisterBtn: "Instant Register with Google",
      googleNote: "Register via Google without email confirmation required.",
      orWithEmail: "or with email & password",
      nameLabel: "Full Name",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      orgLabel: "Institution / University / Company",
      phoneLabel: "WhatsApp Number",
      loginSubmit: "Sign In to Dashboard",
      registerSubmit: "Create New Account",
      haveAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      signInHere: "Sign in here",
      registerStudent: "Register as Student",
      confirmEmailTitle: "Email Confirmation Sent!",
      confirmEmailDesc: "We have sent an account verification link to:",
      confirmEmailInstruction:
        "Please check your inbox or spam folder and click the confirmation link to activate your account.",
      resendBtn: "Resend Confirmation Email",
      confirmedBtn: "Confirmed? Sign In Now",
      namePlaceholder: "Enter your full name",
      emailPlaceholder: "name@company.com",
      orgPlaceholder: "Institution / University / Company",
      phonePlaceholder: "+62 812 3456 7890",
    },

    // Shopping Cart Drawer
    cart: {
      title: "Shopping Cart",
      readyToCheckout: "Ready to enroll & checkout",
      emptyTitle: "Your Cart is Empty",
      emptySubtitle: "Choose a BIM specialization module from our catalog to get started.",
      recommendedTitle: "Popular Recommended Modules:",
      select: "Select",
      coursesCount: "Courses",
      totalCourses: "Total Courses",
      adminFee: "Admin & Platform Fee",
      free: "FREE",
      totalPayment: "Total Amount",
      trustVerification: "QRIS & Bank Verification",
      trustAccess: "Instant Course Access",
      checkoutBtn: "Checkout & Proceed to Payment",
      removeTooltip: "Remove from cart",
    },
  },
};
