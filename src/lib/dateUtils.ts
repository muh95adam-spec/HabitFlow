import { HabitLog } from '../types';

export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INDO_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDO_DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export interface DayItem {
  dateStr: string;
  dayName: string; // 'Sen', 'Sel', ...
  dayNum: number;  // 1, 2, 3 ...
  isToday: boolean;
}

export function getDaysWindow(centerDateStr?: string, daysAround = 3): DayItem[] {
  const todayStr = getTodayStr();
  const base = centerDateStr ? new Date(centerDateStr) : new Date();

  const result: DayItem[] = [];
  for (let i = -daysAround; i <= daysAround; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateStr = formatDateStr(d);
    result.push({
      dateStr,
      dayName: INDO_DAYS[d.getDay()],
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }
  return result;
}

export function formatIndonesianFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = INDO_DAYS_FULL[date.getDay()];
  const monthName = INDO_MONTHS[date.getMonth()];
  return `${dayName}, ${d} ${monthName} ${y}`;
}

export function formatShortMonthDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${INDO_MONTHS[date.getMonth()].slice(0, 3)}`;
}

// Streak calculation logic
export function getHabitStreak(habitId: string, logs: HabitLog[]): { currentStreak: number; bestStreak: number } {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId && l.completed)
    .map((l) => l.date)
    .sort();

  if (habitLogs.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const logSet = new Set(habitLogs);
  const today = getTodayStr();

  // Check current streak starting from today or yesterday
  let currentStreak = 0;
  let checkDate = new Date();
  let checkStr = formatDateStr(checkDate);

  // If not completed today, start checking from yesterday
  if (!logSet.has(checkStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = formatDateStr(checkDate);
  }

  while (logSet.has(checkStr)) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = formatDateStr(checkDate);
  }

  // Calculate best streak historically
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  const sortedDates = Array.from(logSet)
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  for (const d of sortedDates) {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diff = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    prevDate = d;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { currentStreak, bestStreak };
}
