/**
 * Check Firebase Admin SDK Configuration
 * 
 * This script checks if FIREBASE_SERVICE_ACCOUNT_KEY is properly configured
 * 
 * Usage:
 * node scripts/check-firebase-admin-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Firebase Admin SDK Configuration Check ===\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

let envFile = null;
if (fs.existsSync(envLocalPath)) {
  envFile = envLocalPath;
  console.log('✅ Found .env.local file');
} else if (fs.existsSync(envPath)) {
  envFile = envPath;
  console.log('✅ Found .env file');
} else {
  console.log('❌ No .env.local or .env file found');
  console.log('\n📝 To create .env.local:');
  console.log('   1. Create a file named .env.local in the project root');
  console.log('   2. Add: FIREBASE_SERVICE_ACCOUNT_KEY=\'[your JSON here]\'');
  console.log('\nSee FIREBASE_ADMIN_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

// Read environment file
try {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Check if FIREBASE_SERVICE_ACCOUNT_KEY is in the file
  if (envContent.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
    console.log('✅ FIREBASE_SERVICE_ACCOUNT_KEY found in environment file');
    
    // Try to extract the value (simple regex match)
    const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY\s*=\s*['"](.*)['"]/s);
    if (match && match[1]) {
      const keyValue = match[1].trim();
      
      // Check if it looks like JSON
      if (keyValue.startsWith('{') && keyValue.endsWith('}')) {
        try {
          const parsed = JSON.parse(keyValue);
          
          // Check required fields
          const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
          const missingFields = requiredFields.filter(field => !parsed[field]);
          
          if (missingFields.length === 0) {
            console.log('✅ JSON structure is valid');
            console.log(`✅ Project ID: ${parsed.project_id}`);
            console.log(`✅ Client Email: ${parsed.client_email}`);
            
            // Try to initialize Firebase Admin SDK
            try {
              const admin = require('firebase-admin');
              
              // Set the environment variable for this process
              process.env.FIREBASE_SERVICE_ACCOUNT_KEY = keyValue;
              
              const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
              admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
              });
              
              console.log('✅ Firebase Admin SDK initialized successfully!');
              console.log('\n🎉 Configuration is correct! You can now create users.');
              console.log('\n⚠️  Remember to restart your development server:');
              console.log('   npm run dev\n');
            } catch (error) {
              if (error.code === 'MODULE_NOT_FOUND') {
                console.log('❌ firebase-admin package not installed');
                console.log('\n📦 Install it with:');
                console.log('   npm install firebase-admin\n');
              } else {
                console.log(`❌ Error initializing Firebase Admin SDK: ${error.message}`);
                console.log('\n🔍 Check:');
                console.log('   1. JSON content is correct');
                console.log('   2. Service account key is valid');
                console.log('   3. Private key is properly formatted\n');
              }
            }
          } else {
            console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
            console.log('\n🔍 The JSON should contain:');
            console.log('   - type: "service_account"');
            console.log('   - project_id');
            console.log('   - private_key');
            console.log('   - client_email\n');
          }
        } catch (parseError) {
          console.log('❌ Invalid JSON format');
          console.log(`   Error: ${parseError.message}`);
          console.log('\n🔍 Check:');
          console.log('   1. JSON is properly formatted');
          console.log('   2. JSON is wrapped in single quotes (\')');
          console.log('   3. No extra characters before or after JSON\n');
        }
      } else {
        console.log('❌ Value does not appear to be valid JSON');
        console.log('   (Should start with { and end with })');
        console.log('\n🔍 Make sure the JSON is wrapped in single quotes:\n');
        console.log("   FIREBASE_SERVICE_ACCOUNT_KEY='{...}'\n");
      }
    } else {
      console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY value not found or improperly formatted');
      console.log('\n📝 Expected format:');
      console.log("   FIREBASE_SERVICE_ACCOUNT_KEY='{...}'\n");
    }
  } else {
    console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment file');
    console.log('\n📝 Add this line to your .env.local file:');
    console.log("   FIREBASE_SERVICE_ACCOUNT_KEY='[your JSON here]'");
    console.log('\nSee FIREBASE_ADMIN_SETUP.md for detailed instructions.\n');
  }
} catch (error) {
  console.log(`❌ Error reading environment file: ${error.message}\n`);
  process.exit(1);
}
