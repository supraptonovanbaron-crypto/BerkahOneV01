import { TechStackComparison } from '../types';

export const TECH_STACK_OPTIONS: TechStackComparison[] = [
  {
    id: 'supabase-react',
    name: 'React / Next.js + Supabase (PostgreSQL)',
    stackBadge: 'Sangat Direkomendasikan (Biaya Rp 0)',
    frontend: 'React / Next.js + Tailwind CSS + Lucide Icons',
    backend: 'Supabase Serverless Edge Functions + Postgres PostgREST API',
    database: 'PostgreSQL (Supabase Cloud)',
    auth: 'Supabase Auth (Email OTP / WhatsApp OTP / Password)',
    deploymentTarget: 'Vercel / Cloudflare Pages (Frontend) + Supabase Free Tier (Backend & DB)',
    estimatedCost: 'Rp 0 / Bulan (100% Free Tier mencakup hingga 500 MB DB & 50.000 user aktif bulanan)',
    scoreSimplicity: 9,
    scoreScalability: 9,
    scoreCost: 10,
    isRecommended: true,
    pros: [
      'Hosting 100% Gratis: Free tier Vercel + Supabase sangat cukup untuk skala RT (puluhan hingga ratusan KK).',
      'Database PostgreSQL Handal: Memiliki fitur Relasi, Foreign Key, dan ACID compliance.',
      'Row Level Security (RLS) Bawaan: Keamanan data warga terisolasi langsung di level database.',
      'Realtime Sync: Ketika bendahara memvalidasi iuran, dashboard warga langsung terupdate tanpa refresh.',
      'Storage Gratis 1 GB: Sangat cukup untuk menyimpan ribuan foto bukti transfer dan struk nota belanja RT.',
      'Mudah integrasi WhatsApp Bot (misal Fonnte / Wablas) via Supabase Database Webhook.'
    ],
    cons: [
      'Proyek Supabase free tier akan pause otomatis jika tidak ada request selama 7 hari berturut-turut (bisa di-ping via cron/UptimeRobot gratis).',
      'Memerlukan pemahaman dasar aturan PostgreSQL RLS.'
    ],
    summary:
      'Solusi paling modern, efisien, dan tanpa beban biaya bulanan untuk kas RT. Tidak butuh sewa VPS atau setting server Linux rumit.'
  },
  {
    id: 'laravel-mysql',
    name: 'Laravel 11 + MySQL (Filament Admin v3)',
    stackBadge: 'Paling Populer untuk Shared Hosting cPanel',
    frontend: 'Blade + Tailwind CSS / Livewire / Filament Admin',
    backend: 'PHP 8.2+ (Laravel 11)',
    database: 'MySQL 8.0 / MariaDB',
    auth: 'Laravel Breeze / Fortify',
    deploymentTarget: 'Shared Hosting Indonesia (cPanel: Niagahoster, DomaiNesia, IDCloudHost)',
    estimatedCost: 'Rp 15.000 – Rp 35.000 / Bulan (Shared hosting reguler)',
    scoreSimplicity: 8,
    scoreScalability: 8,
    scoreCost: 8,
    isRecommended: false,
    pros: [
      'Filament v3: Dashboard admin pengurus RT (CRUD warga, iuran, pengeluaran) bisa jadi hanya dalam 1-2 hari coding.',
      'Bisa jalan di Shared Hosting murah Indonesia: Cukup upload file ZIP ke public_html cPanel.',
      'Ekosistem PHP sangat melimpah dokumentasinya dan mudah diteruskan oleh pengurus RT yang berlatar belakang IT.',
      'Mudah export PDF (dompdf/snappy) untuk kwitansi iuran & laporan keuangan bulanan.'
    ],
    cons: [
      'Ada biaya sewa hosting tahunan (sekitar Rp 200.000 - Rp 350.000/tahun dari uang kas RT).',
      'Perlu backup database manual secara berkala di cPanel phpMyAdmin.'
    ],
    summary:
      'Pilihan terbaik jika RT sudah memiliki sewa domain/web hosting sendiri dan ingin fitur panel admin yang cepat jadi menggunakan Filament v3.'
  },
  {
    id: 'express-react',
    name: 'React SPA + Node.js (Express / Fastify) + SQLite / Postgres',
    stackBadge: 'Fleksibel & Full Control',
    frontend: 'Vite + React + Tailwind CSS',
    backend: 'Node.js Express / NestJS',
    database: 'PostgreSQL / SQLite via Prisma ORM / Drizzle ORM',
    auth: 'JWT (JSON Web Token) + bcrypt',
    deploymentTarget: 'VPS DigitalOcean / Linode / Railway / Render',
    estimatedCost: 'Rp 70.000 – Rp 100.000 / Bulan (atau Free Tier di Render/Railway)',
    scoreSimplicity: 7,
    scoreScalability: 9,
    scoreCost: 7,
    isRecommended: false,
    pros: [
      'Satu bahasa (Fullstack JavaScript / TypeScript) dari frontend hingga backend.',
      'Sangat leluasa membuat logic custom (misal cetak PDF, kirim notifikasi WA massal).',
      'Bisa dijalankan secara offline di PC lokal sekretariat RT bila internet mati (menggunakan SQLite).'
    ],
    cons: [
      'Perlu setup boilerplates autentikasi, CORS, middleware, dan security headers secara manual.',
      'Perlu maintenance server jika memakai VPS.'
    ],
    summary:
      'Bagus untuk tim pengembang yang ingin kontrol penuh terhadap arsitektur API dan integrasi pihak ketiga.'
  }
];

