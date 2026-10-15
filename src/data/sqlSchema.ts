export const SQL_POSTGRESQL = `-- ============================================================================
-- SKEMA DATABASE: BerkahOne Client
-- Sistem Informasi Pengelolaan Keuangan RT 10 RW 04 Kel. Pedurungan Lor
-- Dialek: PostgreSQL / Supabase Compatible
-- ============================================================================

-- Aktifkan ekstensi UUID jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL: users (Autentikasi & Akun Pengurus/Warga)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ketua_rt', 'sekretaris', 'bendahara', 'warga')),
    status_aktif BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pencarian login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. TABEL: warga (Master Data Kependudukan RT 10 RW 04)
CREATE TABLE IF NOT EXISTS warga (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    nomor_kk VARCHAR(16) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin VARCHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    alamat_rumah TEXT NOT NULL,
    nomor_rumah VARCHAR(20) NOT NULL,
    rt VARCHAR(5) DEFAULT '10',
    rw VARCHAR(5) DEFAULT '04',
    kelurahan VARCHAR(100) DEFAULT 'Pedurungan Lor',
    kecamatan VARCHAR(100) DEFAULT 'Pedurungan',
    kota VARCHAR(100) DEFAULT 'Semarang',
    status_kependudukan VARCHAR(20) DEFAULT 'tetap' CHECK (status_kependudukan IN ('tetap', 'kontrak', 'kost')),
    status_keluarga VARCHAR(30) DEFAULT 'kepala_keluarga' CHECK (status_keluarga IN ('kepala_keluarga', 'istri', 'anak', 'anggota')),
    no_telp VARCHAR(20),
    pekerjaan VARCHAR(100),
    jumlah_anggota_keluarga INT DEFAULT 1,
    status_aktif BOOLEAN DEFAULT true,
    tanggal_masuk DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warga_nik ON warga(nik);
CREATE INDEX IF NOT EXISTS idx_warga_nomor_kk ON warga(nomor_kk);
CREATE INDEX IF NOT EXISTS idx_warga_nomor_rumah ON warga(nomor_rumah);
CREATE INDEX IF NOT EXISTS idx_warga_user_id ON warga(user_id);

-- 3. TABEL: iuran_wajib (Catatan Bulanan Keamanan, Kebersihan, Kas)
CREATE TABLE IF NOT EXISTS iuran_wajib (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warga_id UUID NOT NULL REFERENCES warga(id) ON DELETE CASCADE,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL CHECK (tahun >= 2024),
    jenis_iuran VARCHAR(50) DEFAULT 'keamanan_kebersihan' CHECK (jenis_iuran IN ('keamanan_kebersihan', 'kas_rt', 'sampah')),
    jumlah_nominal DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
    tanggal_bayar DATE,
    metode_bayar VARCHAR(30) CHECK (metode_bayar IN ('tunai', 'transfer_bca', 'transfer_bri', 'qris')),
    bukti_transfer_url TEXT,
    status_verifikasi VARCHAR(30) DEFAULT 'belum_bayar' CHECK (status_verifikasi IN ('belum_bayar', 'menunggu_verifikasi', 'lunas', 'ditolak')),
    nomor_kwitansi VARCHAR(50) UNIQUE,
    diverifikasi_oleh UUID REFERENCES users(id) ON DELETE SET NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Menghindari duplikasi pembayaran iuran yang sama pada bulan & tahun yang sama
    CONSTRAINT uq_warga_iuran_periode UNIQUE (warga_id, bulan, tahun, jenis_iuran)
);

CREATE INDEX IF NOT EXISTS idx_iuran_periode ON iuran_wajib(tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_iuran_status ON iuran_wajib(status_verifikasi);
CREATE INDEX IF NOT EXISTS idx_iuran_warga ON iuran_wajib(warga_id);

-- 4. TABEL: pengeluaran (Catatan Uang Keluar Operasional RT)
CREATE TABLE IF NOT EXISTS pengeluaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN (
        'kebersihan_lingkungan', 
        'keamanan_pos_ronda', 
        'perbaikan_fasilitas', 
        'kegiatan_warga_17an', 
        'operasional_rt', 
        'lainnya'
    )),
    judul_pengeluaran VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    nominal DECIMAL(12,2) NOT NULL CHECK (nominal > 0),
    tanggal_pengeluaran DATE NOT NULL DEFAULT CURRENT_DATE,
    penanggung_jawab VARCHAR(150) NOT NULL,
    bukti_nota_url TEXT,
    disetujui_oleh UUID REFERENCES users(id) ON DELETE SET NULL,
    status_approval VARCHAR(20) DEFAULT 'disetujui' CHECK (status_approval IN ('draft', 'disetujui', 'ditolak')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pengeluaran_tanggal ON pengeluaran(tanggal_pengeluaran);
CREATE INDEX IF NOT EXISTS idx_pengeluaran_kategori ON pengeluaran(kategori);

-- 5. TABEL: kas_sosial (Dana Darurat & Santunan Duka/Sakit Warga)
CREATE TABLE IF NOT EXISTS kas_sosial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipe_transaksi VARCHAR(10) NOT NULL CHECK (tipe_transaksi IN ('masuk', 'keluar')),
    warga_id UUID REFERENCES warga(id) ON DELETE SET NULL,
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN (
        'santunan_kematian', 
        'bantuan_sakit', 
        'bencana_alam', 
        'jimpitan_sukarela', 
        'donasi_khusus'
    )),
    nominal DECIMAL(12,2) NOT NULL CHECK (nominal > 0),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan TEXT NOT NULL,
    bukti_lampiran_url TEXT,
    dicatat_oleh UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kas_sosial_tanggal ON kas_sosial(tanggal);
CREATE INDEX IF NOT EXISTS idx_kas_sosial_tipe ON kas_sosial(tipe_transaksi);

-- ============================================================================
-- VIEW: Ringkasan Saldo Kas RT & Saldo Kas Sosial
-- ============================================================================
CREATE OR REPLACE VIEW v_rekap_kas_rt AS
SELECT 
    (COALESCE((SELECT SUM(jumlah_nominal) FROM iuran_wajib WHERE status_verifikasi = 'lunas'), 0) -
     COALESCE((SELECT SUM(nominal) FROM pengeluaran WHERE status_approval = 'disetujui'), 0)) AS saldo_kas_rt,
    (COALESCE((SELECT SUM(nominal) FROM kas_sosial WHERE tipe_transaksi = 'masuk'), 0) -
     COALESCE((SELECT SUM(nominal) FROM kas_sosial WHERE tipe_transaksi = 'keluar'), 0)) AS saldo_kas_sosial;
`;

