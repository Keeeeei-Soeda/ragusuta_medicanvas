# 🚀 HealthConnect - デプロイガイド

## 📋 サーバー情報

- **IPアドレス**: 162.43.8.168
- **OS**: Ubuntu 25.04
- **サーバー名**: pharmacy-platform
- **標準ホスト名**: x162-43-8-168.static.xvps.ne.jp

## 🔐 SSH接続

### 1. SSH接続の確認

```bash
# SSH接続（ユーザー名は通常 'root' または XServerから提供されたユーザー名）
ssh root@162.43.8.168
# または
ssh your-username@162.43.8.168
```

### 2. SSH鍵の設定（推奨）

```bash
# ローカルマシンでSSH鍵を生成（まだの場合）
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 公開鍵をサーバーにコピー
ssh-copy-id root@162.43.8.168
```

## 📦 サーバーセットアップ

### 1. 必要なソフトウェアのインストール

```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# Node.js 20.x のインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 15 のインストール
sudo apt install -y postgresql postgresql-contrib

# PM2（プロセス管理）のインストール
sudo npm install -g pm2

# Git のインストール（まだの場合）
sudo apt install -y git

# その他の必要なツール
sudo apt install -y build-essential
```

### 2. PostgreSQLのセットアップ

```bash
# PostgreSQLの起動確認
sudo systemctl status postgresql

# PostgreSQLに接続
sudo -u postgres psql

# データベースとユーザーの作成
CREATE DATABASE healthconnect;
CREATE USER healthconnect_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE healthconnect TO healthconnect_user;
\q
```

### 3. アプリケーションディレクトリの作成

```bash
# アプリケーションディレクトリを作成
sudo mkdir -p /var/www/healthconnect
sudo chown $USER:$USER /var/www/healthconnect
cd /var/www/healthconnect
```

## 🔄 デプロイ手順

### 方法1: Git経由でデプロイ（推奨）

```bash
# リポジトリをクローン
cd /var/www/healthconnect
git clone <your-repository-url> .

# または、ローカルからファイルをアップロード
# scp -r /Users/soedakei/lagsta_medicanvas/* root@162.43.8.168:/var/www/healthconnect/
```

### 方法2: ローカルから直接アップロード

```bash
# ローカルマシンから実行
cd /Users/soedakei/lagsta_medicanvas
tar -czf healthconnect.tar.gz --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='dist' .
scp healthconnect.tar.gz root@162.43.8.168:/var/www/healthconnect/
rm healthconnect.tar.gz

# サーバー側で展開
ssh root@162.43.8.168
cd /var/www/healthconnect
tar -xzf healthconnect.tar.gz
rm healthconnect.tar.gz
```

### 3. バックエンドのセットアップ

```bash
cd /var/www/healthconnect/backend

# 依存関係のインストール
npm install --production

# 環境変数ファイルの作成
cat > .env << 'EOF'
DATABASE_URL="postgresql://healthconnect_user:your-secure-password@localhost:5432/healthconnect"
JWT_SECRET="your-production-secret-key-minimum-32-characters-required-change-this"
PORT=3001
NODE_ENV=production
FRONTEND_URL="http://162.43.8.168:3000"
REDIS_URL="redis://localhost:6379"
GOOGLE_SHEETS_API_KEY=""
GOOGLE_SHEETS_SPREADSHEET_ID=""
EOF

# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate deploy

# ビルド
npm run build
```

### 4. フロントエンドのセットアップ

```bash
cd /var/www/healthconnect/frontend

# 依存関係のインストール
npm install --production

# 環境変数ファイルの作成
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://162.43.8.168:3001
EOF

# ビルド
npm run build
```

### 5. PM2でプロセス管理

```bash
# バックエンド用のPM2設定ファイルを作成
cd /var/www/healthconnect
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'healthconnect-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/healthconnect',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'healthconnect-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/healthconnect/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
EOF

# ログディレクトリの作成
mkdir -p /var/www/healthconnect/logs

# PM2でアプリケーションを起動
pm2 start ecosystem.config.js

# PM2の自動起動設定
pm2 startup
pm2 save
```

### 6. ファイアウォールの設定

```bash
# UFW（Uncomplicated Firewall）の設定
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # フロントエンド
sudo ufw allow 3001/tcp  # バックエンドAPI
sudo ufw enable
```

### 7. Nginxリバースプロキシの設定（オプション、推奨）

```bash
# Nginxのインストール
sudo apt install -y nginx

# 設定ファイルの作成
sudo cat > /etc/nginx/sites-available/healthconnect << 'EOF'
server {
    listen 80;
    server_name 162.43.8.168 x162-43-8-168.static.xvps.ne.jp;

    # フロントエンド
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # バックエンドAPI
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# シンボリックリンクの作成
sudo ln -s /etc/nginx/sites-available/healthconnect /etc/nginx/sites-enabled/

# 設定のテスト
sudo nginx -t

# Nginxの再起動
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔧 運用コマンド

### PM2コマンド

```bash
# ステータス確認
pm2 status

# ログ確認
pm2 logs healthconnect-backend
pm2 logs healthconnect-frontend

# 再起動
pm2 restart healthconnect-backend
pm2 restart healthconnect-frontend

# 停止
pm2 stop healthconnect-backend
pm2 stop healthconnect-frontend

# 削除
pm2 delete healthconnect-backend
pm2 delete healthconnect-frontend
```

### データベース管理

```bash
# Prisma Studio（開発用）
cd /var/www/healthconnect/backend
npx prisma studio --port 5555

# マイグレーションの確認
npx prisma migrate status

# シードデータの投入
npm run db:seed:all:json
```

## 🔄 更新デプロイ手順

```bash
# 1. サーバーに接続
ssh root@162.43.8.168

# 2. アプリケーションディレクトリに移動
cd /var/www/healthconnect

# 3. Gitから最新のコードを取得（Git経由の場合）
git pull origin main

# 4. バックエンドの更新
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build

# 5. フロントエンドの更新
cd ../frontend
npm install --production
npm run build

# 6. PM2で再起動
pm2 restart all
```

## 🔍 トラブルシューティング

### ログの確認

```bash
# PM2ログ
pm2 logs

# Nginxログ
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQLログ
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### ポートの確認

```bash
# 使用中のポートを確認
sudo netstat -tlnp | grep -E '3000|3001'
```

### データベース接続の確認

```bash
# PostgreSQLに接続してテスト
psql -U healthconnect_user -d healthconnect -h localhost
```

## 📝 セキュリティチェックリスト

- [ ] JWT_SECRETを強力なランダム文字列に変更
- [ ] データベースパスワードを強力なものに変更
- [ ] SSH鍵認証を設定
- [ ] ファイアウォールを設定
- [ ] 定期的なバックアップを設定
- [ ] SSL/TLS証明書の設定（Let's Encrypt推奨）
- [ ] 環境変数ファイルの権限設定（chmod 600）

## 🔐 SSL/TLS設定（Let's Encrypt）

```bash
# Certbotのインストール
sudo apt install -y certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d x162-43-8-168.static.xvps.ne.jp

# 自動更新の確認
sudo certbot renew --dry-run
```