export const WORKFLOW_EXPLANATION = [
  {
    step: '1. Registrasi & Manajemen Data Warga (Tabel `warga` & `users`)',
    actor: 'Ketua RT / Bendahara / Warga',
    description:
      'Bendahara mendata setiap Kepala Keluarga (KK) ke dalam tabel `warga`. Jika warga ingin mengakses portal mandiri untuk cek riwayat iuran, akun dibuatkan di tabel `users` dengan role `warga` dan di-link lewat foreign key `user_id`. Ketua RT dan Bendahara memiliki role khusus dengan hak akses verifikasi dan approval.',
    badge: 'Master Data'
  },
  {
    step: '2. Penerbitan Tagihan & Pembayaran Iuran (Tabel `iuran_wajib`)',
    actor: 'Warga & Bendahara',
    description:
      'Setiap awal bulan, tagihan iuran rutin (keamanan + sampah + kebersihan, misal Rp 50.000/bulan) digenerate. Warga dapat membayar secara tunai langsung ke bendahara atau transfer (BCA/BRI/QRIS RT) lalu mengunggah bukti transfer. Status pembayaran: `belum_bayar` -> `menunggu_verifikasi` -> `lunas`. Setelah lunas, sistem menerbitkan e-Kwitansi dengan nomor unik.',
    badge: 'Pemasukan Kas'
  },
  {
    step: '3. Pencatatan Operasional & Kegiatan RT (Tabel `pengeluaran`)',
    actor: 'Bendahara & Ketua RT',
    description:
      'Pengeluaran kas RT (honor ronda pos kamling, upah petugas sampah, pembelian lampu PJU, konsumsi rapat warga) dicatat oleh Bendahara lengkap dengan foto nota fisik. Ketua RT memverifikasi dan menyetujui (`disetujui`) sehingga saldo kas utama berkurang secara transparan.',
    badge: 'Pengeluaran Kas'
  },
  {
    step: '4. Dana Darurat & Jimpitan Warga (Tabel `kas_sosial`)',
    actor: 'Pengurus Sosial & Bendahara',
    description:
      'Dipisahkan dari kas operasional RT agar tidak tercampur. Uang masuk bersumber dari jimpitan koin warga atau donasi sukarela. Uang keluar disalurkan untuk santunan warga berduka cita (kematian), bantuan rawat inap sakit, atau musibah kebencanaan.',
    badge: 'Dana Sosial'
  },
  {
    step: '5. Transparansi & Rekap Laporan Bulanan (View & Broadcast WA)',
    actor: 'Semua Warga RT 10 RW 04',
    description:
      'Setiap akhir bulan, sistem menghasilkan rekapitulasi kas bersih (Total Iuran Masuk - Total Pengeluaran) dan saldo Kas Sosial. Laporan dapat diexport ke format teks rapi untuk dibagikan langsung ke grup WhatsApp warga RT 10 RW 04 Pedurungan Lor.',
    badge: 'Transparansi'
  }
];
