# Firebase認証ユーザーをPrismaに同期する手順

## 問題
Firebase認証でログインしたユーザーは、自動的にPrismaのUserテーブルに作成されません。
そのため、Flight Hoursを追加する際に「User not found」エラーが発生します。

## 解決方法

### 方法1: スクリプトを使用して一括同期（推奨）

1. **Firebase Admin SDKの設定**
   - Firebase Console > プロジェクト設定 > サービスアカウント
   - 「新しい秘密鍵の生成」をクリック
   - ダウンロードしたJSONファイルの内容をコピー

2. **環境変数の設定**
   ```bash
   # .env.local ファイルに追加（または環境変数として設定）
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
   ```
   
   **注意**: JSON全体を文字列として設定してください。シングルクォートで囲みます。

3. **スクリプトの実行**
   ```bash
   node scripts/sync-firebase-to-prisma.js
   ```

   これで、Firebase認証のすべてのユーザーがPrismaのUserテーブルに作成されます。

### 方法2: 手動でPrismaにユーザーを作成

Prisma Studioを使用するか、直接SQLを実行してユーザーを作成します。

```bash
# Prisma Studioを起動
npx prisma studio
```

または、SQLを直接実行：

```sql
INSERT INTO "User" (id, email, "infiniteFlightUsername", "passwordHash", "displayName", role, "createdAt", "updatedAt")
VALUES (
  'cuid...',  -- Prismaが生成するID
  'user@example.com',  -- Firebase認証のemail
  'username',  -- ユーザー名
  '$2a$10$...',  -- bcryptハッシュ（任意の値でOK、Firebase認証では使用されない）
  'Display Name',  -- 表示名（オプション）
  'user',  -- ロール
  NOW(),
  NOW()
);
```

### 方法3: APIエンドポイントで自動作成（既に実装済み）

APIエンドポイントは、Firebase認証のユーザーがPrismaに存在しない場合、自動的に作成する機能が実装されています。
ただし、Firebase Admin SDKが設定されている必要があります。

## Firebase Admin SDKの設定

1. **サービスアカウントキーの取得**
   - Firebase Console > プロジェクト設定 > サービスアカウント
   - 「新しい秘密鍵の生成」をクリック
   - JSONファイルをダウンロード

2. **環境変数の設定**
   
   **オプションA: .env.localファイルに追加**
   ```bash
   # .env.local
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
   ```
   
   **オプションB: 環境変数として設定**
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```

3. **確認**
   ```bash
   # 開発サーバーを再起動
   npm run dev
   ```

## userEmailがクエリパラメータから取得できない場合

Adminページからパイロット詳細ページに遷移する際、emailがクエリパラメータとして渡されます。
もし取得できない場合は、ブラウザのコンソールで以下を確認してください：

```javascript
// ブラウザのコンソールで実行
console.log(window.location.search)
// 例: ?email=user@example.com
```

URLにemailパラメータが含まれているか確認してください。

## トラブルシューティング

### エラー: "User not found"
- PrismaのUserテーブルにユーザーが存在するか確認
- `node scripts/sync-firebase-to-prisma.js`を実行して同期

### エラー: "Firebase Admin SDK is not available"
- `FIREBASE_SERVICE_ACCOUNT_KEY`環境変数が設定されているか確認
- 開発サーバーを再起動

### エラー: "Email was not provided"
- Adminページから遷移する際にemailがクエリパラメータとして渡されているか確認
- ブラウザのコンソールで`userEmail`の値を確認


