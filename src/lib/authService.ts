import { auth, signInAnonymously } from './firebase';

const LOCAL_USER_NAME_KEY = 'habitflow_user_name';
const SYNC_CODE_KEY = 'habitflow_sync_code';

export function getStoredUserName(): string {
  try {
    return localStorage.getItem(LOCAL_USER_NAME_KEY) || 'Sahabat';
  } catch {
    return 'Sahabat';
  }
}

export function setStoredUserName(name: string): void {
  try {
    localStorage.setItem(LOCAL_USER_NAME_KEY, name.trim() || 'Sahabat');
  } catch (e) {
    console.error('Failed to save user name', e);
  }
}

export function getStoredSyncCode(): string {
  try {
    let code = localStorage.getItem(SYNC_CODE_KEY);
    if (!code) {
      code = 'HF-' + Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(SYNC_CODE_KEY, code);
    }
    return code;
  } catch {
    return 'HF-123456';
  }
}

export function setStoredSyncCode(code: string): void {
  try {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean) {
      localStorage.setItem(SYNC_CODE_KEY, clean);
    }
  } catch (e) {
    console.error('Failed to save sync code', e);
  }
}

export async function initAnonymousAuth() {
  try {
    if (auth && !auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (e) {
    console.log('Using local device storage mode');
  }
}


