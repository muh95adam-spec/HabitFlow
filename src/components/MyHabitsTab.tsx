import React, { useState } from 'react';
import { Habit } from '../types';
import { HabitIcon } from './HabitIcon';
import { getColorTheme } from '../lib/colors';
import { Plus, Edit3, Trash2, Pause, Play, ChevronRight, Check } from 'lucide-react';

interface MyHabitsTabProps {
  habits: Habit[];
  isLoading?: boolean;
  onOpenAddModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleStatus: (habit: Habit) => void;
}

export const MyHabitsTab: React.FC<MyHabitsTabProps> = ({
  habits,
  isLoading = false,
  onOpenAddModal,
  onEditHabit,
  onDeleteHabit,
  onToggleStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredHabits = habits.filter((h) => {
    if (filter === 'active') return h.status === 'active';
    if (filter === 'paused') return h.status === 'paused';
    return true;
  });

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto w-full pb-20 md:pb-6 space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Habit Saya</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Kelola target dan kebiasaan harian Anda</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-xl w-fit">
        {[
          { id: 'all', label: `Semua (${habits.length})` },
          { id: 'active', label: `Aktif (${habits.filter((h) => h.status === 'active').length})` },
          { id: 'paused', label: `Di-pause (${habits.filter((h) => h.status === 'paused').length})` },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === item.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Habit List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 h-16 bg-slate-100/70" />
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 h-16 bg-slate-100/70" />
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-semibold text-sm">Tidak ada habit ditemukan</p>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const theme = getColorTheme(habit.color);
            const isPaused = habit.status === 'paused';

            return (
              <div
                key={habit.id}
                className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs transition-all flex items-center justify-between gap-3 ${
                  isPaused ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0`}>
                    <HabitIcon name={habit.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{habit.name}</h4>
                      {isPaused && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                          Di-pause
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                      Tipe: <span className="capitalize font-semibold text-slate-600">{habit.type}</span> •{' '}
                      {habit.type === 'max'
                        ? `Batas: ${habit.targetValue} ${habit.unit}`
                        : habit.type === 'checklist'
                        ? 'Checklist Harian'
                        : `Target: ${habit.targetValue} ${habit.unit}`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleStatus(habit)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title={isPaused ? 'Aktifkan kembali' : 'Pause habit'}
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onEditHabit(habit)}
                    className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    title="Edit habit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(habit.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                  if (confirmDeleteId) {
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
    </div>
  );
};
