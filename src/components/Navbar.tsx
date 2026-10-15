import React, { useState } from 'react';
import { User, Role } from '../types';
import { BerkahOneIcon } from './BerkahOneLogo';
import { ChangeLogoModal } from './ChangeLogoModal';
import {
  Building2,
  Users,
  Wallet,
  Receipt,
  HeartHandshake,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronRight,
  LayoutGrid,
  Camera,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  summary: {
    saldoKasRt: number;
    saldoKasSosial: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  summary
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChangeLogoModal, setShowChangeLogoModal] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Wallet },
    { id: 'warga', label: 'Data Warga', icon: Users },
    { id: 'iuran', label: 'Iuran Wajib', icon: Receipt },
    { id: 'pengeluaran', label: 'Pengeluaran', icon: Building2 },
    { id: 'kas-sosial', label: 'Kas Sosial', icon: HeartHandshake },
    { id: 'laporan', label: 'Laporan RT', icon: FileSpreadsheet },
    { id: 'manajemen', label: 'Manajemen Aplikasi', icon: Settings }
  ];

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ketua_rt':
        return { label: 'Ketua RT 10', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'sekretaris':
        return { label: 'Sekretaris RT 10', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'bendahara':
        return { label: 'Bendahara RT 10', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'warga':
        return { label: 'Warga (Blok B-04)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  const handleSelectNav = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Top Banner (Responsive: wraps neatly on phone & tablet) */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a4828] to-slate-950 text-white px-3 sm:px-6 py-2 border-b border-orange-500/25">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-1 bg-orange-500/20 rounded-md text-orange-400 border border-orange-500/30 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span className="font-bold tracking-wide text-emerald-200 text-[11px] sm:text-xs truncate">
                BERKAHONE • SISTEM KEUANGAN RT 10 / RW 04
              </span>
              <span className="hidden lg:inline text-slate-500">•</span>
              <span className="hidden lg:inline text-slate-300 text-[11px]">
                Pedurungan Lor, Semarang
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud DB Terhubung
              </span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono">
              <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <span className="text-emerald-300 text-[10px] sm:text-xs">Kas Utama:</span>
                <span className="font-bold text-emerald-400 truncate">{formatRupiah(summary.saldoKasRt)}</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-orange-500/30">
                <span className="text-orange-300 text-[10px] sm:text-xs">Kas Sosial:</span>
                <span className="font-bold text-orange-400 truncate">{formatRupiah(summary.saldoKasSosial)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Brand with Official BerkahOne Logo (Clickable to change logo) */}
          <div
            onClick={() => setShowChangeLogoModal(true)}
            className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 cursor-pointer group select-none transition"
            title="Klik untuk Ganti / Unggah Logo BerkahOne"
          >
            <div className="relative shrink-0">
              <BerkahOneIcon
                size={42}
                className="rounded-xl sm:rounded-2xl shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/20 group-hover:scale-105 group-hover:ring-emerald-500/50 transition shrink-0"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-emerald-800 p-0.5 rounded-full shadow-xs border border-slate-200 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition">
                <Camera className="w-2.5 h-2.5 text-emerald-700" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                  <span className="text-emerald-800 font-extrabold tracking-tight transition group-hover:text-emerald-700">Berkah</span>
                  <span className="text-orange-500 font-extrabold tracking-tight ml-1 transition group-hover:text-orange-600">One</span>
                  <span className="text-slate-400 font-semibold text-[10px] sm:text-xs ml-1 tracking-wider uppercase">
                    CLIENT
                  </span>
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full shrink-0">
                  RT 10
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-2.5 h-2.5 text-emerald-600" />
                  Ganti Logo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block">
                Sistem Kas Warga Pedurungan Lor
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Profile Info */}
            <div className="flex items-center gap-2 bg-slate-50 py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl border border-slate-200">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-200 ring-1 ring-slate-300 shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-xs">
                    {currentUser.nama.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {currentUser.nama}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Logout Button (Desktop) */}
            <button
              onClick={onLogout}
              title="Keluar dari Aplikasi (Logout)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>

            {/* Mobile Menu Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Horizontal Navigation Tabs */}
        <nav className="border-t border-slate-200/80 bg-slate-50/80 backdrop-blur-sm overflow-x-auto scrollbar-none hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 sm:space-x-2 py-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-sm ring-1 ring-emerald-600/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Slide-down Drawer / Menu Modal */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* User Details in Mobile Drawer */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 ring-2 ring-emerald-500/30">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-xs">
                      {currentUser.nama.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{currentUser.nama}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Menu List */}
            <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition text-left ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}

              {/* Quick Ganti Logo Action in Mobile Drawer */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangeLogoModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Ganti / Unggah Logo BerkahOne</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
      </header>

      {/* Floating Bottom App Navigation Bar for Smartphones (Thumb Ergonomics) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition ${
            currentTab === 'dashboard'
              ? 'text-emerald-800 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              currentTab === 'dashboard' ? 'bg-emerald-100 text-emerald-800' : ''
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Dashboard</span>
        </button>

        <button
          onClick={() => handleSelectNav('warga')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition ${
            currentTab === 'warga'
              ? 'text-emerald-800 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              currentTab === 'warga' ? 'bg-emerald-100 text-emerald-800' : ''
            }`}
          >
            <Users className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Warga</span>
        </button>

        <button
          onClick={() => handleSelectNav('iuran')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition ${
            currentTab === 'iuran'
              ? 'text-emerald-800 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              currentTab === 'iuran' ? 'bg-emerald-100 text-emerald-800' : ''
            }`}
          >
            <Receipt className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Iuran</span>
        </button>

        <button
          onClick={() => handleSelectNav('pengeluaran')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition ${
            currentTab === 'pengeluaran'
              ? 'text-rose-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              currentTab === 'pengeluaran' ? 'bg-rose-100 text-rose-700' : ''
            }`}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Belanja</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition ${
            isMobileMenuOpen || ['kas-sosial', 'laporan', 'manajemen'].includes(currentTab)
              ? 'text-emerald-800 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              isMobileMenuOpen || ['kas-sosial', 'laporan', 'manajemen'].includes(currentTab)
                ? 'bg-emerald-100 text-emerald-800'
                : ''
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Menu</span>
        </button>
      </nav>
    </>
  );
};

