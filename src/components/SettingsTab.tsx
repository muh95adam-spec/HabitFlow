import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Habit, HabitLog } from '../types';
import { signInWithGoogle, logoutUser } from '../lib/authService';
import {
  User as UserIcon,
  LogIn,
  LogOut,
  Bell,
  Palette,
  Download,
  Upload,
  Info,
  Smartphone,
  CheckCircle2,
  CloudCheck,
  ShieldCheck,
  RefreshCw,
  Share,
  PlusSquare,
  Monitor
} from 'lucide-react';

interface SettingsTabProps {
  user: User | null;
  habits: Habit[];
  logs: HabitLog[];
  onImportData: (habits: Habit[], logs: HabitLog[]) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  habits,
  logs,
  onImportData,
}) => {
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

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

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      alert('Untuk menginstal di Desktop/Android: Buka menu titik tiga di browser Anda (⋮ atau ⚙), lalu pilih "Instal HabitFlow" atau "Tambahkan ke Layar Utama".');
    }
  };

  const handleExportJSON = () => {
    const data = {
      app: 'HabitFlow',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: user?.email || 'guest',
      habits,
      logs,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.habits && Array.isArray(parsed.habits)) {
          onImportData(parsed.habits, parsed.logs || []);
          alert('Berhasil mengimpor data habit!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto w-full pb-20 md:pb-6 space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Pengaturan</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Konfigurasi akun, reminder, dan cadangan data</p>
      </div>

      {/* Profil Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profil</h3>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center">
                  {(user.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{user.displayName || 'Pengguna'}</h4>
                  <CloudCheck className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logoutUser}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <p className="text-xs font-bold text-slate-800">Masuk dengan Google</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sinkronkan habit Anda di semua perangkat</p>
            </div>
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Pengingat (Reminder) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengingat & Notifikasi</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Ingatkan Habit Harian</p>
              <p className="text-[11px] text-slate-400">Notifikasi harian untuk cek habit</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {reminderEnabled && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-600">Jam Pengingat</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Tema */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tampilan & Tema</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Warna Utama</p>
              <p className="text-[11px] text-slate-400">Hijau Pastel / Soft Teal (Calm & Clean)</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800">
            Pastel Teal
          </span>
        </div>
      </div>

      {/* PWA Install Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aplikasi PWA (Web App)</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Instal di Perangkat</p>
              <p className="text-[11px] text-slate-400">Android, Desktop & iOS (Tanpa App Store)</p>
            </div>
          </div>
          {isStandalone ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terinstal</span>
            </span>
          ) : (
            <button
              onClick={handleInstallPWA}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instal App</span>
            </button>
          )}
        </div>
      </div>

      {/* Backup & Export Data */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Backup & Ekspor Data</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold text-slate-700">Ekspor JSON</span>
          </button>
          <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Impor JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tentang Aplikasi */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tentang Aplikasi</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-base">
            HF
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">HabitFlow v1.0.0</h4>
            <p className="text-[11px] text-slate-400">Mobile-First Personal Habit Tracker</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Data tersimpan aman di Firestore & Offline Cache</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
            <span>PWA Installable di Android, Desktop, & iOS</span>
          </p>
        </div>
      </div>

      {/* Modal Petunjuk Instalasi iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <span>Instal di iOS (iPhone/iPad)</span>
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Untuk menginstal <strong>HabitFlow</strong> di iPhone atau iPad Anda:
              </p>
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <p>Tekan tombol <strong>Bagikan (Share <Share className="w-3.5 h-3.5 inline text-teal-600" />)</strong> di bagian bawah Safari.</p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <p>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-teal-600" />).</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
