/**
 * Firebase認証のユーザーをPrismaのUserテーブルに同期するスクリプト
 * 
 * 使用方法:
 * node scripts/sync-firebase-to-prisma.js
 * 
 * 注意: このスクリプトはNode.js環境で実行します（ブラウザでは動作しません）
 */

const { PrismaClient } = require('@prisma/client')
const admin = require('firebase-admin')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function syncFirebaseUsersToPrisma() {
  console.log('\n=== Firebase認証ユーザーをPrismaに同期 ===\n')

  // Check if firebase-admin is installed
  try {
    require('firebase-admin')
  } catch (error) {
    console.log('❌ firebase-admin がインストールされていません。')
    console.log('\n以下のコマンドでインストールしてください:')
    console.log('   npm install firebase-admin')
    rl.close()
    return
  }

  // Firebase Admin SDKの初期化確認
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY環境変数が設定されていません。')
    console.log('\n【設定方法】')
    console.log('1. ブラウザで https://console.firebase.google.com/ を開く')
    console.log('2. あなたのプロジェクトを選択')
    console.log('3. 左側のメニューから「⚙️ プロジェクトの設定」をクリック')
    console.log('4. 上のタブから「サービスアカウント」をクリック')
    console.log('5. 「新しい秘密鍵の生成」ボタンをクリック')
    console.log('6. ダウンロードしたJSONファイルを開いて、中身をすべてコピー')
    console.log('7. プロジェクトフォルダに .env.local ファイルを作成（または開く）')
    console.log('8. 以下のように追加:')
    console.log('   FIREBASE_SERVICE_ACCOUNT_KEY=\'[コピーしたJSONの内容]\'')
    console.log('\n【重要】JSONの内容をシングルクォート（\'）で囲んでください')
    rl.close()
    return
  }

  try {
    // Initialize Firebase Admin SDK
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
    console.log('✅ Firebase Admin SDK initialized\n')

    // Get all Firebase users
    console.log('Firebase認証のユーザーを取得中...')
    const listUsersResult = await admin.auth().listUsers()
    const firebaseUsers = listUsersResult.users
    console.log(`✅ ${firebaseUsers.length}人のFirebaseユーザーが見つかりました\n`)

    let created = 0
    let updated = 0
    let skipped = 0

    for (const firebaseUser of firebaseUsers) {
      const email = firebaseUser.email
      if (!email) {
        console.log(`⚠️  Emailがないユーザーをスキップ: ${firebaseUser.uid}`)
        skipped++
        continue
      }

      try {
        // Check if user exists in Prisma
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          console.log(`✓ 既存ユーザー: ${email} (スキップ)`)
          skipped++
        } else {
          // Create user in Prisma
          const placeholderPassword = await bcrypt.hash(`firebase-auth-${firebaseUser.uid}`, 10)
          
          await prisma.user.create({
            data: {
              email: email,
              infiniteFlightUsername: firebaseUser.displayName || email.split('@')[0],
              passwordHash: placeholderPassword,
              displayName: firebaseUser.displayName || null,
              role: 'user', // Default role
            },
          })
          console.log(`✅ ユーザーを作成: ${email}`)
          created++
        }
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  ユーザーが既に存在: ${email} (スキップ)`)
          skipped++
        } else {
          console.error(`❌ エラー (${email}):`, error.message)
        }
      }
    }

    console.log('\n=== 同期完了 ===')
    console.log(`作成: ${created}`)
    console.log(`更新: ${updated}`)
    console.log(`スキップ: ${skipped}`)
    console.log(`合計: ${firebaseUsers.length}\n`)

  } catch (error) {
    console.error('\n❌ エラー:', error.message)
    if (error.code === 'auth/invalid-credential') {
      console.log('\nFirebase Admin SDKの認証情報が無効です。')
      console.log('FIREBASE_SERVICE_ACCOUNT_KEYを確認してください。')
    }
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

syncFirebaseUsersToPrisma()

