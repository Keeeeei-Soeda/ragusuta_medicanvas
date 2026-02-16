# 🔧 外部接続を有効にする修正手順

## 📋 問題

アプリケーションが `localhost` にバインドしているため、外部からアクセスできません。

## 🚀 解決方法

### 1. バックエンドの修正

シリアルコンソールでサーバーに接続し、以下を実行：

```bash
cd /var/www/healthconnect/backend/src
sed -i "s/app.listen(PORT, () => {/app.listen(PORT, '0.0.0.0', () => {/g" index.ts
sed -i "s|http://localhost:\${PORT}|http://0.0.0.0:\${PORT}|g" index.ts
```

または、直接編集：

```bash
nano index.ts
```

77行目を以下に変更：
```typescript
// 変更前
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// 変更後
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
```

### 2. CORS設定の確認

本番環境のCORS設定を確認：

```bash
cd /var/www/healthconnect/backend
cat .env | grep FRONTEND_URL
```

`FRONTEND_URL=http://162.43.8.168:3000` が設定されていることを確認。

### 3. フロントエンドの設定確認

Next.jsはデフォルトで `0.0.0.0` にバインドしますが、PM2設定を確認：

```bash
cd /var/www/healthconnect
cat ecosystem.config.js
```

### 4. PM2で再起動

```bash
cd /var/www/healthconnect
pm2 restart all
pm2 logs
```

### 5. XServer VPSパケットフィルター設定

**重要**: XServer VPSパネルで以下を設定：

1. XServer VPSパネルにログイン
2. 「VPS管理」→「パケットフィルター設定」を選択
3. 以下のポートを許可：
   - ポート22（SSH）
   - ポート3000（フロントエンド）
   - ポート3001（バックエンドAPI）

### 6. 接続テスト

設定後、以下で確認：

```bash
# サーバー内部から
curl http://localhost:3000
curl http://localhost:3001/health

# 外部から（ローカルマシン）
curl http://162.43.8.168:3000
curl http://162.43.8.168:3001/health
```



