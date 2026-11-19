export interface TabbedItem {
  id: string;
  title: string;
  content: string;
  points?: string[];
}

export interface TabbedBlockData {
  header?: string;
  intro?: string;
  tabs: TabbedItem[];
}

export interface SkillsCheckOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface SkillsCheckData {
  title?: string;
  subtitle?: string;
  question: string;
  instruction?: string;
  options: SkillsCheckOption[];
}

export interface PracticeOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PracticeQuestionData {
  header?: string;
  question: string;
  instruction?: string;
  options: PracticeOption[];
  explanation?: string;
}

export interface LabCardData {
  title: string;
  description?: string;
  fileUrl?: string;
  duration?: string;
}

export type QuizQuestionType = "multiple_choice" | "essay" | "file_upload";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: QuizOption[];
  allowedFormats?: string;
  maxSizeMb?: number;
  sampleAnswer?: string;
  weight?: number;
}

export interface QuizIntroData {
  title: string;
  questionsCount?: number;
  passRatePercent?: number;
  attempts?: string;
  timeLimit?: string;
  questions?: QuizQuestion[];
}

export interface MatchPair {
  id: string;
  category: string;
  badge: string; // "A", "B", "C", etc.
  correctOptionId: string;
}

export interface MatchOption {
  id: string;
  text: string;
}

export interface MatchingActivityData {
  header?: string;
  instruction?: string;
  categories: MatchPair[];
  options: MatchOption[];
}

export interface AssignmentBlockData {
  title: string;
  instruction?: string;
  allowedFormats?: string; // e.g. ".rvt, .dwg, .pdf, .zip, .ifc"
  maxSizeMb?: number; // e.g. 50
  dueDate?: string;
  rubric?: string[];
}

export interface CurriculumLesson {
  id: string;
  code: string; // e.g. "1.0.1"
  title: string;
  subtitle?: string;
  category: string;
  readTime: string;
  summary: string;
  paragraphs: string[];
  quote?: {
    text: string;
    author: string;
  };
  keyTakeaways?: string[];
  visualType?:
    | "bim-lifecycle"
    | "nist-aec"
    | "autodesk-stack"
    | "bim-levels"
    | "bim-dimensions"
    | "revit-vs-cad"
    | "revit-competency"
    | "revit-workflows"
    | "interactive-blocks"
    | "cisco-blocks"
    | "none";
  metadata?: Record<string, any>;

  // Interactive Learning Blocks
  tabbedBlock?: TabbedBlockData;
  skillsCheck?: SkillsCheckData;
  practiceQuestion?: PracticeQuestionData;
  labCard?: LabCardData;
  quizIntro?: QuizIntroData;
  matchingActivity?: MatchingActivityData;
  assignmentBlock?: AssignmentBlockData;
}

