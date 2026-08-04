import { auth, googleProvider, signInWithPopup, signOut } from './firebase';

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      console.log('User closed Google sign-in popup');
      return null;
    }
    if (error?.code === 'auth/unauthorized-domain') {
      alert(
        'Domain belum diizinkan oleh Firebase Auth.\n\n' +
        'Silakan tambahkan domain ini (' + window.location.hostname + ') ke Firebase Console:\n' +
        'Firebase Console -> Authentication -> Settings -> Authorized domains -> Add domain'
      );
      return null;
    }
    console.error('Error signing in with Google:', error);
    alert('Gagal masuk dengan Google: ' + (error?.message || 'Terjadi kesalahan'));
    return null;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
