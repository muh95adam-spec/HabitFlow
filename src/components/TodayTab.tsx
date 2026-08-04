import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import { HabitIcon } from './HabitIcon';
import { getColorTheme } from '../lib/colors';
import { HabitValueModal } from './HabitValueModal';
import { getHabitStreak, getTodayStr } from '../lib/dateUtils';
import confetti from 'canvas-confetti';
import { Check, Flame, Plus, Trash2, Edit3, MoreVertical } from 'lucide-react';

interface TodayTabProps {
  habits: Habit[];
  logs: HabitLog[];
  selectedDateStr: string;
  isLoading?: boolean;
  onUpdateLog: (log: HabitLog) => void;
  onOpenAddModal: () => void;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  habits,
  logs,
  selectedDateStr,
  isLoading = false,
  onUpdateLog,
  onOpenAddModal,
  onEditHabit,
  onDeleteHabit,
}) => {
  const [activeValueModalHabit, setActiveValueModalHabit] = useState<{
    habit: Habit;
    log: HabitLog | null;
  } | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeHabits = habits.filter((h) => h.status === 'active');
  const isSelectedToday = selectedDateStr === getTodayStr();

  // Calculate completed habits count for selected date
  const completedCount = activeHabits.reduce((acc, habit) => {
    const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDateStr);
    return log?.completed ? acc + 1 : acc;
  }, 0);

  const totalCount = activeHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0d9488', '#10b981', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  const handleToggleChecklist = (habit: Habit, currentLog: HabitLog | null) => {
    const newCompleted = !(currentLog?.completed ?? false);
    const newLog: HabitLog = {
      id: currentLog?.id || `log_${habit.id}_${selectedDateStr}`,
      userId: habit.userId,
      habitId: habit.id,
      date: selectedDateStr,
      completed: newCompleted,
      currentValue: newCompleted ? habit.targetValue : 0,
      targetValue: habit.targetValue,
      updatedAt: new Date().toISOString(),
    };
    onUpdateLog(newLog);

    if (newCompleted) {
      triggerConfetti();
    }
  };

  const handleItemClick = (habit: Habit, log: HabitLog | null) => {
    if (habit.type === 'checklist') {
      handleToggleChecklist(habit, log);
    } else {
      setActiveValueModalHabit({ habit, log });
    }
  };

  const sortedActiveHabits = [...activeHabits].sort((a, b) => {
    const logA = logs.find((l) => l.habitId === a.id && l.date === selectedDateStr);
    const logB = logs.find((l) => l.habitId === b.id && l.date === selectedDateStr);
    const isDoneA = logA?.completed ? 1 : 0;
    const isDoneB = logB?.completed ? 1 : 0;
    return isDoneA - isDoneB;
  });

  if (isLoading) {
    return (
      <div className="px-4 py-2 max-w-2xl mx-auto w-full pb-24 md:pb-8 space-y-2.5 animate-pulse">
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 h-16 bg-slate-100/70" />
        <div className="space-y-2">
          <div className="bg-white rounded-xl p-3 h-14 border border-slate-200/80 bg-slate-100/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="space-y-1">
                <div className="w-28 h-3.5 bg-slate-200 rounded"></div>
                <div className="w-16 h-2.5 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 h-14 border border-slate-200/80 bg-slate-100/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="space-y-1">
                <div className="w-36 h-3.5 bg-slate-200 rounded"></div>
                <div className="w-20 h-2.5 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 max-w-2xl mx-auto w-full pb-24 md:pb-8 space-y-2.5">
      {/* Progress Card - Smaller & Compact */}
      <div className="bg-white rounded-xl p-2.5 md:p-3 shadow-2xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress Hari Ini</span>
            <div className="flex items-baseline gap-1 mt-0.2">
              <span className="text-base font-bold text-slate-900">{completedCount}/{totalCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">selesai</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-teal-600">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress bar - Slim */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden p-0.5 flex gap-1">
          {activeHabits.map((habit, i) => {
            const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDateStr);
            const isDone = log?.completed;
            return (
              <div
                key={habit.id || i}
                className={`flex-1 h-full rounded-full transition-all duration-300 ${
                  isDone ? 'bg-teal-500 shadow-2xs' : 'bg-slate-200/60'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-1.5">
        {sortedActiveHabits.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-semibold text-xs">Belum ada habit aktif</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Klik tombol di bawah untuk membuat habit pertama Anda.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-2xs"
            >
              + Tambah Habit
            </button>
          </div>
        ) : (
          sortedActiveHabits.map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDateStr);
            const isCompleted = log?.completed ?? false;
            const currentValue = log?.currentValue ?? 0;
            const streak = getHabitStreak(habit.id, logs);
            const theme = getColorTheme(habit.color);

            return (
              <div
                key={habit.id}
                className={`group rounded-xl p-2.5 border transition-all flex items-center justify-between gap-2 ${
                  isCompleted
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200/80 hover:border-teal-300 shadow-2xs'
                }`}
              >
                {/* Left side: Check button + Habit icon & details */}
                <div
                  onClick={() => handleItemClick(habit, log || null)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleChecklist(habit, log || null);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                      isCompleted
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'border-2 border-slate-300 group-hover:border-teal-500 bg-white'
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className={`w-8 h-8 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center shrink-0`}>
                    <HabitIcon name={habit.icon} className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-bold leading-tight truncate ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {habit.name}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                      {habit.type === 'max'
                        ? `Maks: ${habit.targetValue} ${habit.unit}`
                        : habit.type === 'checklist'
                        ? `Target: 1 ${habit.unit || 'kali'}`
                        : `Target: ${habit.targetValue} ${habit.unit}`}
                    </p>
                  </div>
                </div>

                {/* Right side: Progress badge, streak, & Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {habit.type !== 'checklist' && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentValue > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {currentValue}/{habit.targetValue} {habit.unit}
                    </span>
                  )}

                  {streak.currentStreak > 0 && (
                    <div className="flex items-center gap-0.5 text-[11px] font-extrabold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-200/50">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      <span>{streak.currentStreak}</span>
                    </div>
                  )}

                  {/* Edit / Delete actions */}
                  <div className="flex items-center ml-1 border-l border-slate-100 pl-1">
                    {onEditHabit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditHabit(habit);
                        }}
                        className="p-1 rounded-lg text-slate-300 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Edit Habit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteHabit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(habit.id);
                        }}
                        className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Hapus Habit?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus habit ini? Seluruh riwayat pencapaian habit ini juga akan dihapus.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onDeleteHabit && confirmDeleteId) {
                    onDeleteHabit(confirmDeleteId);
                  }
                  setConfirmDeleteId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={onOpenAddModal}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/35 flex items-center justify-center transition-all active:scale-95 z-30"
        title="Tambah Habit"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Value Modal */}
      {activeValueModalHabit && (
        <HabitValueModal
          habit={activeValueModalHabit.habit}
          log={activeValueModalHabit.log}
          onClose={() => setActiveValueModalHabit(null)}
          onSave={(currentValue, isCompleted) => {
            const newLog: HabitLog = {
              id: activeValueModalHabit.log?.id || `log_${activeValueModalHabit.habit.id}_${selectedDateStr}`,
              userId: activeValueModalHabit.habit.userId,
              habitId: activeValueModalHabit.habit.id,
              date: selectedDateStr,
              completed: isCompleted,
              currentValue,
              targetValue: activeValueModalHabit.habit.targetValue,
              updatedAt: new Date().toISOString(),
            };
            onUpdateLog(newLog);
            if (isCompleted) triggerConfetti();
          }}
        />
      )}
    </div>
  );
};
