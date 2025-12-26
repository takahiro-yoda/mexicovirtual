# Firebase Admin SDK セットアップガイド

## 問題
「Firebase Admin SDK is not configured」というエラーが表示される場合、環境変数が設定されていません。

## 解決方法（5ステップ）

### ステップ1: Firebase Consoleにアクセス
1. ブラウザで https://console.firebase.google.com/ を開く
2. あなたのプロジェクトを選択

### ステップ2: サービスアカウントキーを取得
1. 左側のメニューから「⚙️ プロジェクトの設定」をクリック
2. 上のタブから「サービスアカウント」をクリック
3. 「新しい秘密鍵の生成」ボタンをクリック
4. 警告が出たら「キーを生成」をクリック
5. JSONファイルがダウンロードされます（例: `your-project-firebase-adminsdk-xxxxx.json`）

### ステップ3: JSONファイルの内容をコピー
1. ダウンロードしたJSONファイルをテキストエディタで開く
2. ファイルの中身をすべてコピー（Ctrl+C または Cmd+C）

### ステップ4: 環境変数を設定
1. プロジェクトのルートフォルダ（MXVA）に `.env.local` ファイルを作成
   - 既に存在する場合は、そのファイルを開く
2. 以下のように追加（または既存の内容の下に追加）：

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='[ここにコピーしたJSONの内容を貼り付け]'
```

**重要**: 
- JSONの内容を**シングルクォート（'）**で囲む
- 改行はそのままでOK（JSON形式を保持）

**例**:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"my-project-12345","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@my-project-12345.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40my-project-12345.iam.gserviceaccount.com"}'
```

### ステップ5: 開発サーバーを再起動
1. 現在実行中の開発サーバーを停止（Ctrl+C）
2. 再度起動：
   ```bash
   npm run dev
   ```

## 確認方法

環境変数が正しく設定されているか確認するには：

```bash
# ターミナルで実行
node -e "console.log(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ Set' : '❌ Not set')"
```

または、開発サーバーのログを確認してください。エラーが表示されない場合は、正しく設定されています。

## トラブルシューティング

### エラー: "Unexpected token in JSON"
- JSONの内容が正しくコピーされているか確認
- シングルクォート（'）で囲まれているか確認
- JSON内にシングルクォートが含まれている場合は、エスケープが必要な場合があります

### エラー: "Cannot find module 'firebase-admin'"
- パッケージをインストール：
  ```bash
  npm install firebase-admin
  ```

### エラー: "Invalid service account"
- JSONファイルが正しくコピーされているか確認
- ファイルの先頭と末尾に余分な文字がないか確認
- 再度サービスアカウントキーを生成してみる

### 環境変数が読み込まれない
- `.env.local`ファイルがプロジェクトのルートディレクトリにあるか確認
- 開発サーバーを再起動したか確認
- ファイル名が`.env.local`（先頭にドット）であることを確認

## セキュリティ注意事項

⚠️ **重要**: `.env.local`ファイルは**絶対に**Gitにコミットしないでください！

- `.gitignore`に`.env.local`が含まれているか確認
- このファイルには機密情報が含まれています
- 他の人と共有しないでください


