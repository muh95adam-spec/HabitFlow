import React from 'react';
import { CheckSquare, BarChart2, ListTodo, Settings, Sparkles } from 'lucide-react';

export type TabType = 'today' | 'stats' | 'my_habits' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChangeTab }) => {
  const navItems = [
    { id: 'today' as TabType, label: 'Hari Ini', icon: CheckSquare },
    { id: 'stats' as TabType, label: 'Statistik', icon: BarChart2 },
    { id: 'my_habits' as TabType, label: 'Habit Saya', icon: ListTodo },
    { id: 'settings' as TabType, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Floating Bottom Dock Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-3 pt-1 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-[24px] p-1.5 border border-slate-200/80 shadow-lg shadow-slate-900/5 flex items-center justify-between gap-1 h-[60px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex-1 h-full rounded-[18px] flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
                <span className="text-[11px] font-semibold mt-0.5 leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 p-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 shrink-0">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">
              HabitFlow<span className="text-teal-600">.</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Habit Tracker Personal</p>
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-2xs border border-teal-100 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Habitflow v1.0</p>
          <p className="text-[11px] mt-0.5 text-slate-400">Melacak kebiasaan harian</p>
        </div>
      </aside>
    </>
  );
};

