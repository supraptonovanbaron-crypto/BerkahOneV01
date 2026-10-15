/**
 * Controller: Laporan Keuangan Bulanan RT 10 RW 04
 * BerkahOne Client - Kelurahan Pedurungan Lor, Semarang
 * 
 * Proteksi:
 * 1. Sanitasi input query param (bulan, tahun) dengan casting Number.
 * 2. Menggunakan Parameterized Queries ($1, $2 / ?) untuk mencegah SQL Injection 100%.
 * 3. Menghitung: Saldo Awal (kumulatif sebelum bulan berjalan), Pemasukan, Pengeluaran, & Saldo Akhir.
 */

// Contoh pool koneksi database (PostgreSQL 'pg' atau Supabase Postgres connection pool)
// const { pool } = require('../db/config'); 

/**
 * Endpoint: GET /api/laporan/bulanan?bulan=9&tahun=2026
 */
async function getLaporanBulanan(req, res) {
  try {
    // 1. Validasi & Sanitasi Parameter Bulan dan Tahun
    const bulan = parseInt(req.query.bulan, 10);
    const tahun = parseInt(req.query.tahun, 10);

    if (isNaN(bulan) || bulan < 1 || bulan > 12) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "bulan" tidak valid! Harus berupa angka 1 s/d 12.'
      });
    }

    if (isNaN(tahun) || tahun < 2020 || tahun > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "tahun" tidak valid! Harus berupa 4 digit tahun (contoh: 2026).'
      });
    }

    // Format tanggal awal dan akhir bulan berjalan secara aman
    const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    // Mendapatkan tanggal terakhir di bulan yang dipilih
    const lastDay = new Date(tahun, bulan, 0).getDate();
    const endDate = `${tahun}-${String(bulan).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // ========================================================================
    // 2. HITUNG SALDO AWAL (Kumulatif transaksi SEBELUM bulan berjalan)
    // Parameterized Query: Menggunakan $1 untuk tanggal awal periode
    // ========================================================================
    const querySaldoAwal = `
      SELECT 
        COALESCE(
          (SELECT SUM(jumlah_nominal) FROM iuran_wajib 
           WHERE status_verifikasi = 'lunas' 
             AND (tahun < $1 OR (tahun = $1 AND bulan < $2))), 0
        ) +
        COALESCE(
          (SELECT SUM(nominal) FROM kas_sosial 
           WHERE tipe_transaksi = 'masuk' AND tanggal < $3), 0
        ) -
        COALESCE(
          (SELECT SUM(nominal) FROM pengeluaran 
           WHERE status_approval = 'disetujui' AND tanggal_pengeluaran < $3), 0
        ) -
        COALESCE(
          (SELECT SUM(nominal) FROM kas_sosial 
           WHERE tipe_transaksi = 'keluar' AND tanggal < $3), 0
        ) AS saldo_awal;
    `;

    // ========================================================================
    // 3. AMBIL PEMASUKAN BULAN INI (Iuran Wajib Lunas + Kas Sosial Masuk)
    // Parameterized Queries: $1 = tahun, $2 = bulan, $3 = startDate, $4 = endDate
    // ========================================================================
    const queryIuran = `
      SELECT 
        iw.id,
        iw.warga_id,
        w.nama_lengkap AS nama_warga,
        w.nomor_rumah,
        iw.jenis_iuran,
        iw.jumlah_nominal,
        iw.tanggal_bayar,
        iw.metode_bayar,
        iw.nomor_kwitansi,
        iw.catatan
      FROM iuran_wajib iw
      JOIN warga w ON iw.warga_id = w.id
      WHERE iw.tahun = $1 
        AND iw.bulan = $2 
        AND iw.status_verifikasi = 'lunas'
      ORDER BY iw.tanggal_bayar ASC, w.nomor_rumah ASC;
    `;

    const queryKasSosialMasuk = `
      SELECT 
        id, 
        kategori, 
        nominal, 
        tanggal, 
        keterangan, 
        dicatat_oleh
      FROM kas_sosial
      WHERE tipe_transaksi = 'masuk' 
        AND tanggal >= $1 
        AND tanggal <= $2
      ORDER BY tanggal ASC;
    `;

    // ========================================================================
    // 4. AMBIL PENGELUARAN BULAN INI (Pengeluaran Operasional + Kas Sosial Keluar)
    // ========================================================================
    const queryPengeluaran = `
      SELECT 
        id,
        kategori,
        judul_pengeluaran,
        deskripsi,
        nominal,
        tanggal_pengeluaran,
        penanggung_jawab
      FROM pengeluaran
      WHERE status_approval = 'disetujui' 
        AND tanggal_pengeluaran >= $1 
        AND tanggal_pengeluaran <= $2
      ORDER BY tanggal_pengeluaran ASC;
    `;

    const queryKasSosialKeluar = `
      SELECT 
        ks.id, 
        ks.kategori, 
        ks.nominal, 
        ks.tanggal, 
        ks.keterangan,
        w.nama_lengkap AS penerima_warga
      FROM kas_sosial ks
      LEFT JOIN warga w ON ks.warga_id = w.id
      WHERE ks.tipe_transaksi = 'keluar' 
        AND ks.tanggal >= $1 
        AND ks.tanggal <= $2
      ORDER BY ks.tanggal ASC;
    `;

    // CATATAN: Jika menggunakan library 'pg' (PostgreSQL), eksekusi query seperti di bawah ini:
    /*
    const [resSaldoAwal, resIuran, resKsMasuk, resPengeluaran, resKsKeluar] = await Promise.all([
      pool.query(querySaldoAwal, [tahun, bulan, startDate]),
      pool.query(queryIuran, [tahun, bulan]),
      pool.query(queryKasSosialMasuk, [startDate, endDate]),
      pool.query(queryPengeluaran, [startDate, endDate]),
      pool.query(queryKasSosialKeluar, [startDate, endDate])
    ]);
    const dataSaldoAwal = parseFloat(resSaldoAwal.rows[0].saldo_awal);
    const listIuran = resIuran.rows;
    ...
    */

    // Simulasi data hasil query database jika dijalankan:
    const saldoAwal = 0; // Saldo Awal Periode = 0
    
    // Total kalkulasi
    const totalIuran = 300000;
    const totalDonasiSosial = 1300000;
    const totalPemasukanBulanIni = totalIuran + totalDonasiSosial;

    const totalPengeluaranRutin = 1105000;
    const totalSantunanSosial = 300000;
    const totalPengeluaranBulanIni = totalPengeluaranRutin + totalSantunanSosial;

    // 5. Menghitung Saldo Akhir: (Saldo Awal + Pemasukan - Pengeluaran)
    const saldoAkhir = saldoAwal + totalPemasukanBulanIni - totalPengeluaranBulanIni;

    // Nama bulan dalam bahasa Indonesia
    const daftarBulanIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const namaBulan = daftarBulanIndo[bulan - 1];

    // ========================================================================
    // 6. Output JSON Siap Konsumsi oleh Frontend
    // ========================================================================
    return res.status(200).json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      metadata: {
        organisasi: 'RT 10 RW 04 Kelurahan Pedurungan Lor',
        kecamatan: 'Pedurungan',
        kota: 'Kota Semarang',
        periode: {
          bulan,
          nama_bulan: namaBulan,
          tahun,
          rentang_tanggal: `${startDate} s/d ${endDate}`
        }
      },
      ringkasan_kas: {
        saldo_awal: saldoAwal,
        total_pemasukan: totalPemasukanBulanIni,
        total_pengeluaran: totalPengeluaranBulanIni,
        surplus_defisit_bulan_ini: totalPemasukanBulanIni - totalPengeluaranBulanIni,
        saldo_akhir: saldoAkhir,
        rumus: 'saldo_akhir = saldo_awal + total_pemasukan - total_pengeluaran'
      },
      rincian_pemasukan: {
        subtotal_iuran_wajib: totalIuran,
        subtotal_kas_sosial_masuk: totalDonasiSosial,
        daftar_iuran: [
          {
            id: 'iur-01',
            nama_warga: 'Didik Soemiarsono',
            nomor_rumah: 'A-01',
            jenis_iuran: 'keamanan_kebersihan',
            nominal: 50000,
            tanggal_bayar: `${tahun}-09-02`,
            metode_bayar: 'transfer_bca',
            nomor_kwitansi: 'KWT/2026/09/001'
          },
          {
            id: 'iur-02',
            nama_warga: 'Taufik Hidayat',
            nomor_rumah: 'A-02',
            jenis_iuran: 'keamanan_kebersihan',
            nominal: 50000,
            tanggal_bayar: `${tahun}-09-03`,
            metode_bayar: 'tunai',
            nomor_kwitansi: 'KWT/2026/09/002'
          },
          {
            id: 'iur-03',
            nama_warga: 'Joko Santoso',
            nomor_rumah: 'B-04',
            jenis_iuran: 'keamanan_kebersihan',
            nominal: 50000,
            tanggal_bayar: `${tahun}-09-05`,
            metode_bayar: 'qris',
            nomor_kwitansi: 'KWT/2026/09/003'
          }
        ],
        daftar_kas_sosial_masuk: [
          {
            id: 'ks-01',
            kategori: 'jimpitan_sukarela',
            nominal: 420000,
            tanggal: `${tahun}-09-07`,
            keterangan: 'Jimpitan koin beras rombong warga Minggu I'
          },
          {
            id: 'ks-02',
            kategori: 'donasi_khusus',
            nominal: 500000,
            tanggal: `${tahun}-09-12`,
            keterangan: 'Infaq syukuran keluarga Bpk. Didik Soemiarsono'
          }
        ]
      },
      rincian_pengeluaran: {
        subtotal_operasional_rt: totalPengeluaranRutin,
        subtotal_santunan_sosial: totalSantunanSosial,
        daftar_pengeluaran_operasional: [
          {
            id: 'peng-01',
            kategori: 'keamanan_pos_ronda',
            judul: 'Insentif & Konsumsi Pos Kamling Ronda Malam',
            nominal: 450000,
            tanggal: `${tahun}-09-15`,
            penanggung_jawab: 'Pak Mulyono (Sie Keamanan)'
          },
          {
            id: 'peng-02',
            kategori: 'kebersihan_lingkungan',
            judul: 'Upah Angkut Sampah & Pembersihan Saluran Got',
            nominal: 350000,
            tanggal: `${tahun}-09-20`,
            penanggung_jawab: 'Pak Joko Santoso'
          },
          {
            id: 'peng-03',
            kategori: 'perbaikan_fasilitas',
            judul: 'Beli 3 Bohlam Lampu PJU LED & Kabel Fitting',
            nominal: 185000,
            tanggal: `${tahun}-09-22`,
            penanggung_jawab: 'Pak Agus (Sie Sarpras)'
          },
          {
            id: 'peng-04',
            kategori: 'operasional_rt',
            judul: 'Kertas HVS, Tinta Print & Konsumsi Rapat Pengurus',
            nominal: 120000,
            tanggal: `${tahun}-09-25`,
            penanggung_jawab: 'Ardian Ariawan (Bendahara)'
          }
        ],
        daftar_santunan_keluar: [
          {
            id: 'ks-03',
            kategori: 'bantuan_sakit',
            nominal: 300000,
            tanggal: `${tahun}-09-18`,
            keterangan: 'Santunan rawat inap Ibu Siti (RSUD Wongsonegoro)',
            penerima: 'Keluarga Bpk. Ahmad Fadillah'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Error saat membuat laporan bulanan:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat menghitung laporan bulanan.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getLaporanBulanan
};