export interface CurriculumSection {
  id: string;
  code: string; // e.g. "1.0", "1.1"
  title: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumModule {
  id: string;
  code: string; // e.g. "1", "2"
  title: string;
  duration: string;
  summary: string;
  sections: CurriculumSection[];
}

export interface CurriculumResource {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  url: string;
  isExternal?: boolean;
}

export const BIM_RESOURCES: CurriculumResource[] = [];

export const BIM_MODULES: CurriculumModule[] = [
  {
    id: "mod-1",
    code: "1",
    title: "BIM & Industri AEC",
    duration: "2 Jam 30 Menit",
    summary:
      "Pengenalan komprehensif konsep Building Information Modeling, keterhubungannya dengan industri Arsitektur, Teknik, dan Konstruksi, software populer Autodesk, serta tingkatan dan dimensi BIM.",
    sections: [
      {
        id: "sec-1-0",
        code: "1.0",
        title: "Introduction to BIM & AEC",
        lessons: [
          {
            id: "les-1-0-1",
            code: "1.0.1",
            title: "Definisi BIM (Building Information Modeling)",
            subtitle: "Apa sih sebenarnya BIM itu? Hubungannya dengan AEC Industry apa sih?",
            category: "1.0 Introduction to BIM & AEC",
            readTime: "4 Menit",
            summary:
              "BIM adalah metode kerja berbasis model digital yang mengandung informasi geometris maupun non-geometris untuk kolaborasi sepanjang siklus hidup bangunan.",
            paragraphs: [
              "BIM (Building Information Modeling) adalah sebuah metode kerja berbasis teknologi yang menggunakan model digital bangunan tiga dimensi yang terintegrasi secara cerdas dengan data non-geometris spesifikasi teknis dan estimasi biaya.",
              "![Ilustrasi Pemodelan Parametrik BIM Terintegrasi|right|medium](https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80)",
              "BIM mengusung metode kerja kolaboratif untuk membuat dan mengelola informasi bangunan sepanjang siklus hidupnya, mulai dari perencanaan, desain, konstruksi, hingga operasi dan pemeliharaan fasilitas.",
              "BIM bukan sekadar pemodelan tiga dimensi, tetapi juga mencakup data, koordinasi, dokumentasi, dan pengelolaan informasi proyek secara terpusat (Single Source of Truth).",
              "Penggunaan BIM meningkatkan produktivitas, efisiensi sumber daya, dan efektivitas metode pelaksanaan, sehingga potensi masalah benturan (clash detection) dapat diantisipasi sejak tahap desain sebelum konstruksi fisik dimulai di lapangan.",
            ],
          },
          {
            id: "les-1-0-2",
            code: "1.0.2",
            title: "Industri AEC & Standar NIST",
            subtitle: "Ekosistem Arsitektur, Teknik, dan Konstruksi Modern",
            category: "1.0 Introduction to BIM & AEC",
            readTime: "5 Menit",
            summary:
              "AEC mencakup seluruh jaringan profesional yang merencanakan dan memelihara lingkungan binaan, didukung riset efisiensi standar NIST.",
            paragraphs: [
              "Industri AEC adalah singkatan dari Arsitektur, Teknik, dan Konstruksi (dalam bahasa Inggris: Architecture, Engineering, and Construction). Sektor ini mencakup seluruh jaringan profesional, perusahaan, dan proses yang bekerja sama untuk merencanakan, mendesain, membangun, hingga memelihara lingkungan binaan (seperti rumah, gedung perkantoran, jembatan, jalan raya, dan infrastruktur kota).",
              "Dalam praktiknya, industri AEC melibatkan kolaborasi intensif antara arsitek, insinyur struktur, insinyur MEP, kontraktor utama, subkontraktor spesialis, quantity surveyor, dan pemilik fasilitas.",
            ],
            quote: {
              text: "Menurut National Institute of Standards and Technology (NIST), BIM menjadi kemajuan signifikan di industri AEC yang menghadirkan model digital fasilitas melalui kolaborasi multidisiplin pada berbagai tahap konstruksi. Penggunaan BIM meningkatkan produktivitas, efisiensi sumber daya, dan efektivitas metode pelaksanaan, sehingga potensi masalah dapat diantisipasi sejak tahap desain.",
              author: "National Institute of Standards and Technology (NIST)",
            },
            keyTakeaways: [
              "AEC = Architecture, Engineering, and Construction.",
              "Kolaborasi Multidisiplin: Menghubungkan seluruh tim dari perencana hingga pelaksana di lapangan.",
              "Efisiensi Berstandar Global: Standar NIST membuktikan BIM menekan pembengkakan biaya dan waktu pengerjaan proyek.",
            ],
            visualType: "nist-aec",
          },
        ],
      },
      {
        id: "sec-1-1",
        code: "1.1",
        title: "Software BIM Autodesk Populer",
        lessons: [
          {
            id: "les-1-1-1",
            code: "1.1.1",
            title: "Autodesk Revit (Fokus Pelatihan Utama)",
            subtitle: "Perangkat Lunak Pemodelan Parametrik 3D Berbasis BIM",
            category: "1.1 Software BIM Autodesk",
            readTime: "4 Menit",
            summary:
              "Autodesk Revit adalah software utama untuk arsitektur, struktur, dan MEP guna membuat model dan dokumentasi terpusat.",
            paragraphs: [
              "Beberapa software BIM (Building Information Modeling) dari Autodesk yang paling populer dan banyak digunakan di industri AEC mencakup rangkaian solusi terintegrasi.",
              "Autodesk Revit merupakan perangkat lunak pemodelan parametrik 3D utama untuk arsitektur, struktur, dan MEP (Mechanical, Electrical, Plumbing) guna membuat model dan dokumentasi terpusat.",
              "Dalam modul pelatihan ini, Autodesk Revit akan menjadi fokus pembelajaran utama yang akan kita pelajari langkah demi langkah dari tingkat dasar hingga mahir.",
            ],
            keyTakeaways: [
              "Pemodelan Parametrik Cerdas: Elemen dinding, pintu, balok, dan pipa memiliki hubungan parameter otomatis.",
              "Multi-Disiplin: Mendukung model Arsitektur, Struktur, dan MEP dalam satu ekosistem terpadu.",
              "Dokumentasi Otomatis: Gambar potongan, denah, dan jadwal material diekstrak langsung dari 1 model.",
            ],
            visualType: "autodesk-stack",
            metadata: { softwareKey: "revit" },
          },
          {
            id: "les-1-1-2",
            code: "1.1.2",
            title: "Autodesk Navisworks",
            subtitle: "Peninjauan Model, Clash Detection & Simulasi 4D/5D",
            category: "1.1 Software BIM Autodesk",
            readTime: "4 Menit",
            summary:
              "Solusi peninjauan dan koordinasi model untuk melakukan deteksi benturan (clash detection) serta simulasi 4D (jadwal) dan 5D (biaya).",
            paragraphs: [
              "Autodesk Navisworks adalah solusi peninjauan dan koordinasi model untuk melakukan clash detection (deteksi benturan) serta simulasi konstruksi 4D maupun 5D.",
              "Dengan Navisworks, tim proyek dapat menyatukan model dari berbagai disiplin (misal model arsitektur dari Revit, struktur baja dari Tekla, dan MEP) ke dalam satu lingkungan terpadu (Federated Model) untuk mengidentifikasi potensi tabrakan sebelum konstruksi fisik dimulai di lapangan.",
            ],
            keyTakeaways: [
              "Clash Detective: Menemukan benturan fisik antara pipa utilitas, balok beton, dan ducting AC.",
              "Simulasi 4D TimeLiner: Mengaitkan jadwal proyek (Microsoft Project / Primavera) dengan model 3D.",
              "Simulasi Biaya 5D: Memvisualisasikan pengeluaran dana seiring berjalannya progres konstruksi.",
            ],
            visualType: "autodesk-stack",
            metadata: { softwareKey: "navisworks" },
          },
          {
            id: "les-1-1-3",
            code: "1.1.3",
            title: "Autodesk Civil 3D",
            subtitle: "Perancangan Teknik Sipil, Jalan & Kontur Topografi",
            category: "1.1 Software BIM Autodesk",
            readTime: "3 Menit",
            summary:
              "Perangkat lunak khusus teknik sipil dan infrastruktur untuk perancangan jalan, topografi, dan perhitungan volume tanah.",
            paragraphs: [
              "Autodesk Civil 3D adalah perangkat lunak khusus teknik sipil dan infrastruktur untuk perancangan jalan, topografi, dan perhitungan volume tanah (cut and fill).",
              "Civil 3D sangat esensial untuk proyek jalan tol, jembatan, bendungan, bandara, serta pengembangan kawasan perkotaan berbasis data geospasial presisi tinggi.",
            ],
            keyTakeaways: [
              "Pemodelan Koridor Jalan: Alinyemen horisontal dan vertikal dinamis.",
              "Permukaan Tanah & Kontur: Pembuatan TIN Surface dari data survei GPS / LiDAR.",
              "Kalkulasi Volume Cut & Fill: Ekstraksi volume galian dan timbunan otomatis.",
            ],
            visualType: "autodesk-stack",
            metadata: { softwareKey: "civil3d" },
          },
          {
            id: "les-1-1-4",
            code: "1.1.4",
            title: "Autodesk Construction Cloud (ACC) / BIM 360",
            subtitle: "Common Data Environment (CDE) Berbasis Cloud",
            category: "1.1 Software BIM Autodesk",
            readTime: "4 Menit",
            summary:
              "Platform cloud untuk manajemen proyek konstruksi, peninjauan desain, dan kolaborasi lapangan secara real-time.",
            paragraphs: [
              "Autodesk Construction Cloud (ACC) / BIM 360 adalah platform berbasis cloud untuk manajemen proyek konstruksi, peninjauan desain, dan kolaborasi lapangan secara real-time.",
              "ACC berfungsi sebagai Common Data Environment (CDE) sesuai standar ISO 19650, memungkinkan seluruh pemangku kepentingan mengakses file versi terbaru, memberikan markup revisi, serta melacak issues langsung dari laptop maupun tablet di lapangan.",
            ],
            keyTakeaways: [
              "Single Cloud Source of Truth: Menghindari pengerjaan berdasarkan revisi gambar yang telah kedaluwarsa.",
              "Collaborative Design: Sinkronisasi Revit Worksharing langsung ke server cloud terpusat.",
              "Manajemen Lapangan: RFI (Request for Information), checklist keselamatan kerja, dan serah terima aset digital.",
            ],
            visualType: "autodesk-stack",
            metadata: { softwareKey: "acc" },
            tabbedBlock: {
              header: "1.1.4 Ekosistem Software Autodesk BIM",
              intro: "Sebelum memahami koordinasi BIM multidisiplin secara utuh, Anda perlu memahami peran masing-masing software dalam ekosistem AEC. Pilih masing-masing tab di bawah untuk melihat rincian fungsi:",
              tabs: [
                {
                  id: "tab-revit",
                  title: "Autodesk Revit",
                  content: "Perangkat lunak pemodelan parametrik 3D utama untuk arsitektur, struktur, dan MEP. Model terpusat dengan dokumentasi DED otomatis dan sinkronisasi dua arah antar denah, tampak, dan potongan.",
                  points: ["Pemodelan LOD 100 - 400", "BIM 3D Parametrik Cerdas", "Ekstraksi Material Schedule BoQ", "Sistem Worksharing Tim"],
                },
                {
                  id: "tab-navisworks",
                  title: "Autodesk Navisworks",
                  content: "Solusi peninjauan federated model multisektor untuk deteksi tabrakan fisik (clash detection) serta simulasi 4D waktu pengerjaan dan 5D estimasi pengeluaran dana konstruksi.",
                  points: ["Clash Detective Otomatis", "Simulasi Waktu 4D TimeLiner", "Analisis Biaya 5D Quantification", "Ekspor Laporan Format BCF"],
                },
                {
                  id: "tab-civil3d",
                  title: "Autodesk Civil 3D",
                  content: "Perangkat lunak khusus teknik sipil dan infrastruktur untuk perancangan jalan raya, topografi kontur bumi, dan perhitungan volume galian serta timbunan (cut and fill) tanah.",
                  points: ["Pemodelan Koridor Jalan Raya", "Permukaan Tanah TIN Surface", "Kalkulasi Volume Galian-Timbunan", "Perancangan Jaringan Pipa Gravitasi"],
                },
                {
                  id: "tab-acc",
                  title: "ACC / BIM 360",
                  content: "Platform Common Data Environment (CDE) cloud standar ISO 19650 untuk kolaborasi lapangan real-time, review desain tim multidisiplin, dan pengelolaan versi dokumen proyek.",
                  points: ["Single Cloud Source of Truth", "Revit Cloud Worksharing", "Pelacakan Issues & RFI Lapangan", "Standar Kepatuhan ISO 19650"],
                },
              ],
            },
          },
        ],
      },
      {
        id: "sec-1-2",
        code: "1.2",
        title: "Tingkatan & Dimensi BIM",
        lessons: [
          {
            id: "les-1-2-1",
            code: "1.2.1",
            title: "Tingkatan Level Kompleksitas Desain (Level 0 - 3)",
            subtitle: "Maturity Levels dalam Implementasi BIM",
            category: "1.2 Tingkatan & Dimensi BIM",
            readTime: "5 Menit",
            summary:
              "Tingkatan BIM terbagi sesuai kompleksitas dari Level 0 (2D CAD manual) hingga Level 3 (Integrated Project Delivery).",
            paragraphs: [
              "BIM terbagi menjadi beberapa tingkatan sesuai dengan kompleksitas design yang dibuat. Secara umum level kematangan BIM (BIM Maturity Levels) terbagi menjadi Level 0 hingga Level 3:",
              "• Level 0 — 2D CAD Design: Gambar teknik dua dimensi dibuat dengan drafting konvensional tanpa pertukaran data cerdas. Komunikasi masih bergantung pada cetakan kertas atau PDF manual.",
              "• Level 1 — Basic 3D Models: Menggunakan kombinasi pemodelan 3D untuk visualisasi konseptual dan gambar 2D untuk dokumentasi izin mendirikan bangunan, namun belum terkoordinasi antar disiplin secara otomatis.",
              "• Level 2 — Collaborative 3D BIM: Masing-masing disiplin (arsitektur, struktur, MEP) membuat model 3D sendiri, lalu bertukar data melalui format terbuka (seperti IFC) dan CDE terstandarisasi. Level ini merupakan standar tender proyek pemerintah dan BUMN saat ini.",
              "• Level 3 — Integrated Project Delivery: Semua disiplin bekerja bersama secara simultan pada satu model cloud terintegrasi penuh sepanjang siklus hidup bangunan (iBIM).",
            ],
            keyTakeaways: [
              "Level 0: 2D CAD murni tanpa metadata terintegrasi.",
              "Level 1: 3D dasar untuk visualisasi konseptual.",
              "Level 2: Kolaborasi 3D multisektor dengan format CDE/IFC (Standar Industri Saat Ini).",
              "Level 3: Integrasi digital komprehensif cloud seumur hidup bangunan.",
            ],
            visualType: "bim-levels",
            skillsCheck: {
              title: "Skills Check",
              subtitle: "Jawablah pertanyaan evaluasi berikut setelah mempelajari tingkatan Level BIM.",
              question: "Manakah tiga karakteristik utama yang wajib dipenuhi dalam implementasi BIM Level 2 pada proyek industri AEC?",
              instruction: "(Pilih tiga.)",
              options: [
                { id: "sc-1", text: "Masing-masing disiplin (arsitektur, struktur, MEP) membuat model 3D mandiri", isCorrect: true },
                { id: "sc-2", text: "Pertukaran data dilakukan melalui format terbuka (IFC) dan Common Data Environment (CDE)", isCorrect: true },
                { id: "sc-3", text: "Diterapkan sebagai standar acuan tender proyek BUMN dan mandat konstruksi pemerintah", isCorrect: true },
                { id: "sc-4", text: "Seluruh gambar teknis hanya dibuat manual dua dimensi di kertas cetak tanpa data 3D", isCorrect: false },
              ],
            },
          },
          {
            id: "les-1-2-2",
            code: "1.2.2",
            title: "Dimensi BIM (3D Geometrical s/d 7D Facility Management)",
            subtitle: "Ekspansi Data: Dimensi Geometri, Jadwal, Biaya, Energi & Pemeliharaan",
            category: "1.2 Tingkatan & Dimensi BIM",
            readTime: "6 Menit",
            summary:
              "Dimensi BIM memperluas model 3D geometris dengan integrasi dimensi 4D jadwal, 5D estimasi biaya, 6D keberlanjutan, hingga 7D pemeliharaan aset.",
            paragraphs: [
              "Dalam implementasi BIM, data yang dimasukkan ke dalam model digital dikelompokkan ke dalam beberapa dimensi mulai dari 3D hingga 7D:",
              "• BIM 3D (Geometrical View): Representasi tiga dimensi dari konstruksi yang mempermudah pemangku kepentingan mengidentifikasi kesalahan desain dan masalah yang bisa mengubah desain saat konstruksi. Ini memungkinkan pengambilan keputusan berbasis informasi dan pembaruan secara real-time.",
              "• BIM 4D (Scheduling): Digunakan untuk memvisualisasikan kemajuan proyek dengan jadwal pekerjaan lebih optimal, dari proses perencanaan hingga pengawasan. Simulasi yang akurat dapat mempermudah tim proyek dalam menyelesaikan pekerjaan secara tepat waktu.",
              "• BIM 5D (Estimating): Digunakan untuk membuat anggaran dan analisis biaya yang akurat berdasarkan pemodelan, spesifikasi, serta perubahan dalam BIM, dan terus diperbarui dengan faktor lingkungan bangunan yang terjadi.",
              "• BIM 6D (Sustainability): Mengintegrasikan informasi tentang keberlanjutan, analisis energi, dan dampak lingkungan, membantu pemangku kepentingan memahami efisiensi energi, biaya, jadwal, dan desain bangunan pada tahap pra-konstruksi.",
              "• BIM 7D (Building Management): Mengintegrasikan informasi operasional dan pemeliharaan gedung, termasuk spesifikasi bahan, manual, serta data garansi. Dengan ketelitian tinggi, BIM 7D mendukung pengelolaan dan perawatan bangunan secara efektif.",
            ],
            keyTakeaways: [
              "3D = Shape / Geometri: Visualisasi bentuk fisik dan koordinasi spasial presisi.",
              "4D = Scheduling / Waktu: Simulasi urutan konstruksi dan mitigasi keterlambatan.",
              "5D = Estimating / Biaya: Perhitungan kuantitas material dan arus kas proyek real-time.",
              "6D = Sustainability / Energi: Analisis jejak karbon, efisiensi termal, dan sertifikasi hijau (LEED/Greenship).",
              "7D = Facility Management / Operasional: Pemeliharaan aset berkala dan manajemen garansi gedung.",
            ],
            visualType: "bim-dimensions",
            practiceQuestion: {
              header: "1.2.4 Practice - Uji Pemahaman Dimensi BIM",
              question: "Kontraktor utama PT Wijaya Karya ditugaskan untuk melakukan simulasi visual urutan waktu pengecoran beton bertingkat sekaligus memantau arus kas pengeluaran biaya mingguan. Dimensi BIM apa sajakah yang diterapkan pada skenario ini?",
              instruction: "(Pilih dua.)",
              options: [
                { id: "pq-1", text: "BIM 4D (Scheduling & Visualisasi TimeLiner)", isCorrect: true },
                { id: "pq-2", text: "BIM 5D (Estimating & Manajemen Arus Kas Biaya)", isCorrect: true },
                { id: "pq-3", text: "BIM 2D (Drafting Manual Garis Terpisah)", isCorrect: false },
                { id: "pq-4", text: "BIM 0D (Sketsa Kertas Konseptual)", isCorrect: false },
              ],
              explanation: "BIM 4D mengintegrasikan model 3D dengan jadwal waktu proyek (TimeLiner) untuk simulasi urutan konstruksi, sedangkan BIM 5D mengaitkannya dengan kalkulasi biaya kuantitas material (Quantity Take-Off & Cashflow).",
            },
          },
        ],
      },
    ],
  },
  {
    id: "mod-2",
    code: "2",
    title: "Pengenalan & Workflow Autodesk Revit",
    duration: "3 Jam 15 Menit",
    summary:
      "Memahami esensi Autodesk Revit sebagai platform perancangan BIM terpadu, 6 tingkatan kompetensi pengguna, serta 2 sub alur kerja pembelajaran terstruktur.",
    sections: [
      {
        id: "sec-2-0",
        code: "2.0",
        title: "What's Revit?",
        lessons: [
          {
            id: "les-2-0-1",
            code: "2.0.1",
            title: "Konsep Revit vs Drafting Konvensional",
            subtitle: "Paradigma Baru: Dari Sekadar Menggambar ke Memodelkan Informasi",
            category: "2.0 What's Revit?",
            readTime: "5 Menit",
            summary:
              "Revit menghubungkan seluruh gambar denah, tampak, dan potongan ke dalam satu model bangunan terpusat sehingga perubahan langsung sinkron otomatis.",
            paragraphs: [
              "Autodesk Revit merupakan salah satu perangkat lunak yang dikembangkan oleh Autodesk dan digunakan dalam proses perancangan serta dokumentasi bangunan berbasis BIM (Building Information Modeling).",
              "Revit memungkinkan pengguna untuk membuat representasi digital suatu bangunan dalam bentuk model tiga dimensi yang tidak hanya menggambarkan bentuk dan ukuran bangunan, tetapi juga memuat berbagai informasi mengenai elemen-elemen yang terdapat di dalamnya.",
              "Konsep tersebut menjadi salah satu perbedaan utama antara Revit dengan perangkat lunak drafting konvensional lainnya.",
              "Pada proses drafting konvensional, gambar denah, tampak, dan potongan umumnya dibuat sebagai gambar yang terpisah satu sama lain. Apabila terjadi perubahan pada denah, drafter harus mengubah gambar tampak dan potongan secara manual satu per satu, yang berisiko tinggi menimbulkan ketidaksesuaian antar gambar.",
              "Sementara itu, pada Revit, ketiga gambar tersebut merupakan representasi dari satu model bangunan yang saling terhubung. Perubahan yang dilakukan pada model (misalnya menggeser jendela di denah) otomatis langsung tercermin pada tampilan tampak, potongan, dan jadwal material yang berkaitan, sehingga proses revisi dan koordinasi gambar menjadi lebih terorganisir dan bebas galat.",
            ],
            keyTakeaways: [
              "Single Source of Truth: Denah, tampak, dan potongan bukan file terpisah, melainkan sudut pandang (views) dari satu model yang sama.",
              "Sinkronisasi Dua Arah: Perubahan di pandangan 3D otomatis mengupdate gambar kerja 2D dan tabel BoQ.",
              "Data Parametrik: Dinding bukan sekadar dua garis sejajar, tetapi entitas cerdas dengan ketebalan material, koefisien panas, dan harga per m².",
            ],
            visualType: "revit-vs-cad",
            labCard: {
              title: "Lab - Setup Project Template, Levels & Grids di Autodesk Revit",
              description: "Buka template standar industri AEC, atur elevasi lantai (Levels), dan buat sistem grid struktur bangunan 4 lantai sesuai panduan.",
              duration: "45 Menit Lab",
            },
          },
          {
            id: "les-2-0-2",
            code: "2.0.2",
            title: "Revit sebagai Platform Kolaboratif Terintegrasi",
            subtitle: "Mengintegrasikan Model, Data, dan Dokumentasi Proyek",
            category: "2.0 What's Revit?",
            readTime: "4 Menit",
            summary:
              "Revit bukan sekadar software gambar atau 3D, melainkan platform perancangan berbasis BIM yang mengintegrasikan model, data, dan dokumentasi kerja.",
            paragraphs: [
              "Oleh karena itu, Autodesk Revit dapat dipahami bukan hanya sebagai perangkat lunak untuk membuat gambar atau model 3D, tetapi sebagai platform perancangan berbasis BIM yang mengintegrasikan model bangunan, informasi, dan dokumentasi dalam satu sistem kerja.",
              "Penggunaan Revit membantu mengubah proses kerja dari sekadar menggambar bangunan menjadi proses memodelkan dan mengelola informasi bangunan secara terintegrasi.",
              "Dalam alur kerja modern, arsitek, drafter, estimator biaya, dan insinyur struktur dapat bekerja pada file Revit Central Model yang sama dengan sistem Worksharing, memastikan kolaborasi tanpa benturan informasi.",
            ],
            keyTakeaways: [
              "Platform Kolaboratif Terpadu: Menghubungkan seluruh fungsi teknis dalam satu alur kerja.",
              "Efisiensi Koordinasi Tim: Memangkas waktu revisi hingga 60% dibanding metode konvensional.",
              "Kesiapan Standar ISO 19650: Memenuhi tuntutan digitalisasi konstruksi global.",
            ],
            visualType: "revit-vs-cad",
          },
        ],
      },
      {
        id: "sec-2-1",
        code: "2.1",
        title: "Tingkatan Kompetensi Revit",
        lessons: [
          {
            id: "les-2-1-1",
            code: "2.1.1",
            title: "6 Tingkatan Penguasaan Pengguna Revit",
            subtitle: "Jenjang Karir & Roadmap Skill dari Beginner hingga Profesional",
            category: "2.1 Tingkatan Kompetensi",
            readTime: "6 Menit",
            summary:
              "Pengelompokan kompetensi Revit terbagi menjadi 6 tahapan: Beginner, Basic, Basic+, Intermediate, Advance, dan Profesional.",
            paragraphs: [
              "Revit sendiri mempunyai beberapa tingkatan kompetensi. Secara umum rata-rata User Revit mengelompokkannya menjadi 6 jenjang kecakapan:",
              "1. Beginner: Memahami User Interface Revit (Ribbon, Properties, Project Browser) dan melakukan Project Setup (Level, Grids, Units, & Template).",
              "2. Basic: Menguasai Architectural Modeling (Dinding, Pintu, Jendela, Lantai, Atap) dan Structural Modeling (Kolom, Balok, Pondasi).",
              "3. Basic+: Menguasai Annotation (Dimensi, Tag, Teks teknis) dan Documentation (Title block, Sheet composition, Ekspor PDF/DWG).",
              "4. Intermediate: Menghasilkan Quantity Take-Off (QTO) presisi dan Schedule (Jadwal volume material & pintu/jendela otomatis).",
              "5. Advance: Menerapkan Worksharing (Central File, Local File, Worksets) dan Koordinasi Multidisiplin (Linked Revit Models).",
              "6. Profesional: Otomasi alur kerja tingkat lanjut menggunakan Dynamo Plugin visual programming dan Parametric Family Design yang kompleks.",
            ],
            keyTakeaways: [
              "Beginner: Navigasi UI dan persiapan dasar proyek.",
              "Basic: Pemodelan elemen fisik arsitektur dan struktur.",
              "Basic+: Notasi detail dan pembuatan lembar gambar DED.",
              "Intermediate: Ekstraksi data kuantitas dan tabel biaya material.",
              "Advance: Kolaborasi multi-user dan integrasi model lintas divisi.",
              "Profesional: Otomasi skrip Dynamo dan perancangan parametrik tingkat tinggi.",
            ],
            visualType: "revit-competency",
            matchingActivity: {
              header: "2.3.2 Practice - Pasangkan Tingkatan Kompetensi Revit dengan Aktivitasnya",
              instruction: "Pasangkan setiap jenjang kecakapan Revit di kolom kiri dengan aktivitas atau kemampuan teknis yang sesuai di kolom kanan.",
              categories: [
                { id: "cat-1", category: "Beginner Level", badge: "A", correctOptionId: "opt-1" },
                { id: "cat-2", category: "Basic & Basic+ Level", badge: "B", correctOptionId: "opt-2" },
                { id: "cat-3", category: "Intermediate Level", badge: "C", correctOptionId: "opt-3" },
                { id: "cat-4", category: "Advance Level", badge: "D", correctOptionId: "opt-4" },
                { id: "cat-5", category: "Profesional Level", badge: "E", correctOptionId: "opt-5" },
              ],
              options: [
                { id: "opt-1", text: "Penguasaan User Interface Revit, navigasi Project Browser, dan Setup Levels/Grids." },
                { id: "opt-2", text: "Pemodelan elemen arsitektur/struktur fisik serta dokumentasi sheet gambar kerja DED." },
                { id: "opt-3", text: "Ekstraksi volume material Quantity Take-Off (QTO) dan jadwal biaya otomatis." },
                { id: "opt-4", text: "Penerapan Worksharing Central Model dan koordinasi model terhubung multisektor." },
                { id: "opt-5", text: "Pemrograman visual Dynamo Plugin otomasi dan custom parametric family design." },
              ],
            },
          },
        ],
      },
      {
        id: "sec-2-2",
        code: "2.2",
        title: "Alur Workflow Terstruktur",
        lessons: [
          {
            id: "les-2-2-1",
            code: "2.2.1",
            title: "Sub 1: Pondasi & Pemodelan (Beginner - Basic - Basic+)",
            subtitle: "Fase Pembentukan Pondasi Teknis & Pembuatan Gambar Kerja",
            category: "2.2 Alur Workflow Terstruktur",
            readTime: "5 Menit",
            summary:
              "Sub 1 fokus pada pondasi kuat pemodelan elemen arsitektur, struktur, dan pembuatan lembar gambar kerja standar proyek.",
            paragraphs: [
              "Untuk pengenalan awal, Workflow Revit dibagi menjadi 2 Sub Utama agar pembelajarannya menjadi lebih terstruktur dan terarah untuk persiapan jangka panjang jika ingin lebih dalam mempelajari Software Revit.",
              "Sub 1: Beginner — Basic — Basic+ merupakan pondasi wajib bagi setiap praktisi BIM. Fokus pembelajaran pada tahapan ini mencakup:",
              "• User Interface Revit: Penguasaan Ribbon, Quick Access Toolbar, Properties Palette, dan Project Browser.",
              "• Project Setup: Pengaturan koordinat proyek, sistem satuan (metric/imperial), pembuatan Grid dan Level bangunan.",
              "• Architectural Modeling: Pemodelan dinding majemuk (compound walls), lantai bertingkat, pintu, jendela, tangga, railing, dan atap.",
              "• Structural Modeling: Pemodelan kolom beton/baja, balok penopang, dan pondasi telapak/tiang pancang.",
              "• Annotation: Pemberian dimensi otomatis, elevasi level, serta penandaan (tagging) elemen secara dinamis.",
              "• Documentation: Penyusunan lembar gambar kerja (Sheet Setup), penataan viewport, hingga ekspor dokumen DED siap cetak.",
            ],
            keyTakeaways: [
              "Fokus pada Akurasi Geometri: Memastikan model 3D terbangun sesuai kaidah teknis konstruksi nyata.",
              "Dokumentasi Cepat & Konsisten: Menghilangkan inkonsistensi antara denah dan tampak.",
              "Prasyarat Menuju Sub 2: Harus dikuasai penuh sebelum melangkah ke otomasi dan analisis biaya.",
            ],
            visualType: "revit-workflows",
            metadata: { sub: 1 },
          },
          {
            id: "les-2-2-2",
            code: "2.2.2",
            title: "Sub 2: Manajemen & Otomasi (Intermediate - Advance - Profesional)",
            subtitle: "Fase Peningkatan Efisiensi: Analisis Biaya, Kolaborasi Tim & Otomasi Dynamo",
            category: "2.2 Alur Workflow Terstruktur",
            readTime: "5 Menit",
            summary:
              "Sub 2 meningkatkan kecakapan ke level manajerial: Quantity Take-Off, Worksharing multi-user, dan komputasi otomasi dengan Dynamo.",
            paragraphs: [
              "Sub 2: Intermediate — Advance — Profesional membawa pengguna ke level kapabilitas industri modern untuk memimpin koordinasi proyek besar:",
              "• Quantity Take-Off (QTO): Ekstraksi data volume beton, luasan cat, dan jumlah unit material secara real-time langsung dari model parametrik.",
              "• Schedule: Pembuatan tabel jadwal terstruktur untuk pintu, jendela, volume material, serta formula kalkulasi biaya.",
              "• Worksharing: Pengelolaan Central Model pada Local Area Network atau Cloud CDE, sistem check-out Worksets, serta resolusi konflik editing antar anggota tim.",
              "• Coordination: Penyelarasan model terhubung (Linked Models) lintas disiplin Arsitektur, Struktur, dan MEP dengan fitur Copy/Monitor.",
              "• Dynamo Plugin: Pemrograman visual node-based untuk mengotomasi tugas berulang (seperti penomoran ruang otomatis, pembuatan sheet massal).",
              "• Parametric Design: Pembuatan komponen cerdas (Custom Family RFA) dengan parameter fleksibel yang dapat beradaptasi terhadap perubahan desain kompleks.",
            ],
            keyTakeaways: [
              "Efisiensi Skala Industri: Menangani proyek gedung puluhan lantai dengan kolaborasi simultan puluhan modeler.",
              "Otomasi Bebas Human Error: Menghemat ratusan jam kerja repetitif melalui skrip Dynamo.",
              "Kesiapan Karir Tingkat Tinggi: Membuka peluang profesi sebagai BIM Coordinator, BIM Manager, dan Computational Specialist.",
            ],
            visualType: "revit-workflows",
            metadata: { sub: 2 },
          },
          {
            id: "les-2-2-3",
            code: "2.2.3",
            title: "Panduan & Rekomendasi Alur Belajar Terarah",
            subtitle: "Pedoman Penting Mengikuti Alur Kurikulum Secara Bertahap",
            category: "2.2 Alur Workflow Terstruktur",
            readTime: "3 Menit",
            summary:
              "Pedoman penting: Pelajari kurikulum sesuai alur yang telah tertera untuk kemudahan dalam proses pembelajaran.",
            paragraphs: [
              "*Notes Penting Pembelajaran:*",
              "Sebaiknya dipelajari sesuai alur yang telah tertera, untuk kemudahan dalam proses pembelajaran nantinya.",
              "Mencoba melompati tahap dasar (seperti langsung ke Dynamo atau Worksharing tanpa memahami Project Setup dan Modeling Dasar) seringkali menyebabkan kebingungan struktural saat menyelesaikan proyek nyata.",
              "Dengan mengikuti kurikulum terstruktur dari Modul 1 (Prinsip BIM & Ekosistem AEC) menuju Modul 2 Sub 1 (Pondasi Modeling) dan diakhiri Sub 2 (Manajemen & Otomasi), Anda akan membangun pondasi keahlian yang kokoh, kredibel, dan siap bersaing di industri konstruksi digital global.",
            ],
            keyTakeaways: [
              "Ikuti Urutan Berjenjang: Mulai dari konsep dasar, pemodelan fisik, dokumentasi, hingga manajemen dan otomasi.",
              "Latihan Praktis: Terapkan setiap materi langsung pada software Revit untuk membangun muscle memory.",
              "Konsultasi Terbuka: Diskusikan pertanyaan dan tantangan proyek bersama mentor instruktur BIMCourse.",
            ],
            visualType: "revit-workflows",
            metadata: { sub: "notes" },
            quizIntro: {
              title: "Quiz - Evaluasi Komprehensif Ekosistem BIM & Autodesk Revit",
              questionsCount: 3,
              passRatePercent: 70,
              attempts: "unlimited attempts",
              timeLimit: "no time limit",
              questions: [
                {
                  id: "sample-q-1",
                  type: "multiple_choice",
                  prompt: "Apa keuntungan utama penggunaan BIM (Building Information Modeling) dibandingkan CAD 2D konvensional?",
                  options: [
                    { id: "opt-1", text: "Integrasi data parametrik 3D yang otomatis memperbarui potongan, tampak, dan jadwal volume (BoQ)", isCorrect: true },
                    { id: "opt-2", text: "Hanya menghasilkan gambar garis hitam-putih tanpa database", isCorrect: false },
                    { id: "opt-3", text: "Membutuhkan waktu revisi manual lebih lama untuk setiap lembar gambar", isCorrect: false },
                    { id: "opt-4", text: "Tidak dapat berkolaborasi antar disiplin struktur dan MEP", isCorrect: false },
                  ],
                  weight: 30,
                },
                {
                  id: "sample-q-2",
                  type: "essay",
                  prompt: "Jelaskan peran Level of Development (LOD) dari LOD 200 hingga LOD 400 dalam siklus proyek konstruksi berbasis BIM!",
                  sampleAnswer: "LOD mendefinisikan tingkat kedalaman geometri dan informasi elemen: LOD 200 skematik perkiraan, LOD 300 desain spesifik untuk tender/perizinan, LOD 350 koordinasi interface antar sistem, LOD 400 fabrikasi/shop drawing siap rakit.",
                  weight: 35,
                },
                {
                  id: "sample-q-3",
                  type: "file_upload",
                  prompt: "Unggah file proyek Revit (.rvt) atau file ekspor IFC hasil latihan pemodelan elemen arsitektur dasar Anda untuk dievaluasi oleh pengajar.",
                  allowedFormats: ".rvt, .dwg, .pdf, .zip, .ifc",
                  maxSizeMb: 50,
                  sampleAnswer: "Pastikan model memiliki grid level teratur, dinding terkoneksi ke level lantai atas, dan tidak ada clash geometri mayor.",
                  weight: 35,
                },
              ],
            },
          },
        ],
      },
    ],
  },
];

// Helper to get flat lessons list
export const getAllLessons = (): CurriculumLesson[] => {
  const all: CurriculumLesson[] = [];
  BIM_MODULES.forEach((mod) => {
    mod.sections.forEach((sec) => {
      sec.lessons.forEach((les) => {
        all.push(les);
      });
    });
  });
  return all;
};

// Helper to find a lesson by ID or Code
export const findLesson = (idOrCode: string): CurriculumLesson | undefined => {
  return getAllLessons().find(
    (les) => les.id === idOrCode || les.code === idOrCode
  );
};
