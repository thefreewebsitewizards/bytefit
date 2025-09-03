const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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

async function addTestData() {
  try {
    console.log('🔐 Signing in as admin...');
    await signInWithEmailAndPassword(auth, 'newadmin@bytefit.com', 'newadmin123');
    console.log('✅ Signed in successfully');

    // Add test categories
    console.log('🏷️ Adding test categories...');
    const categories = [
      {
        name: 'Protein Supplements',
        description: 'High-quality protein powders and supplements',
        slug: 'protein-supplements',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Pre-Workout',
        description: 'Energy boosting pre-workout supplements',
        slug: 'pre-workout',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Vitamins',
        description: 'Essential vitamins and minerals',
        slug: 'vitamins',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const category of categories) {
      const docRef = await addDoc(collection(db, 'categories'), category);
      console.log(`✅ Added category: ${category.name} with ID: ${docRef.id}`);
    }

    // Add test orders
    console.log('🛒 Adding test orders...');
    const orders = [
      {
        userId: 'test-user-1',
        customerEmail: 'customer1@test.com',
        items: [
          {
            id: 'product-1',
            name: 'Whey Protein',
            price: 29.99,
            quantity: 2,
            image: 'https://example.com/whey.jpg'
          }
        ],
        total: 59.98,
        status: 'delivered',
        paymentMethod: 'stripe',
        createdAt: Timestamp.now()
      },
      {
        userId: 'test-user-2',
        customerEmail: 'customer2@test.com',
        items: [
          {
            id: 'product-2',
            name: 'Pre-Workout Boost',
            price: 24.99,
            quantity: 1,
            image: 'https://example.com/preworkout.jpg'
          }
        ],
        total: 24.99,
        status: 'pending',
        paymentMethod: 'stripe',
        createdAt: Timestamp.now()
      }
    ];

    for (const order of orders) {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log(`✅ Added order with ID: ${docRef.id}`);
    }

    console.log('🎉 Test data added successfully!');
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

addTestData();