// Firebase configuration for React app
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7zIOLQ-3bSTc9ORdBc-PWwqPDbwmxqFc",
  authDomain: "bytefit-v2.firebaseapp.com",
  projectId: "bytefit-v2",
  storageBucket: "bytefit-v2.firebasestorage.app",
  messagingSenderId: "133190653365",
  appId: "1:133190653365:web:b16171c3e919a32272b5fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_PRODUCTION) {
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9098', { disableWarnings: true });
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Firebase emulators already connected or not available');
  }
}



export default app;