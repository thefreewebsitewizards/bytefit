const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc } = require('firebase/firestore');

// Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user details
const adminEmail = 'newadmin@bytefit.com';
const adminPassword = 'newadmin123'; // Change this to a secure password

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');
    
    // Try to create the admin user in Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Admin user created in Firebase Auth');
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Admin user already exists in Firebase Auth, signing in...');
        userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } else {
        throw authError;
      }
    }
    
    const user = userCredential.user;
    console.log(`👤 User UID: ${user.uid}`);
    
    // Check if user profile exists in Firestore
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('email', '==', adminEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: adminEmail,
        name: 'Admin User',
        role: 'admin',
        userType: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await addDoc(usersRef, userProfile);
      console.log('✅ Admin user profile created in Firestore');
    } else {
      console.log('ℹ️  Admin user profile already exists in Firestore');
      
      // Update existing profile to ensure admin role
      const docRef = querySnapshot.docs[0].ref;
      await setDoc(docRef, {
        role: 'admin',
        userType: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('✅ Admin user profile updated with admin role');
    }
    
    console.log('🎉 Admin user setup completed!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('\n🔐 You can now login to the admin dashboard with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the function
createAdminUser().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});