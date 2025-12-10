# MexicoVirtual - Infinite Flight Virtual Airlines Platform

Infinite Flight向けの仮想航空会社（VA）管理プラットフォームです。パイロットがフライトを記録し、統計を管理できるVA Center機能を提供します。

## プロジェクト概要

MexicoVirtualは、Infinite Flightコミュニティ向けの包括的なVA管理システムです。以下の主要機能を提供します：

- **ホームページ**: VAの紹介、ニュース、統計情報の表示
- **VA Center**: パイロットがフライトを記録・管理するためのダッシュボード
- **フライト記録システム**: フライトデータの入力、保存、分析
- **統計・ランキング**: パイロットの成績、ランキング、達成度の表示

## 主な機能

### ホームページ機能（外部向け公開ページ）
> **参考**: [Qatari Virtual](https://www.qatarivirtual.xyz/) のサイト構造を参考に、実際のAeroMexicoのような航空会社サイトのデザインをイメージ

- **トップページ（Home）**
  - ヒーローセクション（大型背景画像、キャッチコピー）
  - Why Join Us? セクション
  - 主要機能ハイライト（Fleet, Ranks, Routes, Special Features, Codeshares）
  - 統計表示（リアルタイム更新）
  - Apply Today セクション

- **About ページ**
  - About Us（VAの歴史・理念・特徴）
  - Staff（運営チーム紹介）

- **Operations ページ**
  - Fleet（機材一覧・詳細）
  - Routes（ルート一覧・マップ）
  - Ranks（ランクシステム詳細）
  - Special Features（特別機能の説明）
  - Codeshares（提携VA情報）

- **Apply ページ**
  - 応募フォーム
  - 応募要件の確認
  - 応募後の流れ

### VA Center機能
- **フライト記録**
  - フライト情報の入力（出発地、目的地、機種、フライト時間など）
  - Infinite Flightのフライトログとの連携
  - フライト履歴の閲覧・編集・削除
  
- **統計ダッシュボード**
  - 総フライト時間
  - 総フライト数
  - 訪問空港数
  - 使用機種統計
  - 月次・年次統計
  
- **パイロットプロフィール**
  - 個人情報管理
  - ランク・称号システム
  - バッジ・実績表示
  
- **ランキング**
  - 総フライト時間ランキング
  - 月間フライト数ランキング
  - 訪問空港数ランキング

## 技術スタック（予定）

### フロントエンド
- React / Next.js
- TypeScript
- Tailwind CSS
- Chart.js / Recharts（統計グラフ用）

### バックエンド
- Node.js / Express または Next.js API Routes
- PostgreSQL / MongoDB（データベース）
- JWT認証

### その他
- Infinite Flight API（可能であれば）
- デプロイ: Vercel / Netlify

## プロジェクト構造

```
MXVA/
├── README.md
├── PROJECT_PLAN.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── app/                    # Next.js App Router
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── globals.css        # グローバルスタイル
│   ├── about/             # Aboutページ
│   │   ├── page.tsx
│   │   └── staff/
│   │       └── page.tsx
│   ├── operations/        # Operationsページ
│   │   ├── fleet/
│   │   ├── routes/
│   │   ├── ranks/
│   │   ├── special-features/
│   │   └── codeshares/
│   ├── apply/             # 応募ページ
│   │   └── page.tsx
│   └── crew-center/       # VA Center
│       └── page.tsx
├── components/            # 再利用可能なコンポーネント
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/                   # ユーティリティ関数
│   └── utils.ts
└── public/                # 静的ファイル
```

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Firebase プロジェクトのセットアップ

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「Authentication」を有効化
   - 「Sign-in method」タブで「Email/Password」を有効化
4. 「Project settings」→「General」タブで、Webアプリを追加
5. 表示される設定値を `.env.local` にコピー

#### 管理者テストユーザーの作成

管理者テストユーザーを作成するには、以下のいずれかの方法を使用できます：

**方法1: Firebase Consoleで直接作成（推奨）**
1. Firebase Console > Authentication > Users > Add user
2. Email: `admin@mxva.test`（任意のメールアドレス）
3. Password: `admin123456`（任意のパスワード、6文字以上）
4. 「Add」をクリック

**方法2: 登録ページを使用**
1. ブラウザで `http://localhost:3000/crew-center/register` にアクセス
2. メールアドレスとパスワードを入力して登録

**方法3: スクリプトを使用（Firebase Admin SDK設定が必要）**
```bash
node scripts/create-admin-user.js
```

**ログインできない場合の確認事項：**

1. **ユーザーがFirebaseに存在するか確認**
   - [Firebase Console](https://console.firebase.google.com/) にアクセス
   - Authentication > Users でユーザー一覧を確認
   - ログインしようとしているメールアドレスが存在するか確認

2. **Firebase Authentication設定を確認**
   - Authentication > Sign-in method を開く
   - 「Email/Password」が有効になっているか確認
   - 無効の場合は有効化する

3. **環境変数を確認**
   - `.env.local` ファイルが存在するか確認
   - すべてのFirebase環境変数が正しく設定されているか確認
   - 開発サーバーを再起動（環境変数の変更後は必須）

4. **ブラウザのコンソールを確認**
   - ブラウザの開発者ツール（F12）を開く
   - Consoleタブでエラーメッセージを確認
   - Firebase設定が読み込まれているか確認

5. **パスワードを確認**
   - パスワードが6文字以上か確認
   - 大文字・小文字・記号の区別を確認
   - パスワードリセットを試す

**admin@test.mxvaでログインする場合：**
- まず、Firebase Consoleでこのメールアドレスのユーザーを作成
- または、登録ページ（`/crew-center/register`）でアカウントを作成
- その後、`node scripts/assign-admin-role.js` でオーナー権限を付与

#### 管理者権限の設定

**admin@test.mxva にオーナー権限を付与する方法：**

1. Firebase Admin SDKを設定（上記参照）
2. スクリプトを実行：
```bash
node scripts/assign-admin-role.js
```

**権限レベル：**
- **Owner**: すべての権限（ユーザー管理、システム設定、管理者の追加/削除）
- **Admin**: ユーザー管理、応募管理、統計閲覧（管理者の追加/削除は不可）
- **User**: 通常のユーザー権限（自分のフライト記録、統計など）

**管理画面へのアクセス：**
- ログイン後、Crew Centerのサイドバーに「Admin Panel」が表示されます
- `/crew-center/admin` に直接アクセスすることもできます

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 4. ビルド

```bash
npm run build
npm start
```

## 開発コマンド

- `npm run dev` - 開発サーバーを起動（デフォルトポート: 3000）
- `npm run dev:clean` - キャッシュをクリアして開発サーバーを起動
- `npm run clean` - Next.jsのビルドキャッシュ（.next）を削除
- `npm run clean:all` - すべてのキャッシュを削除
- `npm run build` - 本番用ビルドを作成
- `npm start` - 本番サーバーを起動
- `npm run lint` - ESLintでコードをチェック

### トラブルシューティング

**ChunkLoadErrorが発生した場合：**
1. 開発サーバーを停止（Ctrl+C）
2. `npm run clean` を実行してキャッシュをクリア
3. `npm run dev` で開発サーバーを再起動

**特定のポートで起動する場合：**
```bash
PORT=3002 npm run dev
```

## 開発フェーズ

### Phase 1: 基礎構築
- [ ] プロジェクトセットアップ
- [ ] データベース設計
- [ ] 認証システム実装
- [ ] 基本的なUIコンポーネント作成

### Phase 2: ホームページ
- [ ] ランディングページ作成
- [ ] ニュース・お知らせ機能
- [ ] 統計情報表示
- [ ] レスポンシブデザイン対応

### Phase 3: VA Center - フライト記録
- [ ] フライト記録フォーム
- [ ] フライト履歴表示
- [ ] フライト編集・削除機能
- [ ] データ検証

### Phase 4: VA Center - 統計・分析
- [ ] ダッシュボード実装
- [ ] 統計グラフ表示
- [ ] ランキング機能
- [ ] フィルタリング・ソート機能

### Phase 5: 高度な機能
- [ ] パイロットランクシステム
- [ ] バッジ・実績システム
- [ ] 通知機能
- [ ] エクスポート機能（CSV/PDF）

### Phase 6: 最適化・デプロイ
- [ ] パフォーマンス最適化
- [ ] セキュリティ強化
- [ ] テスト作成
- [ ] 本番環境デプロイ

## データモデル（予定）

### ユーザー（パイロット）
- ID
- Infinite Flightユーザー名
- メールアドレス
- パスワード（ハッシュ化）
- ランク
- 登録日時

### フライト記録
- ID
- パイロットID
- 出発空港（ICAOコード）
- 到着空港（ICAOコード）
- 機種
- 出発日時
- 到着日時
- フライト時間
- 距離
- 備考

### 統計データ
- パイロットID
- 総フライト時間
- 総フライト数
- 訪問空港リスト
- 使用機種リスト
- 最終更新日時

## 今後の拡張案

- Infinite Flight APIとの自動連携
- マルチVA対応
- 管理者ダッシュボード
- モバイルアプリ
- ソーシャル機能（コメント、いいねなど）
- フライトプラン共有機能

## ライセンス

未定

## 貢献

プロジェクトへの貢献を歓迎します。詳細は後日追加予定です。

