# Vercelデプロイガイド

このプロジェクトをVercelにデプロイする手順です。

## 前提条件

- GitHubアカウント
- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録可能）
- コードがGitHubリポジトリにpush済み

## デプロイ手順

### 1. GitHubにコードをpush

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Vercelでプロジェクトを作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. **Add New...** → **Project** をクリック
3. GitHubリポジトリを選択して **Import**
4. Framework Presetは **Next.js** が自動検出されます
5. **Deploy** をクリック（この時点では環境変数未設定のためエラーになる可能性があります）

### 3. Vercel Postgresを作成

1. Vercel Dashboard → **Storage** タブ
2. **Create Database** → **Postgres** を選択
3. データベース名を入力（例: `mxva-db`）
4. **Create** をクリック
5. 作成後、プロジェクトの **Settings** → **Environment Variables** に `DATABASE_URL` が自動追加されます

### 4. 環境変数を設定

プロジェクトの **Settings** → **Environment Variables** で以下を追加：

#### 必須

- `DATABASE_URL` - Vercel Postgres作成時に自動追加されます（確認のみ）
- `NEXTAUTH_URL` - デプロイ後のURL（例: `https://your-project.vercel.app`）
- `NEXTAUTH_SECRET` - ランダムな長い文字列（例: `openssl rand -base64 32` で生成）

#### Firebase（使用する場合）

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` - 改行は `\n` 形式で入力

#### Discord通知（使用する場合）

- `DISCORD_WEBHOOK_URL` - Application通知用
- `DISCORD_PIREP_WEBHOOK_URL` - PIREP通知用

#### 地図表示（使用する場合）

- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox APIトークン

### 5. データベースマイグレーションを適用

Vercel Postgresにスキーマを作成します。以下のいずれかの方法で実行：

#### 方法A: ローカルから実行（推奨）

1. ローカルの `.env.local` にVercel Postgresの `DATABASE_URL` を一時的に設定
2. マイグレーションを実行：

```bash
npx prisma migrate dev --name init
```

または、既存のマイグレーションがある場合：

```bash
npx prisma migrate deploy
```

#### 方法B: Vercelのビルド時に実行

Vercelの **Settings** → **Build & Development Settings** で：

- **Build Command**: `prisma generate && prisma migrate deploy && next build`

（注意: この方法はビルド時間が長くなる可能性があります）

### 6. 再デプロイ

環境変数を設定した後、**Deployments** タブから最新のデプロイを **Redeploy** するか、GitHubにpushして自動デプロイをトリガーします。

### 7. 初期データの投入（オプション）

管理者ユーザーなどが必要な場合：

```bash
# ローカルで実行（DATABASE_URLをVercel Postgresに設定）
node scripts/create-admin-user.js
```

## トラブルシューティング

### ビルドエラー: "Prisma Client has not been generated"

- `package.json` の `postinstall` スクリプトが正しく設定されているか確認
- Vercelのビルドログで `prisma generate` が実行されているか確認

### データベース接続エラー

- `DATABASE_URL` が正しく設定されているか確認
- Vercel Postgresが作成されているか確認
- 接続文字列に `?sslmode=require` が含まれているか確認（Vercel PostgresはSSL必須）

### 環境変数が読み込まれない

- 環境変数を設定後、**Redeploy** が必要です
- Production / Preview / Development で別々に設定する必要がある場合があります

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
