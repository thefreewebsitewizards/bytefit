const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, addDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Firebase config (using the same config as the app)
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
const db = getFirestore(app);
const auth = getAuth(app);

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users in Users collection...');
    
    // Query Users collection
    const usersRef = collection(db, 'Users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`📊 Total users found: ${snapshot.size}`);
    
    let adminFound = false;
    snapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 User ID: ${doc.id}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   UserType: ${userData.userType}`);
      console.log(`   UID: ${userData.uid}`);
      console.log('---');
      
      if (userData.role === 'admin' || userData.userType === 'admin') {
        adminFound = true;
      }
    });
    
    if (adminFound) {
      console.log('✅ Admin user found!');
    } else {
      console.log('❌ No admin users found!');
      console.log('💡 You may need to manually set a user\'s role to "admin" in the Firestore console.');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  }
}

// Run the check
checkAdminUsers().then(() => {
  console.log('✅ Admin user check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});