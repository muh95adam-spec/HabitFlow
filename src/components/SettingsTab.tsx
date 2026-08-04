import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import {
  User as UserIcon,
  Bell,
  Palette,
  Download,
  Upload,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Save,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Laptop,
  Trash2
} from 'lucide-react';

interface SettingsTabProps {
  userName: string;
  syncCode: string;
  onSaveUserName: (name: string) => void;
  onSaveSyncCode: (code: string) => void;
  habits: Habit[];
  logs: HabitLog[];
  onImportData: (habits: Habit[], logs: HabitLog[]) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userName,
  syncCode,
  onSaveUserName,
  onSaveSyncCode,
  habits,
  logs,
  onImportData,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUserName(nameInput);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectSyncCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    onSaveSyncCode(codeInput.trim());
    setSyncSuccess(true);
    setCodeInput('');
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handleGenerateNewCode = () => {
    const randomCode = 'HF-' + Math.floor(100000 + Math.random() * 900000).toString();
    onSaveSyncCode(randomCode);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const data = {
      app: 'HabitFlow',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: userName || 'guest',
      syncCode,
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
        <p className="text-xs text-slate-500 font-medium mt-0.5">Konfigurasi profil, sinkronisasi multi-device, dan cadangan data</p>
      </div>

      {/* Profil Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profil Pengguna</h3>
        <form onSubmit={handleSaveName} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm shadow-teal-600/20">
              {(nameInput.trim().charAt(0) || 'S').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Panggilan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavedAlert ? 'Tersimpan!' : 'Simpan'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Multi-Device Sync Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Sinkronisasi Multi-Device (Tanpa Login)</span>
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Realtime Active
          </span>
        </div>

        {/* Current Sync Code Display */}
        <div className="p-3.5 bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-teal-200 font-medium">
            <span>Kode Sinkronisasi Perangkat Ini:</span>
            <div className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" />
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 bg-teal-950/60 px-3 py-2 rounded-lg border border-teal-700/50">
            <span className="font-mono text-base tracking-wider font-extrabold text-teal-300">
              {syncCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>
          <p className="text-[11px] text-teal-100/80 leading-snug">
            Gunakan kode di atas pada HP atau Laptop Anda yang lain. Semua data habit akan tersinkronisasi secara otomatis & real-time tanpa perlu Login Google.
          </p>
        </div>

        {/* Form Connect Code */}
        <form onSubmit={handleConnectSyncCode} className="pt-1 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Hubungkan ke Kode HP/Laptop Lain:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Contoh: HF-829102 atau KODE_KAMU"
              className="flex-1 px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hubungkan</span>
            </button>
          </div>
        </form>

        {syncSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Berhasil terhubung ke Kode Sinkronisasi! Data telah diperbarui.</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleGenerateNewCode}
            type="button"
            className="text-[11px] font-semibold text-slate-500 hover:text-teal-700 underline underline-offset-2 transition-colors"
          >
            Buat Kode Sinkronisasi Baru
          </button>
        </div>
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

      {/* Backup & Export Data */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Backup & Pindah Data</h3>
        <p className="text-xs text-slate-500">
          Gunakan fitur ini jika ingin memindahkan data habit ke HP/browser lain.
        </p>
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

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus cache lokal & mereset tampilan?')) {
                localStorage.removeItem('habitflow_local_habits');
                localStorage.removeItem('habitflow_local_logs');
                window.location.reload();
              }
            }}
            type="button"
            className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Bersihkan Cache & Reset Data Lokal</span>
          </button>
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
            <span>Data tersimpan aman di Local Storage & Offline Cache</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
            <span>PWA Installable di Android / iOS</span>
          </p>
        </div>
      </div>
    </div>
  );
};

