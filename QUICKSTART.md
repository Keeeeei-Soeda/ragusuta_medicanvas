# 🚀 HealthConnect - クイックスタートガイド

## 📋 前提条件

- Node.js v18以上
- PostgreSQL v14以上

## ⚡ 5分で起動する方法

### 自動セットアップ（推奨）

```bash
# セットアップスクリプトを実行
chmod +x setup.sh
./setup.sh
```

### 手動セットアップ

#### 1. データベース作成

```bash
createdb healthconnect
```

#### 2. バックエンドのセットアップ

```bash
cd backend

# 環境変数ファイルを作成
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthconnect"
JWT_SECRET="your-secret-key-change-in-production-minimum-32-characters-required"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
EOF

# 依存関係をインストール
npm install

# Prismaのセットアップ
npx prisma generate
npx prisma migrate deploy
npm run db:seed:all
```

#### 3. フロントエンドのセットアップ

```bash
cd ../frontend

# 環境変数ファイルを作成
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# 依存関係をインストール
npm install
```

## ▶️ 起動

### ターミナル1: バックエンド

```bash
cd backend
npm run dev
```

**確認**: http://localhost:3001/health にアクセスして `{"status":"ok"}` が表示されればOK

### ターミナル2: フロントエンド

```bash
cd frontend
npm run dev
```

**確認**: http://localhost:3000 にアクセス

## 🎯 動作確認

### 1. ホーム画面

http://localhost:3000/home

- 5件の体験談が表示される

### 2. 統計画面

http://localhost:3000/stats

- 個人統計と部署ランキングが表示される

### 3. 管理画面

http://localhost:3000/admin

- 全社統計が表示される

### 4. 部署管理

http://localhost:3000/admin/departments

- 部署の追加・編集・削除ができる

## 👤 テストユーザー

開発モードでは認証がバイパスされるため、ログイン不要です。

本番環境用のテストユーザー:
- 法人コード: `TEST0001`
- 管理者: `admin001` / `password123`
- 一般: `emp001` / `password123`

## 🔍 データベース確認

```bash
cd backend
npx prisma studio
```

http://localhost:5555 でGUIが開きます

## 🐛 トラブルシューティング

### バックエンドが起動しない

```bash
# PostgreSQLが起動しているか確認
pg_isready

# 依存関係を再インストール
cd backend
rm -rf node_modules package-lock.json
npm install
```

### フロントエンドでAPIエラー

```bash
# バックエンドが起動しているか確認
curl http://localhost:3001/health

# 環境変数を確認
cat frontend/.env.local
```

### データが表示されない

```bash
# シードデータを再投入
cd backend
npm run db:seed:all
```

## 📚 詳細ガイド

- **TESTING.md**: 詳細なテスト手順
- **docs/DEVELOPMENT.md**: 開発環境の詳細
- **要件定義書_HealthConnect_v2.0.md**: 機能仕様

---

**問題が解決しない場合は、エラーメッセージと共にお知らせください！**

