import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { ICON_MAP, HabitIcon } from './HabitIcon';
import { HABIT_COLORS } from '../lib/colors';
import { X, Check } from 'lucide-react';

interface HabitFormModalProps {
  habitToEdit?: Habit | null;
  userId: string;
  onClose: () => void;
  onSave: (habit: Habit) => void;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  habitToEdit,
  userId,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(habitToEdit?.name || '');
  const [type, setType] = useState<HabitType>(habitToEdit?.type || 'checklist');
  const [targetValue, setTargetValue] = useState<number>(habitToEdit?.targetValue || 1);
  const [unit, setUnit] = useState(habitToEdit?.unit || '');
  const [icon, setIcon] = useState(habitToEdit?.icon || 'CheckCircle2');
  const [color, setColor] = useState(habitToEdit?.color || 'teal');

  const iconsList = Object.keys(ICON_MAP);
  const colorKeys = Object.keys(HABIT_COLORS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    const updatedHabit: Habit = {
      id: habitToEdit?.id || `habit_${Date.now()}`,
      userId: userId || 'guest',
      name: name.trim(),
      type,
      targetValue: type === 'checklist' ? 1 : Math.max(1, targetValue),
      unit: type === 'checklist' ? '' : unit.trim(),
      icon,
      color,
      status: habitToEdit?.status || 'active',
      createdAt: habitToEdit?.createdAt || now,
      updatedAt: now,
      currentStreak: habitToEdit?.currentStreak || 0,
      bestStreak: habitToEdit?.bestStreak || 0,
    };

    onSave(updatedHabit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-base">
            {habitToEdit ? 'Edit Habit' : 'Tambah Habit Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nama Habit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Habit
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Minum air, Baca Al-Qur'an, Workout..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Tipe Habit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipe Habit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'checklist', label: 'Checklist', desc: 'Ya / Tidak' },
                { id: 'number', label: 'Angka', desc: 'Hitungan target (misal: gelas)' },
                { id: 'duration', label: 'Durasi', desc: 'Waktu (misal: menit)' },
                { id: 'max', label: 'Maksimal', desc: 'Batas (misal: screen time)' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => {
                    setType(t.id as HabitType);
                    if (t.id === 'checklist') {
                      setTargetValue(1);
                      setUnit('');
                    } else if (t.id === 'duration' && !unit) {
                      setUnit('menit');
                      setTargetValue(30);
                    } else if (t.id === 'max' && !unit) {
                      setUnit('jam');
                      setTargetValue(3);
                    } else if (t.id === 'number' && !unit) {
                      setUnit('gelas');
                      setTargetValue(8);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    type === t.id
                      ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{t.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target & Unit */}
          {type !== 'checklist' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {type === 'max' ? 'Batas Maksimal' : 'Target'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Satuan / Unit
                </label>
                <input
                  type="text"
                  placeholder="gelas, menit, jam, dll"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Ikon
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border border-slate-200 rounded-xl">
              {iconsList.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg transition-transform ${
                    icon === ic
                      ? 'bg-teal-600 text-white font-bold scale-110 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <HabitIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pilih Warna Tema
            </label>
            <div className="flex items-center gap-2">
              {colorKeys.map((ck) => {
                const c = HABIT_COLORS[ck];
                return (
                  <button
                    type="button"
                    key={ck}
                    onClick={() => setColor(ck)}
                    className={`w-7 h-7 rounded-full ${c.progressBg} flex items-center justify-center transition-transform ${
                      color === ck ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {color === ck && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-transform active:scale-98 shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{habitToEdit ? 'Simpan Edit' : 'Tambah Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
