# Creating Demo Users for ByteFit

Since the service account doesn't have sufficient permissions to create users programmatically, here are the manual steps to create demo users:

## Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `bytefit-v2` project
3. Navigate to **Authentication** > **Users**
4. Click **Add user** and create the following users:

### Demo Users to Create:

#### Customer Account
- **Email**: `customer@bytefit.com`
- **Password**: `customer123`
- **Display Name**: `Demo Customer`

#### Admin Account
- **Email**: `admin@bytefit.com`
- **Password**: `admin123`
- **Display Name**: `Demo Admin`

#### Test Account
- **Email**: `test@bytefit.com`
- **Password**: `test123`
- **Display Name**: `Test User`

## Option 2: Required Service Account Permissions

If you want to use the automated script, the service account needs these IAM roles:

1. **Firebase Authentication Admin** - To create/manage users
2. **Cloud Datastore User** - To write user profiles to Firestore
3. **Service Account Token Creator** - For admin operations

### To grant permissions:
1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
2. Find the service account: `133190653365-compute@developer.gserviceaccount.com`
3. Click **Edit** and add the roles above
4. Then run: `node scripts/create-demo-users.js`

## Option 3: Firebase CLI (Alternative)

You can also use Firebase CLI with proper authentication:

```bash
# Login with your Firebase account
firebase login

# Use Firebase Auth emulator for testing
firebase emulators:start --only auth
```

## After Creating Users

Once users are created in Firebase Authentication, you need to create their profiles in Firestore:

### For Customer Account:
```javascript
// Add to Firestore 'Users' collection
{
  uid: "[USER_UID_FROM_AUTH]",
  email: "customer@bytefit.com",
  name: "Demo Customer",
  role: "customer",
  userType: "customer",
  createdAt: [TIMESTAMP],
  updatedAt: [TIMESTAMP]
}
```

### For Admin Account:
```javascript
// Add to Firestore 'Users' collection
{
  uid: "[USER_UID_FROM_AUTH]",
  email: "admin@bytefit.com",
  name: "Demo Admin",
  role: "admin",
  userType: "admin",
  createdAt: [TIMESTAMP],
  updatedAt: [TIMESTAMP]
}
```

## Testing the Users

After creation, test the users by:
1. Going to your application login page
2. Using the credentials above
3. Verifying that:
   - Customer can access customer features
   - Admin can access admin dashboard
   - User profiles are properly loaded

## Notes

- The application expects user profiles in the `Users` collection (capital U)
- Both `role` and `userType` fields should be set for backward compatibility
- Admin users should have `role: "admin"` to access admin features