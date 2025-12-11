# Discord Webhook & Bot セットアップガイド

## 概要

Applicationが送信されると、Discordの特定のチャンネルに自動的に通知が送信されます。また、Discord内のボタンから直接ステータスを更新できます。

## 必要なもの

### 1. Discord Webhook URL

1. Discordサーバーを開く
2. 通知を送りたいチャンネルを開く
3. チャンネル設定（⚙️）→「連携サービス」→「Webhook」
4. 「新しいWebhook」をクリック
5. Webhook名を設定（例: "MXVA Application Bot"）
6. 「Webhook URLをコピー」をクリック

### 2. Discord Bot Token（インタラクティブボタン用）

1. https://discord.com/developers/applications にアクセス
2. 「New Application」をクリック
3. アプリケーション名を入力（例: "MXVA Application Bot"）
4. 「Bot」タブに移動
5. 「Add Bot」をクリック
6. 「Reset Token」をクリックしてトークンをコピー（**このトークンは一度しか表示されません**）
7. 「Privileged Gateway Intents」セクションで以下を有効化：
   - ✅ MESSAGE CONTENT INTENT（必要に応じて）

### 3. Botをサーバーに招待

1. Discord Developer Portalで「OAuth2」→「URL Generator」に移動
2. 「Scopes」で以下を選択：
   - ✅ `bot`
   - ✅ `   applications.commands`
3. 「Bot Permissions」で以下を選択：
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Use External Emojis
4. 生成されたURLをコピーしてブラウザで開く
5. Botを招待したいサーバーを選択して承認

## 環境変数の設定

`.env.local` ファイルに以下を追加：

```env
# Discord Webhook URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# Discord Bot Token（インタラクティブボタン用）
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN

# API Base URL（本番環境の場合は本番URLを設定）
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## データベースマイグレーション

スキーマを更新したので、マイグレーションを実行してください：

```bash
npx prisma migrate dev --name add_discord_message_id
```

または、Prisma Studioで手動で確認：

```bash
npx prisma studio
```

## パッケージのインストール

Discord Botに必要なパッケージをインストール：

```bash
npm install
```

## Discord Botの起動

別のターミナルでDiscord Botを起動：

```bash
npm run discord-bot
```

または：

```bash
node scripts/discord-bot.js
```

Botが正常に起動すると、以下のメッセージが表示されます：

```
✅ Discord Bot is ready! Logged in as YourBotName#1234
```

## 動作確認

1. ApplicationフォームからApplicationを送信
2. 指定したDiscordチャンネルに通知が届くことを確認
3. 通知メッセージに3つのボタン（In Progress、Approve、Reject）が表示されることを確認
4. ボタンをクリックしてステータスが更新されることを確認

## トラブルシューティング

### Botが起動しない

- `DISCORD_BOT_TOKEN` が正しく設定されているか確認
- Botがサーバーに招待されているか確認
- Botに必要な権限が付与されているか確認

### ボタンが動作しない

- Discord Botが起動しているか確認
- `NEXT_PUBLIC_API_URL` が正しく設定されているか確認
- APIエンドポイントがアクセス可能か確認

### メッセージが更新されない

- `DISCORD_WEBHOOK_URL` が正しく設定されているか確認
- データベースに `discordMessageId` が保存されているか確認

## 本番環境での注意事項

1. **環境変数の設定**: 本番環境（Vercel等）でも環境変数を設定してください
2. **Discord Botの常時起動**: Discord Botは常に起動している必要があります。以下のオプションを検討：
   - VPSやサーバーで常時起動
   - Heroku、Railway、Render等のホスティングサービスを使用
   - PM2等のプロセスマネージャーを使用
3. **API URL**: `NEXT_PUBLIC_API_URL` を本番環境のURLに設定してください

## 機能

- ✅ Application送信時にDiscordに自動通知
- ✅ IFC Usernameがリンクとして表示
- ✅ ステータスが一番下に表示
- ✅ 3つのボタン（In Progress、Approve、Reject）でステータス更新
- ✅ ボタンクリックでサーバー側とDiscordメッセージの両方が更新


