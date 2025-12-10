# MXVA プロジェクト詳細計画書

## 1. プロジェクト概要

### 1.1 目的
Infinite Flightコミュニティ向けの仮想航空会社（VA）管理プラットフォームを構築し、パイロットがフライトを記録・管理できるVA Centerを提供する。

### 1.2 ターゲットユーザー
- Infinite Flightでフライトシミュレーションを楽しむパイロット
- VAを運営する管理者
- フライト統計を管理したい個人パイロット

## 2. 機能要件

### 2.1 ホームページ機能（外部向け公開ページ）

> **参考**: [Qatari Virtual](https://www.qatarivirtual.xyz/) のサイト構造を参考に、実際のAeroMexicoのような航空会社サイトのデザインをイメージ

#### 2.1.1 トップページ（Home）

**ヘッダー（全ページ共通）**
- VAロゴ（左上）
- メインナビゲーションメニュー
  - Home
  - About（ドロップダウン: About Us, Staff）
  - Operations（ドロップダウン: Fleet, Routes, Ranks, Special Features, Codeshares）
  - Crew Center（ログイン済みユーザー向け）
  - Apply（応募ページ）
- ログイン/登録ボタン（右上）
- 言語切り替え（オプション）

**ヒーローセクション**
- 大型背景画像（航空機・空港の美しい写真）
- VAのキャッチコピー（例: "The Home of Excellence" / "YOUR JOURNEY STARTS HERE"）
- 主要CTAボタン
  - "Join Us" / "Apply Today"（応募ページへ）
  - "Crew Center"（ログインページへ）
- スクロールインジケーター

**Why Join Us? セクション**
- 3-4つのカード形式でVAの魅力を紹介
  - サポートのあるコミュニティ
  - スキル向上の機会
  - 広大なルートネットワーク
  - トレーニングプログラム

**主要機能ハイライトセクション**
- **Fleet（機材）**
  - 機材の多様性を強調（小型から大型まで）
  - 機種数（例: "9 types of aircraft"）
  - 短距離・長距離フライト対応
  - 主要機種の画像ギャラリー
  - "View Fleet" リンク

- **Ranks（ランク）**
  - ランクシステムの説明
  - スキル・献身・成功したフライトで昇進
  - ランク一覧の概要表示
  - "View Ranks" リンク

- **Routes（ルート）**
  - 広大なルートネットワーク
  - 人気ルートのハイライト
  - 世界地図でのルート可視化
  - "View Routes" リンク

- **Special Features（特別機能）**
  - 独自機能の紹介
    - Community Cargo System（コミュニティ貨物システム）
    - Amiri Royal Flights（特別フライト）
    - その他のユニークな機能
  - "Learn More" リンク

- **Codeshares（コードシェア）**
  - 提携VAの紹介
  - 拡大を続けるコードシェアネットワーク
  - 世界中を探索できる機会
  - 提携VAのロゴ表示
  - "View Codeshares" リンク

**統計表示セクション**
- 4つの統計カード（リアルタイム更新）
  - 総パイロット数
  - 総フライト数
  - 総フライト時間
  - アクティブパイロット数
- アニメーション効果（数字のカウントアップ）

**Apply Today セクション**
- 応募要件の明記
  - 13歳以上
  - 英語でのコミュニケーション可能
  - Infinite Flight Grade 3以上
  - Discordアカウント所持
  - Infinite Flight Communityアカウント所持
  - IFVARBブラックリストに載っていない
- 目立つCTAボタン（"Apply Today"）

**フッター**
- リンク集
  - About
  - Operations
  - Crew Center
  - Apply
  - 利用規約
  - プライバシーポリシー
- ソーシャルメディアリンク
  - Instagram
  - Infinite Flight Community
  - YouTube
  - Discord
- お問い合わせ情報
  - IFCアカウント経由
  - エグゼクティブチームへのDM
- 免責事項
  - 実在の航空会社との非関連性
  - IFVARB規制下での運営

#### 2.1.2 About ページ

**About Us サブページ**
- VAの歴史・設立背景
- ミッション・ビジョン・価値観
- VAの特徴・強み
- 運営理念
- コミュニティへの貢献
- タイムライン（マイルストーン）

**Staff サブページ**
- 運営チームの紹介
- スタッフメンバーのプロフィール
  - 役職
  - Infinite Flightでの経験
  - 写真・アバター
  - 自己紹介
- 組織図
- 連絡先情報

#### 2.1.3 Operations ページ

**Fleet サブページ**
- 機材一覧（グリッド表示）
  - 機種名
  - 機種画像
  - 座席数
  - 航続距離
  - 巡航速度
  - 用途（短距離/中距離/長距離）
- 機種別詳細ページ
- フィルタリング機能（機種タイプ、用途）

**Routes サブページ**
- ルート一覧表示
  - 出発地 - 到着地
  - 距離
  - 推定飛行時間
  - 使用機種推奨
- ルートマップ（インタラクティブ地図）
- 人気ルートランキング
- ルート検索機能
- 地域別フィルタ

**Ranks サブページ**
- ランクシステムの詳細説明
- 全ランク一覧
  - ランク名
  - 必要フライト時間
  - 必要フライト数
  - 特典・権限
  - バッジ・アイコン
- ランクアップの条件
- ランク別統計（各ランクのパイロット数）

**Special Features サブページ**
- 各特別機能の詳細説明
  - Community Cargo System
    - システムの仕組み
    - 参加方法
    - 報酬・特典
  - Amiri Royal Flights
    - 特別フライトの説明
    - 参加条件
    - スケジュール
- その他のユニークな機能
- 機能別の画像・スクリーンショット

**Codeshares サブページ**
- 提携VA一覧
  - VA名・ロゴ
  - 提携内容
  - 提携開始日
- コードシェアのメリット
- 提携VAのルート情報
- 提携申請情報（他のVA向け）

#### 2.1.4 Apply ページ（応募ページ）

**応募フォーム**
- 個人情報
  - Infinite Flightユーザー名
  - メールアドレス
  - Discordユーザー名
  - Infinite Flight Communityユーザー名
- Infinite Flight情報
  - Grade（グレード）
  - 総フライト時間（オプション）
  - 経験年数（オプション）
- その他
  - 年齢確認
  - 英語コミュニケーション能力
  - IFVARBブラックリスト確認
  - 応募動機（テキストエリア）
- 利用規約・プライバシーポリシーへの同意チェックボックス
- 送信ボタン

**応募要件の再確認**
- 要件チェックリスト
- よくある質問（FAQ）

**応募後の流れ**
- 審査プロセスの説明
- 審査期間の目安
- 連絡方法

#### 2.1.5 その他のページ

**ニュース・お知らせページ**（オプション）
- 最新ニュース一覧（ページネーション）
- ニュース詳細ページ
- カテゴリフィルタ（お知らせ、イベント、アップデートなど）
- 検索機能
- 日付ソート

**統計ページ**（オプション）
- 全体統計グラフ
  - フライト数推移（時系列）
  - 人気機種ランキング
  - 人気ルートランキング
  - アクティビティマップ（訪問空港の可視化）
- パブリック統計の表示

### 2.2 VA Center機能

#### 2.2.1 認証システム
- **ユーザー登録**
  - Infinite Flightユーザー名
  - メールアドレス
  - パスワード（強度チェック）
  - 利用規約同意
  
- **ログイン**
  - メール/ユーザー名 + パスワード
  - 「ログイン状態を保持」オプション
  - パスワードリセット機能
  
- **セッション管理**
  - JWTトークンベース認証
  - 自動ログアウト（一定時間無操作）

#### 2.2.2 ダッシュボード
- **概要カード**
  - 総フライト時間
  - 総フライト数
  - 今月のフライト数
  - 訪問空港数
  - 現在のランク
  
- **最近のフライト**
  - 直近5件のフライト記録
  - クイックアクション（編集・削除）
  
- **統計グラフ**
  - 月次フライト数推移
  - 機種別使用率
  - フライト時間分布

#### 2.2.3 フライト記録機能

**フライト入力フォーム**
- 必須項目
  - 出発空港（ICAOコード、自動補完）
  - 到着空港（ICAOコード、自動補完）
  - 機種（選択式、検索可能）
  - 出発日時（日時ピッカー）
  - 到着日時（日時ピッカー）
  - フライト時間（自動計算可能）
  
- オプション項目
  - 距離（自動計算可能）
  - フライト番号
  - 備考・メモ
  - スクリーンショット（画像アップロード）
  - Infinite FlightフライトID（連携用）

**フライト履歴**
- リスト表示
  - テーブル形式（ソート可能）
  - カード形式（切り替え可能）
  - フィルタリング（日付範囲、機種、空港）
  - 検索機能
  
- フライト詳細
  - 全情報表示
  - 編集・削除ボタン
  - 統計への影響表示

**一括操作**
- CSVインポート（既存データ移行用）
- CSVエクスポート
- 一括削除（選択したフライト）

#### 2.2.4 統計・分析機能

**個人統計**
- 総フライト時間（時間・分表示）
- 総フライト数
- 平均フライト時間
- 最長フライト
- 最短フライト
- 訪問空港数
- 使用機種数
- 総飛行距離

**時系列統計**
- 日次・週次・月次・年次切り替え
- フライト数推移グラフ
- フライト時間推移グラフ
- 距離推移グラフ

**機種統計**
- 機種別フライト数
- 機種別使用時間
- 機種別平均フライト時間
- 機種別人気ルート

**空港統計**
- 訪問空港マップ（地図表示）
- 出発空港ランキング
- 到着空港ランキング
- ルート統計（出発-到着ペア）

#### 2.2.5 ランキング機能

**全体ランキング**
- 総フライト時間ランキング
- 総フライト数ランキング
- 月間フライト数ランキング
- 訪問空港数ランキング
- 総飛行距離ランキング

**ランキング表示**
- トップ10/50/100切り替え
- 自分の順位ハイライト
- パイロットプロフィールへのリンク
- 期間フィルタ（全期間・月間・年間）

#### 2.2.6 プロフィール機能

**プロフィール表示**
- Infinite Flightユーザー名
- 登録日
- ランク・称号
- 獲得バッジ
- 統計サマリー
- 最近のフライト

**プロフィール編集**
- 表示名変更
- アバター画像アップロード
- 自己紹介文
- プライバシー設定

#### 2.2.7 ランク・バッジシステム

**ランクシステム**
- フライト時間に基づく自動ランクアップ
  - 初心者（0-10時間）
  - 初級パイロット（10-50時間）
  - 中級パイロット（50-200時間）
  - 上級パイロット（200-500時間）
  - エキスパート（500-1000時間）
  - マスター（1000時間以上）

**バッジシステム**
- フライト数バッジ（10回、50回、100回など）
- 距離バッジ（10,000km、50,000kmなど）
- 機種バッジ（特定機種でのフライト）
- 特別バッジ（イベント参加など）

## 3. 技術仕様

### 3.1 フロントエンド

**フレームワーク**: Next.js 14+ (App Router)
- 理由: SSR/SSG対応、API Routes統合、優れたパフォーマンス

**言語**: TypeScript
- 型安全性の確保

**スタイリング**: Tailwind CSS
- 高速開発、カスタマイズ性

**UIコンポーネント**: 
- shadcn/ui または Radix UI
- アクセシビリティ重視

**状態管理**: 
- React Context API（認証状態）
- React Query（サーバー状態管理）

**グラフ・可視化**:
- Recharts（統計グラフ）
- Leaflet / Mapbox（空港マップ）

**フォーム管理**:
- React Hook Form
- Zod（バリデーション）

### 3.2 バックエンド

**API**: Next.js API Routes
- フロントエンドと統合、シンプルな構成

**データベース**: PostgreSQL
- リレーショナルデータ、ACID準拠

**ORM**: Prisma
- 型安全なデータベースアクセス

**認証**: NextAuth.js
- JWT、セッション管理

**ファイルストレージ**: 
- Cloudinary または AWS S3（画像アップロード用）

### 3.3 インフラ

**ホスティング**: Vercel
- Next.jsに最適化、自動デプロイ

**データベース**: 
- Vercel Postgres または Supabase

**CDN**: Vercel Edge Network

## 4. データベース設計

### 4.1 テーブル構造

**users（ユーザー）**
```sql
- id: UUID (Primary Key)
- infinite_flight_username: VARCHAR(50) (Unique)
- email: VARCHAR(255) (Unique)
- password_hash: VARCHAR(255)
- display_name: VARCHAR(100)
- avatar_url: VARCHAR(500)
- rank: VARCHAR(50)
- bio: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_login_at: TIMESTAMP
```

**flights（フライト記録）**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- departure_airport: VARCHAR(4) (ICAO)
- arrival_airport: VARCHAR(4) (ICAO)
- aircraft: VARCHAR(100)
- departure_time: TIMESTAMP
- arrival_time: TIMESTAMP
- flight_time_minutes: INTEGER
- distance_km: DECIMAL(10,2)
- flight_number: VARCHAR(20)
- notes: TEXT
- screenshot_url: VARCHAR(500)
- infinite_flight_id: VARCHAR(100)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**user_statistics（ユーザー統計）**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id, Unique)
- total_flight_time_minutes: INTEGER
- total_flights: INTEGER
- total_distance_km: DECIMAL(12,2)
- visited_airports: JSONB (空港コードの配列)
- aircraft_types: JSONB (機種の配列)
- last_flight_date: DATE
- updated_at: TIMESTAMP
```

**badges（バッジ）**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- badge_type: VARCHAR(50)
- badge_name: VARCHAR(100)
- earned_at: TIMESTAMP
```

