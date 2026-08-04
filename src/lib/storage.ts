import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { Habit, HabitLog } from '../types';

const LOCAL_HABITS_KEY = 'habitflow_local_habits';
const LOCAL_LOGS_KEY = 'habitflow_local_logs';

export const DEFAULT_HABITS: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'bestStreak'>[] = [
  { name: 'Minum air', type: 'number', targetValue: 8, unit: 'gelas', icon: 'Droplet', color: 'teal', status: 'active' },
  { name: 'Baca Al-Qur\'an', type: 'number', targetValue: 1, unit: 'halaman', icon: 'BookOpen', color: 'emerald', status: 'active' },
  { name: 'Baca buku', type: 'duration', targetValue: 20, unit: 'menit', icon: 'BookMarked', color: 'amber', status: 'active' },
  { name: 'Workout', type: 'duration', targetValue: 30, unit: 'menit', icon: 'Dumbbell', color: 'orange', status: 'active' },
  { name: 'Belajar', type: 'duration', targetValue: 60, unit: 'menit', icon: 'GraduationCap', color: 'blue', status: 'active' },
  { name: 'Screen time', type: 'max', targetValue: 3, unit: 'jam', icon: 'Smartphone', color: 'purple', status: 'active' },
  { name: 'Tidur cukup', type: 'duration', targetValue: 7, unit: 'jam', icon: 'Moon', color: 'indigo', status: 'active' },
  { name: 'Meditasi', type: 'duration', targetValue: 10, unit: 'menit', icon: 'Leaf', color: 'emerald', status: 'active' },
  { name: 'Journaling', type: 'number', targetValue: 1, unit: 'halaman', icon: 'PenTool', color: 'rose', status: 'active' },
  { name: 'Jalan kaki', type: 'number', targetValue: 6000, unit: 'langkah', icon: 'Footprints', color: 'green', status: 'active' },
];

export function getLocalHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(LOCAL_HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalHabits(habits: Habit[]) {
  try {
    localStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving local habits', e);
  }
}

export function getLocalLogs(): HabitLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLogs(logs: HabitLog[]) {
  try {
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving local logs', e);
  }
}

export function seedInitialHabits(userId: string): Habit[] {
  const now = new Date().toISOString();
  const seeded: Habit[] = DEFAULT_HABITS.map((item, index) => ({
    ...item,
    id: `habit_${Date.now()}_${index}`,
    userId,
    createdAt: now,
    updatedAt: now,
    currentStreak: 0,
    bestStreak: 0,
  }));
  saveLocalHabits(seeded);
  return seeded;
}

// Subscribe to habits real-time
export function subscribeHabits(userId: string, callback: (habits: Habit[]) => void) {
  if (!userId) {
    const habits = getLocalHabits();
    callback(habits);
    return () => {};
  }

  const q = query(collection(db, 'habits'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        const local = getLocalHabits();
        if (local.length > 0) {
          // Sync existing local habits to Firestore
          for (const h of local) {
            saveHabitToDb({ ...h, userId });
          }
          callback(local);
        } else {
          // Auto-seed default habits directly to Firestore for Adam
          seedUserHabitsToFirestore(userId).then(() => {
            callback(getLocalHabits());
          });
        }
      } else {
        const habits: Habit[] = snapshot.docs.map((d) => d.data() as Habit);
        saveLocalHabits(habits);
        callback(habits);
      }
    },
    (error) => {
      console.warn('Firestore habits subscription fallback to local', error);
      const local = getLocalHabits();
      if (local.length === 0) {
        const seeded = seedInitialHabits(userId);
        callback(seeded);
      } else {
        callback(local);
      }
    }
  );
}

// Subscribe to logs real-time
export function subscribeLogs(userId: string, callback: (logs: HabitLog[]) => void) {
  if (!userId || userId === 'guest') {
    callback(getLocalLogs());
    return () => {};
  }

  const q = query(collection(db, 'habit_logs'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        saveLocalLogs([]);
        callback([]);
      } else {
        const logs: HabitLog[] = snapshot.docs.map((d) => d.data() as HabitLog);
        saveLocalLogs(logs);
        callback(logs);
      }
    },
    (error) => {
      console.warn('Firestore logs subscription error, fallback to local', error);
      callback(getLocalLogs());
    }
  );
}

// Add or Edit habit
export async function saveHabitToDb(habit: Habit) {
  // Save local first for instant update
  const local = getLocalHabits();
  const idx = local.findIndex((h) => h.id === habit.id);
  if (idx >= 0) {
    local[idx] = habit;
  } else {
    local.push(habit);
  }
  saveLocalHabits(local);

  if (habit.userId && habit.userId !== 'guest') {
    try {
      const docRef = doc(db, 'habits', habit.id);
      await setDoc(docRef, habit, { merge: true });
    } catch (e) {
      console.error('Error saving habit to Firestore', e);
    }
  }
}

// Subscribe User Profile real-time
export function subscribeUserProfile(userId: string, callback: (userName: string) => void) {
  if (!userId || userId === 'guest') return () => {};
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && (data.userName || data.name)) {
        callback(data.userName || data.name);
      }
    }
  });
}

// Save User Profile to Firestore
export async function saveUserProfileToDb(userId: string, userName: string) {
  if (!userId || userId === 'guest') return;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { userName, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.error('Error saving user profile to Firestore', e);
  }
}

// Seed Initial Habits for New User directly to Firestore
export async function seedUserHabitsToFirestore(userId: string) {
  if (!userId || userId === 'guest') return;
  const now = new Date().toISOString();
  try {
    const batch = writeBatch(db);
    const createdHabits: Habit[] = DEFAULT_HABITS.map((item, index) => {
      const habitId = `habit_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
      const newHabit: Habit = {
        ...item,
        id: habitId,
        userId,
        createdAt: now,
        updatedAt: now,
        currentStreak: 0,
        bestStreak: 0,
      };
      const docRef = doc(db, 'habits', habitId);
      batch.set(docRef, newHabit);
      return newHabit;
    });
    await batch.commit();
    saveLocalHabits(createdHabits);
  } catch (e) {
    console.error('Error seeding user habits to Firestore', e);
  }
}

// Delete habit
export async function deleteHabitFromDb(habitId: string, userId: string) {
  const local = getLocalHabits().filter((h) => h.id !== habitId);
  saveLocalHabits(local);

  const localLogs = getLocalLogs().filter((l) => l.habitId !== habitId);
  saveLocalLogs(localLogs);

  if (userId && userId !== 'guest') {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
      // Delete associated logs
      const q = query(collection(db, 'habit_logs'), where('habitId', '==', habitId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error('Error deleting habit from Firestore', e);
    }
  }
}

// Update Habit Log
export async function updateHabitLogToDb(log: HabitLog) {
  const logs = getLocalLogs();
  const idx = logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.push(log);
  }
  saveLocalLogs(logs);

  if (log.userId && log.userId !== 'guest') {
    try {
      const docRef = doc(db, 'habit_logs', log.id);
      await setDoc(docRef, log, { merge: true });
    } catch (e) {
      console.error('Error updating habit log to Firestore', e);
    }
  }
}
