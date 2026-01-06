# HealthConnect

法人向け健康プラットフォーム「HealthConnect」

メディキャンバス × ラグスタ 共同開発

## 📋 プロジェクト概要

HealthConnectは、従業員が健康に関する体験談を共有し、専門家による健康コンテンツにアクセスできるプラットフォームです。

### 主な機能

- ✅ **体験談機能**: 健康体験の共有・閲覧・検索
- ✅ **健康コンテンツ**: 動画・記事・PDFコンテンツの提供
- ✅ **統計機能**: 個人・部署・会社全体の健康データ可視化
- ✅ **マイページ**: プロフィール管理・投稿履歴・統計情報
- ✅ **お知らせ機能**: 重要な情報の配信
- ✅ **教室機能**: 運動教室の情報（Mock）
- ✅ **管理機能**: 管理者向けダッシュボード

## 🚀 クイックスタート

詳細なセットアップ手順は [QUICKSTART.md](./QUICKSTART.md) を参照してください。

### 前提条件

- Node.js v18以上
- PostgreSQL v14以上
- npm または yarn

### セットアップ

```bash
# 1. データベース作成
createdb healthconnect

# 2. バックエンドのセットアップ
cd backend
npm install
cp .env.example .env  # 環境変数を設定
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed:all

# 3. フロントエンドのセットアップ
cd ../frontend
npm install
cp .env.example .env.local  # 環境変数を設定

# 4. サーバー起動
# ターミナル1: バックエンド
cd backend && npm run dev

# ターミナル2: フロントエンド
cd frontend && npm run dev
```

### アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001
- Prisma Studio: `cd backend && npx prisma studio` → http://localhost:5555

## 📁 プロジェクト構成

```
lagsta_medicanvas/
├── backend/              # Express.js バックエンド
│   ├── src/
│   │   ├── routes/       # APIルート
│   │   ├── middlewares/  # 認証ミドルウェア
│   │   └── utils/        # ユーティリティ
│   └── prisma/           # Prismaスキーマ・シード
├── frontend/             # Next.js フロントエンド
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   └── lib/              # ユーティリティ・APIクライアント
├── docs/                 # ドキュメント
└── 要件定義書_HealthConnect_v2.0.md
```

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **React Query** - データフェッチング
- **Heroicons** - アイコン

### バックエンド
- **Express.js** - Webフレームワーク
- **TypeScript** - 型安全性
- **Prisma** - ORM
- **PostgreSQL** - データベース
- **JWT** - 認証
- **bcrypt** - パスワードハッシュ化
- **Zod** - バリデーション

## 📚 ドキュメント

- [要件定義書](./要件定義書_HealthConnect_v2.0.md) - システム全体の要件定義
- [QUICKSTART.md](./QUICKSTART.md) - クイックスタートガイド
- [TESTING.md](./TESTING.md) - テスト手順
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - 開発環境の詳細
- [docs/PROGRESS.md](./docs/PROGRESS.md) - 開発進捗状況
- [docs/USER_FEATURES_STATUS.md](./docs/USER_FEATURES_STATUS.md) - ユーザー向け機能の実装状況

## 🔐 開発モード

開発モードでは認証がバイパスされます。以下のヘッダーが自動的に送信されます：

- `x-dev-user-id`: 開発用ユーザーID
- `x-dev-company-id`: 開発用法人ID
- `x-dev-role`: ユーザーロール（EMPLOYEE, ADMIN, etc.）

## 📊 実装状況

### Phase 1: MVP（完了）
- ✅ 基盤構築（データベース、認証）
- ✅ 体験談機能
- ✅ 統計機能
- ✅ 管理機能
- ✅ 健康コンテンツ機能
- ✅ マイページ機能
- ✅ お知らせ機能
- ✅ 教室機能（Mock）

### Phase 2: 外部連携（未実装）
- ⏳ Google Sheets API連携
- ⏳ マッチングアルゴリズム
- ⏳ 会社間比較機能

### Phase 3: コンテンツ機能（一部実装）
- ✅ 健康コンテンツ閲覧
- ⏳ ラグスタ向け管理画面

## 🧪 テストデータ

シードデータで以下のテストデータが作成されます：

- **法人**: テスト株式会社（コード: TEST0001）
- **部署**: 営業部、総務部、開発部
- **ユーザー**: 
  - 管理者: ADMIN001 / Admin123!
  - 従業員: EMP001 / User123!
- **体験談**: 5件
- **健康コンテンツ**: 11件（動画4、記事4、PDF3）
- **ActivityLog**: 各ユーザーに10-40件

## 📝 ライセンス

このプロジェクトはメディキャンバス × ラグスタの共同開発プロジェクトです。

## 👥 開発者向け情報

### コマンド一覧

**バックエンド**
```bash
npm run dev          # 開発サーバー起動
npm run build        # ビルド
npm run db:migrate   # マイグレーション実行
npm run db:seed:all  # シードデータ投入
npm run db:studio    # Prisma Studio起動
```

**フロントエンド**
```bash
npm run dev          # 開発サーバー起動
npm run build        # ビルド
npm run start        # 本番サーバー起動
```

---

**詳細な情報は各ドキュメントを参照してください。**