**news（ニュース）**
```sql
- id: UUID (Primary Key)
- title: VARCHAR(200)
- content: TEXT
- author_id: UUID (Foreign Key -> users.id)
- category: VARCHAR(50)
- published_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**fleet（機材）**
```sql
- id: UUID (Primary Key)
- aircraft_name: VARCHAR(100)
- aircraft_type: VARCHAR(50)
- manufacturer: VARCHAR(100)
- seats: INTEGER
- range_km: DECIMAL(10,2)
- cruise_speed_kmh: INTEGER
- image_url: VARCHAR(500)
- description: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**routes（ルート）**
```sql
- id: UUID (Primary Key)
- departure_airport: VARCHAR(4) (ICAO)
- arrival_airport: VARCHAR(4) (ICAO)
- distance_km: DECIMAL(10,2)
- estimated_flight_time_minutes: INTEGER
- recommended_aircraft: VARCHAR(100)
- route_type: VARCHAR(50) (domestic/international)
- is_active: BOOLEAN
- popularity_score: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**staff（スタッフ）**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id, Unique)
- position: VARCHAR(100)
- department: VARCHAR(50)
- bio: TEXT
- photo_url: VARCHAR(500)
- display_order: INTEGER
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**ranks（ランク）**
```sql
- id: UUID (Primary Key)
- rank_name: VARCHAR(100)
- rank_level: INTEGER
- required_flight_time_minutes: INTEGER
- required_flights: INTEGER
- badge_url: VARCHAR(500)
- description: TEXT
- privileges: JSONB
- display_order: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**codeshares（コードシェア）**
```sql
- id: UUID (Primary Key)
- va_name: VARCHAR(100)
- va_logo_url: VARCHAR(500)
- partnership_type: VARCHAR(50)
- description: TEXT
- website_url: VARCHAR(500)
- is_active: BOOLEAN
- display_order: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**applications（応募）**
```sql
- id: UUID (Primary Key)
- infinite_flight_username: VARCHAR(50)
- email: VARCHAR(255)
- discord_username: VARCHAR(100)
- ifc_username: VARCHAR(100)
- grade: INTEGER
- total_flight_time: INTEGER
- years_of_experience: INTEGER
- motivation: TEXT
- status: VARCHAR(50) (pending/approved/rejected)
- reviewed_by: UUID (Foreign Key -> users.id)
- reviewed_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 4.2 インデックス
- users.email (Unique Index)
- users.infinite_flight_username (Unique Index)
- flights.user_id (Index)
- flights.departure_time (Index)
- user_statistics.user_id (Unique Index)
- fleet.is_active (Index)
- routes.is_active (Index)
- routes.departure_airport (Index)
- routes.arrival_airport (Index)
- staff.is_active (Index)
- staff.display_order (Index)
- ranks.rank_level (Index)
- codeshares.is_active (Index)
- applications.status (Index)
- applications.email (Index)

