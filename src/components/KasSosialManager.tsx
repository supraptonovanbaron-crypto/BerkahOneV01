import React, { useState } from 'react';
import { KasSosial, User, TipeKasSosial, KategoriKasSosial, Warga } from '../types';
import {
  HeartHandshake,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Heart,
  Calendar,
  User as UserIcon,
  X,
  Coins,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface KasSosialManagerProps {
  currentUser: User;
  kasSosialList: KasSosial[];
  wargaList: Warga[];
  onAddKasSosial: (item: KasSosial) => void;
  onUpdateKasSosial?: (item: KasSosial) => void;
  onDeleteKasSosial?: (id: string) => void;
}

export const KasSosialManager: React.FC<KasSosialManagerProps> = ({
  currentUser,
  kasSosialList,
  wargaList,
  onAddKasSosial,
  onUpdateKasSosial,
  onDeleteKasSosial
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KasSosial | null>(null);
  const [itemToDelete, setItemToDelete] = useState<KasSosial | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [tipeTransaksi, setTipeTransaksi] = useState<TipeKasSosial>('masuk');
  const [kategori, setKategori] = useState<KategoriKasSosial>('jimpitan_sukarela');
  const [nominal, setNominal] = useState(300000);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');
  const [selectedWargaId, setSelectedWargaId] = useState('');

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

  const totalMasuk = kasSosialList
    .filter((k) => k.tipe_transaksi === 'masuk')
    .reduce((s, k) => s + k.nominal, 0);

  const totalKeluar = kasSosialList
    .filter((k) => k.tipe_transaksi === 'keluar')
    .reduce((s, k) => s + k.nominal, 0);

  const saldoKasSosial = totalMasuk - totalKeluar;

  const openAddModal = () => {
    setEditingItem(null);
    setTipeTransaksi('masuk');
    setKategori('jimpitan_sukarela');
    setNominal(300000);
    setTanggal(new Date().toISOString().split('T')[0]);
    setKeterangan('');
    setSelectedWargaId('');
    setShowModal(true);
  };

  const openEditModal = (item: KasSosial) => {
    setEditingItem(item);
    setTipeTransaksi(item.tipe_transaksi);
    setKategori(item.kategori);
    setNominal(item.nominal);
    setTanggal(item.tanggal);
    setKeterangan(item.keterangan);
    setSelectedWargaId(item.warga_id || '');
    setShowModal(true);
  };

  const confirmDelete = (item: KasSosial) => {
    setItemToDelete(item);
  };

  const handleExecuteDelete = () => {
    if (!itemToDelete) return;
    if (onDeleteKasSosial) {
      onDeleteKasSosial(itemToDelete.id);
    }
    showToast(`Data kas sosial "${itemToDelete.keterangan}" berhasil dihapus.`);
    setItemToDelete(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || !keterangan) return;

    const warga = wargaList.find((w) => w.id === selectedWargaId);

    if (editingItem) {
      // Koreksi Data Kas Sosial
      const updated: KasSosial = {
        ...editingItem,
        tipe_transaksi: tipeTransaksi,
        kategori,
        nominal: Number(nominal),
        tanggal,
        keterangan,
        warga_id: warga?.id,
        nama_warga: warga?.nama_lengkap
      };

      if (onUpdateKasSosial) {
        onUpdateKasSosial(updated);
      }
      showToast(`Koreksi kas sosial berhasil disimpan.`);
    } else {
      // Tambah Data Kas Sosial Baru
      const newItem: KasSosial = {
        id: `ks-${Date.now()}`,
        tipe_transaksi: tipeTransaksi,
        kategori,
        nominal: Number(nominal),
        tanggal,
        keterangan,
        warga_id: warga?.id,
        nama_warga: warga?.nama_lengkap,
        dicatat_oleh: currentUser.nama
      };

      onAddKasSosial(newItem);
      showToast(`Mutasi kas sosial baru berhasil dicatat.`);
    }

    setShowModal(false);
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
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <HeartHandshake className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Tabel Database: `kas_sosial`
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Kas Sosial & Dana Darurat Kemanusiaan
          </h2>
          <p className="text-xs text-slate-500">
            Khusus untuk infaq/jimpitan koin warga, santunan kematian (lelayu), dan bantuan rawat inap. Koreksi & hapus mutasi.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Mutasi Sosial</span>
          </button>
        )}
      </div>

      {/* Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Saldo Kas Sosial Siap Pakai</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(saldoKasSosial)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Dana siaga warga RT 10 RW 04</p>
        </div>

        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span>Total Jimpitan & Donasi Masuk</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-900 font-mono">
            +{formatRupiah(totalMasuk)}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">Akumulasi donasi sukarela</p>
        </div>

        <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200/80">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span>Total Santunan Diberikan</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-extrabold text-rose-900 font-mono">
            -{formatRupiah(totalKeluar)}
          </p>
          <p className="text-[11px] text-rose-700 mt-1">Santunan lelayu & warga sakit</p>
        </div>
      </div>

      {/* Mutasi List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Riwayat Mutasi Masuk & Keluar Kas Sosial</span>
        </h3>

        <div className="space-y-3">
          {kasSosialList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 bg-slate-50/50 hover:bg-amber-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    item.tipe_transaksi === 'masuk'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.tipe_transaksi === 'masuk' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {item.kategori.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.keterangan}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {item.tanggal} • Dicatat: {item.dicatat_oleh}
                    {item.nama_warga && ` • Warga Terkait: ${item.nama_warga}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span
                  className={`text-xs font-bold font-mono ${
                    item.tipe_transaksi === 'masuk' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {item.tipe_transaksi === 'masuk' ? '+' : '-'} {formatRupiah(item.nominal)}
                </span>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                      title="Koreksi Mutasi Sosial"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Koreksi</span>
                    </button>

                    <button
                      onClick={() => confirmDelete(item)}
                      className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                      title="Hapus Mutasi Sosial"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {kasSosialList.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada mutasi kas sosial yang tercatat.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah / Koreksi Kas Sosial */}
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
              {editingItem ? 'Koreksi Data Kas Sosial' : 'Catat Mutasi Kas Sosial'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingItem
                ? `Perbarui rincian transaksi kas sosial ${editingItem.id}`
                : 'Simulasi INSERT INTO `kas_sosial` RT 10 RW 04'}
            </p>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jenis Mutasi</label>
                  <select
                    value={tipeTransaksi}
                    onChange={(e) => {
                      const val = e.target.value as TipeKasSosial;
                      setTipeTransaksi(val);
                      if (val === 'masuk') setKategori('jimpitan_sukarela');
                      else setKategori('santunan_kematian');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="masuk">Pemasukan (Donasi / Jimpitan)</option>
                    <option value="keluar">Pengeluaran (Santunan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriKasSosial)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {tipeTransaksi === 'masuk' ? (
                      <>
                        <option value="jimpitan_sukarela">Jimpitan Koin Rombong Warga</option>
                        <option value="donasi_khusus">Donasi / Infaq Khusus Warga</option>
                      </>
                    ) : (
                      <>
                        <option value="santunan_kematian">Santunan Kematian (Lelayu)</option>
                        <option value="bantuan_sakit">Bantuan Rawat Inap Sakit</option>
                        <option value="bencana_alam">Bantuan Tanggap Darurat</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Kaitkan dengan Warga (Opsional)
                </label>
                <select
                  value={selectedWargaId}
                  onChange={(e) => setSelectedWargaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- Tidak Terkait Spesifik --</option>
                  {wargaList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama_lengkap} (Rumah Blok {w.nomor_rumah})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Keterangan Catatan *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Santunan lelayu kakek Alm. Ibu Rahayu"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingItem ? 'Simpan Koreksi' : 'Simpan Mutasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Hapus Kas Sosial */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Mutasi Sosial</h3>
                <p className="text-xs text-slate-500">Tindakan ini menghapus catatan kas sosial</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-xs text-rose-800 space-y-1">
              <p>
                Apakah Anda yakin ingin menghapus mutasi <b>{itemToDelete.keterangan}</b>?
              </p>
              <p className="text-[11px] text-rose-600">
                Tanggal: <b>{itemToDelete.tanggal}</b> • Nominal:{' '}
                <b>{formatRupiah(itemToDelete.nominal)}</b> ({itemToDelete.tipe_transaksi.toUpperCase()})
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
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
