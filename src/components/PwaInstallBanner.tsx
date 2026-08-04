import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share, PlusSquare, Check } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone (PWA) mode
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(checkStandalone);

    // Check session dismissal
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    setIsDismissed(dismissed);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt if deferred prompt hasn't fired yet
      alert('Untuk menginstal HabitFlow:\n1. Buka menu browser (⋮ atau ⚙)\n2. Pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama"');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Install Banner at bottom for mobile / top for desktop */}
      <div className="fixed bottom-16 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/80 z-40 animate-in slide-in-from-bottom-5 duration-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>Instal HabitFlow App</span>
              <span className="bg-teal-500/30 text-teal-300 text-[10px] px-1.5 py-0.5 rounded-md border border-teal-500/30 font-semibold">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 truncate">
              Akses cepat & offline di Layar Utama HP/PC Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instal</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Tutup Banner"
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>Instal di iPhone / iPad</span>
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Untuk memasang <strong>HabitFlow</strong> di iPhone/iPad tanpa App Store:
              </p>
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-xs">Tekan tombol <strong>Bagikan (Share <Share className="w-3.5 h-3.5 inline text-teal-600" />)</strong> di Safari.</p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-xs">Pilih <strong>"Tambahkan ke Layar Utama"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-teal-600" />).</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Mengerti & Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
};
