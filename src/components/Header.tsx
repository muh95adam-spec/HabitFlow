import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, Sparkles, CloudCheck, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/authService';

interface HeaderProps {
  user: User | null;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenProfile }) => {
  const firstName = user?.displayName
    ? user.displayName.split(' ')[0]
    : 'Sahabat';

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
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-teal-50 hover:bg-teal-100/80 transition-colors border border-teal-200/80"
            title="Akun Profile"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-teal-500/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <CloudCheck className="w-3.5 h-3.5 text-teal-600" />
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200 transition-all shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Masuk</span>
          </button>
        )}
      </div>
    </header>
  );
};
