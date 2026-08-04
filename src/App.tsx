import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Habit, HabitLog } from './types';
import { getTodayStr } from './lib/dateUtils';
import {
  subscribeHabits,
  subscribeLogs,
  saveHabitToDb,
  deleteHabitFromDb,
  updateHabitLogToDb,
  saveLocalHabits,
  saveLocalLogs
} from './lib/storage';
import {
  getStoredUserName,
  setStoredUserName,
  getStoredSyncCode,
  setStoredSyncCode,
  initAnonymousAuth
} from './lib/authService';

import { Header } from './components/Header';
import { DateSelector } from './components/DateSelector';
import { Navigation, TabType } from './components/Navigation';
import { TodayTab } from './components/TodayTab';
import { StatsTab } from './components/StatsTab';
import { MyHabitsTab } from './components/MyHabitsTab';
import { SettingsTab } from './components/SettingsTab';
import { HabitFormModal } from './components/HabitFormModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>(getStoredUserName());
  const [syncCode, setSyncCode] = useState<string>(getStoredSyncCode());
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // Initialize background anonymous auth if available
  useEffect(() => {
    initAnonymousAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveUserName = (newName: string) => {
    setStoredUserName(newName);
    setUserName(newName);
  };

  const handleSaveSyncCode = (newCode: string) => {
    setStoredSyncCode(newCode);
    setSyncCode(newCode);
  };

  // Real-time Firestore or Local Storage subscriptions using active Sync Code
  useEffect(() => {
    const activeUserId = syncCode;

    const unsubHabits = subscribeHabits(activeUserId, (data) => {
      setHabits(data);
    });

    const unsubLogs = subscribeLogs(activeUserId, (data) => {
      setLogs(data);
    });

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [syncCode]);

  // Handle Habit Log update
  const handleUpdateLog = async (log: HabitLog) => {
    const logToSave = { ...log, userId: syncCode };
    const updatedLogs = logs.filter((l) => l.id !== log.id);
    updatedLogs.push(logToSave);
    setLogs(updatedLogs);
    await updateHabitLogToDb(logToSave);
  };

  // Handle Save (Add / Edit) Habit
  const handleSaveHabit = async (habit: Habit) => {
    const habitToSave = { ...habit, userId: syncCode };
    const idx = habits.findIndex((h) => h.id === habit.id);
    let updated: Habit[];
    if (idx >= 0) {
      updated = [...habits];
      updated[idx] = habitToSave;
    } else {
      updated = [...habits, habitToSave];
    }
    setHabits(updated);
    await saveHabitToDb(habitToSave);
  };

  // Handle Delete Habit
  const handleDeleteHabit = async (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
    await deleteHabitFromDb(habitId, syncCode);
  };

  // Handle Toggle Status (Active / Paused)
  const handleToggleStatus = async (habit: Habit) => {
    const updated: Habit = {
      ...habit,
      status: habit.status === 'active' ? 'paused' : 'active',
      updatedAt: new Date().toISOString(),
    };
    await handleSaveHabit(updated);
  };

  // Handle Import JSON Data
  const handleImportData = async (importedHabits: Habit[], importedLogs: HabitLog[]) => {
    setHabits(importedHabits);
    setLogs(importedLogs);
    saveLocalHabits(importedHabits);
    saveLocalLogs(importedLogs);

    for (const h of importedHabits) {
      await saveHabitToDb({ ...h, userId: syncCode });
    }
    for (const l of importedLogs) {
      await updateHabitLogToDb({ ...l, userId: syncCode });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Navigation (Sidebar on Desktop) */}
      <Navigation activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Header userName={userName} onOpenProfile={() => setActiveTab('settings')} />

        {activeTab === 'today' && (
          <>
            <DateSelector
              selectedDateStr={selectedDateStr}
              onSelectDate={setSelectedDateStr}
            />
            <TodayTab
              habits={habits}
              logs={logs}
              selectedDateStr={selectedDateStr}
              onUpdateLog={handleUpdateLog}
              onOpenAddModal={() => {
                setHabitToEdit(null);
                setIsFormModalOpen(true);
              }}
              onEditHabit={(habit) => {
                setHabitToEdit(habit);
                setIsFormModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
            />
          </>
        )}

        {activeTab === 'stats' && <StatsTab habits={habits} logs={logs} />}

        {activeTab === 'my_habits' && (
          <MyHabitsTab
            habits={habits}
            onOpenAddModal={() => {
              setHabitToEdit(null);
              setIsFormModalOpen(true);
            }}
            onEditHabit={(habit) => {
              setHabitToEdit(habit);
              setIsFormModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            userName={userName}
            syncCode={syncCode}
            onSaveUserName={handleSaveUserName}
            onSaveSyncCode={handleSaveSyncCode}
            habits={habits}
            logs={logs}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Habit Form Modal */}
      {isFormModalOpen && (
        <HabitFormModal
          habitToEdit={habitToEdit}
          userId={syncCode}
          onClose={() => {
            setIsFormModalOpen(false);
            setHabitToEdit(null);
          }}
          onSave={handleSaveHabit}
        />
      )}
    </div>
  );
}


