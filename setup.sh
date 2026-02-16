#!/bin/bash

echo "🚀 HealthConnect - セットアップスクリプト"
echo "=========================================="
echo ""

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# エラーハンドリング
set -e

# 1. PostgreSQLの確認
echo "📌 Step 1: PostgreSQLの確認..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQLがインストールされていません${NC}"
    echo "PostgreSQLをインストールしてください: https://www.postgresql.org/download/"
    exit 1
fi

if ! pg_isready &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQLが起動していません${NC}"
    echo "PostgreSQLを起動してください"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL OK${NC}"
echo ""

# 2. データベースの作成
echo "📌 Step 2: データベースの作成..."
if psql -lqt | cut -d \| -f 1 | grep -qw healthconnect; then
    echo -e "${YELLOW}⚠️  データベース 'healthconnect' は既に存在します${NC}"
    read -p "データベースを再作成しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb healthconnect
        createdb healthconnect
        echo -e "${GREEN}✅ データベースを再作成しました${NC}"
    else
        echo -e "${YELLOW}⏭️  既存のデータベースを使用します${NC}"
    fi
else
    createdb healthconnect
    echo -e "${GREEN}✅ データベースを作成しました${NC}"
fi
echo ""

# 3. バックエンドのセットアップ
echo "📌 Step 3: バックエンドのセットアップ..."
cd backend

# 環境変数ファイルの作成
if [ ! -f .env ]; then
    echo "環境変数ファイルを作成します..."
    cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthconnect"
JWT_SECRET="your-secret-key-change-in-production-minimum-32-characters-required"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
GOOGLE_SHEETS_API_KEY=""
GOOGLE_SHEETS_SPREADSHEET_ID=""
EOF
    echo -e "${GREEN}✅ .env ファイルを作成しました${NC}"
    echo -e "${YELLOW}💡 PostgreSQLの接続情報を変更する場合は backend/.env を編集してください${NC}"
else
    echo -e "${YELLOW}⏭️  .env ファイルは既に存在します${NC}"
fi

# 依存関係のインストール
echo "依存関係をインストールします..."
npm install
echo -e "${GREEN}✅ 依存関係をインストールしました${NC}"

# Prismaクライアントの生成
echo "Prismaクライアントを生成します..."
npx prisma generate
echo -e "${GREEN}✅ Prismaクライアントを生成しました${NC}"

# マイグレーション
echo "データベースマイグレーションを実行します..."
npx prisma migrate deploy
echo -e "${GREEN}✅ マイグレーションを実行しました${NC}"

# シードデータの投入
echo "シードデータを投入します..."
npm run db:seed:all
echo -e "${GREEN}✅ シードデータを投入しました${NC}"

cd ..
echo ""

# 4. フロントエンドのセットアップ
echo "📌 Step 4: フロントエンドのセットアップ..."
cd frontend

# 環境変数ファイルの作成
if [ ! -f .env.local ]; then
    echo "環境変数ファイルを作成します..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo -e "${GREEN}✅ .env.local ファイルを作成しました${NC}"
else
    echo -e "${YELLOW}⏭️  .env.local ファイルは既に存在します${NC}"
fi

# 依存関係のインストール
echo "依存関係をインストールします..."
npm install
echo -e "${GREEN}✅ 依存関係をインストールしました${NC}"

cd ..
echo ""

# 5. 完了メッセージ
echo "=========================================="
echo -e "${GREEN}🎉 セットアップが完了しました！${NC}"
echo "=========================================="
echo ""
echo "📝 次のステップ:"
echo ""
echo "1. バックエンドを起動（ターミナル1）:"
echo "   cd backend && npm run dev"
echo ""
echo "2. フロントエンドを起動（ターミナル2）:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. ブラウザでアクセス:"
echo "   http://localhost:3000"
echo ""
echo "📊 テストユーザー:"
echo "   法人コード: TEST0001"
echo "   管理者: admin001 / password123"
echo "   一般: emp001 / password123"
echo ""
echo "🔍 Prisma Studio（データベースGUI）:"
echo "   cd backend && npx prisma studio"
echo ""
echo "📖 詳細なテストガイド:"
echo "   TESTING.md を参照してください"
echo ""



