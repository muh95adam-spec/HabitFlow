import { auth, signInAnonymously } from './firebase';

const LOCAL_USER_NAME_KEY = 'habitflow_user_name';
export const PERSONAL_USER_ID = 'adam_personal';

export function getStoredUserName(): string {
  try {
    return localStorage.getItem(LOCAL_USER_NAME_KEY) || 'Adam';
  } catch {
    return 'Adam';
  }
}

export function setStoredUserName(name: string): void {
  try {
    localStorage.setItem(LOCAL_USER_NAME_KEY, name.trim() || 'Adam');
  } catch (e) {
    console.error('Failed to save user name', e);
  }
}

export async function initAnonymousAuth() {
  try {
    if (auth && !auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (e) {
    console.log('Firebase Auth skipped, using direct Firestore sync mode');
  }
}



