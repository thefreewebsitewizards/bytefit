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

const db = admin.firestore();

// Demo user profiles to create (assuming users exist in Firebase Auth)
const userProfiles = [
  {
    email: 'customer@bytefit.com',
    name: 'Demo Customer',
    role: 'customer'
  },
  {
    email: 'admin@bytefit.com',
    name: 'Demo Admin',
    role: 'admin'
  },
  {
    email: 'test@bytefit.com',
    name: 'Test User',
    role: 'customer'
  }
];

async function createUserProfiles() {
  console.log('🚀 Starting user profile creation...');
  
  for (const userData of userProfiles) {
    try {
      console.log(`\n📝 Creating profile for: ${userData.email}`);
      
      // Check if profile already exists
      const existingProfile = await db.collection('Users')
        .where('email', '==', userData.email)
        .get();
      
      if (!existingProfile.empty) {
        console.log(`⚠️  Profile already exists for: ${userData.email}`);
        continue;
      }
      
      // Create user profile in Firestore
      const userProfile = {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        userType: userData.role, // For backward compatibility
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        // Note: uid will need to be added manually after Firebase Auth user creation
        uid: null // Placeholder - needs to be updated with actual Firebase Auth UID
      };
      
      const docRef = await db.collection('Users').add(userProfile);
      console.log(`✅ Created user profile with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error(`❌ Error creating profile for ${userData.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 User profile creation completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Create users in Firebase Authentication Console');
  console.log('2. Update the user profiles with their Firebase Auth UIDs');
  console.log('3. Test login with the demo credentials');
  
  process.exit(0);
}

// Function to update user profile with UID (run this after creating Firebase Auth users)
async function updateUserProfileWithUID(email, uid) {
  try {
    const userQuery = await db.collection('Users').where('email', '==', email).get();
    
    if (userQuery.empty) {
      console.log(`❌ No profile found for: ${email}`);
      return;
    }
    
    const docRef = userQuery.docs[0].ref;
    await docRef.update({ uid: uid });
    console.log(`✅ Updated profile for ${email} with UID: ${uid}`);
    
  } catch (error) {
    console.error(`❌ Error updating profile for ${email}:`, error.message);
  }
}

// Run the script
createUserProfiles().catch(console.error);

// Export the update function for manual use
module.exports = { updateUserProfileWithUID };