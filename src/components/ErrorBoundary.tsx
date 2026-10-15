import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BerkahOne App Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      const keys = [
        'berkahone_is_authenticated',
        'berkahone_auth_user',
        'berkahone_users',
        'berkahone_warga',
        'berkahone_iuran',
        'berkahone_pengeluaran',
        'berkahone_kas_sosial',
        'berkahone_audit_logs'
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl font-extrabold text-white mb-2">
              Terjadi Kendala Memuat Aplikasi
            </h1>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Sistem mendeteksi kendala pada sesi browser atau cache data lokal. Anda dapat memuat ulang aplikasi atau mereset data cache lokal.
            </p>

            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left mb-6 font-mono text-xs text-red-300 max-h-32 overflow-y-auto">
                <p className="font-bold text-slate-400 mb-1">Rincian Error:</p>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Cache & Data Sesi Lokal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
