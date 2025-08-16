// Firebase configuration for React app
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDy5hBMFfqzWQinV0sLLZAFh8koVZE5Qk",
  authDomain: "ksenia-munoz.firebaseapp.com",
  projectId: "ksenia-munoz",
  storageBucket: "ksenia-munoz.firebasestorage.app",
  messagingSenderId: "982189236395",
  appId: "1:982189236395:web:594648694ec020153f17ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (disabled for production use)
// if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_PRODUCTION) {
//   try {
//     // Connect to Auth emulator
//     connectAuthEmulator(auth, 'http://127.0.0.1:9098', { disableWarnings: true });
//     
//     // Connect to Firestore emulator
//     connectFirestoreEmulator(db, '127.0.0.1', 8080);
//     
//     // Connect to Storage emulator
//     connectStorageEmulator(storage, '127.0.0.1', 9199);
//     
//     console.log('🔧 Connected to Firebase emulators');
//   } catch (error) {
//     console.log('⚠️ Firebase emulators already connected or not available');
//   }
// }



export default app;