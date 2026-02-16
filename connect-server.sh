#!/bin/bash

# HealthConnect - サーバー接続スクリプト
# 使用方法: ./connect-server.sh [username]

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# デフォルト値
SERVER_IP="162.43.8.168"
USERNAME="${1:-root}"

echo -e "${BLUE}🔌 HealthConnect - サーバー接続${NC}"
echo "=========================================="
echo -e "サーバー: ${YELLOW}${USERNAME}@${SERVER_IP}${NC}"
echo ""

# 接続テスト
echo -e "${BLUE}📌 接続テスト中...${NC}"
if ssh -o ConnectTimeout=5 "${USERNAME}@${SERVER_IP}" "echo '接続成功'" 2>/dev/null; then
    echo -e "${GREEN}✅ サーバーに接続できました${NC}"
    echo ""
    echo -e "${YELLOW}サーバー情報:${NC}"
    ssh "${USERNAME}@${SERVER_IP}" << 'EOF'
echo "OS: $(lsb_release -d | cut -f2)"
echo "カーネル: $(uname -r)"
echo "メモリ: $(free -h | grep Mem | awk '{print $2}')"
echo "ディスク: $(df -h / | tail -1 | awk '{print $4 " 空き / " $2 " 合計"}')"
echo ""
echo "Node.js: $(node --version 2>/dev/null || echo '未インストール')"
echo "npm: $(npm --version 2>/dev/null || echo '未インストール')"
echo "PostgreSQL: $(psql --version 2>/dev/null || echo '未インストール')"
echo "PM2: $(pm2 --version 2>/dev/null || echo '未インストール')"
EOF
    echo ""
    echo -e "${GREEN}SSH接続を開始します...${NC}"
    echo ""
    ssh "${USERNAME}@${SERVER_IP}"
else
    echo -e "${RED}❌ サーバーに接続できません${NC}"
    echo ""
    echo "接続方法を確認してください:"
    echo "  1. SSH鍵が設定されているか確認"
    echo "  2. パスワード認証が必要な場合は手動で接続:"
    echo "     ssh ${USERNAME}@${SERVER_IP}"
    echo ""
    echo "XServer VPSパネルから以下を確認してください:"
    echo "  - SSH接続情報"
    echo "  - ユーザー名"
    echo "  - パスワードまたはSSH鍵"
    exit 1
fi