## 5. API設計

### 5.1 認証エンドポイント
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `POST /api/auth/refresh` - トークンリフレッシュ
- `POST /api/auth/reset-password` - パスワードリセット

### 5.2 フライトエンドポイント
- `GET /api/flights` - フライト一覧取得（ページネーション、フィルタ）
- `GET /api/flights/:id` - フライト詳細取得
- `POST /api/flights` - フライト作成
- `PUT /api/flights/:id` - フライト更新
- `DELETE /api/flights/:id` - フライト削除
- `POST /api/flights/import` - CSVインポート
- `GET /api/flights/export` - CSVエクスポート

### 5.3 統計エンドポイント
- `GET /api/statistics/user/:userId` - ユーザー統計取得
- `GET /api/statistics/global` - 全体統計取得
- `GET /api/statistics/rankings` - ランキング取得

### 5.4 ユーザーエンドポイント
- `GET /api/users/:id` - ユーザー情報取得
- `PUT /api/users/:id` - ユーザー情報更新
- `GET /api/users/:id/flights` - ユーザーのフライト一覧

### 5.5 Operations エンドポイント（公開API）
- `GET /api/fleet` - 機材一覧取得
- `GET /api/fleet/:id` - 機材詳細取得
- `GET /api/routes` - ルート一覧取得（フィルタ・検索対応）
- `GET /api/routes/:id` - ルート詳細取得
- `GET /api/routes/popular` - 人気ルート取得
- `GET /api/ranks` - ランク一覧取得
- `GET /api/ranks/:id` - ランク詳細取得
- `GET /api/codeshares` - コードシェア一覧取得
- `GET /api/staff` - スタッフ一覧取得
- `GET /api/staff/:id` - スタッフ詳細取得

