import React, { useState, useEffect } from 'react';
import { Habit, HabitLog } from './types';
import { getTodayStr } from './lib/dateUtils';
import {
  subscribeHabits,
  subscribeLogs,
  subscribeUserProfile,
  saveUserProfileToDb,
  saveHabitToDb,
  deleteHabitFromDb,
  updateHabitLogToDb,
  saveLocalHabits,
  saveLocalLogs
} from './lib/storage';
import {
  getStoredUserName,
  setStoredUserName,
  PERSONAL_USER_ID,
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
  const [userName, setUserName] = useState<string>(getStoredUserName());
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Silently initialize Firebase auth if enabled, or proceed directly
  useEffect(() => {
    initAnonymousAuth();
  }, []);

  const handleSaveUserName = (newName: string) => {
    setStoredUserName(newName);
    setUserName(newName);
    saveUserProfileToDb(PERSONAL_USER_ID, newName);
  };

  // Real-time Firestore subscriptions using PERSONAL_USER_ID
  useEffect(() => {
    setIsLoading(true);

    const unsubHabits = subscribeHabits(PERSONAL_USER_ID, (data) => {
      setHabits(data);
      setIsLoading(false);
    });

    const unsubLogs = subscribeLogs(PERSONAL_USER_ID, (data) => {
      setLogs(data);
    });

    const unsubProfile = subscribeUserProfile(PERSONAL_USER_ID, (remoteName) => {
      if (remoteName) {
        setStoredUserName(remoteName);
        setUserName(remoteName);
      }
    });

    return () => {
      unsubHabits();
      unsubLogs();
      unsubProfile();
    };
  }, []);

  // Handle Habit Log update
  const handleUpdateLog = async (log: HabitLog) => {
    const logToSave = { ...log, userId: PERSONAL_USER_ID };
    const updatedLogs = logs.filter((l) => l.id !== log.id);
    updatedLogs.push(logToSave);
    setLogs(updatedLogs);
    await updateHabitLogToDb(logToSave);
  };

  // Handle Save (Add / Edit) Habit
  const handleSaveHabit = async (habit: Habit) => {
    const habitToSave = { ...habit, userId: PERSONAL_USER_ID };
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
    await deleteHabitFromDb(habitId, PERSONAL_USER_ID);
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
      await saveHabitToDb({ ...h, userId: PERSONAL_USER_ID });
    }
    for (const l of importedLogs) {
      await updateHabitLogToDb({ ...l, userId: PERSONAL_USER_ID });
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
              isLoading={isLoading}
              onUpdateLog={handleUpdateLog}
              onOpenAddModal={() => {
                setHabitToEdit(null);
                setIsFormModalOpen(true);
              }}
            />
          </>
        )}

        {activeTab === 'stats' && <StatsTab habits={habits} logs={logs} />}

        {activeTab === 'my_habits' && (
          <MyHabitsTab
            habits={habits}
            isLoading={isLoading}
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
            onSaveUserName={handleSaveUserName}
            habits={habits}
            logs={logs}
            onImportData={handleImportData}
            deferredPrompt={deferredPrompt}
            onInstallPWA={handleInstallPWA}
          />
        )}
      </main>

      {/* Habit Form Modal */}
      {isFormModalOpen && (
        <HabitFormModal
          habitToEdit={habitToEdit}
          userId={PERSONAL_USER_ID}
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


