import React, { useState } from 'react';
import { User } from '../types';
import { BerkahOneIcon } from './BerkahOneLogo';
import { ChangeLogoModal } from './ChangeLogoModal';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Info,
  Camera
} from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
  loggedOutMessage?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLogin,
  loggedOutMessage
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangeLogoModal, setShowChangeLogoModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = usernameOrEmail.trim().toLowerCase();
    if (!identifier || !password) {
      setErrorMessage('Silakan isi username/email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by username or email
      let matched = users.find(
        (u) =>
          u.username.toLowerCase() === identifier ||
          u.email.toLowerCase() === identifier
      );

      // Jaminan akun Admin selalu teridentifikasi jika belum tersimpan di state
      if (!matched && (identifier === 'admin' || identifier === 'admin@rt10.id')) {
        matched = {
          id: 'u-admin',
          warga_id: 'w-01',
          nama: 'Administrator RT 10',
          email: 'admin@rt10.id',
          username: 'Admin',
          password: 'admin123',
          role: 'ketua_rt',
          no_hp: '081234567899',
          status_aktif: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
      }

      if (!matched) {
        setErrorMessage('Username atau email tidak terdaftar dalam sistem RT 10.');
        setIsLoading(false);
        return;
      }

      // Check password (supports admin123, matched password, or password123)
      const expectedPassword = matched.password || (matched.username.toLowerCase() === 'admin' ? 'admin123' : 'password123');
      const isPasswordValid =
        password === expectedPassword ||
        password === 'admin123' ||
        password === 'password123';

      if (!isPasswordValid) {
        setErrorMessage('Kata sandi yang Anda masukkan salah.');
        setIsLoading(false);
        return;
      }

      if (!matched.status_aktif) {
        setErrorMessage('Akun ini sedang dinonaktifkan oleh Pengurus RT.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLogin(matched);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#07301c] to-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-28 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-28 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            onClick={() => setShowChangeLogoModal(true)}
            className="group cursor-pointer inline-flex items-center justify-center p-3 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 mb-4 ring-4 ring-emerald-500/20 hover:ring-emerald-500/40 transition relative select-none"
            title="Klik untuk Ganti / Unggah Logo BerkahOne"
          >
            <BerkahOneIcon size={64} className="rounded-2xl group-hover:scale-105 transition" />
            <span className="absolute -bottom-1 -right-1 bg-white text-emerald-800 p-1 rounded-full shadow-md border border-slate-200 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition">
              <Camera className="w-3 h-3 text-emerald-700" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>BERKAH</span>
            <span className="text-orange-400">ONE</span>
            <span className="text-emerald-300 text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 ml-1">
              CLIENT
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-1">
            Sistem Informasi & Pengelolaan Kas RT 10 RW 04
          </p>
          <p className="text-xs text-slate-400">
            Kelurahan Pedurungan Lor, Kec. Pedurungan, Kota Semarang
          </p>
        </div>

        {/* Logged out notice or Login Required Notice */}
        {loggedOutMessage ? (
          <div className="mb-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{loggedOutMessage}</span>
          </div>
        ) : (
          <div className="mb-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Silakan login terlebih dahulu untuk mengakses sistem keuangan RT 10.</span>
          </div>
        )}

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Masuk Aplikasi</h2>
              <p className="text-xs text-slate-500">Gunakan akun pengurus atau warga RT 10</p>
            </div>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Contoh: Admin atau didik_rt10"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400">Admin: admin123</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-700/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem RT 10</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Info Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400/80">
            <Info className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC) Aktif</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Ketua RT: <b>Didik Soemiarsono</b> • Sekretaris: <b>Taufik Hidayat</b> • Bendahara: <b>Ardian Ariawan</b>
          </p>
        </div>
      </div>

      {/* Modal Ganti Logo BerkahOne */}
      <ChangeLogoModal
        isOpen={showChangeLogoModal}
        onClose={() => setShowChangeLogoModal(false)}
      />
    </div>
  );
};
