export type Role = 'ketua_rt' | 'sekretaris' | 'bendahara' | 'warga';

export interface User {
  id: string;
  warga_id?: string;
  nama: string;
  email: string;
  username: string;
  password?: string;
  role: Role;
  no_hp: string;
  status_aktif: boolean;
  avatar?: string;
}

export type StatusKependudukan = 'tetap' | 'kontrak' | 'kost';
export type StatusKeluarga = 'kepala_keluarga' | 'istri' | 'anak' | 'anggota';

export interface Warga {
  id: string;
  nomor_kk: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  alamat_rumah: string;
  nomor_rumah: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  status_kependudukan: StatusKependudukan;
  status_keluarga: StatusKeluarga;
  no_telp: string;
  pekerjaan: string;
  jumlah_anggota_keluarga: number;
  status_aktif: boolean;
  tanggal_masuk: string;
}

export type StatusVerifikasiIuran = 'lunas' | 'menunggu_verifikasi' | 'belum_bayar' | 'ditolak';
export type MetodeBayar = 'tunai' | 'transfer_bca' | 'transfer_bri' | 'qris';
export type JenisIuran = 'keamanan_kebersihan' | 'kas_rt' | 'sampah';

export interface IuranWajib {
  id: string;
  warga_id: string;
  nama_warga?: string;
  nomor_rumah?: string;
  bulan: number; // 1-12
  tahun: number;
  jenis_iuran: JenisIuran;
  jumlah_nominal: number;
  tanggal_bayar?: string;
  metode_bayar?: MetodeBayar;
  bukti_transfer_url?: string;
  status_verifikasi: StatusVerifikasiIuran;
  diverifikasi_oleh?: string;
  nomor_kwitansi?: string;
  catatan?: string;
}

export type KategoriPengeluaran =
  | 'kebersihan_lingkungan'
  | 'keamanan_pos_ronda'
  | 'perbaikan_fasilitas'
  | 'kegiatan_warga_17an'
  | 'operasional_rt'
  | 'lainnya';

export interface Pengeluaran {
  id: string;
  kategori: KategoriPengeluaran;
  judul_pengeluaran: string;
  deskripsi: string;
  nominal: number;
  tanggal_pengeluaran: string;
  penanggung_jawab: string;
  bukti_nota_url?: string;
  disetujui_oleh: string;
  status_approval: 'disetujui' | 'draft' | 'ditolak';
}

export type TipeKasSosial = 'masuk' | 'keluar';
export type KategoriKasSosial =
  | 'santunan_kematian'
  | 'bantuan_sakit'
  | 'bencana_alam'
  | 'jimpitan_sukarela'
  | 'donasi_khusus';

export interface KasSosial {
  id: string;
  tipe_transaksi: TipeKasSosial;
  warga_id?: string;
  nama_warga?: string;
  kategori: KategoriKasSosial;
  nominal: number;
  tanggal: string;
  keterangan: string;
  bukti_lampiran_url?: string;
  dicatat_oleh: string;
}

export interface TechStackComparison {
  id: string;
  name: string;
  stackBadge: string;
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  deploymentTarget: string;
  estimatedCost: string;
  scoreSimplicity: number; // 1-10
  scoreScalability: number; // 1-10
  scoreCost: number; // 1-10
  isRecommended: boolean;
  pros: string[];
  cons: string[];
  summary: string;
}

export interface AuditLog {
  id: string;
  waktu: string;
  pengguna: string;
  role: Role;
  aksi: string;
  rincian: string;
  kategori: 'warga' | 'iuran' | 'pengeluaran' | 'kas_sosial' | 'auth' | 'system';
}