export const SQL_MYSQL = `-- ============================================================================
-- SKEMA DATABASE: BerkahOne Client (MySQL / MariaDB / Laravel Ready)
-- Sistem Informasi Pengelolaan Keuangan RT 10 RW 04 Kel. Pedurungan Lor
-- ============================================================================

CREATE DATABASE IF NOT EXISTS berkahone_rt10 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE berkahone_rt10;

-- 1. TABEL: users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    role ENUM('ketua_rt', 'bendahara', 'warga') NOT NULL DEFAULT 'warga',
    status_aktif TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL: warga
CREATE TABLE IF NOT EXISTS warga (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    nomor_kk VARCHAR(16) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat_rumah TEXT NOT NULL,
    nomor_rumah VARCHAR(20) NOT NULL,
    rt VARCHAR(5) DEFAULT '10',
    rw VARCHAR(5) DEFAULT '04',
    kelurahan VARCHAR(100) DEFAULT 'Pedurungan Lor',
    kecamatan VARCHAR(100) DEFAULT 'Pedurungan',
    kota VARCHAR(100) DEFAULT 'Semarang',
    status_kependudukan ENUM('tetap', 'kontrak', 'kost') DEFAULT 'tetap',
    status_keluarga ENUM('kepala_keluarga', 'istri', 'anak', 'anggota') DEFAULT 'kepala_keluarga',
    no_telp VARCHAR(20) NULL,
    pekerjaan VARCHAR(100) NULL,
    jumlah_anggota_keluarga INT DEFAULT 1,
    status_aktif TINYINT(1) DEFAULT 1,
    tanggal_masuk DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_warga_nik (nik),
    INDEX idx_warga_nomor_kk (nomor_kk),
    INDEX idx_warga_nomor_rumah (nomor_rumah),
    CONSTRAINT fk_warga_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL: iuran_wajib
CREATE TABLE IF NOT EXISTS iuran_wajib (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    warga_id BIGINT UNSIGNED NOT NULL,
    bulan TINYINT UNSIGNED NOT NULL COMMENT '1-12',
    tahun INT UNSIGNED NOT NULL COMMENT 'Contoh 2026',
    jenis_iuran ENUM('keamanan_kebersihan', 'kas_rt', 'sampah') DEFAULT 'keamanan_kebersihan',
    jumlah_nominal DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
    tanggal_bayar DATE NULL,
    metode_bayar ENUM('tunai', 'transfer_bca', 'transfer_bri', 'qris') NULL,
    bukti_transfer_url TEXT NULL,
    status_verifikasi ENUM('belum_bayar', 'menunggu_verifikasi', 'lunas', 'ditolak') DEFAULT 'belum_bayar',
    nomor_kwitansi VARCHAR(50) UNIQUE NULL,
    diverifikasi_oleh BIGINT UNSIGNED NULL,
    catatan TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_warga_iuran (warga_id, bulan, tahun, jenis_iuran),
    INDEX idx_iuran_periode (tahun, bulan),
    INDEX idx_iuran_status (status_verifikasi),
    CONSTRAINT fk_iuran_warga FOREIGN KEY (warga_id) REFERENCES warga(id) ON DELETE CASCADE,
    CONSTRAINT fk_iuran_verifier FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL: pengeluaran
CREATE TABLE IF NOT EXISTS pengeluaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kategori ENUM(
        'kebersihan_lingkungan', 
        'keamanan_pos_ronda', 
        'perbaikan_fasilitas', 
        'kegiatan_warga_17an', 
        'operasional_rt', 
        'lainnya'
    ) NOT NULL,
    judul_pengeluaran VARCHAR(200) NOT NULL,
    deskripsi TEXT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    tanggal_pengeluaran DATE NOT NULL,
    penanggung_jawab VARCHAR(150) NOT NULL,
    bukti_nota_url TEXT NULL,
    disetujui_oleh BIGINT UNSIGNED NULL,
    status_approval ENUM('draft', 'disetujui', 'ditolak') DEFAULT 'disetujui',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pengeluaran_tanggal (tanggal_pengeluaran),
    INDEX idx_pengeluaran_kategori (kategori),
    CONSTRAINT fk_pengeluaran_approver FOREIGN KEY (disetujui_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL: kas_sosial
CREATE TABLE IF NOT EXISTS kas_sosial (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipe_transaksi ENUM('masuk', 'keluar') NOT NULL,
    warga_id BIGINT UNSIGNED NULL,
    kategori ENUM(
        'santunan_kematian', 
        'bantuan_sakit', 
        'bencana_alam', 
        'jimpitan_sukarela', 
        'donasi_khusus'
    ) NOT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    tanggal DATE NOT NULL,
    keterangan TEXT NOT NULL,
    bukti_lampiran_url TEXT NULL,
    dicatat_oleh BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kas_sosial_tanggal (tanggal),
    INDEX idx_kas_sosial_tipe (tipe_transaksi),
    CONSTRAINT fk_kas_sosial_warga FOREIGN KEY (warga_id) REFERENCES warga(id) ON DELETE SET NULL,
    CONSTRAINT fk_kas_sosial_recorder FOREIGN KEY (dicatat_oleh) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export const SQL_SEED_DATA = `-- ============================================================================
