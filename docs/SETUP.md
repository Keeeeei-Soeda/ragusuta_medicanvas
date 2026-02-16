# セットアップガイド

## 📋 必要な環境

- Node.js 20以上
- PostgreSQL 15以上
- npm または yarn

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd health-connect
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリ
npm install

# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

### 3. PostgreSQLのセットアップ

```bash
# PostgreSQLがインストールされていない場合
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# データベースを作成
createdb healthconnect
```

### 4. 環境変数の設定

#### バックエンド

```bash
cd backend
cp .env.example .env
```

`.env` ファイルを編集：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthconnect"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

#### フロントエンド

```bash
cd frontend
cp .env.local.example .env.local
```

`.env.local` ファイルを編集：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. データベースのセットアップ

```bash
cd backend

# Prismaクライアントの生成
npm run db:generate

# マイグレーションの実行
npm run db:migrate

# シードデータの投入
npm run db:seed

# 体験談のMockデータを投入
npm run db:seed:experiences
```

### 6. 開発サーバーの起動

#### ターミナル1: バックエンド

```bash
cd backend
npm run dev
```

バックエンドが http://localhost:3001 で起動します。

#### ターミナル2: フロントエンド

```bash
cd frontend
npm run dev
```

フロントエンドが http://localhost:3000 で起動します。

### 7. アクセス確認

ブラウザで http://localhost:3000 にアクセス

## 📊 テストアカウント

シードデータで以下のアカウントが作成されます：

### 管理者アカウント
- **法人コード**: TEST0001
- **社員番号**: ADMIN001
- **パスワード**: Admin123!

### 従業員アカウント
- **法人コード**: TEST0001
- **社員番号**: EMP001
- **パスワード**: User123!

## 🎨 開発モード

現在、開発モードでは認証をスキップしています。
ログイン画面を経由せずに直接 http://localhost:3000/home にアクセスできます。

## 🔧 便利なコマンド

### データベース操作

```bash
# Prisma Studio（GUI）を起動
cd backend
npm run db:studio

# マイグレーションをリセット（開発環境のみ）
npx prisma migrate reset

# スキーマからマイグレーションを作成
npx prisma migrate dev --name migration_name
```

### 開発

```bash
# バックエンドのみ起動
cd backend
npm run dev

# フロントエンドのみ起動
cd frontend
npm run dev

# 両方を同時に起動（ルートディレクトリから）
npm run dev
```

### ビルド

```bash
# バックエンドのビルド
cd backend
npm run build

# フロントエンドのビルド
cd frontend
npm run build
```

## 🐛 トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
pg_isready

# データベースが存在するか確認
psql -l | grep healthconnect

# データベースを再作成
dropdb healthconnect
createdb healthconnect
cd backend
npm run db:migrate
npm run db:seed
```

### Prismaエラー

```bash
# Prismaクライアントを再生成
cd backend
npm run db:generate

# マイグレーションを再実行
npm run db:migrate
```

### ポート競合

バックエンドのポートを変更：
```bash
cd backend
PORT=3002 npm run dev
```

フロントエンドの環境変数も更新：
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### node_modulesの問題

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📚 次のステップ

- [開発ガイド](DEVELOPMENT.md) を確認
- [進捗管理](PROGRESS.md) を確認
- [要件定義書](../要件定義書_HealthConnect_v2.0.md) を確認

## 💡 ヒント

- 開発中は http://localhost:3001/health でバックエンドのヘルスチェックができます
- Prisma Studioで簡単にデータベースを確認・編集できます
- フロントエンドはホットリロードに対応しています






