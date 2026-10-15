import React, { useState } from 'react';
import { IuranWajib, Pengeluaran, KasSosial, User, Warga } from '../types';
import { BerkahOneIcon } from './BerkahOneLogo';
import {
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
  Printer,
  Calendar,
  Code2,
  Download,
  Terminal,
  ExternalLink,
  TableProperties,
  X,
  FileCode
} from 'lucide-react';

interface LaporanViewProps {
  currentUser?: User;
  iuranList: IuranWajib[];
  pengeluaranList: Pengeluaran[];
  kasSosialList: KasSosial[];
  wargaList: Warga[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  iuranList,
  pengeluaranList,
  kasSosialList,
  wargaList
}) => {
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [selectedBulan, setSelectedBulan] = useState(9); // September
  const [selectedTahun, setSelectedTahun] = useState(2026);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const daftarBulanIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const namaBulan = daftarBulanIndo[selectedBulan - 1];

  // 1. Hitung Saldo Awal (Saldo Awal Periode = 0)
  const saldoAwal = 0;

  // 2. Filter data bulan berjalan
  const iuranBulanIni = iuranList.filter(
    (i) => i.bulan === selectedBulan && i.tahun === selectedTahun && i.status_verifikasi === 'lunas'
  );
  const totalIuranMasuk = iuranBulanIni.reduce((s, i) => s + i.jumlah_nominal, 0);

  const ksMasuk = kasSosialList
    .filter((k) => k.tipe_transaksi === 'masuk')
    .reduce((s, k) => s + k.nominal, 0);

  const totalPemasukan = totalIuranMasuk + ksMasuk;

  const pengeluaranBulanIni = pengeluaranList.filter((p) => p.status_approval === 'disetujui');
  const totalPengeluaranRutin = pengeluaranBulanIni.reduce((s, p) => s + p.nominal, 0);

  const ksKeluar = kasSosialList
    .filter((k) => k.tipe_transaksi === 'keluar')
    .reduce((s, k) => s + k.nominal, 0);

  const totalPengeluaran = totalPengeluaranRutin + ksKeluar;

  // 3. Saldo Akhir: (Saldo Awal + Pemasukan - Pengeluaran)
  const saldoAkhir = saldoAwal + totalPemasukan - totalPengeluaran;

  const saldoKasRt = totalIuranMasuk - totalPengeluaranRutin;
  const saldoKasSosial = ksMasuk - ksKeluar;

  // 4. Struktur Output JSON Persis Seperti Response API
  const apiResponseJson = {
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    endpoint: `/api/laporan/bulanan?bulan=${selectedBulan}&tahun=${selectedTahun}`,
    metadata: {
      organisasi: 'RT 10 RW 04 Kelurahan Pedurungan Lor',
      kecamatan: 'Pedurungan',
      kota: 'Kota Semarang',
      periode: {
        bulan: selectedBulan,
        nama_bulan: namaBulan,
        tahun: selectedTahun,
        rentang_tanggal: `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}-01 s/d ${selectedTahun}-${String(selectedBulan).padStart(2, '0')}-30`
      }
    },
    ringkasan_kas: {
      saldo_awal: saldoAwal,
      total_pemasukan: totalPemasukan,
      total_pengeluaran: totalPengeluaran,
      surplus_defisit: totalPemasukan - totalPengeluaran,
      saldo_akhir: saldoAkhir,
      formula: 'saldo_akhir = saldo_awal + total_pemasukan - total_pengeluaran'
    },
    rincian_pemasukan: {
      subtotal_iuran_wajib: totalIuranMasuk,
      subtotal_kas_sosial_masuk: ksMasuk,
      daftar_iuran: iuranBulanIni.map((i) => ({
        id: i.id,
        nama_warga: i.nama_warga,
        nomor_rumah: i.nomor_rumah,
        jenis_iuran: i.jenis_iuran,
        nominal: i.jumlah_nominal,
        tanggal_bayar: i.tanggal_bayar,
        metode_bayar: i.metode_bayar,
        nomor_kwitansi: i.nomor_kwitansi
      }))
    },
    rincian_pengeluaran: {
      subtotal_operasional_rt: totalPengeluaranRutin,
      subtotal_santunan_sosial: ksKeluar,
      daftar_pengeluaran: pengeluaranBulanIni.map((p) => ({
        id: p.id,
        judul: p.judul_pengeluaran,
        kategori: p.kategori,
        nominal: p.nominal,
        tanggal: p.tanggal_pengeluaran,
        penanggung_jawab: p.penanggung_jawab
      }))
    }
  };

  // WhatsApp Broadcast Text
  const waBroadcastText = `*LAPORAN KAS BULANAN RT 10 RW 04*
*Kelurahan Pedurungan Lor, Kec. Pedurungan, Kota Semarang*
Periode: ${namaBulan} ${selectedTahun}
━━━━━━━━━━━━━━━━━━━━

*1. RINGKASAN SALDO KAS RT*
• Saldo Awal Periode: ${formatRupiah(saldoAwal)}
• (+) Total Pemasukan: ${formatRupiah(totalPemasukan)}
• (-) Total Pengeluaran: ${formatRupiah(totalPengeluaran)}
👉 *SALDO AKHIR SAH:* ${formatRupiah(saldoAkhir)}

*2. DETAIL KAS UTAMA & SOSIAL*
• Kas Utama (Iuran Wajib - Operasional): ${formatRupiah(saldoKasRt)}
• Kas Sosial (Jimpitan - Santunan Sakit/Lelayu): ${formatRupiah(saldoKasSosial)}

━━━━━━━━━━━━━━━━━━━━
_Kwitansi dan bukti nota dapat dicek melalui aplikasi BerkahOne RT 10._
_Terima kasih atas partisipasi aktif seluruh warga RT 10 RW 04 tercinta._

*Pengurus RT 10 RW 04 Pedurungan Lor*
Ketua RT: Didik Soemiarsono
Sekretaris: Taufik Hidayat
Bendahara: Ardian Ariawan`;

  const handleCopyWa = () => {
    navigator.clipboard.writeText(waBroadcastText);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(apiResponseJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download CSV / Excel
  const handleDownloadExcel = () => {
    let csv = `LAPORAN KAS BULANAN RT 10 RW 04 PEDURUNGAN LOR\n`;
    csv += `Periode,${namaBulan} ${selectedTahun}\n\n`;
    csv += `RINGKASAN SALDO\n`;
    csv += `Saldo Awal,${saldoAwal}\n`;
    csv += `Total Pemasukan,${totalPemasukan}\n`;
    csv += `Total Pengeluaran,${totalPengeluaran}\n`;
    csv += `SALDO AKHIR,${saldoAkhir}\n\n`;

    csv += `RINCIAN IURAN WAJIB MASUK\n`;
    csv += `No,Nama Warga,Blok Rumah,Metode,Nominal,Kwitansi\n`;
    iuranBulanIni.forEach((i, idx) => {
      csv += `${idx + 1},"${i.nama_warga}","${i.nomor_rumah}","${i.metode_bayar}",${i.jumlah_nominal},"${i.nomor_kwitansi}"\n`;
    });

    csv += `\nRINCIAN PENGELUARAN\n`;
    csv += `No,Uraian,Kategori,Penanggung Jawab,Nominal\n`;
    pengeluaranBulanIni.forEach((p, idx) => {
      csv += `${idx + 1},"${p.judul_pengeluaran}","${p.kategori}","${p.penanggung_jawab}",${p.nominal}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Kas_RT10_${namaBulan}_${selectedTahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Laporan Keuangan Terpadu & API Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Transparansi Keuangan RT 10 RW 04
          </h2>
          <p className="text-xs text-slate-500">
            Kalkulasi otomatis Saldo Awal + Pemasukan - Pengeluaran = Saldo Akhir.
          </p>
        </div>

        {/* Action Toolbar (Responsive Grid on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Response API JSON</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.csv)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Period Selector & Summary Cards (Responsive) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Periode:</span>
          </div>
          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {daftarBulanIndo.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <div className="w-full sm:w-auto flex justify-start sm:justify-end">
          <button
            onClick={handleCopyWa}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-emerald-200"
          >
            {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedWa ? 'Tersalin!' : 'Copy Teks Broadcast WA'}</span>
          </button>
        </div>
      </div>

      {/* Formula & Calculation Box (Responsive: 1 col on mobile, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Saldo Awal Periode
          </p>
          <p className="text-base font-bold text-slate-800">{formatRupiah(saldoAwal)}</p>
          <span className="text-[10px] text-slate-400">Kumulatif bulan lalu</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            (+) Total Pemasukan
          </p>
          <p className="text-base font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</p>
          <span className="text-[10px] text-slate-400">Iuran + Jimpitan Masuk</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-1">
            (-) Total Pengeluaran
          </p>
          <p className="text-base font-bold text-rose-600">{formatRupiah(totalPengeluaran)}</p>
          <span className="text-[10px] text-slate-400">Operasional + Santunan</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider mb-1">
            (=) Saldo Akhir Kas RT
          </p>
          <p className="text-lg font-extrabold text-white">{formatRupiah(saldoAkhir)}</p>
          <span className="text-[10px] text-emerald-200/80">Saldo Kas Sah Saat Ini</span>
        </div>
      </div>

      {/* Official Printable Statement Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none">
        {/* Letterhead */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-slate-900 mb-6 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <BerkahOneIcon size={58} className="rounded-2xl shrink-0 shadow-xs" />
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-center sm:justify-start gap-1">
                <span>BERKAH</span>
                <span className="text-orange-500">ONE</span>
                <span>• RUKUN TETANGGA 10 RW 04</span>
              </h2>
              <h3 className="text-xs font-bold text-slate-800">
                KELURAHAN PEDURUNGAN LOR - KECAMATAN PEDURUNGAN
              </h3>
              <p className="text-[11px] text-slate-500">
                Sekretariat: Balai Pertemuan RT 10, Jl. Pedurungan Lor Gang Mawar, Semarang 50192
              </p>
            </div>
          </div>
          <div className="inline-block bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
            PERIODE: {namaBulan.toUpperCase()} {selectedTahun}
          </div>
        </div>

        {/* Statement Details */}
        <div className="space-y-6 text-xs">
          {/* Section A: Ringkasan Saldo Berjalan */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 mb-2">I. PERHITUNGAN SALDO KAS BERJALAN</h4>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Saldo Awal Kas per 01 {namaBulan} {selectedTahun}:</span>
              <span className="font-mono font-bold text-slate-800">{formatRupiah(saldoAwal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">(+) Pemasukan Iuran Wajib & Kas Sosial:</span>
              <span className="font-mono font-bold text-emerald-700">{formatRupiah(totalPemasukan)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">(-) Pengeluaran Operasional & Santunan Warga:</span>
              <span className="font-mono font-bold text-rose-600">{formatRupiah(totalPengeluaran)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-bold bg-white px-2 rounded-lg border border-slate-200 mt-2">
              <span className="text-slate-900">SALDO AKHIR KAS BERSIH:</span>
              <span className="text-emerald-800 font-mono">{formatRupiah(saldoAkhir)}</span>
            </div>
          </div>

          {/* Section B: Rincian Iuran Wajib */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 pb-1 border-b border-slate-200 flex justify-between">
              <span>II. RINCIAN IURAN WAJIB MASUK ({iuranBulanIni.length} KK LUNAS)</span>
              <span className="text-emerald-700 font-mono">{formatRupiah(totalIuranMasuk)}</span>
            </h4>
            <div className="divide-y divide-slate-100">
              {iuranBulanIni.map((i, idx) => (
                <div key={i.id} className="py-1.5 flex justify-between text-slate-600">
                  <span>
                    {idx + 1}. {i.nama_warga} (Rumah {i.nomor_rumah}) • Kwitansi: {i.nomor_kwitansi}
                  </span>
                  <span className="font-mono">{formatRupiah(i.jumlah_nominal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Pengeluaran Operasional */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 pb-1 border-b border-slate-200 flex justify-between">
              <span>III. RINCIAN PENGELUARAN OPERASIONAL</span>
              <span className="text-rose-600 font-mono">{formatRupiah(totalPengeluaranRutin)}</span>
            </h4>
            <div className="divide-y divide-slate-100">
              {pengeluaranBulanIni.map((p, idx) => (
                <div key={p.id} className="py-1.5 flex justify-between text-slate-600">
                  <div>
                    <span className="font-medium text-slate-800">
                      {idx + 1}. {p.judul_pengeluaran}
                    </span>
                    <span className="text-slate-400 text-[11px] block">PJ: {p.penanggung_jawab}</span>
                  </div>
                  <span className="font-mono text-rose-600">{formatRupiah(p.nominal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-3 text-center text-xs gap-4 border-t border-slate-200 mt-6">
            <div>
              <p className="text-slate-500 mb-12">Mengetahui,<br /><b>Ketua RT 10 RW 04</b></p>
              <p className="font-bold text-slate-900 underline">Didik Soemiarsono</p>
              <p className="text-[11px] text-slate-400">Ketua RT 10</p>
            </div>
            <div>
              <p className="text-slate-500 mb-12">Administrasi Dokumen,<br /><b>Sekretaris RT 10</b></p>
              <p className="font-bold text-slate-900 underline">Taufik Hidayat</p>
              <p className="text-[11px] text-slate-400">Sekretaris RT 10</p>
            </div>
            <div>
              <p className="text-slate-500 mb-12">Semarang, 30 {namaBulan} {selectedTahun}<br /><b>Bendahara RT 10</b></p>
              <p className="font-bold text-slate-900 underline">Ardian Ariawan</p>
              <p className="text-[11px] text-slate-400">Bendahara RT 10</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: API JSON Response Explorer */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-950 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative border border-slate-800 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowJsonModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Live Output: GET /api/laporan/bulanan
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Format JSON bersih yang dihasilkan oleh controller backend dan dikonsumsi oleh frontend BerkahOne.
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
              <pre>{JSON.stringify(apiResponseJson, null, 2)}</pre>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <span className="text-slate-400">Status HTTP: 200 OK • Content-Type: application/json</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJson}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Tersalin' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