-- CONTOH DATA SEED AWAL: RT 10 RW 04 Kel. Pedurungan Lor
-- ============================================================================

-- Data Pengguna Login
INSERT INTO users (id, nama, email, username, password_hash, no_hp, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'Didik Soemiarsono (Ketua RT)', 'didik.rt10@gmail.com', 'didik_rt10', '$2y$10$abcdefghijklmnopqrstuv', '081234567890', 'ketua_rt'),
('22222222-2222-2222-2222-222222222222', 'Taufik Hidayat (Sekretaris)', 'taufik.rt10@gmail.com', 'taufik_sekretaris', '$2y$10$abcdefghijklmnopqrstuv', '081298765432', 'sekretaris'),
('33333333-3333-3333-3333-333333333333', 'Ardian Ariawan (Bendahara)', 'ardian.rt10@gmail.com', 'ardian_bendahara', '$2y$10$abcdefghijklmnopqrstuv', '081398765432', 'bendahara'),
('44444444-4444-4444-4444-444444444444', 'Bpk. Joko Santoso (Warga)', 'joko.santoso@gmail.com', 'joko_b4', '$2y$10$abcdefghijklmnopqrstuv', '085711223344', 'warga');

-- Data Warga RT 10 RW 04
INSERT INTO warga (id, user_id, nomor_kk, nik, nama_lengkap, jenis_kelamin, alamat_rumah, nomor_rumah, rt, rw, kelurahan, status_kependudukan, status_keluarga, no_telp, pekerjaan) VALUES
('w01-1111-2222', '11111111-1111-1111-1111-111111111111', '3374011204050001', '3374011508750001', 'Didik Soemiarsono', 'L', 'Jl. Pedurungan Lor Gang Mawar', 'A-01', '10', '04', 'Pedurungan Lor', 'tetap', 'kepala_keluarga', '081234567890', 'Wiraswasta / Ketua RT'),
('w02-2222-3333', '22222222-2222-2222-2222-222222222222', '3374011204050002', '3374012105820002', 'Taufik Hidayat', 'L', 'Jl. Pedurungan Lor Gang Mawar', 'A-02', '10', '04', 'Pedurungan Lor', 'tetap', 'kepala_keluarga', '081298765432', 'Sekretaris RT 10'),
('w03-3333-4444', '33333333-3333-3333-3333-333333333333', '3374011204050003', '3374011809850003', 'Ardian Ariawan', 'L', 'Jl. Pedurungan Lor Gang Mawar', 'A-03', '10', '04', 'Pedurungan Lor', 'tetap', 'kepala_keluarga', '081398765432', 'Bendahara RT 10'),
('w04-4444-5555', '44444444-4444-4444-4444-444444444444', '3374011204050004', '3374012102830004', 'Joko Santoso', 'L', 'Jl. Pedurungan Lor Gang Melati', 'B-04', '10', '04', 'Pedurungan Lor', 'tetap', 'kepala_keluarga', '085711223344', 'Karyawan Swasta');

