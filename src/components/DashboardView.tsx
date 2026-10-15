import React, { useState } from 'react';
import { User, Warga, IuranWajib, Pengeluaran, KasSosial } from '../types';
import { FinancialAiLogo } from './FinancialAiLogo';
import { AiFinancialFeaturesModal } from './AiFinancialFeaturesModal';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  PlusCircle,
  MinusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  X,
  Building2,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  BarChart3,
  Layers,
  Sparkles,
  Brain
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  currentUser: User;
  wargaList: Warga[];
  iuranList: IuranWajib[];
  pengeluaranList: Pengeluaran[];
  kasSosialList: KasSosial[];
  onNavigateTab: (tab: string) => void;
  onAddIuran?: (iuran: IuranWajib) => void;
  onAddPengeluaran?: (pengeluaran: Pengeluaran) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  wargaList,
  iuranList,
  pengeluaranList,
  kasSosialList,
  onNavigateTab,
  onAddIuran,
  onAddPengeluaran
}) => {
  // Modal states for shortcut buttons
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Form states for Quick Income Shortcut
  const [incomeWargaId, setIncomeWargaId] = useState(wargaList[0]?.id || '');
  const [incomeMonth, setIncomeMonth] = useState(9);
  const [incomeAmount, setIncomeAmount] = useState(50000);
  const [incomeMethod, setIncomeMethod] = useState<'tunai' | 'transfer_bca' | 'transfer_bri' | 'qris'>('tunai');
  const [incomeNote, setIncomeNote] = useState('Iuran bulanan RT 10');

  // Form states for Quick Expense Shortcut
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<any>('keamanan_pos_ronda');
  const [expenseAmount, setExpenseAmount] = useState(150000);
  const [expensePerson, setExpensePerson] = useState('Pak Mulyono (Sie Keamanan)');
  const [expenseDesc, setExpenseDesc] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Calculations for the 3 Summary Cards
  // Pemasukan Bulan Ini (September 2026: Iuran Lunas + Kas Sosial Masuk)
  const iuranBulanIniLunas = iuranList
    .filter((i) => i.bulan === 9 && i.tahun === 2026 && i.status_verifikasi === 'lunas')
    .reduce((sum, item) => sum + item.jumlah_nominal, 0);

  const kasSosialMasukBulanIni = kasSosialList
    .filter((k) => k.tipe_transaksi === 'masuk')
    .reduce((sum, item) => sum + item.nominal, 0);

  const totalPemasukanBulanIni = iuranBulanIniLunas + kasSosialMasukBulanIni;

  // Pengeluaran Bulan Ini (September 2026: Pengeluaran Disetujui + Kas Sosial Keluar)
  const pengeluaranDisetujuiBulanIni = pengeluaranList
    .filter((p) => p.status_approval === 'disetujui')
    .reduce((sum, item) => sum + item.nominal, 0);

  const kasSosialKeluarBulanIni = kasSosialList
    .filter((k) => k.tipe_transaksi === 'keluar')
    .reduce((sum, item) => sum + item.nominal, 0);

  const totalPengeluaranBulanIni = pengeluaranDisetujuiBulanIni + kasSosialKeluarBulanIni;

  // Total Keseluruhan Saldo Kas Aktif (Pemasukan kumulatif - Pengeluaran kumulatif)
  const totalSeluruhPemasukan =
    iuranList
      .filter((i) => i.status_verifikasi === 'lunas')
      .reduce((sum, item) => sum + item.jumlah_nominal, 0) +
    kasSosialList
      .filter((k) => k.tipe_transaksi === 'masuk')
      .reduce((sum, item) => sum + item.nominal, 0);

  const totalSeluruhPengeluaran =
    pengeluaranList
      .filter((p) => p.status_approval === 'disetujui')
      .reduce((sum, item) => sum + item.nominal, 0) +
    kasSosialList
      .filter((k) => k.tipe_transaksi === 'keluar')
      .reduce((sum, item) => sum + item.nominal, 0);

  const totalSaldoKas = totalSeluruhPemasukan - totalSeluruhPengeluaran;

  // 2. Trend Data 6 Bulan Terakhir (April - September 2026)
  const trendData6Bulan = [
    { bulan: 'Apr 2026', pemasukan: 1250000, pengeluaran: 920000, selisih: 330000 },
    { bulan: 'Mei 2026', pemasukan: 1400000, pengeluaran: 1100000, selisih: 300000 },
    { bulan: 'Jun 2026', pemasukan: 1350000, pengeluaran: 850000, selisih: 500000 },
    { bulan: 'Jul 2026', pemasukan: 1550000, pengeluaran: 1250000, selisih: 300000 },
    { bulan: 'Agu 2026', pemasukan: 2100000, pengeluaran: 1850000, selisih: 250000 }, // Bulan perayaan HUT RI 17-an
    { bulan: 'Sep 2026', pemasukan: totalPemasukanBulanIni, pengeluaran: totalPengeluaranBulanIni, selisih: totalPemasukanBulanIni - totalPengeluaranBulanIni }
  ];

  // 3. 5 Transaksi Terakhir (Gabungan Iuran, Pengeluaran, Kas Sosial)
  interface TransactionItem {
    id: string;
    tipe: 'pemasukan' | 'pengeluaran';
    judul: string;
    subJudul: string;
    kategori: string;
    nominal: number;
    tanggal: string;
    status: 'lunas' | 'menunggu_verifikasi' | 'disetujui';
  }

  const allTransactions: TransactionItem[] = [
    ...iuranList.map((i) => ({
      id: `iur-${i.id}`,
      tipe: 'pemasukan' as const,
      judul: `Iuran Wajib: ${i.nama_warga || 'Warga'}`,
      subJudul: `Rumah Blok ${i.nomor_rumah || '-'} • Via ${i.metode_bayar?.toUpperCase() || 'Tunai'}`,
      kategori: 'Iuran Bulanan',
      nominal: i.jumlah_nominal,
      tanggal: i.tanggal_bayar || '2026-09-01',
      status: (i.status_verifikasi === 'lunas' ? 'lunas' : 'menunggu_verifikasi') as any
    })),
    ...pengeluaranList.map((p) => ({
      id: `peng-${p.id}`,
      tipe: 'pengeluaran' as const,
      judul: p.judul_pengeluaran,
      subJudul: `PJ: ${p.penanggung_jawab}`,
      kategori: p.kategori.replace(/_/g, ' '),
      nominal: p.nominal,
      tanggal: p.tanggal_pengeluaran,
      status: (p.status_approval === 'disetujui' ? 'disetujui' : 'menunggu_verifikasi') as any
    })),
    ...kasSosialList.map((k) => ({
      id: `ks-${k.id}`,
      tipe: (k.tipe_transaksi === 'masuk' ? 'pemasukan' : 'pengeluaran') as 'pemasukan' | 'pengeluaran',
      judul: `Kas Sosial: ${k.kategori.replace(/_/g, ' ')}`,
      subJudul: k.keterangan,
      kategori: 'Dana Sosial',
      nominal: k.nominal,
      tanggal: k.tanggal,
      status: 'lunas' as const
    }))
  ];

  // Ambil 5 riwayat transaksi paling baru
  const limaTransaksiTerakhir = allTransactions
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  // 4. Handle Shortcut Form Submission
  const handleSubmitIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const warga = wargaList.find((w) => w.id === incomeWargaId);
    if (!warga) return;

    const newIuran: IuranWajib = {
      id: `iur-${Date.now()}`,
      warga_id: warga.id,
      nama_warga: warga.nama_lengkap,
      nomor_rumah: warga.nomor_rumah,
      bulan: Number(incomeMonth),
      tahun: 2026,
      jenis_iuran: 'keamanan_kebersihan',
      jumlah_nominal: Number(incomeAmount),
      tanggal_bayar: new Date().toISOString().split('T')[0],
      metode_bayar: incomeMethod,
      status_verifikasi: currentUser.role !== 'warga' ? 'lunas' : 'menunggu_verifikasi',
      nomor_kwitansi: `KWT/2026/09/${Math.floor(100 + Math.random() * 900)}`,
      diverifikasi_oleh: currentUser.role !== 'warga' ? currentUser.id : undefined,
      catatan: incomeNote
    };

    if (onAddIuran) {
      onAddIuran(newIuran);
    }
    setShowIncomeModal(false);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    const newExpense: Pengeluaran = {
      id: `peng-${Date.now()}`,
      judul_pengeluaran: expenseTitle,
      kategori: expenseCategory,
      nominal: Number(expenseAmount),
      tanggal_pengeluaran: new Date().toISOString().split('T')[0],
      penanggung_jawab: expensePerson,
      deskripsi: expenseDesc || 'Pengeluaran operasional RT 10',
      disetujui_oleh: currentUser.role === 'ketua_rt' ? currentUser.id : 'u-ketua-rt',
      status_approval: currentUser.role === 'ketua_rt' ? 'disetujui' : 'draft'
    };

    if (onAddPengeluaran) {
      onAddPengeluaran(newExpense);
    }
    setShowExpenseModal(false);
    setExpenseTitle('');
    setExpenseDesc('');
  };

  // Custom Recharts Tooltip Formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs">
          <p className="font-bold mb-1.5 text-slate-300">{label}</p>
          <div className="space-y-1">
            <p className="flex items-center justify-between gap-4 text-emerald-400">
              <span>Pemasukan:</span>
              <span className="font-mono font-bold">{formatRupiah(payload[0]?.value || 0)}</span>
            </p>
            <p className="flex items-center justify-between gap-4 text-rose-400">
              <span>Pengeluaran:</span>
              <span className="font-mono font-bold">{formatRupiah(payload[1]?.value || 0)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Welcome Bar & Action Buttons (Mobile & Tablet Optimized) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          {/* Logo Standar Keuangan dengan Fitur AI */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <FinancialAiLogo
              size={54}
              showAiBadge={true}
              pulseAnimation={true}
              onClick={() => setShowAiModal(true)}
              title="Klik untuk membuka Fitur AI Keuangan & Audit Realtime RT 10"
              className="shrink-0"
            />
            {/* Quick Mobile AI Badge Button */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="sm:hidden inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 text-emerald-950 border border-emerald-300 shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>AI Features</span>
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Dashboard Keuangan Realtime RT 10 RW 04
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                Pedurungan Lor
              </span>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 text-emerald-950 border border-emerald-300 hover:border-emerald-500 transition shadow-2xs cursor-pointer group"
                title="Buka Pusat Fitur AI Keuangan"
              >
                <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span>AI Features Aktif</span>
              </button>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Ringkasan Kas & Arus Transaksi
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Portal Keuangan Mandiri Warga & Pengurus RT 10 • Terintegrasi <b>Fitur AI Finansial Cerdas</b>
            </p>
          </div>
        </div>

        {/* 4. Tombol Shortcut: "Fitur AI Keuangan", "Catat Pemasukan" dan "Catat Pengeluaran" */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowAiModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 hover:from-slate-800 hover:to-emerald-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm border border-emerald-500/40 cursor-pointer"
            title="Buka Fitur AI Analitik & Audit Kas Realtime"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Fitur AI Keuangan</span>
          </button>

          <button
            onClick={() => setShowIncomeModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 active:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm border border-emerald-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>Catat Pemasukan</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 active:bg-orange-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm border border-orange-500/30 cursor-pointer"
          >
            <MinusCircle className="w-4 h-4 text-orange-200" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* 1. Ringkasan Kas (Tiga kartu/card - Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Kartu 1: Total Saldo Kas */}
        <div className="bg-gradient-to-br from-[#032b17] via-[#094726] to-[#011a0d] text-white rounded-2xl p-4 sm:p-6 shadow-sm border border-emerald-900/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                Total Saldo Kas RT
              </span>
              <div className="p-2 sm:p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/20">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white truncate">
              {formatRupiah(totalSaldoKas)}
            </h3>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              Surplus Bersih Kas
            </span>
            <span className="text-slate-400 text-[10px] sm:text-[11px]">Kas Utama & Kas Sosial</span>
          </div>
        </div>

        {/* Kartu 2: Total Pemasukan Bulan Ini */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pemasukan Bulan Ini
              </span>
              <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-emerald-700 truncate">
              {formatRupiah(totalPemasukanBulanIni)}
            </h3>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-500">
            <span className="font-medium truncate">
              Iuran Wajib: <b>{formatRupiah(iuranBulanIniLunas)}</b>
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              Jimpitan: {formatRupiah(kasSosialMasukBulanIni)}
            </span>
          </div>
        </div>

        {/* Kartu 3: Total Pengeluaran Bulan Ini */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pengeluaran Bulan Ini
              </span>
              <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-rose-600 truncate">
              {formatRupiah(totalPengeluaranBulanIni)}
            </h3>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-500">
            <span className="font-medium truncate">
              Operasional & Ronda: <b>{formatRupiah(pengeluaranDisetujuiBulanIni)}</b>
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              Santunan: {formatRupiah(kasSosialKeluarBulanIni)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grafik Transaksi: Pemasukan vs Pengeluaran 6 Bulan Terakhir */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Tren Transaksi Keuangan (6 Bulan Terakhir)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan arus pemasukan iuran vs pengeluaran operasional RT 10 RW 04
            </p>
          </div>

          {/* Toggle Type Chart */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Area Chart
            </button>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={trendData6Bulan}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  stroke="#64748B"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '16px' }}
                />
                <Bar
                  dataKey="pemasukan"
                  name="Pemasukan (Iuran & Donasi)"
                  fill="#16a34a"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran (Operasional)"
                  fill="#ea580c"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={trendData6Bulan}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  stroke="#64748B"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '16px' }}
                />
                <Area
                  type="monotone"
                  dataKey="pemasukan"
                  name="Pemasukan"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPemasukan)"
                />
                <Area
                  type="monotone"
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPengeluaran)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Tabel Transaksi Terakhir (Menampilkan 5 riwayat transaksi terbaru) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">5 Transaksi Terakhir</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan mutasi kas terkini di lingkungan RT 10 RW 04
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('laporan')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
          >
            <span>Semua Laporan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Transaksi & Uraian</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {limaTransaksiTerakhir.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-800 leading-tight">{trx.judul}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{trx.subJudul}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {trx.tanggal}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {trx.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {trx.tipe === 'pemasukan' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        Pemasukan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                        Pengeluaran
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-bold font-mono">
                    <span className={trx.tipe === 'pemasukan' ? 'text-emerald-700' : 'text-rose-600'}>
                      {trx.tipe === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.nominal)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {trx.status === 'lunas' || trx.status === 'disetujui' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Sah / Lunas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Shortcut: Catat Pemasukan */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowIncomeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <PlusCircle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Shortcut: Catat Pemasukan</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan cepat setoran iuran warga atau donasi kas RT 10
            </p>

            <form onSubmit={handleSubmitIncome} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Warga / Kepala Keluarga *
                </label>
                <select
                  value={incomeWargaId}
                  onChange={(e) => setIncomeWargaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {wargaList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama_lengkap} (Blok {w.nomor_rumah})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bulan Iuran</label>
                  <select
                    value={incomeMonth}
                    onChange={(e) => setIncomeMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {[
                      { val: 8, name: 'Agustus 2026' },
                      { val: 9, name: 'September 2026' },
                      { val: 10, name: 'Oktober 2026' }
                    ].map((m) => (
                      <option key={m.val} value={m.val}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Metode Setoran</label>
                <select
                  value={incomeMethod}
                  onChange={(e) => setIncomeMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 uppercase"
                >
                  <option value="tunai">Tunai ke Bendahara</option>
                  <option value="qris">QRIS RT 10 Pedurungan</option>
                  <option value="transfer_bca">Transfer Bank BCA</option>
                  <option value="transfer_bri">Transfer Bank BRI</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Keterangan pembayaran..."
                  value={incomeNote}
                  onChange={(e) => setIncomeNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Pemasukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Shortcut: Catat Pengeluaran */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                <MinusCircle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Shortcut: Catat Pengeluaran</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan cepat belanja operasional atau pemeliharaan lingkungan RT 10
            </p>

            <form onSubmit={handleSubmitExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Judul Pengeluaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Lampu PJU Gang Melati"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kategori</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                  >
                    <option value="keamanan_pos_ronda">Keamanan & Ronda</option>
                    <option value="kebersihan_lingkungan">Kebersihan & Got</option>
                    <option value="perbaikan_fasilitas">Perbaikan Sarpras / PJU</option>
                    <option value="operasional_rt">Operasional & ATK</option>
                    <option value="kegiatan_warga_17an">Kegiatan Warga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Penanggung Jawab</label>
                <input
                  type="text"
                  value={expensePerson}
                  onChange={(e) => setExpensePerson(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan nota atau kwitansi belanja..."
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Pusat Fitur AI Keuangan & Audit Realtime */}
      <AiFinancialFeaturesModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        currentUser={currentUser}
        wargaList={wargaList}
        iuranList={iuranList}
        pengeluaranList={pengeluaranList}
        kasSosialList={kasSosialList}
      />
    </div>
  );
};
