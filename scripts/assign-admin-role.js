/**
 * Assign owner and admin roles to admin@test.mxva
 * 
 * This script uses Firebase Admin SDK to set custom claims
 * 
 * Usage:
 * 1. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable
 * 2. node scripts/assign-admin-role.js
 */

const admin = require('firebase-admin');

const ADMIN_EMAIL = 'admin@test.mxva';

async function assignAdminRole() {
  console.log('\n=== Assigning Owner and Admin Roles ===\n');
  console.log(`Target email: ${ADMIN_EMAIL}\n`);

  // Check if Firebase Admin SDK is configured
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('⚠️  Firebase Admin SDK is not configured.');
    console.log('\nTo configure:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Generate a new private key');
    console.log('3. Set the JSON content as FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    console.log('\nExample:');
    console.log('export FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
    console.log('node scripts/assign-admin-role.js\n');
    return;
  }

  try {
    // Initialize Firebase Admin SDK
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK initialized\n');

    // Get user by email
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`✅ User found: ${userRecord.email}`);
      console.log(`   UID: ${userRecord.uid}\n`);
    } catch (error) {
      console.error('❌ Error finding user:', error.message);
      console.log('\nPlease make sure the user exists in Firebase Authentication.');
      console.log('You can create the user at: https://console.firebase.google.com/');
      return;
    }

    // Set custom claims with owner and admin roles
    const customClaims = {
      role: 'owner',
      isOwner: true,
      isAdmin: true,
    };

    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);

    console.log('✅ Custom claims set successfully:');
    console.log('   Role: owner');
    console.log('   isOwner: true');
    console.log('   isAdmin: true\n');

    // Verify the claims
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('📋 Verification:');
    console.log('   Email:', updatedUser.email);
    console.log('   Custom Claims:', JSON.stringify(updatedUser.customClaims, null, 2));
    console.log('\n✅ Role assignment complete!');
    console.log('\n⚠️  Important: The user needs to sign out and sign in again');
    console.log('   for the new claims to take effect.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('\nUser not found. Please create the user first in Firebase Console.');
    }
  }
}

assignAdminRole();


