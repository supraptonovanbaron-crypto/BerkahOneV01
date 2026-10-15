import React, { useState } from 'react';
import { Warga, User, IuranWajib, MetodeBayar } from '../types';
import {
  Users,
  Search,
  Plus,
  Home,
  Phone,
  Briefcase,
  IdCard,
  Filter,
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Receipt,
  CreditCard,
  Calendar,
  Check,
  Eye
} from 'lucide-react';

interface WargaManagerProps {
  currentUser: User;
  wargaList: Warga[];
  iuranList: IuranWajib[];
  onAddWarga: (warga: Warga) => void;
  onUpdateWarga?: (warga: Warga) => void;
  onDeleteWarga?: (id: string) => void;
  onAddIuran?: (iuran: IuranWajib) => void;
}

export const WargaManager: React.FC<WargaManagerProps> = ({
  currentUser,
  wargaList,
  iuranList,
  onAddWarga,
  onUpdateWarga,
  onDeleteWarga,
  onAddIuran
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIuran, setFilterIuran] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null);
  const [wargaToDelete, setWargaToDelete] = useState<Warga | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Quick Pay Modal for Linked Warga
  const [quickPayWarga, setQuickPayWarga] = useState<Warga | null>(null);
  const [payBulan, setPayBulan] = useState(9);
  const [payTahun, setPayTahun] = useState(2026);
  const [payNominal, setPayNominal] = useState(50000);
  const [payMetode, setPayMetode] = useState<MetodeBayar>('tunai');
  const [payCatatan, setPayCatatan] = useState('');

  // Form State Warga
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nik, setNik] = useState('');
  const [nomorKk, setNomorKk] = useState('');
  const [nomorRumah, setNomorRumah] = useState('');
  const [alamatRumah, setAlamatRumah] = useState('Jl. Pedurungan Lor Gang Mawar');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [statusKependudukan, setStatusKependudukan] = useState<'tetap' | 'kontrak' | 'kost'>('tetap');
  const [noTelp, setNoTelp] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [jumlahAnggota, setJumlahAnggota] = useState(3);

  const canManage = currentUser.role !== 'warga';

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

  // Helper: Relasi Iuran Warga
  const safeIuranList = iuranList || [];

  const getIuranForWarga = (wargaId: string) => {
    return safeIuranList.filter((i) => i.warga_id === wargaId);
  };

  const isCurrentMonthLunas = (wargaId: string) => {
    return safeIuranList.some(
      (i) => i.warga_id === wargaId && i.bulan === 9 && i.tahun === 2026 && i.status_verifikasi === 'lunas'
    );
  };

  const filteredWarga = wargaList.filter((w) => {
    const matchSearch =
      w.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      w.nomor_rumah.toLowerCase().includes(search.toLowerCase()) ||
      w.nik.includes(search) ||
      w.nomor_kk.includes(search);
    const matchStatus = filterStatus === 'all' || w.status_kependudukan === filterStatus;
    const lunas = isCurrentMonthLunas(w.id);
    const matchIuran =
      filterIuran === 'all' ||
      (filterIuran === 'lunas' && lunas) ||
      (filterIuran === 'belum_lunas' && !lunas);
    return matchSearch && matchStatus && matchIuran;
  });

  const openAddModal = () => {
    setEditingWarga(null);
    setNamaLengkap('');
    setNik('');
    setNomorKk('');
    setNomorRumah('');
    setAlamatRumah('Jl. Pedurungan Lor Gang Mawar');
    setJenisKelamin('L');
    setStatusKependudukan('tetap');
    setNoTelp('');
    setPekerjaan('');
    setJumlahAnggota(3);
    setShowModal(true);
  };

  const openEditModal = (warga: Warga, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingWarga(warga);
    setNamaLengkap(warga.nama_lengkap);
    setNik(warga.nik);
    setNomorKk(warga.nomor_kk);
    setNomorRumah(warga.nomor_rumah);
    setAlamatRumah(warga.alamat_rumah);
    setJenisKelamin(warga.jenis_kelamin);
    setStatusKependudukan(warga.status_kependudukan);
    setNoTelp(warga.no_telp);
    setPekerjaan(warga.pekerjaan);
    setJumlahAnggota(warga.jumlah_anggota_keluarga);
    setShowModal(true);
    if (selectedWarga) setSelectedWarga(null);
  };

  const confirmDelete = (warga: Warga, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWargaToDelete(warga);
  };

  const handleExecuteDelete = () => {
    if (!wargaToDelete) return;
    if (onDeleteWarga) {
      onDeleteWarga(wargaToDelete.id);
    }
    showToast(`Data warga "${wargaToDelete.nama_lengkap}" berhasil dihapus.`);
    if (selectedWarga?.id === wargaToDelete.id) {
      setSelectedWarga(null);
    }
    setWargaToDelete(null);
  };

  const handleSaveWarga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap || !nik || !nomorRumah) return;

    if (editingWarga) {
      const updated: Warga = {
        ...editingWarga,
        nama_lengkap: namaLengkap,
        nik,
        nomor_kk: nomorKk || editingWarga.nomor_kk,
        nomor_rumah: nomorRumah,
        alamat_rumah: alamatRumah,
        jenis_kelamin: jenisKelamin,
        status_kependudukan: statusKependudukan,
        no_telp: noTelp || '-',
        pekerjaan: pekerjaan || 'Wiraswasta',
        jumlah_anggota_keluarga: Number(jumlahAnggota) || 1
      };
      if (onUpdateWarga) {
        onUpdateWarga(updated);
      }
      showToast(`Koreksi data warga "${namaLengkap}" berhasil disimpan.`);
    } else {
      const newWarga: Warga = {
        id: `w-${Date.now()}`,
        nomor_kk: nomorKk || '3374010000000000',
        nik,
        nama_lengkap: namaLengkap,
        jenis_kelamin: jenisKelamin,
        alamat_rumah: alamatRumah,
        nomor_rumah: nomorRumah,
        rt: '10',
        rw: '04',
        kelurahan: 'Pedurungan Lor',
        kecamatan: 'Pedurungan',
        kota: 'Semarang',
        status_kependudukan: statusKependudukan,
        status_keluarga: 'kepala_keluarga',
        no_telp: noTelp || '-',
        pekerjaan: pekerjaan || 'Wiraswasta',
        jumlah_anggota_keluarga: Number(jumlahAnggota) || 1,
        status_aktif: true,
        tanggal_masuk: new Date().toISOString().split('T')[0]
      };
      onAddWarga(newWarga);
      showToast(`Warga baru "${namaLengkap}" berhasil ditambahkan.`);
    }

    setShowModal(false);
  };

  // Submit Quick Pay for this resident
  const handleSaveQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayWarga || !onAddIuran) return;

    const receiptNum = `KWT/${payTahun}/${String(payBulan).padStart(2, '0')}/${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newIuran: IuranWajib = {
      id: `iur-${Date.now()}`,
      warga_id: quickPayWarga.id,
      nama_warga: quickPayWarga.nama_lengkap,
      nomor_rumah: quickPayWarga.nomor_rumah,
      bulan: payBulan,
      tahun: payTahun,
      jenis_iuran: 'keamanan_kebersihan',
      jumlah_nominal: Number(payNominal),
      tanggal_bayar: new Date().toISOString().split('T')[0],
      metode_bayar: payMetode,
      status_verifikasi: 'lunas',
      diverifikasi_oleh: currentUser.id,
      nomor_kwitansi: receiptNum,
      catatan: payCatatan || `Setoran via profil warga ${quickPayWarga.nama_lengkap}`
    };

    onAddIuran(newIuran);
    showToast(`Iuran warga ${quickPayWarga.nama_lengkap} berhasil dicatat & Lunas!`);
    setQuickPayWarga(null);
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
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Data Kependudukan Terintegrasi Iuran • RT 10 RW 04
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Daftar Warga & Status Iuran Bulanan
          </h2>
          <p className="text-xs text-slate-500">
            Terhubung langsung dengan catatan iuran kas. Cek status lunas bulan berjalan dan catat setoran langsung per warga.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Warga</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama warga, nomor rumah, NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Kependudukan */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">Semua Status Warga ({wargaList.length})</option>
            <option value="tetap">Warga Tetap</option>
            <option value="kontrak">Warga Kontrak</option>
            <option value="kost">Warga Kost</option>
          </select>

          {/* Status Iuran Terhubung */}
          <select
            value={filterIuran}
            onChange={(e) => setFilterIuran(e.target.value)}
            className="bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
          >
            <option value="all">Semua Status Iuran Bln 9</option>
            <option value="lunas">✓ Iuran Bln 9 Lunas</option>
            <option value="belum_lunas">⏳ Bln 9 Belum Bayar</option>
          </select>
        </div>
      </div>

      {/* Residents Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWarga.map((w) => {
          const lunasBulanIni = isCurrentMonthLunas(w.id);
          const iuranWargaList = getIuranForWarga(w.id);
          const totalDisetor = iuranWargaList
            .filter((i) => i.status_verifikasi === 'lunas')
            .reduce((s, i) => s + i.jumlah_nominal, 0);

          return (
            <div
              key={w.id}
              onClick={() => setSelectedWarga(w)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  lunasBulanIni ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition">
                      {w.nama_lengkap}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Rumah: {w.nomor_rumah}
                      </span>
                      <span className="truncate max-w-[120px]">• {w.alamat_rumah}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      w.status_kependudukan === 'tetap'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {w.status_kependudukan}
                  </span>
                </div>

                {/* Status Iuran Terhubung (Fitur Hubungkan Data Warga dengan Iuran) */}
                <div className="my-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      Status Iuran Bln 9 (September):
                    </span>
                    {lunasBulanIni ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Lunas Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Belum Membayar
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Iuran:</span>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      {formatRupiah(totalDisetor)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">NIK: {w.nik}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{w.no_telp || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {/* Shortcut Catat Iuran */}
                {canManage && !lunasBulanIni && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickPayWarga(w);
                      setPayNominal(50000);
                      setPayBulan(9);
                      setPayTahun(2026);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2 py-1 rounded-lg transition"
                    title="Catat Iuran untuk Warga Ini"
                  >
                    <Receipt className="w-3 h-3 text-emerald-700" />
                    <span>Bayar Iuran</span>
                  </button>
                )}

                {canManage && lunasBulanIni && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Lunas 2026
                  </span>
                )}

                {!canManage && (
                  <span className="text-slate-400 text-[11px]">{w.jumlah_anggota_keluarga} Jiwa</span>
                )}

                {/* Action Buttons: Koreksi & Hapus */}
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(w, e)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg transition"
                      title="Koreksi Data Warga"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Koreksi</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => confirmDelete(w, e)}
                      className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition"
                      title="Hapus Data Warga"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredWarga.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Data Warga Tidak Ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba gunakan filter atau kata kunci lain.</p>
        </div>
      )}

      {/* Modal Detail Warga (LENGKAP DENGAN RIWAYAT IURAN TERHUBUNG) */}
      {selectedWarga && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedWarga(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                {selectedWarga.nama_lengkap.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedWarga.nama_lengkap}</h3>
                <p className="text-xs text-slate-500">
                  Kepala Keluarga • Rumah No. {selectedWarga.nomor_rumah} • RT 10 RW 04
                </p>
              </div>
            </div>

            {/* Biodata */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-700 mb-5 border border-slate-200/80">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">NIK:</span>
                <span className="font-mono font-bold text-slate-800">{selectedWarga.nik}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">No. Kartu Keluarga (KK):</span>
                <span className="font-mono font-bold text-slate-800">{selectedWarga.nomor_kk}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Alamat:</span>
                <span className="font-semibold text-slate-800">{selectedWarga.alamat_rumah}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-semibold text-slate-800">{selectedWarga.no_telp}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status Warga:</span>
                <span className="font-bold capitalize text-emerald-800">
                  Warga {selectedWarga.status_kependudukan} ({selectedWarga.jumlah_anggota_keluarga} Jiwa)
                </span>
              </div>
            </div>

            {/* Riwayat Iuran Warga Terhubung */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Catatan Iuran Wajib Warga Ini (Tabel `iuran_wajib`)
                  </h4>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickPayWarga(selectedWarga);
                      setSelectedWarga(null);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded-lg transition shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Catat Iuran Baru</span>
                  </button>
                )}
              </div>

              {(() => {
                const riwayat = getIuranForWarga(selectedWarga.id);
                if (riwayat.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 italic py-2">
                      Belum ada catatan transaksi iuran yang tercatat untuk warga ini.
                    </p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {riwayat.map((i) => (
                      <div
                        key={i.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            Bulan {i.bulan} / {i.tahun}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Metode: <span className="uppercase font-semibold">{i.metode_bayar || 'Tunai'}</span>{' '}
                            • {i.tanggal_bayar}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-emerald-700">
                            {formatRupiah(i.jumlah_nominal)}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              i.status_verifikasi === 'lunas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {i.status_verifikasi}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-2">
              {canManage && (
                <>
                  <button
                    onClick={() => openEditModal(selectedWarga)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Koreksi Data Warga</span>
                  </button>
                  <button
                    onClick={() => confirmDelete(selectedWarga)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Warga</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedWarga(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quick Pay (Setoran Iuran Terhubung ke Warga) */}
      {quickPayWarga && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-emerald-100">
            <button
              onClick={() => setQuickPayWarga(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-emerald-800">
              <Receipt className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">Catat Iuran Warga</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pembayaran iuran otomatis dikaitkan dengan <b>{quickPayWarga.nama_lengkap}</b> (Rumah {quickPayWarga.nomor_rumah})
            </p>

            <form onSubmit={handleSaveQuickPay} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bulan</label>
                  <select
                    value={payBulan}
                    onChange={(e) => setPayBulan(Number(e.target.value))}
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
                    value={payTahun}
                    onChange={(e) => setPayTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={payNominal}
                    onChange={(e) => setPayNominal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Metode Bayar</label>
                  <select
                    value={payMetode}
                    onChange={(e) => setPayMetode(e.target.value as MetodeBayar)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                  >
                    <option value="tunai">Tunai ke Bendahara</option>
                    <option value="qris">QRIS RT 10</option>
                    <option value="transfer_bca">Transfer BCA</option>
                    <option value="transfer_bri">Transfer BRI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Titip ke Bendahara / Via QRIS"
                  value={payCatatan}
                  onChange={(e) => setPayCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPayWarga(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Setoran Iuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Koreksi Warga */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingWarga ? 'Koreksi Data Warga' : 'Tambah Data Warga Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingWarga
                ? `Perbarui informasi untuk ${editingWarga.nama_lengkap}`
                : 'Simulasi INSERT INTO `warga` untuk RT 10 RW 04 Pedurungan Lor'}
            </p>

            <form onSubmit={handleSaveWarga} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Bambang Wijaya"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIK (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="337401..."
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">No KK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="337401..."
                    value={nomorKk}
                    onChange={(e) => setNomorKk(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nomor Rumah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B-06 / D-04"
                    value={nomorRumah}
                    onChange={(e) => setNomorRumah(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status Kependudukan</label>
                  <select
                    value={statusKependudukan}
                    onChange={(e) => setStatusKependudukan(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="tetap">Warga Tetap</option>
                    <option value="kontrak">Warga Kontrak</option>
                    <option value="kost">Warga Kost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder="Jl. Pedurungan Lor Gang ..."
                  value={alamatRumah}
                  onChange={(e) => setAlamatRumah(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={noTelp}
                    onChange={(e) => setNoTelp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Wiraswasta / Karyawan"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jumlah Anggota Keluarga</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={jumlahAnggota}
                    onChange={(e) => setJumlahAnggota(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition"
                >
                  {editingWarga ? 'Simpan Koreksi' : 'Simpan Data Warga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Hapus Warga */}
      {wargaToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Warga</h3>
                <p className="text-xs text-slate-500">Tindakan ini menghapus data kependudukan</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-xs text-rose-800 space-y-1">
              <p>
                Apakah Anda yakin ingin menghapus data warga <b>{wargaToDelete.nama_lengkap}</b>?
              </p>
              <p className="text-[11px] text-rose-600">
                Nomor Rumah: <b>{wargaToDelete.nomor_rumah}</b> • NIK: <b>{wargaToDelete.nik}</b>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWargaToDelete(null)}
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
    </div>
  );
};
