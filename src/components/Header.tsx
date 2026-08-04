import React from 'react';
import { Sparkles, CheckCircle2, User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName = 'Sahabat', onOpenProfile }) => {
  const initial = userName.trim().charAt(0).toUpperCase() || 'S';

  return (
    <header className="px-4 pt-3 pb-2 flex items-center justify-between max-w-2xl mx-auto w-full bg-white/60 backdrop-blur-xs border-b border-slate-100 sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/20 shrink-0">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
            HabitFlow<span className="text-teal-600">.</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100/80 transition-colors border border-teal-200/80 text-xs font-semibold text-teal-800"
          title="Pengaturan & Profil"
        >
          <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
            {initial}
          </div>
          <span className="max-w-[100px] truncate">{userName}</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        </button>
      </div>
    </header>
  );
};

