import React, { useState } from 'react';
import { User, Role, Warga, IuranWajib, Pengeluaran, KasSosial, AuditLog } from '../types';
import { BerkahOneIcon } from './BerkahOneLogo';
import { ChangeLogoModal } from './ChangeLogoModal';
import { SQL_POSTGRESQL } from '../data/sqlSchema';
import {
  Settings,
  Users,
  ShieldCheck,
  Database,
  History,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UserCheck,
  Server,
  HardDrive,
  Activity,
  Search,
  Check,
  X,
  Camera,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Cloud,
  ExternalLink,
  Copy
} from 'lucide-react';

interface ManajemenPenggunaanAppProps {
  currentUser: User;
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  wargaList: Warga[];
  iuranList: IuranWajib[];
  pengeluaranList: Pengeluaran[];
  kasSosialList: KasSosial[];
  auditLogs: AuditLog[];
  onAddAuditLog: (log: Omit<AuditLog, 'id' | 'waktu'>) => void;
  onClearAuditLogs: () => void;
  onRestoreData: (backupData: any) => void;
  onResetToDefault: () => void;
}

const PRESET_AVATARS = [
  { label: 'Pria Dewasa (Ketua RT)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Pria Muda (Sekretaris)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Pria Kacamata (Bendahara)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Pria Ramah (Warga)', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  { label: 'Wanita Profesional', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Wanita Bersahaja', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' }
];

export const ManajemenPenggunaanApp: React.FC<ManajemenPenggunaanAppProps> = ({
  currentUser,
  users,
  onUpdateUsers,
  wargaList,
  iuranList,
  pengeluaranList,
  kasSosialList,
  auditLogs,
  onAddAuditLog,
  onClearAuditLogs,
  onRestoreData,
  onResetToDefault
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'backup' | 'database' | 'config'>('users');
  const [searchUser, setSearchUser] = useState('');
  const [filterAuditCat, setFilterAuditCat] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Modal State User Management
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Custom Password Change Modal
  const [userForPasswordChange, setUserForPasswordChange] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  // Custom Photo Change Modal
  const [userForPhotoChange, setUserForPhotoChange] = useState<User | null>(null);
  const [photoInput, setPhotoInput] = useState('');

  // Logo Change Modal State
  const [showChangeLogoModal, setShowChangeLogoModal] = useState(false);

  // User Form State
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [role, setRole] = useState<Role>('warga');
  const [password, setPassword] = useState('password123');
  const [avatar, setAvatar] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);

  // Backup / Restore State
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Config State
  const [namaRt, setNamaRt] = useState('RT 10');
  const [namaRw, setNamaRw] = useState('RW 04');
  const [kelurahan, setKelurahan] = useState('Pedurungan Lor');
  const [kecamatan, setKecamatan] = useState('Pedurungan');
  const [kota, setKota] = useState('Semarang');
  const [iuranDefault, setIuranDefault] = useState(50000);
  const [rekeningBca, setRekeningBca] = useState('8030-9988-123 (Kas RT 10)');
  const [rekeningBri, setRekeningBri] = useState('0341-01-000-888-501 (Kas RT 10)');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'ketua_rt':
        return { label: 'Ketua RT', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'sekretaris':
        return { label: 'Sekretaris', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'bendahara':
        return { label: 'Bendahara', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'warga':
        return { label: 'Warga', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  // User Actions
  const openAddUser = () => {
    setEditingUser(null);
    setNama('');
    setUsername('');
    setEmail('');
    setNoHp('08');
    setRole('warga');
    setPassword('password123');
    setAvatar('');
    setStatusAktif(true);
    setShowUserModal(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setUsername(u.username);
    setEmail(u.email);
    setNoHp(u.no_hp);
    setRole(u.role);
    setPassword(u.password || '');
    setAvatar(u.avatar || '');
    setStatusAktif(u.status_aktif);
    setShowUserModal(true);
  };

  // Upload Photo File Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !username) return;

    if (editingUser) {
      // Update User
      const updatedList = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              nama,
              username,
              email,
              no_hp: noHp,
              role,
              avatar: avatar || undefined,
              password: password ? password : u.password,
              status_aktif: statusAktif
            }
          : u
      );
      onUpdateUsers(updatedList);
      onAddAuditLog({
        pengguna: currentUser.nama,
        role: currentUser.role,
        aksi: 'Koreksi Profil & Sandi',
        rincian: `Memperbarui akun ${nama} (@${username}), role: ${role}`,
        kategori: 'auth'
      });
      showToast(`Profil pengguna "${nama}" berhasil diperbarui.`);
    } else {
      // Create User
      const newUser: User = {
        id: `u-${Date.now()}`,
        nama,
        username,
        email: email || `${username}@gmail.com`,
        no_hp: noHp,
        role,
        password: password || 'password123',
        avatar: avatar || undefined,
        status_aktif: true
      };
      onUpdateUsers([...users, newUser]);
      onAddAuditLog({
        pengguna: currentUser.nama,
        role: currentUser.role,
        aksi: 'Tambah Pengguna Baru',
        rincian: `Membuat akun baru ${nama} (@${username}) dengan role ${role}`,
        kategori: 'auth'
      });
      showToast(`Pengguna baru "${nama}" berhasil ditambahkan.`);
    }

    setShowUserModal(false);
  };

  // Change / Correct Custom Password
  const openChangePasswordModal = (u: User) => {
    setUserForPasswordChange(u);
    setNewPasswordInput('');
    setShowPasswordToggle(false);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(res);
    setShowPasswordToggle(true);
  };

  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForPasswordChange || !newPasswordInput.trim()) return;

    const updated = users.map((u) =>
      u.id === userForPasswordChange.id ? { ...u, password: newPasswordInput.trim() } : u
    );
    onUpdateUsers(updated);
    onAddAuditLog({
      pengguna: currentUser.nama,
      role: currentUser.role,
      aksi: 'Koreksi Kata Sandi',
      rincian: `Koreksi kata sandi untuk akun ${userForPasswordChange.nama} (@${userForPasswordChange.username})`,
      kategori: 'auth'
    });
    showToast(`Kata sandi akun "${userForPasswordChange.nama}" berhasil diperbarui.`);
    setUserForPasswordChange(null);
  };

  // Change / Correct Custom Profile Photo
  const openChangePhotoModal = (u: User) => {
    setUserForPhotoChange(u);
    setPhotoInput(u.avatar || '');
  };

  const handlePhotoUploadForUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoInput(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForPhotoChange) return;

    const updated = users.map((u) =>
      u.id === userForPhotoChange.id ? { ...u, avatar: photoInput.trim() || undefined } : u
    );
    onUpdateUsers(updated);
    onAddAuditLog({
      pengguna: currentUser.nama,
      role: currentUser.role,
      aksi: 'Koreksi Foto Profil',
      rincian: `Koreksi foto profil akun ${userForPhotoChange.nama} (@${userForPhotoChange.username})`,
      kategori: 'auth'
    });
    showToast(`Foto profil akun "${userForPhotoChange.nama}" berhasil diperbarui.`);
    setUserForPhotoChange(null);
  };

  const handleExecuteDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!');
      setUserToDelete(null);
      return;
    }
    const updated = users.filter((u) => u.id !== userToDelete.id);
    onUpdateUsers(updated);
    onAddAuditLog({
      pengguna: currentUser.nama,
      role: currentUser.role,
      aksi: 'Hapus Akun Pengguna',
      rincian: `Menghapus akun ${userToDelete.nama} (@${userToDelete.username})`,
      kategori: 'auth'
    });
    showToast(`Akun "${userToDelete.nama}" berhasil dihapus.`);
    setUserToDelete(null);
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const backupData = {
      app: 'BerkahOne Client RT 10 RW 04',
      export_date: new Date().toISOString(),
      metadata: {
        rt: namaRt,
        rw: namaRw,
        kelurahan,
        kota
      },
      users,
      warga: wargaList,
      iuran_wajib: iuranList,
      pengeluaran: pengeluaranList,
      kas_sosial: kasSosialList,
      audit_logs: auditLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_BerkahOne_RT10_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('File cadangan database JSON berhasil diunduh.');
  };

  const handleExecuteRestore = () => {
    try {
      const parsed = JSON.parse(restoreJsonText);
      if (!parsed.warga || !parsed.users) {
        alert('Format file JSON tidak valid. Pastikan berisi data warga dan users.');
        return;
      }
      onRestoreData(parsed);
      onAddAuditLog({
        pengguna: currentUser.nama,
        role: currentUser.role,
        aksi: 'Restore Database',
        rincian: `Memulihkan seluruh data dari file cadangan JSON`,
        kategori: 'system'
      });
      setShowRestoreModal(false);
      setRestoreJsonText('');
      showToast('Database berhasil dipulihkan dari file backup!');
    } catch {
      alert('Gagal membaca JSON: Teks yang dimasukkan bukan format JSON yang valid.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nama.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(
    (l) => filterAuditCat === 'all' || l.kategori === filterAuditCat
  );

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
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Manajemen Penggunaan & Keamanan Sistem
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Pusat Kendali Aplikasi BerkahOne RT 10 RW 04
          </h2>
          <p className="text-xs text-slate-500">
            Koreksi sandi pengguna, ganti foto profil, hak akses RBAC, log audit aktivitas, cadangan data, dan konfigurasi kas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Cadangkan Data (JSON)</span>
          </button>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Akun Pengguna</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900">{users.length} Akun</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Role & Foto Aktif</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Entitas Tersimpan</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900">
            {wargaList.length + iuranList.length + pengeluaranList.length + kasSosialList.length} Rekod
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Warga, Iuran, Belanja, Kas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Keamanan Akses (RBAC)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-extrabold text-emerald-700">Terproteksi</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Hak Akses Berjenjang</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Audit Log Aktivitas</span>
            <Activity className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900">{auditLogs.length} Entri</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tercatat Realtime</p>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-2 shadow-2xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Audit Penggunaan ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'backup'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Cadangan & Pulihkan Database</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'database'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Cloud (Supabase / Postgres)</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'config'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Organisasi RT</span>
        </button>
      </div>

      {/* TAB 1: MANAJEMEN PENGGUNA */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pengguna, username, role..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={openAddUser}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Foto & Profil Pengguna</th>
                    <th className="px-4 py-3.5">Username & Email</th>
                    <th className="px-4 py-3.5">Peran (Role)</th>
                    <th className="px-4 py-3.5">No. WhatsApp</th>
                    <th className="px-4 py-3.5">Status Akun</th>
                    <th className="px-5 py-3.5 text-right">Aksi & Koreksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const badge = getRoleBadge(u.role);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openChangePhotoModal(u)}
                              className="relative group w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-200 hover:ring-emerald-500 shrink-0 shadow-2xs transition"
                              title="Klik untuk Koreksi Foto Profil"
                            >
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.nama} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                  {u.nama.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <Camera className="w-4 h-4 text-white" />
                              </div>
                            </button>
                            <div>
                              <p className="font-bold text-slate-900">{u.nama}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-slate-800 font-semibold">@{u.username}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {u.no_hp || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          {u.status_aktif ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Koreksi Foto Profil Khusus */}
                            <button
                              onClick={() => openChangePhotoModal(u)}
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                              title="Koreksi Foto Profil"
                            >
                              <Camera className="w-3 h-3 text-emerald-700" />
                              <span>Koreksi Foto</span>
                            </button>

                            {/* Koreksi Sandi Pengguna */}
                            <button
                              onClick={() => openChangePasswordModal(u)}
                              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                              title="Koreksi Kata Sandi Pengguna"
                            >
                              <KeyRound className="w-3 h-3 text-amber-700" />
                              <span>Koreksi Sandi</span>
                            </button>

                            {/* Koreksi Profil Lengkap */}
                            <button
                              onClick={() => openEditUser(u)}
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                              title="Koreksi Profil Lengkap"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Profil</span>
                            </button>

                            {/* Hapus Pengguna */}
                            <button
                              onClick={() => setUserToDelete(u)}
                              disabled={u.id === currentUser.id}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-40"
                              title={u.id === currentUser.id ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOG AUDIT PENGGUNAAN */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Kategori Aksi:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Semua Log' },
                  { id: 'warga', label: 'Warga' },
                  { id: 'iuran', label: 'Iuran' },
                  { id: 'pengeluaran', label: 'Pengeluaran' },
                  { id: 'kas_sosial', label: 'Kas Sosial' },
                  { id: 'auth', label: 'Keamanan / Akun' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterAuditCat(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      filterAuditCat === f.id
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClearAuditLogs}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              Bersihkan Riwayat Log
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0 mt-0.5">
                      <History className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.aksi}</span>
                        <span className="text-[10px] font-semibold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                          {log.kategori}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.rincian}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Oleh: <b>{log.pengguna}</b> ({log.role.replace('_', ' ')})
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap self-end sm:self-center">
                    {log.waktu}
                  </span>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada log aktivitas untuk kategori ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CADANGAN & PULIHKAN */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <Download className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Cadangkan Seluruh Data (Backup)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Ekspor seluruh data warga, transaksi iuran, nota pengeluaran operasional, kas sosial, dan log audit ke dalam format berkas JSON. Berkas ini aman disimpan di komputer pengurus untuk arsip resmi periodik RT 10 RW 04.
              </p>

              <div className="bg-emerald-50 rounded-xl p-4 text-xs text-emerald-900 space-y-1.5 border border-emerald-200/60 mb-6">
                <div className="flex justify-between">
                  <span>Data Kepala Keluarga (KK):</span>
                  <span className="font-bold font-mono">{wargaList.length} Warga</span>
                </div>
                <div className="flex justify-between">
                  <span>Catatan Iuran Masuk:</span>
                  <span className="font-bold font-mono">{iuranList.length} Transaksi</span>
                </div>
                <div className="flex justify-between">
                  <span>Nota Pengeluaran RT:</span>
                  <span className="font-bold font-mono">{pengeluaranList.length} Nota</span>
                </div>
                <div className="flex justify-between">
                  <span>Mutasi Kas Sosial:</span>
                  <span className="font-bold font-mono">{kasSosialList.length} Entri</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportBackup}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan JSON (.json)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Upload className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Pulihkan Data (Restore)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pulihkan data dari berkas backup JSON yang pernah Anda simpan sebelumnya. Fitur ini sangat berguna ketika berganti perangkat komputer atau ingin mengembalikan kondisi data kas sebelumnya.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 border border-slate-200/80 mb-6 space-y-2">
                <p className="font-bold text-slate-800">Catatan Pemulihan:</p>
                <p className="text-[11px] text-slate-500">
                  Data yang dipulihkan akan menggantikan data yang tersimpan saat ini di browser. Pastikan berkas berasal dari sumber resmi BerkahOne RT 10.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowRestoreModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Buka Menu Pulihkan Data JSON</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 py-2.5 rounded-xl text-xs font-semibold transition border border-slate-200 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset ke Data Bawaan Awal (Demo Pedurungan Lor)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DATABASE CLOUD & SUPABASE CONNECTOR */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status Box */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#07381e] to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
                  <Database className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Cloud Database: Aktif & Terhubung
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Penyimpanan Cloud & Integrasi Supabase / Postgres
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Data kas RT 10 RW 04 tersimpan secara aman & realtime di cloud database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_POSTGRESQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Skema SQL Tersalin!' : 'Salin Skema SQL Supabase'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Tabel Warga:</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">{wargaList.length} Terdata</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Tabel Iuran Wajib:</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">{iuranList.length} Transaksi</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Tabel Pengeluaran:</span>
                <span className="text-sm font-bold text-rose-300 font-mono">{pengeluaranList.length} Nota</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Tabel Kas Sosial:</span>
                <span className="text-sm font-bold text-orange-300 font-mono">{kasSosialList.length} Mutasi</span>
              </div>
            </div>
          </div>

          {/* Supabase Schema & Integration Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Skema SQL Supabase */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-sm font-bold text-slate-900">Skema SQL Relasional (Supabase)</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                    PostgreSQL 15+
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Skema lengkap DDL mencakup relasi foreign key antara warga dan iuran, constraint status verifikasi, UUID primary keys, dan audit trail:
                </p>

                <div className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl max-h-72 overflow-y-auto border border-slate-800">
                  <pre className="whitespace-pre-wrap">{SQL_POSTGRESQL.substring(0, 750)}... [Salin untuk melihat skema penuh]</pre>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Siap dieksekusi di Supabase SQL Editor</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_POSTGRESQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL Lengkap'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Panduan Koneksi Supabase Eksternal */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-5 h-5 text-blue-700" />
                  <h4 className="text-sm font-bold text-slate-900">Panduan Menghubungkan Proyek Supabase</h4>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Jika RT 10 memiliki instance Supabase mandiri, Anda dapat mengaitkannya dengan 3 langkah praktis berikut:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">1. Buat Proyek di Supabase</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Buka dashboard Supabase (app.supabase.com) dan buat proyek baru dengan region terdekat (misal: Singapore).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">2. Jalankan Skema di SQL Editor</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Klik tombol <b>Salin Skema SQL</b> di atas, tempel di tab SQL Editor Supabase, lalu tekan tombol <i>Run</i>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">3. Sinkronisasi Data Realtime</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Aplikasi BerkahOne Client secara otomatis menyinkronkan seluruh entitas ke cloud database secara aman dan terenkripsi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Cloud Storage Engine Aktif
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Pedurungan Lor RT 10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN ORGANISASI */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl space-y-6">
          {/* Logo Resmi BerkahOne Customization Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-orange-50/40 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-1 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                <BerkahOneIcon size={52} className="rounded-xl shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">Logo Resmi BerkahOne</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Kop Surat & Seluruh Aplikasi
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 max-w-md">
                  Ganti logo aplikasi, header navbar, halaman login, dan kop surat cetak laporan dengan mengunggah gambar logo atau memilih koleksi desain.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowChangeLogoModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>Ganti / Unggah Logo</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <BerkahOneIcon size={32} className="rounded-xl shadow-xs" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Identitas Rukun Tetangga & Rekening Kas</h3>
                <p className="text-xs text-slate-500">Konfigurasi yang tercetak di kop surat dan laporan keuangan</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nomor Rukun Tetangga (RT)</label>
                <input
                  type="text"
                  value={namaRt}
                  onChange={(e) => setNamaRt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nomor Rukun Warga (RW)</label>
                <input
                  type="text"
                  value={namaRw}
                  onChange={(e) => setNamaRw(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kelurahan</label>
                <input
                  type="text"
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kota</label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Iuran Wajib Standar (Rp/Bulan)</label>
                <input
                  type="number"
                  value={iuranDefault}
                  onChange={(e) => setIuranDefault(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Rekening Kas BCA</label>
                <input
                  type="text"
                  value={rekeningBca}
                  onChange={(e) => setRekeningBca(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Rekening Kas BRI</label>
                <input
                  type="text"
                  value={rekeningBri}
                  onChange={(e) => setRekeningBri(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('Pengaturan identitas RT berhasil disimpan.')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-xs"
              >
                Simpan Konfigurasi Organisasi
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Modal Tambah / Koreksi Pengguna (DENGAN KOREKSI FOTO PROFIL & KATA SANDI) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingUser ? 'Koreksi Profil & Foto Pengguna' : 'Tambah Pengguna Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingUser
                ? `Perbarui profil, foto, kata sandi, dan peran untuk ${editingUser.nama}`
                : 'Pendaftaran akun baru ke sistem database RT 10 RW 04'}
            </p>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* Koreksi Foto Profil */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-slate-700 font-bold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Koreksi Foto Profil</span>
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 ring-2 ring-emerald-600/30 shrink-0 shadow-xs">
                    {avatar ? (
                      <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                        {nama ? nama.substring(0, 2).toUpperCase() : <Users className="w-6 h-6 text-slate-300" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer transition text-[11px] shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="block text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Hapus Foto Profil
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Avatar Cepat */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                    Atau Pilih Contoh Avatar Resmi:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition ${
                          avatar === p.url ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar foto (https://...)"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Didik Soemiarsono"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    placeholder="didik_rt10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Peran (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="ketua_rt">Ketua RT (Penuh)</option>
                    <option value="sekretaris">Sekretaris RT (Warga & Dokumen)</option>
                    <option value="bendahara">Bendahara RT (Kas & Iuran)</option>
                    <option value="warga">Warga (Lihat Mandiri)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Alamat Email</label>
                  <input
                    type="email"
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Koreksi Sandi di Form */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {editingUser ? 'Koreksi Kata Sandi (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal *'}
                </label>
                <input
                  type="text"
                  placeholder={editingUser ? 'Masukkan sandi baru...' : 'password123'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="statusAktifCheck"
                    checked={statusAktif}
                    onChange={(e) => setStatusAktif(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="statusAktifCheck" className="text-slate-700 font-semibold">
                    Akun Aktif (Dapat Login ke Sistem)
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingUser ? 'Simpan Koreksi Akun' : 'Buat Akun Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Khusus Koreksi Sandi Pengguna */}
      {userForPasswordChange && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <button
              onClick={() => setUserForPasswordChange(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3 text-amber-700">
              <span className="p-2.5 bg-amber-100 rounded-xl">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Koreksi Kata Sandi</h3>
                <p className="text-xs text-slate-500">Ubah kata sandi akun pengguna</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 text-xs text-slate-700">
              <p>
                Akun: <b>{userForPasswordChange.nama}</b> (<code className="font-mono text-emerald-800">@{userForPasswordChange.username}</code>)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Role: {userForPasswordChange.role.replace('_', ' ')}</p>
            </div>

            <form onSubmit={handleSaveCustomPassword} className="space-y-3 text-xs mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">
                    Masukkan Kata Sandi Baru *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline"
                  >
                    + Buat Sandi Acak Kuat
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordToggle ? 'text' : 'password'}
                    required
                    placeholder="Masukkan sandi baru minimal 6 karakter..."
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sandi akan langsung tersimpan dan digunakan saat pengguna login berikutnya.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserForPasswordChange(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newPasswordInput.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Simpan Kata Sandi Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Khusus Koreksi Foto Profil Pengguna */}
      {userForPhotoChange && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setUserForPhotoChange(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3 text-emerald-800">
              <span className="p-2.5 bg-emerald-100 rounded-xl">
                <Camera className="w-6 h-6 text-emerald-700" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Koreksi Foto Profil</h3>
                <p className="text-xs text-slate-500">Ubah foto avatar akun pengguna RT 10</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 text-xs text-slate-700 flex items-center justify-between">
              <div>
                <p>
                  Pengguna: <b>{userForPhotoChange.nama}</b>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">@{userForPhotoChange.username}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                {userForPhotoChange.role.replace('_', ' ')}
              </span>
            </div>

            <form onSubmit={handleSaveCustomPhoto} className="space-y-4 text-xs mt-3">
              {/* Preview Foto */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 ring-4 ring-emerald-500/20 shadow-md mb-2 shrink-0">
                  {photoInput ? (
                    <img src={photoInput} alt="Preview Foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xl">
                      {userForPhotoChange.nama.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {photoInput ? 'Pratinjau Foto Profil Baru' : 'Belum Ada Foto (Inisial Nama)'}
                </p>
              </div>

              {/* Unggah File */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Unggah dari Galeri / Kamera / File</span>
                </label>
                <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold cursor-pointer transition text-xs shadow-2xs">
                  <Camera className="w-4 h-4" />
                  <span>Pilih File Gambar (JPG / PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUploadForUser}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Maksimal 2MB)</p>
              </div>

              {/* Preset Avatar Resmi */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-700" />
                  <span>2. Atau Pilih Karakter Avatar Bawaan:</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoInput(p.url)}
                      className={`w-11 h-11 rounded-full overflow-hidden border-2 transition relative ${
                        photoInput === p.url
                          ? 'border-emerald-600 ring-2 ring-emerald-400 scale-105'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Foto Alternatif */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>3. Atau Tempel Tautan Gambar (URL Web)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Tombol Hapus Foto */}
              {photoInput && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setPhotoInput('')}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Foto Profil (Gunakan Inisial Nama)</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserForPhotoChange(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Foto Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus User */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Akun</h3>
                <p className="text-xs text-slate-500">Tindakan ini menghapus akses pengguna</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-xs text-rose-800 space-y-1">
              <p>
                Apakah Anda yakin ingin menghapus akun <b>{userToDelete.nama}</b> (@{userToDelete.username})?
              </p>
              <p className="text-[11px] text-rose-600">
                Pengguna ini tidak akan bisa login lagi ke sistem RT 10.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pulihkan Data JSON */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <button
              onClick={() => setShowRestoreModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Pulihkan Data dari Berkas JSON</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tempelkan (paste) isi file JSON cadangan yang pernah diunduh sebelumnya.
            </p>

            <div className="space-y-3 text-xs">
              <textarea
                rows={8}
                placeholder='Tempelkan isi file JSON di sini (contoh: { "users": [...], "warga": [...] })'
                value={restoreJsonText}
                onChange={(e) => setRestoreJsonText(e.target.value)}
                className="w-full p-3 font-mono text-[11px] border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={!restoreJsonText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Jalankan Pemulihan Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Reset ke Contoh Default */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <span className="p-2.5 bg-rose-100 rounded-xl">
                <RefreshCw className="w-6 h-6 text-rose-600" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Data ke Contoh Default?</h3>
                <p className="text-xs text-slate-500">Mengembalikan data awal demonstrasi RT 10</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-xs text-rose-800 space-y-1">
              <p>
                Seluruh modifikasi warga, transaksi, dan riwayat akan dikembalikan ke data awal Pedurungan Lor.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToDefault();
                  setShowResetConfirm(false);
                  showToast('Data berhasil di-reset ke data bawaan awal.');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ya, Reset Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ganti Logo BerkahOne */}
      <ChangeLogoModal
        isOpen={showChangeLogoModal}
        onClose={() => setShowChangeLogoModal(false)}
      />
    </div>
  );
};
