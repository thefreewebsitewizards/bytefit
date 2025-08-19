const admin = require('firebase-admin');

// Initialize Firebase Admin
// Note: Use Firebase CLI authentication or set GOOGLE_APPLICATION_CREDENTIALS environment variable
// For local development: firebase login
// For production: Set service account key as environment variable
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: 'bytefit-v2'
  });
}

const auth = admin.auth();
const db = admin.firestore();

// Demo users to create
const demoUsers = [
  {
    email: 'customer@bytefit.com',
    password: 'customer123',
    name: 'Demo Customer',
    role: 'customer'
  },
  {
    email: 'admin@bytefit.com',
    password: 'admin123',
    name: 'Demo Admin',
    role: 'admin'
  },
  {
    email: 'test@bytefit.com',
    password: 'test123',
    name: 'Test User',
    role: 'customer'
  }
];

async function createDemoUsers() {
  console.log('🚀 Starting demo user creation...');
  
  for (const userData of demoUsers) {
    try {
      console.log(`\n📧 Creating user: ${userData.email}`);
      
      // Check if user already exists
      try {
        const existingUser = await auth.getUserByEmail(userData.email);
        console.log(`⚠️  User ${userData.email} already exists with UID: ${existingUser.uid}`);
        
        // Update user profile in Firestore if it doesn't exist
        await updateUserProfile(existingUser.uid, userData);
        continue;
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
        // User doesn't exist, continue with creation
      }
      
      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
        emailVerified: true // Set as verified for demo purposes
      });
      
      console.log(`✅ Created Firebase Auth user: ${userRecord.uid}`);
      
      // Create user profile in Firestore
      await createUserProfile(userRecord.uid, userData);
      
      console.log(`✅ Created user profile for: ${userData.email}`);
      
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Demo user creation completed!');
  process.exit(0);
}

async function createUserProfile(uid, userData) {
  const userProfile = {
    uid: uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    userType: userData.role, // For backward compatibility
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };
  
  // Add to Users collection (note the capital U)
  await db.collection('Users').add(userProfile);
}

async function updateUserProfile(uid, userData) {
  try {
    // Check if user profile exists in Firestore
    const userQuery = await db.collection('Users').where('uid', '==', uid).get();
    
    if (userQuery.empty) {
      console.log(`📝 Creating missing user profile for: ${userData.email}`);
      await createUserProfile(uid, userData);
    } else {
      console.log(`✅ User profile already exists for: ${userData.email}`);
    }
  } catch (error) {
    console.error(`❌ Error updating user profile for ${userData.email}:`, error.message);
  }
}

// Run the script
createDemoUsers().catch(console.error);