### 5.6 応募エンドポイント
- `POST /api/applications` - 応募フォーム送信
- `GET /api/applications/:id` - 応募状況確認（認証必要）
- `GET /api/applications/status/:email` - メールアドレスで応募状況確認

### 5.7 統計エンドポイント（公開）
- `GET /api/statistics/public` - 公開統計情報取得（総パイロット数、総フライト数など）

## 6. UI/UX設計

> **デザイン参考**: 実際のAeroMexicoのような航空会社サイトのデザインをイメージ

### 6.1 デザイン原則
- **プロフェッショナルで洗練された**: 実際の航空会社サイトのような高品質なデザイン
- **視覚的に魅力的**: 大型の美しい航空機・空港の画像を活用
- **モダンでクリーン**: ミニマルなデザイン、適切な余白
- **直感的なナビゲーション**: 明確なメニュー構造、ドロップダウンメニュー
- **レスポンシブ**: モバイル・タブレット・デスクトップ完全対応
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **パフォーマンス**: 高速読み込み、スムーズなアニメーション、画像最適化

### 6.2 カラースキーム
- **プライマリ**: 航空会社らしい青系（例: #0066CC, #003366）
  - 信頼感・プロフェッショナル感を演出
- **セカンダリ**: 白・ライトグレー
  - クリーンで読みやすい背景
