/**
 * Check if a user exists in Firebase Authentication
 * 
 * Usage:
 * node scripts/check-firebase-user.js <email>
 */

const admin = require('firebase-admin');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/check-firebase-user.js <email>');
  console.log('Example: node scripts/check-firebase-user.js admin@test.mxva');
  process.exit(1);
}

async function checkUser() {
  console.log(`\n=== Checking Firebase User ===\n`);
  console.log(`Email: ${email}\n`);

  // Check if Firebase Admin SDK is configured
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('⚠️  Firebase Admin SDK is not configured.');
    console.log('\nTo check users without Admin SDK:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to Authentication > Users');
    console.log('4. Search for the email address\n');
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
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log('✅ User found:');
      console.log('   UID:', userRecord.uid);
      console.log('   Email:', userRecord.email);
      console.log('   Display Name:', userRecord.displayName || 'Not set');
      console.log('   Email Verified:', userRecord.emailVerified);
      console.log('   Disabled:', userRecord.disabled);
      console.log('   Created:', userRecord.metadata.creationTime);
      console.log('   Last Sign In:', userRecord.metadata.lastSignInTime || 'Never');
      
      // Check custom claims
      if (userRecord.customClaims) {
        console.log('   Custom Claims:', JSON.stringify(userRecord.customClaims, null, 2));
      } else {
        console.log('   Custom Claims: None');
      }
      
      console.log('\n✅ User exists and can log in (if password is correct)');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ User not found in Firebase Authentication');
        console.log('\nTo create this user:');
        console.log('1. Go to Firebase Console > Authentication > Users > Add user');
        console.log('2. Or use the registration page: /crew-center/register');
        console.log('3. Or run: node scripts/create-admin-user.js');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkUser();




