import React, { useState, useEffect } from 'react';
import { User, Warga, IuranWajib, Pengeluaran, KasSosial, AuditLog } from './types';
import {
  INITIAL_USERS,
  INITIAL_WARGA,
  INITIAL_IURAN,
  INITIAL_PENGELUARAN,
  INITIAL_KAS_SOSIAL
} from './data/mockData';
import { CloudStorageService } from './services/cloudStorageService';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WargaManager } from './components/WargaManager';
import { IuranManager } from './components/IuranManager';
import { PengeluaranManager } from './components/PengeluaranManager';
import { KasSosialManager } from './components/KasSosialManager';
import { LaporanView } from './components/LaporanView';
import { ManajemenPenggunaanApp } from './components/ManajemenPenggunaanApp';
import { LoginView } from './components/LoginView';

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    waktu: '2026-09-29 18:30:15',
    pengguna: 'Didik Soemiarsono',
    role: 'ketua_rt',
    aksi: 'Login Aplikasi',
    rincian: 'Ketua RT Didik Soemiarsono berhasil masuk ke sistem BerkahOne RT 10',
    kategori: 'auth'
  },
  {
    id: 'log-2',
    waktu: '2026-09-29 18:35:40',
    pengguna: 'Ardian Ariawan',
    role: 'bendahara',
    aksi: 'Verifikasi Iuran',
    rincian: 'Mengesahkan pembayaran iuran Bpk. Joko Santoso (KWT/2026/09/003)',
    kategori: 'iuran'
  },
  {
    id: 'log-3',
    waktu: '2026-09-29 18:40:22',
    pengguna: 'Taufik Hidayat',
    role: 'sekretaris',
    aksi: 'Validasi Data Warga',
    rincian: 'Pengecekan kelengkapan NIK dan nomor rumah warga Blok A & B',
    kategori: 'warga'
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Load users from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('berkahone_users');
    let loaded: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    if (!loaded.some((u) => u.username.toLowerCase() === 'admin')) {
      const adminUser = INITIAL_USERS.find((u) => u.username.toLowerCase() === 'admin');
      if (adminUser) {
        loaded = [adminUser, ...loaded];
      }
    }
    return loaded;
  });

  // Wajib Login sebelum masuk ke Aplikasi
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const hasAuth = localStorage.getItem('berkahone_is_authenticated') === 'true';
    if (!hasAuth) {
      return null; // Tampilkan halaman Login terlebih dahulu!
    }
    const saved = localStorage.getItem('berkahone_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loggedOutNotice, setLoggedOutNotice] = useState<string | null>(null);

  const [wargaList, setWargaList] = useState<Warga[]>(() => {
    const saved = localStorage.getItem('berkahone_warga');
    return saved ? JSON.parse(saved) : INITIAL_WARGA;
  });

  const [iuranList, setIuranList] = useState<IuranWajib[]>(() => {
    const saved = localStorage.getItem('berkahone_iuran');
    return saved ? JSON.parse(saved) : INITIAL_IURAN;
  });

  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>(() => {
    const saved = localStorage.getItem('berkahone_pengeluaran');
    return saved ? JSON.parse(saved) : INITIAL_PENGELUARAN;
  });

  const [kasSosialList, setKasSosialList] = useState<KasSosial[]>(() => {
    const saved = localStorage.getItem('berkahone_kas_sosial');
    return saved ? JSON.parse(saved) : INITIAL_KAS_SOSIAL;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('berkahone_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('berkahone_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('berkahone_warga', JSON.stringify(wargaList));
  }, [wargaList]);

  useEffect(() => {
    localStorage.setItem('berkahone_iuran', JSON.stringify(iuranList));
  }, [iuranList]);

  useEffect(() => {
    localStorage.setItem('berkahone_pengeluaran', JSON.stringify(pengeluaranList));
  }, [pengeluaranList]);

  useEffect(() => {
    localStorage.setItem('berkahone_kas_sosial', JSON.stringify(kasSosialList));
  }, [kasSosialList]);

  useEffect(() => {
    localStorage.setItem('berkahone_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Load and synchronize from Cloud Database on mount
  useEffect(() => {
    let isMounted = true;
    CloudStorageService.loadAllData().then((res) => {
      if (!isMounted) return;
      if (res.warga && res.warga.length > 0) setWargaList(res.warga);
      if (res.iuran && res.iuran.length > 0) setIuranList(res.iuran);
      if (res.pengeluaran && res.pengeluaran.length > 0) setPengeluaranList(res.pengeluaran);
      if (res.kasSosial && res.kasSosial.length > 0) setKasSosialList(res.kasSosial);
      if (res.users && res.users.length > 0) setUsers(res.users);
      if (res.auditLogs && res.auditLogs.length > 0) setAuditLogs(res.auditLogs);
    }).catch((err) => {
      console.warn('Cloud sync initialization:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper: Append Audit Log
  const addAudit = (aksi: string, rincian: string, kategori: AuditLog['kategori']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      waktu: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: currentUser?.nama || 'Sistem',
      role: currentUser?.role || 'ketua_rt',
      aksi,
      rincian,
      kategori
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    CloudStorageService.saveEntity('audit_logs', newLog);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('berkahone_is_authenticated', 'true');
    localStorage.setItem('berkahone_auth_user', JSON.stringify(user));
    localStorage.removeItem('berkahone_logged_out');
    setLoggedOutNotice(null);

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      waktu: new Date().toISOString().replace('T', ' ').substring(0, 19),
      pengguna: user.nama,
      role: user.role,
      aksi: 'Login Masuk',
      rincian: `${user.nama} (@${user.username}) berhasil masuk ke aplikasi`,
      kategori: 'auth'
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleLogout = () => {
    if (currentUser) {
      addAudit('Logout Keluar', `${currentUser.nama} keluar dari aplikasi`, 'auth');
    }
    setCurrentUser(null);
    localStorage.removeItem('berkahone_is_authenticated');
    localStorage.removeItem('berkahone_auth_user');
    localStorage.setItem('berkahone_logged_out', 'true');
    setLoggedOutNotice('Anda telah berhasil keluar (logout) dari sistem BerkahOne RT 10.');
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('berkahone_is_authenticated', 'true');
    localStorage.setItem('berkahone_auth_user', JSON.stringify(user));
    addAudit('Beralih Role', `Beralih ke akun ${user.nama} (${user.role})`, 'auth');
  };

  // Warga Handlers (Add, Update, Delete)
  const handleAddWarga = (newWarga: Warga) => {
    setWargaList((prev) => [newWarga, ...prev]);
    CloudStorageService.saveEntity('warga', newWarga);
    addAudit('Tambah Warga', `Menambahkan ${newWarga.nama_lengkap} (Rumah ${newWarga.nomor_rumah})`, 'warga');
  };

  const handleUpdateWarga = (updated: Warga) => {
    setWargaList((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    CloudStorageService.saveEntity('warga', updated);
    addAudit('Koreksi Warga', `Memperbarui data ${updated.nama_lengkap} (Rumah ${updated.nomor_rumah})`, 'warga');
  };

  const handleDeleteWarga = (id: string) => {
    const target = wargaList.find((w) => w.id === id);
    setWargaList((prev) => prev.filter((w) => w.id !== id));
    CloudStorageService.deleteEntity('warga', id);
    addAudit('Hapus Warga', `Menghapus data warga ${target?.nama_lengkap || id}`, 'warga');
  };

  // Iuran Handlers (Add, Verify, Update, Delete)
  const handleAddIuran = (newIuran: IuranWajib) => {
    setIuranList((prev) => [newIuran, ...prev]);
    CloudStorageService.saveEntity('iuran_wajib', newIuran);
    addAudit('Catat Iuran', `Mencatat iuran ${newIuran.nama_warga} (Bulan ${newIuran.bulan}/${newIuran.tahun})`, 'iuran');
  };

  const handleVerifyIuran = (id: string) => {
    let verifiedItem: IuranWajib | null = null;
    setIuranList((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          verifiedItem = {
            ...i,
            status_verifikasi: 'lunas',
            diverifikasi_oleh: currentUser?.id || 'u-ketua-rt',
            nomor_kwitansi: `KWT/2026/09/${Math.floor(100 + Math.random() * 900)}`
          };
          return verifiedItem;
        }
        return i;
      })
    );
    if (verifiedItem) {
      CloudStorageService.saveEntity('iuran_wajib', verifiedItem);
    }
    addAudit('Verifikasi Iuran', `Mengesahkan iuran ID ${id} menjadi lunas`, 'iuran');
  };

  const handleUpdateIuran = (updated: IuranWajib) => {
    setIuranList((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    CloudStorageService.saveEntity('iuran_wajib', updated);
    addAudit('Koreksi Iuran', `Koreksi setoran ${updated.nama_warga} (Bulan ${updated.bulan}/${updated.tahun})`, 'iuran');
  };

  const handleDeleteIuran = (id: string) => {
    const target = iuranList.find((i) => i.id === id);
    setIuranList((prev) => prev.filter((i) => i.id !== id));
    CloudStorageService.deleteEntity('iuran_wajib', id);
    addAudit('Hapus Iuran', `Menghapus transaksi iuran ${target?.nama_warga || id}`, 'iuran');
  };

  // Pengeluaran Handlers (Add, Approve, Update, Delete)
  const handleAddPengeluaran = (newPengeluaran: Pengeluaran) => {
    setPengeluaranList((prev) => [newPengeluaran, ...prev]);
    CloudStorageService.saveEntity('pengeluaran', newPengeluaran);
    addAudit('Catat Pengeluaran', `Mencatat biaya ${newPengeluaran.judul_pengeluaran} (Rp ${newPengeluaran.nominal.toLocaleString('id-ID')})`, 'pengeluaran');
  };

  const handleApprovePengeluaran = (id: string) => {
    let approvedItem: Pengeluaran | null = null;
    setPengeluaranList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          approvedItem = {
            ...p,
            status_approval: 'disetujui',
            disetujui_oleh: currentUser?.id || 'u-ketua-rt'
          };
          return approvedItem;
        }
        return p;
      })
    );
    if (approvedItem) {
      CloudStorageService.saveEntity('pengeluaran', approvedItem);
    }
    addAudit('Approval Pengeluaran', `Menyetujui pengeluaran ID ${id}`, 'pengeluaran');
  };

  const handleUpdatePengeluaran = (updated: Pengeluaran) => {
    setPengeluaranList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    CloudStorageService.saveEntity('pengeluaran', updated);
    addAudit('Koreksi Pengeluaran', `Koreksi nota ${updated.judul_pengeluaran} (Rp ${updated.nominal.toLocaleString('id-ID')})`, 'pengeluaran');
  };

  const handleDeletePengeluaran = (id: string) => {
    const target = pengeluaranList.find((p) => p.id === id);
    setPengeluaranList((prev) => prev.filter((p) => p.id !== id));
    CloudStorageService.deleteEntity('pengeluaran', id);
    addAudit('Hapus Pengeluaran', `Menghapus nota belanja ${target?.judul_pengeluaran || id}`, 'pengeluaran');
  };

  // Kas Sosial Handlers (Add, Update, Delete)
  const handleAddKasSosial = (newKasSosial: KasSosial) => {
    setKasSosialList((prev) => [newKasSosial, ...prev]);
    CloudStorageService.saveEntity('kas_sosial', newKasSosial);
    addAudit('Catat Kas Sosial', `Mutasi ${newKasSosial.tipe_transaksi.toUpperCase()}: ${newKasSosial.keterangan}`, 'kas_sosial');
  };

  const handleUpdateKasSosial = (updated: KasSosial) => {
    setKasSosialList((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    CloudStorageService.saveEntity('kas_sosial', updated);
    addAudit('Koreksi Kas Sosial', `Koreksi mutasi ${updated.keterangan}`, 'kas_sosial');
  };

  const handleDeleteKasSosial = (id: string) => {
    const target = kasSosialList.find((k) => k.id === id);
    setKasSosialList((prev) => prev.filter((k) => k.id !== id));
    CloudStorageService.deleteEntity('kas_sosial', id);
    addAudit('Hapus Kas Sosial', `Menghapus mutasi kas sosial ${target?.keterangan || id}`, 'kas_sosial');
  };

  // Backup & Restore Handlers
  const handleRestoreData = (backup: any) => {
    if (backup.users) setUsers(backup.users);
    if (backup.warga) setWargaList(backup.warga);
    if (backup.iuran_wajib) setIuranList(backup.iuran_wajib);
    if (backup.pengeluaran) setPengeluaranList(backup.pengeluaran);
    if (backup.kas_sosial) setKasSosialList(backup.kas_sosial);
    if (backup.audit_logs) setAuditLogs(backup.audit_logs);
    addAudit('Restore Data', 'Memulihkan database dari file cadangan JSON', 'system');
  };

  const handleResetToDefault = () => {
    setUsers(INITIAL_USERS);
    setWargaList(INITIAL_WARGA);
    setIuranList(INITIAL_IURAN);
    setPengeluaranList(INITIAL_PENGELUARAN);
    setKasSosialList(INITIAL_KAS_SOSIAL);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem('berkahone_users');
    localStorage.removeItem('berkahone_warga');
    localStorage.removeItem('berkahone_iuran');
    localStorage.removeItem('berkahone_pengeluaran');
    localStorage.removeItem('berkahone_kas_sosial');
    localStorage.removeItem('berkahone_audit_logs');
  };

  // Balances summary
  const totalIuranLunas = iuranList
    .filter((i) => i.status_verifikasi === 'lunas')
    .reduce((s, i) => s + i.jumlah_nominal, 0);

  const totalPengeluaran = pengeluaranList
    .filter((p) => p.status_approval === 'disetujui')
    .reduce((s, p) => s + p.nominal, 0);

  const saldoKasRt = totalIuranLunas - totalPengeluaran;

  const ksMasuk = kasSosialList
    .filter((k) => k.tipe_transaksi === 'masuk')
    .reduce((s, k) => s + k.nominal, 0);

  const ksKeluar = kasSosialList
    .filter((k) => k.tipe_transaksi === 'keluar')
    .reduce((s, k) => s + k.nominal, 0);

  const saldoKasSosial = ksMasuk - ksKeluar;

  // If not authenticated, display Login screen
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onLogin={handleLogin}
        loggedOutMessage={loggedOutNotice}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        summary={{
          saldoKasRt,
          saldoKasSosial
        }}
      />

      {/* Main Content Area (Responsive padding for mobile bottom nav) */}
      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            wargaList={wargaList}
            iuranList={iuranList}
            pengeluaranList={pengeluaranList}
            kasSosialList={kasSosialList}
            onNavigateTab={setCurrentTab}
            onAddIuran={handleAddIuran}
            onAddPengeluaran={handleAddPengeluaran}
          />
        )}

        {currentTab === 'warga' && (
          <WargaManager
            currentUser={currentUser}
            wargaList={wargaList}
            iuranList={iuranList}
            onAddWarga={handleAddWarga}
            onUpdateWarga={handleUpdateWarga}
            onDeleteWarga={handleDeleteWarga}
            onAddIuran={handleAddIuran}
          />
        )}

        {currentTab === 'iuran' && (
          <IuranManager
            currentUser={currentUser}
            iuranList={iuranList}
            wargaList={wargaList}
            onAddIuran={handleAddIuran}
            onVerifyIuran={handleVerifyIuran}
            onUpdateIuran={handleUpdateIuran}
            onDeleteIuran={handleDeleteIuran}
          />
        )}

        {currentTab === 'pengeluaran' && (
          <PengeluaranManager
            currentUser={currentUser}
            pengeluaranList={pengeluaranList}
            onAddPengeluaran={handleAddPengeluaran}
            onApprovePengeluaran={handleApprovePengeluaran}
            onUpdatePengeluaran={handleUpdatePengeluaran}
            onDeletePengeluaran={handleDeletePengeluaran}
          />
        )}

        {currentTab === 'kas-sosial' && (
          <KasSosialManager
            currentUser={currentUser}
            kasSosialList={kasSosialList}
            wargaList={wargaList}
            onAddKasSosial={handleAddKasSosial}
            onUpdateKasSosial={handleUpdateKasSosial}
            onDeleteKasSosial={handleDeleteKasSosial}
          />
        )}

        {currentTab === 'laporan' && (
          <LaporanView
            currentUser={currentUser}
            iuranList={iuranList}
            pengeluaranList={pengeluaranList}
            kasSosialList={kasSosialList}
            wargaList={wargaList}
          />
        )}

        {currentTab === 'manajemen' && (
          <ManajemenPenggunaanApp
            currentUser={currentUser}
            users={users}
            onUpdateUsers={setUsers}
            wargaList={wargaList}
            iuranList={iuranList}
            pengeluaranList={pengeluaranList}
            kasSosialList={kasSosialList}
            auditLogs={auditLogs}
            onAddAuditLog={(log) => addAudit(log.aksi, log.rincian, log.kategori)}
            onClearAuditLogs={() => setAuditLogs([])}
            onRestoreData={handleRestoreData}
            onResetToDefault={handleResetToDefault}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-xs text-slate-500 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-800">
              BerkahOne Client • Sistem Keuangan RT 10 RW 04 Kelurahan Pedurungan Lor
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kecamatan Pedurungan, Kota Semarang 50192 • Arsitektur Siap Deploy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('manajemen')}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition"
            >
              Manajemen Aplikasi
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
