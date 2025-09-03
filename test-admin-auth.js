const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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
const db = getFirestore(app);
const auth = getAuth(app);

async function testAdminAuth() {
  try {
    console.log('🔐 Testing admin authentication...');
    
    // Sign in as admin
    const userCredential = await signInWithEmailAndPassword(auth, 'newadmin@bytefit.com', 'newadmin123');
    console.log('✅ Admin signed in successfully:', userCredential.user.email);
    
    // Test fetching categories
    console.log('🏷️ Testing categories fetch...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(`📊 Categories found: ${categoriesSnapshot.size}`);
    categoriesSnapshot.forEach((doc) => {
      console.log(`📄 Category: ${doc.id}`, doc.data());
    });
    
    // Test fetching orders
    console.log('🛒 Testing orders fetch...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    console.log(`📊 Orders found: ${ordersSnapshot.size}`);
    ordersSnapshot.forEach((doc) => {
      console.log(`📄 Order: ${doc.id}`, doc.data());
    });
    
    // Test fetching users
    console.log('👥 Testing users fetch...');
    const usersSnapshot = await getDocs(collection(db, 'Users'));
    console.log(`📊 Users found: ${usersSnapshot.size}`);
    usersSnapshot.forEach((doc) => {
      console.log(`📄 User: ${doc.id}`, doc.data());
    });
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testAdminAuth();