import React, { useState, useEffect } from 'react';

export const getStoredCustomLogo = (): string | null => {
  try {
    return localStorage.getItem('berkahone_custom_logo');
  } catch {
    return null;
  }
};

export const setStoredCustomLogo = (logoUrl: string | null) => {
  try {
    if (logoUrl && logoUrl.trim().length > 0) {
      localStorage.setItem('berkahone_custom_logo', logoUrl);
    } else {
      localStorage.removeItem('berkahone_custom_logo');
    }
    window.dispatchEvent(new Event('berkahone_logo_updated'));
  } catch (e) {
    console.error('Error saving custom logo to localStorage', e);
  }
};

interface BerkahOneLogoProps {
  className?: string;
  size?: number; // Size in pixels
  showText?: boolean;
  variant?: 'full' | 'icon-only' | 'horizontal';
  customUrl?: string;
}

/**
 * Komponen Logo Resmi BerkahOne (Berdasarkan Desain Asli yang Diunggah)
 * Mendukung Custom Logo yang diunggah / diganti pengguna
 */
export const BerkahOneIcon: React.FC<{
  size?: number;
  className?: string;
  customUrl?: string;
}> = ({
  size = 40,
  className = '',
  customUrl
}) => {
  const [activeLogo, setActiveLogo] = useState<string | null>(() => {
    return customUrl !== undefined ? customUrl : getStoredCustomLogo();
  });

  useEffect(() => {
    if (customUrl !== undefined) {
      setActiveLogo(customUrl);
      return;
    }

    const handleSync = () => {
      setActiveLogo(getStoredCustomLogo());
    };

    window.addEventListener('berkahone_logo_updated', handleSync);
    return () => window.removeEventListener('berkahone_logo_updated', handleSync);
  }, [customUrl]);

  // If user has uploaded or selected a custom logo (Data URI or URL)
  if (activeLogo && activeLogo.trim().length > 0) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative shrink-0 overflow-hidden rounded-2xl bg-white shadow-md border border-slate-200/60 flex items-center justify-center p-0.5 select-none ${className}`}
      >
        <img
          src={activeLogo}
          alt="Logo BerkahOne"
          className="w-full h-full object-contain rounded-xl"
          onError={() => {
            // Fallback to default if image broken
            setActiveLogo(null);
          }}
        />
      </div>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md select-none ${className}`}
    >
      <defs>
        {/* Gradien Latar Belakang Squircle Hijau Berkah */}
        <linearGradient id="berkahAppBg" x1="0.1" y1="0.05" x2="0.95" y2="0.95">
          <stop offset="0%" stopColor="#25b352" />
          <stop offset="25%" stopColor="#1aa048" />
          <stop offset="60%" stopColor="#0f6432" />
          <stop offset="100%" stopColor="#032514" />
        </linearGradient>

        {/* Gradien Vignette Halus untuk Kedalaman */}
        <radialGradient id="berkahVignette" cx="50%" cy="45%" r="65%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </radialGradient>

        {/* Gradien Angka 1 Oranye Hangat & Energetik */}
        <linearGradient id="berkahOrangeOne" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="85%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        {/* Gradien Daun Hijau Segar & Alami */}
        <linearGradient id="berkahLeafGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#4d7c0f" />
          <stop offset="35%" stopColor="#65a30d" />
          <stop offset="80%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>

        {/* Filter Bayangan Halus untuk Lambang Utama */}
        <filter id="berkahEmblemShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.45" floodColor="#011b0e" />
        </filter>
      </defs>

      {/* 1. Latar Belakang Squircle Hijau Berkah */}
      <rect
        width="512"
        height="512"
        rx="112"
        fill="url(#berkahAppBg)"
      />
      <rect
        width="512"
        height="512"
        rx="112"
        fill="url(#berkahVignette)"
      />
      {/* Garis Bezel / Border Bagian Dalam */}
      <rect
        x="2.5"
        y="2.5"
        width="507"
        height="507"
        rx="110"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="5"
        fill="none"
      />

      {/* 2. Lambang Simbol Utama (B + Rumah + Daun + Angka 1) */}
      <g filter="url(#berkahEmblemShadow)">
        {/* Huruf B Putih Bersih Utama */}
        <path
          d="M 126 70 
             H 295 
             C 348 70 388 95 388 150 
             C 388 184 365 210 330 224 
             C 375 238 395 272 395 315 
             C 395 378 345 408 275 408 
             H 126 
             Z"
          fill="#FFFFFF"
          transform="scale(0.85) translate(30, 22)"
        />

        {/* Siluet Rumah Hijau Tua di dalam Rongga 'B' */}
        <g transform="translate(156, 134)">
          {/* Atap Segitiga Rumah */}
          <path
            d="M 64 0 L 0 62 H 11 V 154 H 117 V 62 H 128 L 64 0 Z"
            fill="#08361d"
          />
          {/* Jendela 4 Kotak Putih (2x2) */}
          <g transform="translate(48, 76)">
            <rect x="0" y="0" width="14" height="14" rx="2.5" fill="#FFFFFF" />
            <rect x="18" y="0" width="14" height="14" rx="2.5" fill="#FFFFFF" />
            <rect x="0" y="18" width="14" height="14" rx="2.5" fill="#FFFFFF" />
            <rect x="18" y="18" width="14" height="14" rx="2.5" fill="#FFFFFF" />
          </g>
        </g>

        {/* Daun Hijau Segar Melengkung di Kiri Bawah Rumah */}
        <path
          d="M 141 356 
             C 142 320 162 284 205 264 
             C 246 244 278 252 284 256 
             C 280 286 264 322 224 344 
             C 188 364 154 362 141 356 Z"
          fill="url(#berkahLeafGrad)"
        />
        {/* Garis Urat Daun Alami */}
        <path
          d="M 148 355 Q 212 320 274 260"
          stroke="#064e3b"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Angka 1 Oranye Dinamis & Bersinar Menyatu di Sisi Kanan B */}
        <path
          d="M 330 186 
             L 398 122 
             V 260 
             C 398 296 374 332 322 346 
             C 358 314 374 278 374 246 
             V 186 Z"
          fill="url(#berkahOrangeOne)"
        />
        {/* Sayap / Beak Angka 1 */}
        <path
          d="M 398 122 L 330 186 H 362 V 315 C 382 292 398 260 398 220 V 122 Z"
          fill="url(#berkahOrangeOne)"
        />
        {/* Aksen Sorot Halus Angka 1 */}
        <path
          d="M 382 136 L 340 180 H 356 V 288 C 380 258 386 226 386 172 Z"
          fill="#ffedd5"
          opacity="0.25"
        />
      </g>

      {/* 3. Teks Tipografi "BERKAH" Putih Bersih */}
      <text
        x="256"
        y="414"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="54"
        letterSpacing="5"
      >
        BERKAH
      </text>

      {/* 4. Teks Tipografi "— One —" Oranye Elegan */}
      <g transform="translate(0, 452)">
        {/* Garis Pembatas Kiri */}
        <line
          x1="134"
          y1="-8"
          x2="192"
          y2="-8"
          stroke="#f97316"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Kata "One" */}
        <text
          x="256"
          y="0"
          textAnchor="middle"
          fill="#f97316"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="44"
          letterSpacing="1"
        >
          One
        </text>
        {/* Garis Pembatas Kanan */}
        <line
          x1="320"
          y1="-8"
          x2="378"
          y2="-8"
          stroke="#f97316"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export const BerkahOneLogo: React.FC<BerkahOneLogoProps> = ({
  className = '',
  size = 44,
  showText = true,
  variant = 'horizontal'
}) => {
  if (variant === 'icon-only') {
    return <BerkahOneIcon size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* App Icon */}
      <BerkahOneIcon size={size} className="rounded-2xl shadow-md shadow-emerald-950/20" />

      {/* Brand Typography */}
      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              <span className="text-emerald-800">Berkah</span>
              <span className="text-orange-500 font-extrabold ml-1">One</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
              RT 10
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Sistem Keuangan RT 10 RW 04 Pedurungan Lor
          </p>
        </div>
      )}
    </div>
  );
};

export default BerkahOneLogo;
