import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, ExternalLink, Share, PlusSquare, Monitor, CheckCircle2 } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Check if in iframe
    const checkIframe = window.self !== window.top;
    setIsIframe(checkIframe);

    // Check standalone mode
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
    } else if (isIframe) {
      // Open in new tab so browser can trigger native install prompt or address bar icon
      window.open(window.location.href, '_blank');
    } else if (isIOS) {
      setShowGuideModal(true);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
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
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-16 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-lg bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-teal-500/30 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shrink-0 font-extrabold shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-white truncate">
                  Instal HabitFlow App
                </h4>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full border border-teal-500/30 font-bold uppercase tracking-wider shrink-0">
                  PWA Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {isIframe
                  ? 'Buka di tab baru untuk langsung menginstal ke HP/PC Anda'
                  : 'Gunakan offline & akses cepat langsung dari Layar Utama'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Tutup Banner"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          {isIframe ? (
            <>
              <button
                onClick={() => setShowGuideModal(true)}
                className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Panduan
              </button>
              <button
                onClick={handleOpenNewTab}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab Baru & Instal</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? 'Instal Sekarang' : 'Petunjuk Instalasi'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Cara Instal HabitFlow (PWA)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tanpa perlu mendownload di Play Store / App Store
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {isIframe && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-900 leading-relaxed">
                    <strong>Langkah Utama:</strong> Aplikasi ini sedang dibuka di dalam <i>preview frame</i>. Untuk memunculkan tombol instal resmi dari browser, buka di tab baru terlebih dahulu.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewTab}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka HabitFlow di Tab Baru</span>
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                  Android (Chrome / Edge / Brave)
                </h4>
                <p className="text-[11px]">
                  Buka menu titik tiga (<strong>⋮</strong>) di sudut kanan atas browser &rarr; Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Share className="w-3.5 h-3.5 text-teal-600" />
                  iPhone / iPad (Safari)
                </h4>
                <p className="text-[11px]">
                  Tekan tombol <strong>Bagikan (Share)</strong> di bagian bawah Safari &rarr; Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Monitor className="w-3.5 h-3.5 text-teal-600" />
                  Komputer / Laptop (Chrome / Edge)
                </h4>
                <p className="text-[11px]">
                  Klik ikon <strong>Instal (<Download className="w-3 h-3 inline text-teal-600" />)</strong> di ujung kanan bilah alamat URL browser Anda.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
