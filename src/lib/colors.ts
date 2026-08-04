export interface ColorTheme {
  name: string;
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  progressBg: string;
  ring: string;
}

export const HABIT_COLORS: Record<string, ColorTheme> = {
  teal: {
    name: 'Teal',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    progressBg: 'bg-teal-500',
    ring: 'ring-teal-500',
  },
  emerald: {
    name: 'Emerald',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    progressBg: 'bg-emerald-500',
    ring: 'ring-emerald-500',
  },
  amber: {
    name: 'Amber',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    progressBg: 'bg-amber-500',
    ring: 'ring-amber-500',
  },
  orange: {
    name: 'Orange',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    progressBg: 'bg-orange-500',
    ring: 'ring-orange-500',
  },
  blue: {
    name: 'Blue',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    progressBg: 'bg-blue-500',
    ring: 'ring-blue-500',
  },
  purple: {
    name: 'Purple',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    progressBg: 'bg-purple-500',
    ring: 'ring-purple-500',
  },
  indigo: {
    name: 'Indigo',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    progressBg: 'bg-indigo-500',
    ring: 'ring-indigo-500',
  },
  rose: {
    name: 'Rose',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    progressBg: 'bg-rose-500',
    ring: 'ring-rose-500',
  },
  green: {
    name: 'Green',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    progressBg: 'bg-green-500',
    ring: 'ring-green-500',
  },
};

export function getColorTheme(colorKey?: string): ColorTheme {
  return HABIT_COLORS[colorKey || 'teal'] || HABIT_COLORS.teal;
}