- **アクセント**: オレンジ・黄色（例: #FF6600, #FFB800）
  - CTAボタン、強調表示に使用
- **テキスト**: ダークグレー・黒（#333333, #000000）
  - 読みやすさを重視
- **ダークモード**: オプション対応（将来実装）

### 6.3 タイポグラフィ
- **見出し**: 太字、大きなサイズ（Montserrat, Inter, またはカスタムフォント）
- **本文**: 読みやすいサンセリフフォント（16px以上）
- **階層構造**: 明確なフォントサイズの階層（H1-H6）

### 6.4 主要ページレイアウト

**ホームページ（外部向け）**
- **ヘッダー**
  - 固定ヘッダー（スクロール時も表示）
  - ロゴ（左上）
  - メインナビゲーション（中央）
    - Home
    - About（ドロップダウン）
    - Operations（ドロップダウン）
    - Crew Center
    - Apply
  - ログイン/登録ボタン（右上）
  - モバイル: ハンバーガーメニュー

- **ヒーローセクション**
  - 全幅の大型背景画像（航空機・空港）
  - オーバーレイ（半透明のダークレイヤー）
  - 中央配置のテキスト・CTAボタン
  - 高さ: 100vh（ビューポート高さ）

- **コンテンツセクション**
  - セクションごとに明確に区切られたレイアウト
  - カード形式のコンテンツ表示
  - グリッドレイアウト（3-4カラム）
  - 画像とテキストのバランス

- **フッター**
  - ダーク背景
  - リンク集（グリッド表示）
  - ソーシャルメディアアイコン
  - 免責事項・コピーライト

**About / Operations ページ**
- サイドバー（サブナビゲーション、オプション）
- メインコンテンツエリア
- 画像ギャラリー
- タブ切り替え（Operations内の各サブページ）

**Apply ページ**
- 中央配置のフォーム
- ステップインジケーター（マルチステップの場合）
- 応募要件のチェックリスト
- フォームバリデーション（リアルタイム）

**VA Center（ログイン後）**
- **ヘッダー**
  - VAロゴ
  - ユーザー情報（アバター、名前、ランク）
  - 通知アイコン
  - ログアウトボタン

