import React, { useState } from 'react';
import { Habit, HabitLog, TimeRange } from '../types';
import { HabitIcon } from './HabitIcon';
import { getColorTheme } from '../lib/colors';
import { getHabitStreak, formatDateStr } from '../lib/dateUtils';
import { BarChart3, Trophy, Flame, CheckCircle2, Target, Calendar } from 'lucide-react';

interface StatsTabProps {
  habits: Habit[];
  logs: HabitLog[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ habits, logs }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const filterDaysMap: Record<TimeRange, number> = {
    week: 7,
    month: 30,
    '3months': 90,
    '6months': 180,
    year: 365,
    all: 9999,
  };

  const daysCount = filterDaysMap[timeRange];

  // Calculate cutoff date string
  const cutoffDate = new Date();
  if (daysCount !== 9999) {
    cutoffDate.setDate(cutoffDate.getDate() - (daysCount - 1));
  } else {
    cutoffDate.setTime(0); // Beginning of epoch
  }
  const cutoffStr = formatDateStr(cutoffDate);

  // Filter logs in range
  const filteredLogs = logs.filter((l) => l.date >= cutoffStr && l.completed);

  // Active habits
  const activeHabits = habits.filter((h) => h.status === 'active');

  // Overall statistics calculations
  const totalCompletions = filteredLogs.length;

  // Best streak across all habits
  let bestStreakOverall = 0;
  activeHabits.forEach((h) => {
    const s = getHabitStreak(h.id, logs);
    if (s.bestStreak > bestStreakOverall) {
      bestStreakOverall = s.bestStreak;
    }
  });

  // Calculate completion percentage for the active period
  const expectedTotal = activeHabits.length * (daysCount === 9999 ? 30 : daysCount);
  const completionPercentage = expectedTotal > 0 ? Math.min(100, Math.round((totalCompletions / expectedTotal) * 100)) : 0;

  // Generate 7-day consistency bar data
  const last7DaysData: { dayName: string; percent: number }[] = [];
  const indoDays = ['Min', 'Sab', 'Jum', 'Kam', 'Rab', 'Sel', 'Sen'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDateStr(d);
    const dayName = indoDays[d.getDay() % 7];
    const dayLogs = logs.filter((l) => l.date === dateStr && l.completed);
    const percent = activeHabits.length > 0 ? Math.round((dayLogs.length / activeHabits.length) * 100) : 0;
    last7DaysData.push({ dayName, percent });
  }

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto w-full pb-20 md:pb-6 space-y-4">
      {/* Title & Filter Pills */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Statistik</h2>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 mt-1">
          {[
            { id: 'week', label: 'Minggu' },
            { id: 'month', label: 'Bulan' },
            { id: '3months', label: '3 Bulan' },
            { id: '6months', label: '6 Bulan' },
            { id: 'year', label: 'Tahun' },
            { id: 'all', label: 'Semua' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeRange(item.id as TimeRange)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                timeRange === item.id
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selesai</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completionPercentage}%</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{totalCompletions} penyelesaian</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Habit</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{activeHabits.length}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">aktif dipantau</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Streak Terbaik</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-baseline gap-1">
            <span>{bestStreakOverall}</span>
            <span className="text-xs font-bold text-slate-500">hari</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">rekor konsistensi</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Selesai</span>
          <div className="text-2xl font-black text-teal-600 mt-1 flex items-baseline gap-1">
            <span>{totalCompletions}</span>
            <span className="text-xs font-bold text-slate-500">kali</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">di periode ini</p>
        </div>
      </div>

      {/* Consistency Bar Chart */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Konsistensi Harian</h3>
            <p className="text-[11px] text-slate-400">Perkembangan 7 hari terakhir</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2">
          {last7DaysData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-bold text-slate-400">{d.percent}%</span>
              <div className="w-full bg-slate-100 rounded-t-lg h-full max-h-[70px] flex items-end overflow-hidden">
                <div
                  className="w-full bg-teal-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.max(8, d.percent)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">{d.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performa Habit Breakdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Performa Setiap Habit</h3>
          <p className="text-[11px] text-slate-400">Persentase penyelesaian di periode ini</p>
        </div>

        <div className="space-y-3 pt-1">
          {activeHabits.map((habit) => {
            const habitLogs = filteredLogs.filter((l) => l.habitId === habit.id);
            const streak = getHabitStreak(habit.id, logs);
            const theme = getColorTheme(habit.color);

            const count = habitLogs.length;
            const targetDays = daysCount === 9999 ? 30 : daysCount;
            const pct = Math.min(100, Math.round((count / targetDays) * 100));

            return (
              <div key={habit.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md ${theme.bg} ${theme.text} flex items-center justify-center`}>
                      <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-slate-500 text-[11px]">{count} kali</span>
                    <span className="text-teal-600">{pct}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${theme.progressBg} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
