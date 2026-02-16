#!/bin/bash

# HealthConnect - デプロイスクリプト
# 使用方法: ./deploy.sh [server-ip] [username]

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# デフォルト値
SERVER_IP="${1:-162.43.8.168}"
USERNAME="${2:-root}"
APP_DIR="/var/www/healthconnect"

echo -e "${BLUE}🚀 HealthConnect - デプロイスクリプト${NC}"
echo "=========================================="
echo -e "サーバー: ${YELLOW}${USERNAME}@${SERVER_IP}${NC}"
echo -e "アプリケーションディレクトリ: ${YELLOW}${APP_DIR}${NC}"
echo ""

# 1. 接続確認
echo -e "${BLUE}📌 Step 1: サーバー接続確認...${NC}"
if ! ssh -o ConnectTimeout=5 "${USERNAME}@${SERVER_IP}" "echo '接続成功'" 2>/dev/null; then
    echo -e "${RED}❌ サーバーに接続できません${NC}"
    echo "SSH接続を確認してください: ssh ${USERNAME}@${SERVER_IP}"
    exit 1
fi
echo -e "${GREEN}✅ サーバー接続OK${NC}"
echo ""

# 2. アーカイブの作成
echo -e "${BLUE}📌 Step 2: アーカイブの作成...${NC}"
ARCHIVE_NAME="healthconnect-$(date +%Y%m%d-%H%M%S).tar.gz"
cd "$(dirname "$0")"
tar -czf "/tmp/${ARCHIVE_NAME}" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='*.tar.gz' \
    .
echo -e "${GREEN}✅ アーカイブ作成完了: ${ARCHIVE_NAME}${NC}"
echo ""

# 3. サーバーへのアップロード
echo -e "${BLUE}📌 Step 3: サーバーへのアップロード...${NC}"
scp "/tmp/${ARCHIVE_NAME}" "${USERNAME}@${SERVER_IP}:/tmp/"
echo -e "${GREEN}✅ アップロード完了${NC}"
echo ""

# 4. サーバー側での展開とセットアップ
echo -e "${BLUE}📌 Step 4: サーバー側でのセットアップ...${NC}"
ssh "${USERNAME}@${SERVER_IP}" << EOF
set -e

# アプリケーションディレクトリの作成
sudo mkdir -p ${APP_DIR}
sudo chown \$USER:\$USER ${APP_DIR}

# バックアップ（既存の場合）
if [ -d "${APP_DIR}/backend" ]; then
    echo "既存のアプリケーションをバックアップ中..."
    sudo cp -r ${APP_DIR} ${APP_DIR}.backup.\$(date +%Y%m%d-%H%M%S)
fi

# アーカイブの展開
cd ${APP_DIR}
tar -xzf /tmp/${ARCHIVE_NAME}
rm /tmp/${ARCHIVE_NAME}

# バックエンドのセットアップ
if [ -d "backend" ]; then
    echo "バックエンドのセットアップ中..."
    cd backend
    
    # .envファイルが存在しない場合のみ作成
    if [ ! -f .env ]; then
        echo "環境変数ファイルを作成中..."
        cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://healthconnect_user:CHANGE_THIS_PASSWORD@localhost:5432/healthconnect"
JWT_SECRET="CHANGE_THIS_TO_SECURE_RANDOM_STRING_MINIMUM_32_CHARACTERS"
PORT=3001
NODE_ENV=production
FRONTEND_URL="http://${SERVER_IP}:3000"
REDIS_URL="redis://localhost:6379"
GOOGLE_SHEETS_API_KEY=""
GOOGLE_SHEETS_SPREADSHEET_ID=""
ENVEOF
        echo "⚠️  .envファイルを作成しました。必ず設定を確認・変更してください！"
    fi
    
    # 依存関係のインストール
    npm install --production
    
    # Prismaクライアントの生成
    npx prisma generate
    
    # ビルド
    npm run build
    
    cd ..
fi

# フロントエンドのセットアップ
if [ -d "frontend" ]; then
    echo "フロントエンドのセットアップ中..."
    cd frontend
    
    # .env.localファイルが存在しない場合のみ作成
    if [ ! -f .env.local ]; then
        echo "環境変数ファイルを作成中..."
        echo "NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3001" > .env.local
        echo "⚠️  .env.localファイルを作成しました。必要に応じて変更してください！"
    fi
    
    # 依存関係のインストール
    npm install --production
    
    # ビルド
    npm run build
    
    cd ..
fi

echo "✅ セットアップ完了"
EOF

echo -e "${GREEN}✅ サーバー側セットアップ完了${NC}"
echo ""

# 5. ローカルの一時ファイルを削除
rm "/tmp/${ARCHIVE_NAME}"

# 6. 次のステップの表示
echo "=========================================="
echo -e "${GREEN}🎉 デプロイが完了しました！${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}📝 次のステップ:${NC}"
echo ""
echo "1. サーバーに接続:"
echo "   ssh ${USERNAME}@${SERVER_IP}"
echo ""
echo "2. データベースのセットアップ:"
echo "   cd ${APP_DIR}/backend"
echo "   # .envファイルを編集してデータベース接続情報を設定"
echo "   npx prisma migrate deploy"
echo "   npm run db:seed:all:json"
echo ""
echo "3. PM2でアプリケーションを起動:"
echo "   cd ${APP_DIR}"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "4. アクセス確認:"
echo "   http://${SERVER_IP}:3000 (フロントエンド)"
echo "   http://${SERVER_IP}:3001/health (バックエンドAPI)"
echo ""
echo -e "${YELLOW}⚠️  重要:${NC}"
echo "- .envファイルと.env.localファイルの設定を確認してください"
echo "- データベースのマイグレーションを実行してください"
echo "- PM2でアプリケーションを起動してください"
echo ""
echo -e "${BLUE}詳細は docs/DEPLOYMENT.md を参照してください${NC}"



