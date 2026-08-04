import React, { useState, useEffect } from 'react';
import { Habit, HabitLog } from '../types';
import { HabitIcon } from './HabitIcon';
import { getColorTheme } from '../lib/colors';
import { X, Check, Plus, Minus } from 'lucide-react';

interface HabitValueModalProps {
  habit: Habit | null;
  log: HabitLog | null;
  onClose: () => void;
  onSave: (currentValue: number, isCompleted: boolean) => void;
}

export const HabitValueModal: React.FC<HabitValueModalProps> = ({
  habit,
  log,
  onClose,
  onSave,
}) => {
  if (!habit) return null;

  const [value, setValue] = useState<number>(log?.currentValue ?? 0);
  const color = getColorTheme(habit.color);

  useEffect(() => {
    setValue(log?.currentValue ?? 0);
  }, [log]);

  const handleSave = () => {
    let completed = false;
    if (habit.type === 'max') {
      completed = value <= habit.targetValue;
    } else {
      completed = value >= habit.targetValue;
    }
    onSave(value, completed);
    onClose();
  };

  const handleQuickAdd = (amount: number) => {
    const newVal = Math.max(0, value + amount);
    setValue(newVal);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.text} flex items-center justify-center`}>
              <HabitIcon name={habit.icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{habit.name}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {habit.type === 'max' ? `Maksimal ${habit.targetValue} ${habit.unit}` : `Target: ${habit.targetValue} ${habit.unit}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-slate-900">
              {value} <span className="text-base font-semibold text-slate-500">{habit.unit}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {habit.type === 'max'
                ? value <= habit.targetValue
                  ? 'Dalam batas aman'
                  : 'Melebihi batas maksimal'
                : `Progress: ${Math.round((value / habit.targetValue) * 100)}%`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={() => handleQuickAdd(-1)}
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xl font-bold transition-transform active:scale-95"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
              className="w-24 text-center py-2 text-xl font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => handleQuickAdd(1)}
              className="w-12 h-12 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Step Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {[5, 10, 15, 30].map((step) => (
              <button
                key={step}
                onClick={() => handleQuickAdd(step)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                +{step}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-transform active:scale-98 shadow-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
