# Discord Webhook セットアップガイド（詳細版）

## 📋 目次
1. [Discord Webhook URLの取得方法](#discord-webhook-urlの取得方法)
2. [環境変数の設定](#環境変数の設定)
3. [動作確認](#動作確認)
4. [トラブルシューティング](#トラブルシューティング)

---

## Discord Webhook URLの取得方法

### ステップ1: Discordサーバーを開く
1. DiscordアプリまたはブラウザでDiscordを開く
2. 通知を送りたいサーバーを選択

### ステップ2: チャンネル設定を開く
1. 通知を送りたいチャンネルを右クリック（または長押し）
2. 「チャンネルを編集」または「チャンネル設定」をクリック

### ステップ3: Webhookを作成
1. 左側のメニューから「**連携サービス**」をクリック
2. 「**Webhook**」タブをクリック
3. 「**新しいWebhook**」または「**Webhookを作成**」をクリック

### ステップ4: Webhookを設定
1. **Webhook名**: 例: "MXVA Application Bot"
2. **チャンネル**: 通知を送りたいチャンネルを選択（通常は自動選択されています）
3. **アバター**: オプション（Botのアイコンを設定できます）

### ステップ5: Webhook URLをコピー
1. 「**Webhook URLをコピー**」ボタンをクリック
2. URLがクリップボードにコピーされます
   - 形式: `https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890`

### ステップ6: Webhookを保存
1. 「**保存**」または「**変更を保存**」をクリック

---

## 環境変数の設定

### ステップ1: .env.localファイルを開く
プロジェクトのルートディレクトリにある`.env.local`ファイルを開きます。

### ステップ2: Webhook URLを追加/更新
以下の行を見つけて、実際のWebhook URLに置き換えます：

```env
# 古い設定（プレースホルダー）
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# 新しい設定（実際のURLに置き換え）
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890
```

**重要**: 
- URLの前後にスペースや引用符は不要です
- `YOUR_WEBHOOK_ID`や`YOUR_WEBHOOK_TOKEN`という文字列が残っていないか確認してください

### ステップ3: ファイルを保存
`.env.local`ファイルを保存します。

---

## 動作確認

### 方法1: テストスクリプトを使用（推奨）

```bash
npm run test-webhook
```

このコマンドを実行すると、Discordチャンネルにテストメッセージが送信されます。

### 方法2: Applicationを送信して確認

1. Next.jsサーバーを起動（まだ起動していない場合）:
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000/apply` にアクセス

3. Applicationフォームに必要事項を入力して送信

4. Discordチャンネルを確認して、通知が届いているか確認

---

## トラブルシューティング

### 問題1: テストスクリプトでエラーが出る

**エラー**: `DISCORD_WEBHOOK_URLが設定されていません`
- **解決方法**: `.env.local`ファイルに`DISCORD_WEBHOOK_URL`が正しく設定されているか確認

**エラー**: `DISCORD_WEBHOOK_URLがプレースホルダーのままです`
- **解決方法**: 実際のDiscord Webhook URLに置き換えてください

**エラー**: `HTTPステータス: 404`
- **解決方法**: Webhook URLが間違っているか、Webhookが削除されています。新しいWebhookを作成してください

**エラー**: `HTTPステータス: 401`
- **解決方法**: Webhook URLが無効です。新しいWebhookを作成してください

### 問題2: Applicationを送信しても通知が届かない

1. **Next.jsサーバーのログを確認**
   - ターミナルにエラーメッセージが表示されていないか確認
   - `Failed to send Discord notification`というメッセージがないか確認

2. **環境変数が読み込まれているか確認**
   - Next.jsサーバーを再起動してください（環境変数の変更を反映するため）
   ```bash
   # Ctrl+Cで停止してから
   npm run dev
   ```

3. **Webhook URLを再確認**
   ```bash
   npm run test-webhook
   ```

4. **Discordチャンネルの権限を確認**
   - Botがメッセージを送信できる権限があるか確認
   - チャンネルがBotにアクセス可能か確認

### 問題3: Webhook URLを間違えて公開してしまった

1. DiscordでWebhookを削除
2. 新しいWebhookを作成
3. 新しいWebhook URLを`.env.local`に設定

---

## よくある質問

### Q: Webhook URLはどこに保存されますか？
A: `.env.local`ファイルに保存されます。このファイルは`.gitignore`に含まれているため、Gitにコミットされません。

### Q: 複数のチャンネルに通知を送りたい場合は？
A: 複数のWebhook URLを作成し、コードを修正して複数のWebhookに送信するようにします。

### Q: Webhook URLは誰でも見られますか？
A: `.env.local`ファイルに保存されている限り、ローカル環境でのみ見られます。ただし、Webhook URLを知っている人は誰でもそのチャンネルにメッセージを送信できるため、機密情報として扱ってください。

---

## 次のステップ

Webhookが正常に動作することを確認したら：

1. ✅ Discord Botのセットアップ（インタラクティブボタン用）
2. ✅ Application送信のテスト
3. ✅ ボタンクリックでステータス更新のテスト

詳細は `DISCORD_SETUP.md` を参照してください。


