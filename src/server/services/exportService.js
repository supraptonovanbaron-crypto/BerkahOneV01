/**
 * Service: Ekspor Laporan Keuangan ke format Excel (.xlsx) dan PDF (.pdf)
 * BerkahOne Client - RT 10 RW 04 Kelurahan Pedurungan Lor, Semarang
 * 
 * Library Rekomendasi:
 * 1. Excel: 'exceljs' (sangat fleksibel, mendukung styling font, cell borders, warna, & rumus SUM).
 * 2. PDF: 'pdfkit' (server-side stream cepat) atau '@react-pdf/renderer' (jika di frontend React).
 */

const ExcelJS = require('exceljs'); // npm install exceljs
const PDFDocument = require('pdfkit'); // npm install pdfkit

/**
 * 1. GENERATE LAPORAN EXCEL (.xlsx)
 * @param {Object} dataLaporan Data JSON dari getLaporanBulanan
 * @param {Object} res Express response stream
 */
async function generateExcelLaporan(dataLaporan, res) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BerkahOne Client RT 10';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`Laporan ${dataLaporan.metadata.periode.nama_bulan} ${dataLaporan.metadata.periode.tahun}`);

  // Atur Lebar Kolom
  worksheet.columns = [
    { key: 'col1', width: 8 },
    { key: 'col2', width: 32 },
    { key: 'col3', width: 18 },
    { key: 'col4', width: 22 },
    { key: 'col5', width: 20 }
  ];

  // Header Organisasi (Kop Surat)
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'LAPORAN KAS BULANAN RUKUN TETANGGA 10 RW 04';
  worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF065F46' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:E2');
  worksheet.getCell('A2').value = 'Kelurahan Pedurungan Lor, Kec. Pedurungan, Kota Semarang 50192';
  worksheet.getCell('A2').font = { size: 10, italic: true };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A3:E3');
  worksheet.getCell('A3').value = `Periode: ${dataLaporan.metadata.periode.nama_bulan} ${dataLaporan.metadata.periode.tahun}`;
  worksheet.getCell('A3').font = { size: 11, bold: true };
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  worksheet.addRow([]); // Baris kosong

  // KOTAK RINGKASAN SALDO
  const rowRingkasanHeader = worksheet.addRow(['RINGKASAN SALDO KAS RT', '', '', '', '']);
  worksheet.mergeCells(`A${rowRingkasanHeader.number}:E${rowRingkasanHeader.number}`);
  rowRingkasanHeader.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rowRingkasanHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };

  worksheet.addRow(['Saldo Awal Periode', '', '', '', dataLaporan.ringkasan_kas.saldo_awal]);
  worksheet.addRow(['(+) Total Pemasukan Bulan Ini', '', '', '', dataLaporan.ringkasan_kas.total_pemasukan]);
  worksheet.addRow(['(-) Total Pengeluaran Bulan Ini', '', '', '', dataLaporan.ringkasan_kas.total_pengeluaran]);
  const rowSaldoAkhir = worksheet.addRow(['(=) SALDO AKHIR KAS BERSIH', '', '', '', dataLaporan.ringkasan_kas.saldo_akhir]);
  rowSaldoAkhir.font = { bold: true, size: 11 };

  // Format Mata Uang untuk Baris Ringkasan
  for (let r = rowRingkasanHeader.number + 1; r <= rowSaldoAkhir.number; r++) {
    worksheet.getCell(`E${r}`).numFmt = '"Rp "#,##0';
    worksheet.getCell(`E${r}`).alignment = { horizontal: 'right' };
  }

  worksheet.addRow([]); // Baris kosong

  // TABEL DETAIL PEMASUKAN
  const rowPemasukanHeader = worksheet.addRow(['RINCIAN IURAN WAJIB MASUK', '', '', '', '']);
  worksheet.mergeCells(`A${rowPemasukanHeader.number}:E${rowPemasukanHeader.number}`);
  rowPemasukanHeader.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rowPemasukanHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };

  const tableHeaderPemasukan = worksheet.addRow(['No', 'Nama Kepala Keluarga', 'Blok Rumah', 'Metode Bayar', 'Nominal (Rp)']);
  tableHeaderPemasukan.font = { bold: true };
  tableHeaderPemasukan.alignment = { horizontal: 'center' };

  dataLaporan.rincian_pemasukan.daftar_iuran.forEach((item, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      item.nama_warga,
      `Blok ${item.nomor_rumah}`,
      item.metode_bayar.toUpperCase(),
      item.nominal
    ]);
    row.getCell(5).numFmt = '"Rp "#,##0';
  });

  worksheet.addRow([]); // Baris kosong

  // TABEL DETAIL PENGELUARAN
  const rowPengeluaranHeader = worksheet.addRow(['RINCIAN PENGELUARAN OPERASIONAL', '', '', '', '']);
  worksheet.mergeCells(`A${rowPengeluaranHeader.number}:E${rowPengeluaranHeader.number}`);
  rowPengeluaranHeader.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rowPengeluaranHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE11D48' } };

  const tableHeaderPengeluaran = worksheet.addRow(['No', 'Uraian Pengeluaran', 'Kategori', 'Penanggung Jawab', 'Nominal (Rp)']);
  tableHeaderPengeluaran.font = { bold: true };
  tableHeaderPengeluaran.alignment = { horizontal: 'center' };

  dataLaporan.rincian_pengeluaran.daftar_pengeluaran_operasional.forEach((item, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      item.judul,
      item.kategori.replace(/_/g, ' '),
      item.penanggung_jawab,
      item.nominal
    ]);
    row.getCell(5).numFmt = '"Rp "#,##0';
  });

  // Kirim Header File Excel ke Response HTTP
  const fileName = `Laporan_Kas_RT10_${dataLaporan.metadata.periode.nama_bulan}_${dataLaporan.metadata.periode.tahun}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
}

/**
 * 2. GENERATE LAPORAN PDF DOKUMEN RESMI (.pdf)
 * @param {Object} dataLaporan Data JSON dari getLaporanBulanan
 * @param {Object} res Express response stream
 */
function generatePdfLaporan(dataLaporan, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  const fileName = `Laporan_Kas_RT10_${dataLaporan.metadata.periode.nama_bulan}_${dataLaporan.metadata.periode.tahun}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  doc.pipe(res);

  // KOP SURAT
  doc.fontSize(14).font('Helvetica-Bold').text('RUKUN TETANGGA 10 RUKUN WARGA 04', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('KELURAHAN PEDURUNGAN LOR, KECAMATAN PEDURUNGAN, SEMARANG', { align: 'center' });
  doc.fontSize(8).text('Sekretariat: Balai Warga RT 10, Jl. Pedurungan Lor Gang Mawar • Kode Pos 50192', { align: 'center' });
  doc.moveDown(0.5);

  // Garis Pemisah Kop Surat Ganda
  doc.lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.lineWidth(0.5).moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).stroke();
  doc.moveDown(1.5);

  // JUDUL LAPORAN
  doc.fontSize(12).font('Helvetica-Bold').text(`LAPORAN KEUANGAN KAS BULANAN`, { align: 'center' });
  doc.fontSize(10).font('Helvetica-Oblique').text(`Periode: ${dataLaporan.metadata.periode.nama_bulan} ${dataLaporan.metadata.periode.tahun}`, { align: 'center' });
  doc.moveDown(1);

  // FORMAT RUPIAH HELPER
  const toRp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  // KOTAK RINGKASAN SALDO
  doc.rect(40, doc.y, 515, 80).fillAndStroke('#F8FAFC', '#CBD5E1');
  const boxTop = doc.y + 8;
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10);
  doc.text('RINGKASAN SALDO KAS RT 10:', 50, boxTop);
  
  doc.font('Helvetica').fontSize(9);
  doc.text(`1. Saldo Awal Periode:`, 50, boxTop + 16);
  doc.text(toRp(dataLaporan.ringkasan_kas.saldo_awal), 420, boxTop + 16, { align: 'right', width: 120 });

  doc.text(`2. Total Pemasukan (Iuran & Donasi):`, 50, boxTop + 28);
  doc.fillColor('#047857').text(`(+) ${toRp(dataLaporan.ringkasan_kas.total_pemasukan)}`, 420, boxTop + 28, { align: 'right', width: 120 });

  doc.fillColor('#0F172A').text(`3. Total Pengeluaran (Operasional & Ronda):`, 50, boxTop + 40);
  doc.fillColor('#E11D48').text(`(-) ${toRp(dataLaporan.ringkasan_kas.total_pengeluaran)}`, 420, boxTop + 40, { align: 'right', width: 120 });

  doc.fillColor('#0F172A').font('Helvetica-Bold');
  doc.text(`SALDO AKHIR KAS SAH:`, 50, boxTop + 55);
  doc.fontSize(10).text(toRp(dataLaporan.ringkasan_kas.saldo_akhir), 420, boxTop + 55, { align: 'right', width: 120 });

  doc.moveDown(6);

  // BLOK TANDA TANGAN RESMI PENGURUS RT
  doc.font('Helvetica').fontSize(9).fillColor('#000000');
  const ySign = doc.y + 40;
  
  doc.text('Mengetahui,', 40, ySign, { align: 'center', width: 150 });
  doc.text('Ketua RT 10 RW 04', 40, ySign + 12, { align: 'center', width: 150 });
  doc.font('Helvetica-Bold').text('Didik Soemiarsono', 40, ySign + 65, { align: 'center', width: 150 });

  doc.font('Helvetica').text('Administrasi,', 220, ySign, { align: 'center', width: 150 });
  doc.text('Sekretaris RT 10', 220, ySign + 12, { align: 'center', width: 150 });
  doc.font('Helvetica-Bold').text('Taufik Hidayat', 220, ySign + 65, { align: 'center', width: 150 });

  doc.font('Helvetica').text(`Semarang, ${new Date().toLocaleDateString('id-ID')}`, 390, ySign, { align: 'center', width: 150 });
  doc.text('Bendahara RT 10', 390, ySign + 12, { align: 'center', width: 150 });
  doc.font('Helvetica-Bold').text('Ardian Ariawan', 390, ySign + 65, { align: 'center', width: 150 });

  doc.end();
}

module.exports = {
  generateExcelLaporan,
  generatePdfLaporan
};
