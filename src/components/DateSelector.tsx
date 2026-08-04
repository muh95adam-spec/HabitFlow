import React, { useState } from 'react';
import { getDaysWindow, getTodayStr, formatDisplayDateLabel } from '../lib/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDateStr, onSelectDate }) => {
  // Fixed anchor date so clicking dates in the row does NOT auto-shift/re-center the row
  const [anchorDateStr, setAnchorDateStr] = useState<string>(getTodayStr());

  const days = getDaysWindow(anchorDateStr, 3); // 7 days total around anchor

  const handlePrevWeek = () => {
    const d = new Date(anchorDateStr);
    d.setDate(d.getDate() - 7);
    const newAnchor = d.toISOString().split('T')[0];
    setAnchorDateStr(newAnchor);
  };

  const handleNextWeek = () => {
    const d = new Date(anchorDateStr);
    d.setDate(d.getDate() + 7);
    const newAnchor = d.toISOString().split('T')[0];
    setAnchorDateStr(newAnchor);
  };

  return (
    <div className="px-4 py-1.5 max-w-2xl mx-auto w-full">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-extrabold text-slate-800">
            {formatDisplayDateLabel(selectedDateStr)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Minggu Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Minggu Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Strip - Compact height, fixed grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => onSelectDate(item.dateStr)}
              className={`py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all h-11 ${
                isSelected
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : item.isToday
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/80'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/60'
              }`}
            >
              <span className={`text-[9px] font-semibold tracking-tight uppercase leading-none ${
                isSelected ? 'text-teal-100' : item.isToday ? 'text-teal-600' : 'text-slate-400'
              }`}>
                {item.dayName}
              </span>
              <span className="text-xs font-bold leading-tight mt-0.5">
                {item.dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