- **サイドバーナビゲーション**
  - 折りたたみ可能（モバイル対応）
  - メニュー項目
    - Dashboard
    - Flight Log
    - Statistics
    - Rankings
    - Profile
    - Settings
  - アクティブ状態の視覚的表示

- **メインコンテンツエリア**
  - カード形式のダッシュボード
  - データテーブル
  - グラフ・チャート
  - フォーム

### 6.5 コンポーネントデザイン

**ボタン**
- プライマリボタン: 青背景、白文字、ホバー効果
- セカンダリボタン: 白背景、青文字、ボーダー
- CTAボタン: アクセントカラー、大きく目立つ

**カード**
- 白背景、影付き
- ホバー時のエレベーション効果
- 角丸（border-radius: 8-12px）

**フォーム**
- 明確なラベル
- プレースホルダーテキスト
- エラーメッセージ（赤色）
- 成功メッセージ（緑色）
- 入力中のリアルタイムバリデーション

**統計カード**
- 大きな数字表示
- アイコン
- 説明テキスト
- アニメーション（カウントアップ）

### 6.6 画像・メディア
- **ヒーロー画像**: 高解像度、最適化済み
- **機材画像**: 統一されたサイズ、ホバー効果
- **アバター**: 円形、デフォルト画像あり
- **アイコン**: SVG形式、一貫したスタイル

### 6.7 アニメーション・トランジション
- スムーズなスクロール
- フェードイン効果（セクション表示時）
- ホバー時のトランジション
- ローディングアニメーション
- 数字のカウントアップアニメーション

## 7. セキュリティ

### 7.1 認証・認可
- パスワードハッシュ化（bcrypt）
- JWTトークン（短期・長期）
- CSRF対策
- レート制限

### 7.2 データ保護
- SQLインジェクション対策（Prisma ORM使用）
- XSS対策（入力サニタイゼーション）
- HTTPS必須
- 環境変数で機密情報管理

### 7.3 プライバシー
- ユーザーデータの暗号化
- GDPR準拠（必要に応じて）
- プライバシー設定機能

## 8. パフォーマンス最適化

### 8.1 フロントエンド
- 画像最適化（Next.js Image）
- コード分割（動的インポート）
- キャッシング戦略
- 遅延読み込み

### 8.2 バックエンド
- データベースクエリ最適化
- インデックス活用
- APIレスポンスキャッシング
- ページネーション

## 9. テスト戦略

### 9.1 ユニットテスト
- Jest + React Testing Library
- コンポーネントテスト
- ユーティリティ関数テスト

### 9.2 統合テスト
- APIエンドポイントテスト
- データベース操作テスト

### 9.3 E2Eテスト
- Playwright または Cypress
- 主要ユーザーフローテスト

## 10. 開発スケジュール（目安）

### Week 1-2: プロジェクトセットアップ
- 開発環境構築
- データベース設計・構築
- 認証システム実装

### Week 3-4: ホームページ（外部向け）
- トップページ（ヒーローセクション、主要機能ハイライト）
- About ページ（About Us, Staff）
- Operations ページ（Fleet, Routes, Ranks, Special Features, Codeshares）
- Apply ページ（応募フォーム）
- レスポンシブデザイン対応
- 画像最適化・アニメーション実装

### Week 5-6: VA Center - 基本機能
- ダッシュボード
- フライト記録機能
- フライト履歴

### Week 7-8: VA Center - 統計・分析
- 統計グラフ
- ランキング機能
- プロフィール機能

### Week 9-10: 高度な機能
- ランク・バッジシステム
- 最適化・バグ修正

### Week 11-12: テスト・デプロイ
- テスト作成・実行
- セキュリティ監査
- 本番環境デプロイ

## 11. 今後の拡張案

### Phase 2機能
- Infinite Flight API連携（自動フライト記録）
- マルチVA対応（複数VAの管理）
- 管理者ダッシュボード
- リアルタイム通知システム

### Phase 3機能
- モバイルアプリ（React Native）
- ソーシャル機能（コメント、いいね、フォロー）
- フライトプラン共有
- コミュニティフォーラム

## 12. 参考リソース

- Infinite Flight公式サイト
- 既存VAプラットフォームの調査
- 航空業界のUI/UXデザイン参考

---

**最終更新**: 2024年
**バージョン**: 1.0

