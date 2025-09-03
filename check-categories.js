// Check categories in production Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Firebase configuration
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

async function checkCategories() {
  try {
    console.log('🔄 Checking categories in production...');
    
    // Get all categories
    console.log('📂 Fetching ALL categories...');
    const allCategoriesRef = collection(db, 'categories');
    const allCategoriesSnapshot = await getDocs(allCategoriesRef);
    console.log(`✅ Total categories found: ${allCategoriesSnapshot.size}`);
    
    allCategoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Category: ${doc.id}`, {
        name: data.name,
        isActive: data.isActive,
        slug: data.slug
      });
    });
    
    // Get active categories only
    console.log('\n🏷️ Fetching ACTIVE categories only...');
    try {
      const activeCategoriesQuery = query(
        collection(db, 'categories'),
        where('isActive', '==', true),
        orderBy('name')
      );
      const activeCategoriesSnapshot = await getDocs(activeCategoriesQuery);
      console.log(`✅ Active categories found: ${activeCategoriesSnapshot.size}`);
      
      activeCategoriesSnapshot.forEach((doc) => {
        console.log(`📄 Active Category: ${doc.id}`, doc.data());
      });
    } catch (queryError) {
      console.error('❌ Error with active categories query:', queryError);
    }
    
  } catch (error) {
    console.error('❌ Error checking categories:', error);
  }
}

checkCategories();