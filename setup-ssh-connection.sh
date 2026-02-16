#!/bin/bash

# へるこねサーバー SSH接続セットアップスクリプト
# 新しいマシンからサーバーに接続するためのセットアップを自動化します

set -e

echo "🔌 へるこねサーバー SSH接続セットアップ"
echo "=========================================="
echo ""

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# SSH鍵の確認
echo "📋 SSH鍵の確認..."
if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}⚠️  SSH鍵が見つかりません。${NC}"
    read -p "SSH鍵を生成しますか？ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "メールアドレスを入力してください: " email
        ssh-keygen -t ed25519 -C "$email"
        echo -e "${GREEN}✅ SSH鍵を生成しました${NC}"
    else
        echo -e "${RED}❌ SSH鍵の生成をスキップしました${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ SSH鍵が見つかりました${NC}"
fi

# 公開鍵の表示
echo ""
echo "📤 公開鍵の内容:"
echo "----------------------------------------"
if [ -f ~/.ssh/id_ed25519.pub ]; then
    cat ~/.ssh/id_ed25519.pub
    PUBLIC_KEY=$(cat ~/.ssh/id_ed25519.pub)
elif [ -f ~/.ssh/id_rsa.pub ]; then
    cat ~/.ssh/id_rsa.pub
    PUBLIC_KEY=$(cat ~/.ssh/id_rsa.pub)
fi
echo "----------------------------------------"
echo ""

# 公開鍵をクリップボードにコピー（macOS）
if command -v pbcopy &> /dev/null; then
    echo "$PUBLIC_KEY" | pbcopy
    echo -e "${GREEN}✅ 公開鍵をクリップボードにコピーしました${NC}"
fi

# SSH設定ファイルの確認
echo ""
echo "📝 SSH設定ファイルの確認..."
if [ ! -f ~/.ssh/config ]; then
    echo "~/.ssh/config を作成します"
    touch ~/.ssh/config
    chmod 600 ~/.ssh/config
fi

# SSH設定の追加
if ! grep -q "pharmacy-platform" ~/.ssh/config; then
    echo ""
    echo "SSH設定を追加しますか？ (y/n): "
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat >> ~/.ssh/config << 'EOF'

# へるこねサーバー（IPアドレス直接指定）
Host pharmacy-platform
    HostName 162.43.8.168
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts

# 短縮エイリアス
Host 162
    HostName 162.43.8.168
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts
EOF
        chmod 600 ~/.ssh/config
        echo -e "${GREEN}✅ SSH設定を追加しました${NC}"
    fi
else
    echo -e "${GREEN}✅ SSH設定は既に存在します${NC}"
fi

# 次のステップ
echo ""
echo "=========================================="
echo -e "${GREEN}✅ セットアップが完了しました${NC}"
echo ""
echo "📋 次のステップ:"
echo ""
echo "1. サーバーに公開鍵を登録してください:"
echo "   - シリアルコンソール経由で接続"
echo "   - または既存のSSH接続経由"
echo ""
echo "   サーバー上で実行:"
echo "   mkdir -p ~/.ssh"
echo "   chmod 700 ~/.ssh"
echo "   echo \"$PUBLIC_KEY\" >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "2. SSH接続をテスト:"
echo "   ssh pharmacy-platform"
echo "   または"
echo "   ssh 162"
echo ""
echo "3. Cursorで接続:"
echo "   - Cmd + Shift + P (macOS) または Ctrl + Shift + P (Windows/Linux)"
echo "   - 「Remote-SSH: Connect to Host...」を選択"
echo "   - 「pharmacy-platform」または「162」を選択"
echo ""
echo "📚 詳細は docs/SSH_CONNECTION_GUIDE.md を参照してください"
echo ""