-- Data Iuran Wajib (Contoh Bulan 9 & 10 Tahun 2026)
INSERT INTO iuran_wajib (warga_id, bulan, tahun, jenis_iuran, jumlah_nominal, tanggal_bayar, metode_bayar, status_verifikasi, nomor_kwitansi) VALUES
('w01-1111-2222', 9, 2026, 'keamanan_kebersihan', 50000, '2026-09-02', 'transfer_bca', 'lunas', 'KWT/2026/09/001'),
('w02-2222-3333', 9, 2026, 'keamanan_kebersihan', 50000, '2026-09-03', 'tunai', 'lunas', 'KWT/2026/09/002'),
('w03-3333-4444', 9, 2026, 'keamanan_kebersihan', 50000, '2026-09-05', 'qris', 'lunas', 'KWT/2026/09/003'),
('w04-4444-5555', 9, 2026, 'keamanan_kebersihan', 50000, '2026-09-08', 'transfer_bri', 'lunas', 'KWT/2026/09/004'),
('w05-5555-6666', 9, 2026, 'keamanan_kebersihan', 50000, NULL, NULL, 'belum_bayar', NULL);

-- Data Pengeluaran Operasional RT
INSERT INTO pengeluaran (kategori, judul_pengeluaran, deskripsi, nominal, tanggal_pengeluaran, penanggung_jawab, status_approval) VALUES
('keamanan_pos_ronda', 'Insentif & Konsumsi Petugas Pos Kamling', 'Uang kopi, snack ronda malam dan honor petugas jaga bulan September', 450000, '2026-09-15', 'Pak Mulyono (Sie Keamanan)', 'disetujui'),
('kebersihan_lingkungan', 'Upah Angkut Sampah & Pembersihan Selokan', 'Honor petugas sampah roda tiga dan sapu massal got gang Melati', 350000, '2026-09-20', 'Pak Joko Santoso', 'disetujui'),
('perbaikan_fasilitas', 'Ganti 3 Bohlam Lampu PJU Gang Mawar & Fiting', 'Penggantian lampu penerangan jalan umum yang putus', 185000, '2026-09-22', 'Pak Agus (Sie Sarpras)', 'disetujui');

-- Data Kas Sosial (Darurat / Jimpitan / Santunan)
INSERT INTO kas_sosial (tipe_transaksi, warga_id, kategori, nominal, tanggal, keterangan, dicatat_oleh) VALUES
('masuk', NULL, 'jimpitan_sukarela', 380000, '2026-09-10', 'Pengumpulan Jimpitan Koin Rombong Warga Minggu I-II', '22222222-2222-2222-2222-222222222222'),
('keluar', 'w04-4444-5555', 'bantuan_sakit', 300000, '2026-09-18', 'Santunan rawat inap Ibu Siti (Keluarga Bpk. Ahmad Fadillah di RSUD KRMT Wongsonegoro)', '22222222-2222-2222-2222-222222222222');
`;
