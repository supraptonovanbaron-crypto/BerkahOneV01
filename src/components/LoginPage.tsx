import React, { useState } from 'react';
import { User } from '../types';
import { BerkahOneIcon } from './BerkahOneLogo';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  availableUsers: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, availableUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      // Find user by username or email
      let found = availableUsers.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() ||
          u.email.toLowerCase() === username.trim().toLowerCase()
      );

      if (!found && username.trim().toLowerCase() === 'admin') {
        found = {
          id: 'u-admin',
          warga_id: 'w-01',
          nama: 'Administrator RT 10',
          email: 'admin@rt10.id',
          username: 'Admin',
          password: 'admin123',
          role: 'ketua_rt',
          no_hp: '081234567899',
          status_aktif: true
        };
      }

      if (!found) {
        setErrorMsg('Username atau Email tidak ditemukan dalam database RT 10.');
        setLoading(false);
        return;
      }

      // Check password (supports admin123, found.password, or default password123)
      const expectedPassword = found.password || (found.username.toLowerCase() === 'admin' ? 'admin123' : 'password123');
      if (password && password !== expectedPassword && password !== 'password123' && password !== 'admin123') {
        setErrorMsg('Kata sandi salah!');
        setLoading(false);
        return;
      }

      // Login success
      setLoading(false);
      onLogin(found);
    }, 400);
  };

  const handleQuickLogin = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || 'password123');
    onLogin(user);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ketua_rt':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'sekretaris':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'bendahara':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ketua_rt':
        return 'Ketua RT 10';
      case 'sekretaris':
        return 'Sekretaris RT 10';
      case 'bendahara':
        return 'Bendahara RT 10';
      default:
        return 'Warga Blok B-04';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#032916] to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow matching logo colors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          {/* Logo & Heading */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <BerkahOneIcon size={76} className="rounded-3xl shadow-xl shadow-emerald-950/25 ring-4 ring-emerald-500/20" />
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                BERKAH<span className="text-orange-500 ml-1">ONE</span>
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                CLIENT
              </span>
            </div>

            <p className="text-xs font-bold text-emerald-800 mt-1 uppercase tracking-wider">
              RT 10 RW 04 Kelurahan Pedurungan Lor
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kecamatan Pedurungan, Kota Semarang 50192
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username atau Email Pengurus/Warga
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: didik_rt10 / ardian_bendahara"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kata Sandi (Password)
                </label>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Default: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800 hover:from-emerald-800 hover:to-green-900 text-white py-3 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <span>Masuk ke BerkahOne</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Shortcut Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-500" />
              <span>Akses Cepat Pengurus RT (1-Klik Login):</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <span className="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 font-bold transition">
                      Masuk &rarr;
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 truncate text-[11px]">
                    {user.nama}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    @{user.username}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          BerkahOne Client • Sistem Transparansi Keuangan Warga RT 10 RW 04
        </p>
      </div>
    </div>
  );
};
