import React, { useState } from 'react';
import { Pengeluaran, User, KategoriPengeluaran } from '../types';
import {
  Building2,
  Plus,
  Calendar,
  User as UserIcon,
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  X,
  FileText,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PengeluaranManagerProps {
  currentUser: User;
  pengeluaranList: Pengeluaran[];
  onAddPengeluaran: (item: Pengeluaran) => void;
  onApprovePengeluaran: (id: string) => void;
  onUpdatePengeluaran?: (item: Pengeluaran) => void;
  onDeletePengeluaran?: (id: string) => void;
}

export const PengeluaranManager: React.FC<PengeluaranManagerProps> = ({
  currentUser,
  pengeluaranList,
  onAddPengeluaran,
  onApprovePengeluaran,
  onUpdatePengeluaran,
  onDeletePengeluaran
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengeluaran | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Pengeluaran | null>(null);
  const [filterKat, setFilterKat] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<KategoriPengeluaran>('keamanan_pos_ronda');
  const [nominal, setNominal] = useState(250000);
  const [deskripsi, setDeskripsi] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('Pak Mulyono (Sie Keamanan)');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [statusApproval, setStatusApproval] = useState<'disetujui' | 'draft' | 'ditolak'>('disetujui');

  const canApprove = currentUser.role === 'ketua_rt';
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

  const openAddModal = () => {
    setEditingItem(null);
    setJudul('');
    setKategori('keamanan_pos_ronda');
    setNominal(250000);
    setDeskripsi('');
    setPenanggungJawab('Pak Mulyono (Sie Keamanan)');
    setTanggal(new Date().toISOString().split('T')[0]);
    setStatusApproval(canApprove ? 'disetujui' : 'draft');
    setShowModal(true);
  };

  const openEditModal = (item: Pengeluaran) => {
    setEditingItem(item);
    setJudul(item.judul_pengeluaran);
    setKategori(item.kategori);
    setNominal(item.nominal);
    setDeskripsi(item.deskripsi || '');
    setPenanggungJawab(item.penanggung_jawab);
    setTanggal(item.tanggal_pengeluaran);
    setStatusApproval(item.status_approval);
    setShowModal(true);
  };

  const confirmDelete = (item: Pengeluaran) => {
    setItemToDelete(item);
  };

  const handleExecuteDelete = () => {
    if (!itemToDelete) return;
    if (onDeletePengeluaran) {
      onDeletePengeluaran(itemToDelete.id);
    }
    showToast(`Pengeluaran "${itemToDelete.judul_pengeluaran}" berhasil dihapus.`);
    setItemToDelete(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !nominal) return;

    if (editingItem) {
      // Koreksi Data Pengeluaran
      const updated: Pengeluaran = {
        ...editingItem,
        judul_pengeluaran: judul,
        kategori,
        nominal: Number(nominal),
        tanggal_pengeluaran: tanggal,
        penanggung_jawab: penanggungJawab,
        deskripsi,
        status_approval: statusApproval,
        disetujui_oleh: statusApproval === 'disetujui' ? currentUser.id : editingItem.disetujui_oleh
      };

      if (onUpdatePengeluaran) {
        onUpdatePengeluaran(updated);
      }
      showToast(`Koreksi pengeluaran "${judul}" berhasil disimpan.`);
    } else {
      // Tambah Data Pengeluaran Baru
      const newItem: Pengeluaran = {
        id: `peng-${Date.now()}`,
        kategori,
        judul_pengeluaran: judul,
        deskripsi,
        nominal: Number(nominal),
        tanggal_pengeluaran: tanggal,
        penanggung_jawab: penanggungJawab,
        disetujui_oleh: canApprove ? currentUser.id : 'u-ketua-rt',
        status_approval: canApprove ? 'disetujui' : 'draft'
      };

      onAddPengeluaran(newItem);
      showToast(`Pengeluaran baru "${judul}" berhasil dicatat.`);
    }

    setShowModal(false);
  };

  const getKategoriBadge = (kat: KategoriPengeluaran) => {
    const map: Record<KategoriPengeluaran, { label: string; color: string }> = {
      keamanan_pos_ronda: { label: 'Keamanan & Ronda', color: 'bg-blue-100 text-blue-800' },
      kebersihan_lingkungan: { label: 'Kebersihan & Sampah', color: 'bg-emerald-100 text-emerald-800' },
      perbaikan_fasilitas: { label: 'Sarpras / PJU', color: 'bg-purple-100 text-purple-800' },
      kegiatan_warga_17an: { label: 'Kegiatan Warga', color: 'bg-rose-100 text-rose-800' },
      operasional_rt: { label: 'Operasional RT', color: 'bg-amber-100 text-amber-800' },
      lainnya: { label: 'Lainnya', color: 'bg-slate-100 text-slate-800' }
    };
    const res = map[kat] || map.lainnya;
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.color}`}>
        {res.label}
      </span>
    );
  };

  const filtered = pengeluaranList.filter((p) => {
    if (filterKat === 'all') return true;
    return p.kategori === filterKat;
  });

  const totalPengeluaran = filtered.reduce((s, p) => s + p.nominal, 0);

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
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Tabel Database: `pengeluaran`
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Catatan Pengeluaran Kas RT 10 RW 04
          </h2>
          <p className="text-xs text-slate-500">
            Biaya operasional ronda, kebersihan got sampah, lampu PJU, dan kegiatan lingkungan. Koreksi & hapus nota.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl text-right">
            <p className="text-[10px] font-semibold text-rose-600">Total Pengeluaran Terfilter:</p>
            <p className="text-sm font-bold text-rose-900 font-mono">{formatRupiah(totalPengeluaran)}</p>
          </div>

          {canManage && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pengeluaran</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" /> Kategori:
        </span>
        {[
          { id: 'all', label: 'Semua Kategori' },
          { id: 'keamanan_pos_ronda', label: 'Keamanan & Ronda' },
          { id: 'kebersihan_lingkungan', label: 'Kebersihan & Sampah' },
          { id: 'perbaikan_fasilitas', label: 'Sarpras / PJU' },
          { id: 'kegiatan_warga_17an', label: 'Kegiatan Warga' },
          { id: 'operasional_rt', label: 'Operasional RT' }
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterKat(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterKat === c.id
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Expense Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-rose-300 transition shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getKategoriBadge(item.kategori)}
                    <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.judul_pengeluaran}</h3>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base text-rose-600">
                    -{formatRupiah(item.nominal)}
                  </span>
                </div>
              </div>

              {item.deskripsi && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                  {item.deskripsi}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.tanggal_pengeluaran}</span>
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.penanggung_jawab}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.status_approval === 'disetujui' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Disetujui RT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Draft
                  </span>
                )}

                {canManage && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                      title="Koreksi Pengeluaran"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Koreksi</span>
                    </button>

                    <button
                      onClick={() => confirmDelete(item)}
                      className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                      title="Hapus Pengeluaran"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Tidak Ada Data Pengeluaran</p>
          <p className="text-xs text-slate-400 mt-1">Belum ada pengeluaran pada kategori ini.</p>
        </div>
      )}

      {/* Modal Tambah / Koreksi Pengeluaran */}
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
              {editingItem ? 'Koreksi Pengeluaran Kas RT' : 'Catat Pengeluaran RT Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingItem
                ? `Perbarui rincian pengeluaran ${editingItem.judul_pengeluaran}`
                : 'Simulasi INSERT INTO `pengeluaran` kas operasional RT 10 RW 04'}
            </p>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Judul Pengeluaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Cat Gapura Gang Mawar"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriPengeluaran)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="keamanan_pos_ronda">Keamanan & Pos Ronda</option>
                    <option value="kebersihan_lingkungan">Kebersihan Lingkungan</option>
                    <option value="perbaikan_fasilitas">Perbaikan Fasilitas / PJU</option>
                    <option value="kegiatan_warga_17an">Kegiatan Warga / 17an</option>
                    <option value="operasional_rt">Operasional RT & ATK</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {editingItem && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status Persetujuan (Approval)</label>
                  <select
                    value={statusApproval}
                    onChange={(e) => setStatusApproval(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="disetujui">Disetujui RT</option>
                    <option value="draft">Draft / Menunggu</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Deskripsi Tambahan / Rincian Nota</label>
                <textarea
                  rows={2}
                  placeholder="Rincian nota belanja / tempat pembelian..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingItem ? 'Simpan Koreksi' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Hapus Pengeluaran */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Pengeluaran</h3>
                <p className="text-xs text-slate-500">Tindakan ini menghapus catatan belanja</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-xs text-rose-800 space-y-1">
              <p>
                Apakah Anda yakin ingin menghapus catatan belanja <b>{itemToDelete.judul_pengeluaran}</b>?
              </p>
              <p className="text-[11px] text-rose-600">
                Tanggal: <b>{itemToDelete.tanggal_pengeluaran}</b> • Nominal:{' '}
                <b>{formatRupiah(itemToDelete.nominal)}</b>
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
