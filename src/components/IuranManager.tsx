import React, { useState } from 'react';
import { IuranWajib, Warga, User, MetodeBayar, StatusVerifikasiIuran } from '../types';
import { BerkahOneIcon } from './BerkahOneLogo';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Eye,
  Check,
  Printer,
  X,
  CreditCard,
  QrCode,
  Edit3,
  Trash2,
  AlertTriangle,
  Search,
  Users,
  Home,
  Phone,
  IdCard,
  ExternalLink
} from 'lucide-react';

interface IuranManagerProps {
  currentUser: User;
  iuranList: IuranWajib[];
  wargaList: Warga[];
  onAddIuran: (iuran: IuranWajib) => void;
  onVerifyIuran: (id: string) => void;
  onUpdateIuran?: (iuran: IuranWajib) => void;
  onDeleteIuran?: (id: string) => void;
}

export const IuranManager: React.FC<IuranManagerProps> = ({
  currentUser,
  iuranList,
  wargaList,
  onAddIuran,
  onVerifyIuran,
  onUpdateIuran,
  onDeleteIuran
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWargaId, setFilterWargaId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingWargaDetail, setViewingWargaDetail] = useState<Warga | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingIuran, setEditingIuran] = useState<IuranWajib | null>(null);
  const [receiptItem, setReceiptItem] = useState<IuranWajib | null>(null);
  const [iuranToDelete, setIuranToDelete] = useState<IuranWajib | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [selectedWargaId, setSelectedWargaId] = useState(wargaList[0]?.id || '');
  const [bulan, setBulan] = useState(9); // September
  const [tahun, setTahun] = useState(2026);
  const [nominal, setNominal] = useState(50000);
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar>('tunai');
  const [statusVerifikasi, setStatusVerifikasi] = useState<StatusVerifikasiIuran>('lunas');
  const [nomorKwitansi, setNomorKwitansi] = useState('');
  const [catatan, setCatatan] = useState('');

  const canManage = currentUser.role !== 'warga';
  const canVerify = currentUser.role === 'bendahara' || currentUser.role === 'ketua_rt';

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const selectedWarga = wargaList.find((w) => w.id === selectedWargaId);
  const alreadyPaidThisMonth = iuranList.some(
    (i) => i.warga_id === selectedWargaId && i.bulan === bulan && i.tahun === tahun && i.id !== editingIuran?.id
  );

  const filteredIuran = iuranList.filter((i) => {
    const matchStatus = filterStatus === 'all' || i.status_verifikasi === filterStatus;
    const matchWarga = filterWargaId === 'all' || i.warga_id === filterWargaId;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (i.nama_warga || '').toLowerCase().includes(q) ||
      (i.nomor_rumah || '').toLowerCase().includes(q) ||
      (i.nomor_kwitansi || '').toLowerCase().includes(q);
    return matchStatus && matchWarga && matchSearch;
  });

  const openAddModal = () => {
    setEditingIuran(null);
    setSelectedWargaId(wargaList[0]?.id || '');
    setBulan(9);
    setTahun(2026);
    setNominal(50000);
    setMetodeBayar('tunai');
    setStatusVerifikasi(canVerify ? 'lunas' : 'menunggu_verifikasi');
    setNomorKwitansi('');
    setCatatan('');
    setShowModal(true);
  };

  const openEditModal = (item: IuranWajib) => {
    setEditingIuran(item);
    setSelectedWargaId(item.warga_id);
    setBulan(item.bulan);
    setTahun(item.tahun);
    setNominal(item.jumlah_nominal);
    setMetodeBayar(item.metode_bayar || 'tunai');
    setStatusVerifikasi(item.status_verifikasi);
    setNomorKwitansi(item.nomor_kwitansi || '');
    setCatatan(item.catatan || '');
    setShowModal(true);
  };

  const confirmDelete = (item: IuranWajib) => {
    setIuranToDelete(item);
  };

  const handleExecuteDelete = () => {
    if (!iuranToDelete) return;
    if (onDeleteIuran) {
      onDeleteIuran(iuranToDelete.id);
    }
    showToast(`Data iuran "${iuranToDelete.nama_warga}" berhasil dihapus.`);
    setIuranToDelete(null);
  };

  const handleSaveIuran = (e: React.FormEvent) => {
    e.preventDefault();
    const warga = wargaList.find((w) => w.id === selectedWargaId);
    if (!warga) return;

    if (editingIuran) {
      // Koreksi Data Iuran
      const updated: IuranWajib = {
        ...editingIuran,
        warga_id: warga.id,
        nama_warga: warga.nama_lengkap,
        nomor_rumah: warga.nomor_rumah,
        bulan,
        tahun,
        jumlah_nominal: Number(nominal),
        metode_bayar: metodeBayar,
        status_verifikasi: statusVerifikasi,
        nomor_kwitansi:
          statusVerifikasi === 'lunas'
            ? nomorKwitansi ||
              editingIuran.nomor_kwitansi ||
              `KWT/${tahun}/${String(bulan).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`
            : undefined,
        diverifikasi_oleh:
          statusVerifikasi === 'lunas' ? currentUser.id : undefined,
        catatan: catatan || 'Koreksi via BerkahOne RT 10'
      };

      if (onUpdateIuran) {
        onUpdateIuran(updated);
      }
      showToast(`Koreksi iuran "${warga.nama_lengkap}" berhasil disimpan.`);
    } else {
      // Tambah Data Iuran Baru
      const receiptNum = `KWT/${tahun}/${String(bulan).padStart(2, '0')}/${Math.floor(
        100 + Math.random() * 900
      )}`;

      const newIuran: IuranWajib = {
        id: `iur-${Date.now()}`,
        warga_id: warga.id,
        nama_warga: warga.nama_lengkap,
        nomor_rumah: warga.nomor_rumah,
        bulan,
        tahun,
        jenis_iuran: 'keamanan_kebersihan',
        jumlah_nominal: Number(nominal),
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_bayar: metodeBayar,
        status_verifikasi: canVerify ? 'lunas' : 'menunggu_verifikasi',
        diverifikasi_oleh: canVerify ? currentUser.id : undefined,
        nomor_kwitansi: canVerify ? receiptNum : undefined,
        catatan: catatan || 'Pembayaran via BerkahOne RT 10'
      };

      onAddIuran(newIuran);
      showToast(`Setoran iuran "${warga.nama_lengkap}" berhasil dicatat.`);
    }

    setShowModal(false);
  };

  const getStatusBadge = (status: StatusVerifikasiIuran) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Lunas
          </span>
        );
      case 'menunggu_verifikasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Menunggu Verifikasi
          </span>
        );
      case 'belum_bayar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Belum Bayar
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            Ditolak
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Receipt className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Tabel Database: `iuran_wajib`
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Catatan Iuran Wajib Warga RT 10 RW 04
          </h2>
          <p className="text-xs text-slate-500">
            Iuran bulanan kebersihan, sampah, dan ronda pos kamling (Rp 50.000/KK). Koreksi setoran & hapus transaksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Input Bayar Iuran</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pencarian Warga / Kwitansi */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari warga / blok / kwitansi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Dropdown Terkoneksi Data Warga */}
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterWargaId}
              onChange={(e) => setFilterWargaId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Warga Terdaftar ({wargaList.length})</option>
              {wargaList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama_lengkap} (Blok {w.nomor_rumah})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'lunas', label: 'Lunas' },
              { id: 'menunggu_verifikasi', label: 'Menunggu' },
              { id: 'belum_bayar', label: 'Belum Bayar' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono self-end md:self-center">
          Menampilkan {filteredIuran.length} transaksi
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Warga Terkoneksi / Rumah</th>
                <th className="px-4 py-3.5">Periode</th>
                <th className="px-4 py-3.5">Nominal</th>
                <th className="px-4 py-3.5">Metode & Tgl</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">No. Kwitansi</th>
                <th className="px-5 py-3.5 text-right">Aksi & Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIuran.map((item) => {
                const linkedWarga = wargaList.find((w) => w.id === item.warga_id);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (linkedWarga) setViewingWargaDetail(linkedWarga);
                          }}
                          className="text-left font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1 group"
                          title="Klik untuk melihat profil warga lengkap"
                        >
                          <span>{item.nama_warga}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-medium">
                          Blok {item.nomor_rumah}
                        </span>
                        {linkedWarga && (
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Warga {linkedWarga.status_kependudukan}
                          </span>
                        )}
                      </div>
                    </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-700">
                      Bulan {item.bulan} / {item.tahun}
                    </span>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {item.jenis_iuran.replace('_', ' & ')}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {formatRupiah(item.jumlah_nominal)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="uppercase text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.metode_bayar || '-'}
                    </span>
                    {item.tanggal_bayar && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.tanggal_bayar}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">{getStatusBadge(item.status_verifikasi)}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                    {item.nomor_kwitansi || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status_verifikasi === 'menunggu_verifikasi' && canVerify && (
                        <button
                          onClick={() => onVerifyIuran(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-xs font-bold transition shadow-2xs"
                          title="Verifikasi Pembayaran Lunas"
                        >
                          Verifikasi
                        </button>
                      )}

                      {item.status_verifikasi === 'lunas' && (
                        <button
                          onClick={() => setReceiptItem(item)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-semibold transition"
                          title="Cetak Kwitansi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Kwitansi</span>
                        </button>
                      )}

                      {/* Menu Koreksi & Hapus */}
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                            title="Koreksi Data Iuran"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Koreksi</span>
                          </button>

                          <button
                            onClick={() => confirmDelete(item)}
                            className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                            title="Hapus Data Iuran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>

      {/* Modal e-Kwitansi Digital */}
      {receiptItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in zoom-in-95">
            <button
              onClick={() => setReceiptItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Kwitansi Body */}
            <div className="border-2 border-dashed border-emerald-400 rounded-xl p-5 bg-gradient-to-b from-emerald-50/40 to-white">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="flex justify-center mb-2">
                  <BerkahOneIcon size={44} className="rounded-xl shadow-xs" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  KWITANSI PEMBAYARAN IURAN SAH
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-2 flex items-center justify-center gap-1">
                  <span>BERKAH</span>
                  <span className="text-orange-500">ONE</span>
                  <span className="text-slate-400 text-xs font-normal">• RT 10 RW 04</span>
                </h4>
                <p className="text-[11px] text-slate-500">Kel. Pedurungan Lor, Kota Semarang</p>
                <p className="text-[11px] font-mono text-emerald-700 mt-1 font-bold">
                  {receiptItem.nomor_kwitansi}
                </p>
              </div>

              <div className="py-4 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Telah Diterima Dari:</span>
                  <span className="font-bold text-slate-900">{receiptItem.nama_warga}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Rumah:</span>
                  <span className="font-semibold text-slate-800">Blok {receiptItem.nomor_rumah}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guna Pembayaran:</span>
                  <span className="font-semibold text-slate-800">
                    Iuran Wajib Bulan {receiptItem.bulan}/{receiptItem.tahun}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="uppercase font-semibold text-slate-800">
                    {receiptItem.metode_bayar}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Jumlah Uang:</span>
                  <span className="font-bold text-emerald-800 text-sm font-mono">
                    {formatRupiah(receiptItem.jumlah_nominal)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px]">
                <div>
                  <p className="text-slate-400">Status Validasi:</p>
                  <p className="font-bold text-emerald-700">TERVERIFIKASI SAH</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Semarang, {receiptItem.tanggal_bayar}</p>
                  <p className="font-bold text-slate-800 mt-4 underline">Ardian Ariawan</p>
                  <p className="text-[10px] text-slate-400">Bendahara RT 10</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kwitansi</span>
              </button>
              <button
                onClick={() => setReceiptItem(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input / Koreksi Iuran */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingIuran ? 'Koreksi Data Iuran Wajib' : 'Catat Pembayaran Iuran Wajib'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingIuran
                ? `Perbarui rincian iuran atas nama ${editingIuran.nama_warga}`
                : 'Simulasi INSERT INTO `iuran_wajib` RT 10 RW 04 Pedurungan Lor'}
            </p>

            <form onSubmit={handleSaveIuran} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 flex items-center justify-between">
                  <span>Pilih Warga (Kepala Keluarga) *</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Terkoneksi Data Warga
                  </span>
                </label>
                <select
                  value={selectedWargaId}
                  onChange={(e) => setSelectedWargaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  {wargaList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama_lengkap} (Rumah Blok {w.nomor_rumah})
                    </option>
                  ))}
                </select>
              </div>

              {/* Kartu Informasi Warga Terhubung */}
              {selectedWarga && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      Data Warga Terkoneksi (Database Warga RT 10)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Blok {selectedWarga.nomor_rumah}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">NIK & Kepala Keluarga:</span>
                      <p className="font-bold text-slate-900 truncate">{selectedWarga.nama_lengkap}</p>
                      <p className="font-mono text-slate-500 text-[10px]">{selectedWarga.nik}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Status & Kontak:</span>
                      <p className="font-semibold text-slate-800 capitalize">Warga {selectedWarga.status_kependudukan}</p>
                      <p className="text-slate-500 text-[10px]">{selectedWarga.no_telp || '-'}</p>
                    </div>
                  </div>

                  {alreadyPaidThisMonth && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Warga ini tercatat <b>sudah membayar</b> untuk periode Bulan {bulan}/{tahun}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bulan</label>
                  <select
                    value={bulan}
                    onChange={(e) => setBulan(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {[
                      { val: 1, name: 'Januari' },
                      { val: 2, name: 'Februari' },
                      { val: 3, name: 'Maret' },
                      { val: 4, name: 'April' },
                      { val: 5, name: 'Mei' },
                      { val: 6, name: 'Juni' },
                      { val: 7, name: 'Juli' },
                      { val: 8, name: 'Agustus' },
                      { val: 9, name: 'September' },
                      { val: 10, name: 'Oktober' },
                      { val: 11, name: 'November' },
                      { val: 12, name: 'Desember' }
                    ].map((m) => (
                      <option key={m.val} value={m.val}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tahun</label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Metode Bayar</label>
                  <select
                    value={metodeBayar}
                    onChange={(e) => setMetodeBayar(e.target.value as MetodeBayar)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                  >
                    <option value="tunai">Tunai ke Bendahara</option>
                    <option value="qris">QRIS RT 10</option>
                    <option value="transfer_bca">Transfer BCA</option>
                    <option value="transfer_bri">Transfer BRI</option>
                  </select>
                </div>
              </div>

              {editingIuran && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Status Verifikasi
                    </label>
                    <select
                      value={statusVerifikasi}
                      onChange={(e) => setStatusVerifikasi(e.target.value as StatusVerifikasiIuran)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-emerald-800"
                    >
                      <option value="lunas">Lunas (Disahkan)</option>
                      <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                      <option value="belum_bayar">Belum Bayar</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      No. Kwitansi (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: KWT/2026/09/101"
                      value={nomorKwitansi}
                      onChange={(e) => setNomorKwitansi(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Titip lewat Pak Bambang / Sudah transfer"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingIuran ? 'Simpan Koreksi' : 'Simpan Setoran Iuran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Hapus Iuran */}
      {iuranToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Iuran</h3>
                <p className="text-xs text-slate-500">Tindakan ini menghapus catatan transaksi</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-xs text-rose-800 space-y-1">
              <p>
                Apakah Anda yakin ingin menghapus catatan iuran <b>{iuranToDelete.nama_warga}</b>?
              </p>
              <p className="text-[11px] text-rose-600">
                Periode: <b>Bulan {iuranToDelete.bulan}/{iuranToDelete.tahun}</b> • Nominal:{' '}
                <b>{formatRupiah(iuranToDelete.jumlah_nominal)}</b>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIuranToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Warga Terhubung */}
      {viewingWargaDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingWargaDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-emerald-800">
              <span className="p-3 bg-emerald-100 rounded-2xl">
                <Users className="w-6 h-6 text-emerald-700" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingWargaDetail.nama_lengkap}</h3>
                <p className="text-xs text-slate-500">
                  Rumah Blok {viewingWargaDetail.nomor_rumah} • Warga {viewingWargaDetail.status_kependudukan}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-400 text-[11px]">Nomor KK:</span>
                <p className="font-mono font-bold text-slate-800">{viewingWargaDetail.nomor_kk}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">NIK:</span>
                <p className="font-mono font-bold text-slate-800">{viewingWargaDetail.nik}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Alamat:</span>
                <p className="font-medium text-slate-800">{viewingWargaDetail.alamat_rumah}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">WhatsApp / No HP:</span>
                <p className="font-mono text-slate-800">{viewingWargaDetail.no_telp || '-'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Pekerjaan:</span>
                <p className="font-medium text-slate-800">{viewingWargaDetail.pekerjaan || '-'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Anggota Keluarga:</span>
                <p className="font-bold text-emerald-800">{viewingWargaDetail.jumlah_anggota_keluarga} Jiwa</p>
              </div>
            </div>

            {/* Riwayat Iuran Warga Ini */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Catatan Riwayat Iuran untuk Warga Ini</span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  Total Disetor: {formatRupiah(
                    iuranList
                      .filter((i) => i.warga_id === viewingWargaDetail.id && i.status_verifikasi === 'lunas')
                      .reduce((s, i) => s + i.jumlah_nominal, 0)
                  )}
                </span>
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-500 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">Periode</th>
                      <th className="px-3 py-2">Nominal</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Kwitansi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {iuranList.filter((i) => i.warga_id === viewingWargaDetail.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-slate-400">
                          Belum ada catatan setoran iuran untuk warga ini.
                        </td>
                      </tr>
                    ) : (
                      iuranList
                        .filter((i) => i.warga_id === viewingWargaDetail.id)
                        .map((i) => (
                          <tr key={i.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-semibold">
                              Bln {i.bulan}/{i.tahun}
                            </td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-900">
                              {formatRupiah(i.jumlah_nominal)}
                            </td>
                            <td className="px-3 py-2">{getStatusBadge(i.status_verifikasi)}</td>
                            <td className="px-3 py-2 font-mono text-[10px] text-slate-500">
                              {i.nomor_kwitansi || '-'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = viewingWargaDetail.id;
                  setViewingWargaDetail(null);
                  setSelectedWargaId(targetId);
                  openAddModal();
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Iuran untuk Warga Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingWargaDetail(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
