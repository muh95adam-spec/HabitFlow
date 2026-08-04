export type HabitType = 'checklist' | 'number' | 'duration' | 'max';
export type HabitStatus = 'active' | 'paused';
export type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: HabitType;
  targetValue: number;
  unit: string;
  icon: string;
  color: string;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
  currentStreak: number;
  bestStreak: number;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  currentValue: number;
  targetValue: number;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  theme?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
}
