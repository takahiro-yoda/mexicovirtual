/**
 * Firebase Authentication テストユーザー作成スクリプト
 * 
 * 使用方法:
 * node scripts/create-test-user.js
 * 
 * 注意: このスクリプトはNode.js環境で実行します（ブラウザでは動作しません）
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Firebase Admin SDKの初期化（サービスアカウントキーが必要）
// まず、Firebase Consoleからサービスアカウントキーをダウンロードしてください
// プロジェクト設定 > サービスアカウント > 新しい秘密鍵の生成

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function createUser() {
  rl.question('Email: ', (email) => {
    rl.question('Password: ', (password) => {
      rl.question('Display Name (optional): ', async (displayName) => {
        try {
          const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: displayName || undefined,
            emailVerified: true, // テスト用なのでメール確認をスキップ
          });
          
          console.log('\n✅ Successfully created user:');
          console.log('  UID:', userRecord.uid);
          console.log('  Email:', userRecord.email);
          console.log('  Display Name:', userRecord.displayName || 'Not set');
          console.log('\nYou can now login with these credentials.');
        } catch (error) {
          console.error('\n❌ Error creating user:', error.message);
        }
        
        rl.close();
      });
    });
  });
}

console.log('Firebase Authentication Test User Creator\n');
console.log('Note: This script requires Firebase Admin SDK setup.');
console.log('For easier setup, use the web registration page instead.\n');

// サービスアカウントキーが設定されている場合のみ実行
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  createUser();
} else {
  console.log('⚠️  Firebase Admin SDK is not configured.');
  console.log('Please use the web registration page at: /crew-center/register');
  console.log('Or set up Firebase Admin SDK with service account key.');
  rl.close();
}

