import React from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';

interface FinancialAiLogoProps {
  size?: number;
  className?: string;
  showAiBadge?: boolean;
  pulseAnimation?: boolean;
  onClick?: () => void;
  title?: string;
}

export const FinancialAiLogo: React.FC<FinancialAiLogoProps> = ({
  size = 56,
  className = '',
  showAiBadge = true,
  pulseAnimation = true,
  onClick,
  title = 'Logo Standar Keuangan dengan Fitur AI • Sistem BerkahOne RT 10'
}) => {
  return (
    <div
      onClick={onClick}
      title={title}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Glow Halo Ring */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-amber-400/20 blur-sm pointer-events-none group-hover:blur-md transition-all"></div>

      {/* Main Standard Financial Shield & Emblem SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Rich Metallic & Emerald Gradients */}
          <linearGradient id="finShieldGrad" x1="10" y1="10" x2="90" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>

          <linearGradient id="finGoldGrad" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          <linearGradient id="finAiCyanGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="finBorderGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#065f46" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Shield Base (Simbol Keamanan & Kepercayaan Keuangan Standard) */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="22"
          fill="url(#finShieldGrad)"
          stroke="url(#finBorderGrad)"
          strokeWidth="3.5"
        />

        {/* Subtle Inner Security Lattice Grid */}
        <path
          d="M20 30 H80 M20 50 H80 M20 70 H80 M35 20 V80 M50 20 V80 M65 20 V80"
          stroke="#10b981"
          strokeWidth="0.8"
          strokeOpacity="0.12"
          strokeDasharray="2 3"
        />

        {/* Financial Column & Pedestal (Pilar Standar Keuangan) */}
        <path
          d="M26 74 H74 V70 H26 V74 Z"
          fill="url(#finGoldGrad)"
          opacity="0.9"
        />
        <path
          d="M29 68 H71 V65 H29 V68 Z"
          fill="url(#finGoldGrad)"
          opacity="0.8"
        />

        {/* Three Classical Financial Pillars */}
        {/* Left Pillar */}
        <rect x="31" y="42" width="7" height="22" rx="2" fill="url(#finGoldGrad)" opacity="0.85" />
        {/* Middle Pillar */}
        <rect x="46.5" y="38" width="7" height="26" rx="2" fill="url(#finGoldGrad)" opacity="0.95" />
        {/* Right Pillar */}
        <rect x="62" y="42" width="7" height="22" rx="2" fill="url(#finGoldGrad)" opacity="0.85" />

        {/* Classical Pediment (Atap Segitiga Lembaga Keuangan) */}
        <polygon points="50,22 25,35 75,35" fill="url(#finGoldGrad)" />

        {/* Central Currency Balance Emblem (Koin Emas Kas) */}
        <circle cx="50" cy="51" r="11" fill="#042f2e" stroke="url(#finGoldGrad)" strokeWidth="2" />
        {/* Rupiah / Currency Glyph inside coin */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="url(#finGoldGrad)"
        >
          Rp
        </text>

        {/* Ascending Trend Line (Grafik Pertumbuhan Finansial Positif) */}
        <path
          d="M22 62 Q 38 52 50 48 T 78 28"
          fill="none"
          stroke="url(#finAiCyanGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Trend Arrowhead */}
        <polygon points="78,28 70,30 76,36" fill="#38bdf8" />

        {/* AI Neural Circuit Nodes & Synapse Links (AI Features) */}
        <line x1="28" y1="28" x2="36" y2="34" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="28" cy="28" r="2.5" fill="#38bdf8" />

        <line x1="72" y1="64" x2="64" y2="58" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="72" cy="64" r="2.5" fill="#34d399" />

        {/* Sparkling Stars for AI Intelligence */}
        <path
          d="M50 14 L51.5 19 L56.5 20.5 L51.5 22 L50 27 L48.5 22 L43.5 20.5 L48.5 19 Z"
          fill="#fef08a"
        />
      </svg>

      {/* Floating AI Features Chip Badge (Corner Overlay) */}
      {showAiBadge && (
        <div className="absolute -bottom-1.5 -right-2 flex items-center gap-0.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-1.5 py-0.5 rounded-full border border-emerald-400/50 shadow-lg text-[9px] font-black tracking-tight ring-1 ring-black/40">
          <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="bg-gradient-to-r from-amber-300 via-emerald-200 to-cyan-300 bg-clip-text text-transparent font-extrabold">
            AI
          </span>
          {pulseAnimation && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          )}
        </div>
      )}
    </div>
  );
};
