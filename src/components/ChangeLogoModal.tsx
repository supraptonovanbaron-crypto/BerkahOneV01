import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BerkahOneIcon, setStoredCustomLogo, getStoredCustomLogo } from './BerkahOneLogo';

interface ChangeLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoChanged?: (newLogoUrl: string | null) => void;
}

// Preset Logos SVG Data URIs
export const PRESET_LOGOS = [
  {
    id: 'default',
    name: 'Resmi BerkahOne (Original)',
    desc: 'Squircle Hijau Daun, Monogram B, Siluet Rumah RT & Angka 1 Oranye',
    url: '' // empty string signifies default SVG
  },
  {
    id: 'emerald-modern',
    name: 'Modern Emerald & Mint',
    desc: 'Gaya FinTech Geometris, gradasi zamrud ke mint segar dengan aksen minimalis',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23064e3b"/><stop offset="50%" stop-color="%23047857"/><stop offset="100%" stop-color="%2310b981"/></linearGradient><linearGradient id="acc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23fb923c"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(%23bg)"/><path d="M140 110h120c45 0 75 25 75 65 0 28-18 50-45 58 35 8 55 35 55 72 0 50-38 85-88 85H140V110z" fill="%23ffffff"/><path d="M195 160h60c20 0 32 10 32 28s-12 28-32 28h-60V160zm0 85h65c22 0 35 12 35 32s-13 32-35 32h-65V245z" fill="%23064e3b"/><path d="M330 170l55-40v140c0 30-20 55-55 60V170z" fill="url(%23acc)"/><circle cx="360" cy="115" r="14" fill="%23fbbf24"/></svg>`
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold & Emerald',
    desc: 'Sentuhan emas kemakmuran rukun warga dengan latar hijau tua prestisius',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23022c22"/><stop offset="100%" stop-color="%23064e3b"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23fde047"/><stop offset="50%" stop-color="%23eab308"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(%23bg)" stroke="%23eab308" stroke-width="10"/><path d="M150 110h110c40 0 70 22 70 60 0 25-15 45-40 52 30 8 48 30 48 65 0 45-35 75-80 75H150V110z" fill="url(%23gold)"/><path d="M200 155h55c18 0 28 8 28 24s-10 24-28 24h-55V155zm0 75h60c20 0 30 10 30 28s-10 28-30 28h-60V230z" fill="%23022c22"/><path d="M325 155l50-35v120c0 28-18 50-50 55V155z" fill="%23f97316"/><path d="M225 365l30-40 30 40h-60z" fill="%23fde047"/></svg>`
  },
  {
    id: 'community-leaf',
    name: 'Harmoni Warga & Daun Asri',
    desc: 'Simbol kepedulian sosial, gotong royong, dan lingkungan RT yang asri',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2315803d"/><stop offset="100%" stop-color="%23166534"/></linearGradient><linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23a3e635"/><stop offset="100%" stop-color="%2365a30d"/></linearGradient></defs><rect width="512" height="512" rx="120" fill="url(%23bg)"/><circle cx="256" cy="180" r="48" fill="%23ffffff"/><path d="M160 350c0-60 40-90 96-90s96 30 96 90v20H160v-20z" fill="%23ffffff"/><path d="M256 120c-50 0-80 50-80 90 0 60 80 110 80 110s80-50 80-110c0-40-30-90-80-90z" fill="url(%23leaf)" opacity="0.4"/><path d="M340 180l45-30v110c0 25-15 45-45 50V180z" fill="%23f97316"/></svg>`
  }
];

export const ChangeLogoModal: React.FC<ChangeLogoModalProps> = ({
  isOpen,
  onClose,
  onLogoChanged
}) => {
  const currentStored = getStoredCustomLogo() || '';
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const found = PRESET_LOGOS.find((p) => p.url === currentStored);
    return found ? found.id : currentStored ? 'custom' : 'default';
  });

  const [previewUrl, setPreviewUrl] = useState<string>(currentStored);
  const [urlInput, setUrlInput] = useState<string>(
    currentStored.startsWith('http') ? currentStored : ''
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle File Upload from Computer / Phone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file tidak didukung. Harap unggah file gambar (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 3MB.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Optimize image if it's large PNG/JPG by drawing to a canvas max 512x512
        optimizeImage(dataUrl, (optimized) => {
          setPreviewUrl(optimized);
          setSelectedPreset('custom');
          setIsProcessing(false);
        });
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMsg('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  // Optimize image to keep localStorage healthy
  const optimizeImage = (src: string, callback: (result: string) => void) => {
    if (src.startsWith('data:image/svg')) {
      callback(src);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 512;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/png', 0.92));
      } else {
        callback(src);
      }
    };
    img.onerror = () => {
      callback(src);
    };
    img.src = src;
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Harap masukkan tautan URL gambar.');
      return;
    }
    setErrorMsg(null);
    setPreviewUrl(urlInput.trim());
    setSelectedPreset('custom');
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    setErrorMsg(null);
    const preset = PRESET_LOGOS.find((p) => p.id === presetId);
    if (preset) {
      setPreviewUrl(preset.url);
    }
  };

  const handleSave = () => {
    try {
      if (selectedPreset === 'default' || !previewUrl) {
        setStoredCustomLogo(null);
        if (onLogoChanged) onLogoChanged(null);
      } else {
        setStoredCustomLogo(previewUrl);
        if (onLogoChanged) onLogoChanged(previewUrl);
      }

      setSuccessToast('Logo BerkahOne berhasil diperbarui!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg('Gagal menyimpan logo: ' + (err?.message || 'Memori penyimpanan penuh'));
    }
  };

  const handleResetToDefault = () => {
    setSelectedPreset('default');
    setPreviewUrl('');
    setUrlInput('');
    setStoredCustomLogo(null);
    if (onLogoChanged) onLogoChanged(null);
    setSuccessToast('Logo dikembalikan ke desain asli resmi BerkahOne!');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-950 via-[#07381e] to-slate-950 text-white flex items-center justify-between border-b border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-500/30 text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                <span>Ganti Logo BerkahOne</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RT 10
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                Sesuaikan logo resmi pada Header Navbar, Login, Laporan, dan Kop Surat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Live Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <BerkahOneIcon
                  size={64}
                  customUrl={previewUrl}
                  className="rounded-xl shadow-xs"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pratinjau Logo Aktif
                  </span>
                  {previewUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      Logo Kustom
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Logo Standar Resmi
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedPreset === 'default'
                    ? 'Logo Asli BerkahOne (Squircle Hijau Daun)'
                    : PRESET_LOGOS.find((p) => p.id === selectedPreset)?.name || 'Logo Kustom Terunggah'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tampak sempurna di ponsel, tablet, header desktop, dan cetakan PDF
                </p>
              </div>
            </div>

            {/* Preview in Mock Header */}
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2.5">
              <BerkahOneIcon size={34} customUrl={previewUrl} className="rounded-lg shadow-2xs" />
              <div className="text-left leading-tight">
                <div className="flex items-center gap-1 font-extrabold text-xs">
                  <span className="text-emerald-800">Berkah</span>
                  <span className="text-orange-500">One</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">RT 10 Pedurungan Lor</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Selection */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
                activeTab === 'upload'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Berkas Gambar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
                activeTab === 'preset'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Koleksi Logo Desain</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
                activeTab === 'url'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Tautan / Link URL</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD BERKAS */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 transition rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Klik untuk Memilih File Gambar dari Komputer / Smartphone
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung format PNG, JPG, SVG, WebP (Rekomendasi rasio 1:1 persegi)
                </p>
                <span className="mt-3 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs">
                  {isProcessing ? 'Memproses gambar...' : 'Pilih File Logo'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET LOGO DESAIN */}
          {activeTab === 'preset' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_LOGOS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="shrink-0 p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <BerkahOneIcon
                        size={46}
                        customUrl={p.url}
                        className="rounded-lg shadow-2xs"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{p.name}</h5>
                        {isSelected && (
                          <span className="p-0.5 bg-emerald-600 rounded-full text-white">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: LINK URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Tautan URL Gambar Logo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/logo-berkahone.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                >
                  Muat URL
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Pastikan tautan dapat diakses secara publik (Direct Image URL seperti PNG atau JPG).
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Kembalikan ke Logo Default</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-900/20"
            >
              <Check className="w-4 h-4" />
              <span>Terapkan Logo BerkahOne</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
