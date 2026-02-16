#!/bin/bash

# HealthConnect - SSH鍵設定スクリプト
# サーバーにSSH公開鍵を登録するスクリプト

set -e

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER_IP="162.43.8.168"
USERNAME="${1:-root}"

echo -e "${BLUE}🔑 HealthConnect - SSH鍵設定${NC}"
echo "=========================================="
echo ""

# 公開鍵の確認
if [ ! -f ~/.ssh/id_ed25519.pub ]; then
    echo -e "${RED}❌ 公開鍵が見つかりません: ~/.ssh/id_ed25519.pub${NC}"
    echo ""
    echo "SSH鍵を生成する場合は以下を実行してください:"
    echo "  ssh-keygen -t ed25519 -C \"your-email@example.com\""
    exit 1
fi

echo -e "${GREEN}✅ 公開鍵を確認しました${NC}"
echo ""
echo -e "${YELLOW}公開鍵の内容:${NC}"
echo "----------------------------------------"
cat ~/.ssh/id_ed25519.pub
echo "----------------------------------------"
echo ""

echo -e "${YELLOW}📝 次の手順:${NC}"
echo ""
echo "1. シリアルコンソールまたはSSHでサーバーに接続してください"
echo "   ssh ${USERNAME}@${SERVER_IP}"
echo ""
echo "2. サーバー上で以下を実行してください:"
echo ""
echo "   mkdir -p ~/.ssh"
echo "   chmod 700 ~/.ssh"
echo "   echo '$(cat ~/.ssh/id_ed25519.pub)' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "3. または、以下のコマンドで自動的に設定できます（パスワードが必要）:"
echo ""
echo "   ssh-copy-id ${USERNAME}@${SERVER_IP}"
echo ""
echo -e "${BLUE}設定後、CursorのRemote SSHで接続できるようになります${NC}"



