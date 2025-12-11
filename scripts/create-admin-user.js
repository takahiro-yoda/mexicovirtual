/**
 * Firebase Authentication 管理者テストユーザー作成スクリプト（簡易版）
 * 
 * 使用方法:
 * 1. Firebase Consoleで直接ユーザーを作成する方法（推奨）:
 *    - Firebase Console > Authentication > Users > Add user
 *    - Email/Passwordでユーザーを作成
 * 
 * 2. このスクリプトを使用する方法:
 *    - Firebase Admin SDKを設定する必要があります
 *    - node scripts/create-admin-user.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// デフォルトの管理者テストユーザー情報
const DEFAULT_ADMIN_EMAIL = 'admin@mxva.test';
const DEFAULT_ADMIN_PASSWORD = 'admin123456';
const DEFAULT_ADMIN_NAME = 'Admin Test User';

async function createAdminUser() {
  console.log('\n=== Firebase 管理者テストユーザー作成 ===\n');
  
  // Firebase Admin SDKの初期化確認
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('⚠️  Firebase Admin SDKが設定されていません。');
    console.log('\n以下の方法で管理者ユーザーを作成できます：\n');
    console.log('方法1: Firebase Consoleで直接作成（推奨）');
    console.log('  1. https://console.firebase.google.com/ にアクセス');
    console.log('  2. プロジェクトを選択');
    console.log('  3. Authentication > Users > Add user');
    console.log('  4. Email: ' + DEFAULT_ADMIN_EMAIL);
    console.log('  5. Password: ' + DEFAULT_ADMIN_PASSWORD);
    console.log('  6. User UIDをコピー（後で使用）\n');
    console.log('方法2: 登録ページを使用');
    console.log('  1. http://localhost:3000/crew-center/register にアクセス');
    console.log('  2. 上記のメールアドレスとパスワードで登録\n');
    console.log('方法3: Firebase Admin SDKを設定してこのスクリプトを使用');
    console.log('  - .env.localにFIREBASE_SERVICE_ACCOUNT_KEYを設定\n');
    rl.close();
    return;
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    rl.question(`管理者メールアドレス [${DEFAULT_ADMIN_EMAIL}]: `, (email) => {
      const adminEmail = email.trim() || DEFAULT_ADMIN_EMAIL;
      
      rl.question(`パスワード [${DEFAULT_ADMIN_PASSWORD}]: `, (password) => {
        const adminPassword = password.trim() || DEFAULT_ADMIN_PASSWORD;
        
        rl.question(`表示名 [${DEFAULT_ADMIN_NAME}]: `, async (displayName) => {
          const adminName = displayName.trim() || DEFAULT_ADMIN_NAME;
          
          try {
            // 既存のユーザーをチェック
            let userRecord;
            try {
              userRecord = await admin.auth().getUserByEmail(adminEmail);
              console.log('\n⚠️  このメールアドレスのユーザーは既に存在します。');
              console.log('  UID:', userRecord.uid);
              rl.close();
              return;
            } catch (error) {
              // ユーザーが存在しない場合は作成
            }

            // ユーザーを作成
            userRecord = await admin.auth().createUser({
              email: adminEmail,
              password: adminPassword,
              displayName: adminName,
              emailVerified: true,
              disabled: false,
            });

            // カスタムクレームで管理者権限を設定（オプション）
            await admin.auth().setCustomUserClaims(userRecord.uid, {
              admin: true,
              role: 'admin'
            });
            
            console.log('\n✅ 管理者ユーザーが正常に作成されました:');
            console.log('  UID:', userRecord.uid);
            console.log('  Email:', userRecord.email);
            console.log('  Display Name:', userRecord.displayName || 'Not set');
            console.log('  Role: admin');
            console.log('\n以下の情報でログインできます:');
            console.log('  Email:', adminEmail);
            console.log('  Password:', adminPassword);
            console.log('\nログインページ: http://localhost:3000/crew-center/login\n');
          } catch (error) {
            console.error('\n❌ エラーが発生しました:', error.message);
            if (error.code === 'auth/email-already-exists') {
              console.log('このメールアドレスは既に使用されています。');
            }
          }
          
          rl.close();
        });
      });
    });
  } catch (error) {
    console.error('\n❌ Firebase Admin SDKの初期化に失敗しました:', error.message);
    console.log('環境変数FIREBASE_SERVICE_ACCOUNT_KEYが正しく設定されているか確認してください。');
    rl.close();
  }
}

createAdminUser();


