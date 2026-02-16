# 🔥 XServer VPS ファイアウォール設定

## 📋 問題

外部からサーバーに接続できない場合、XServer VPSのパケットフィルター設定を確認する必要があります。

## 🚀 解決手順

### 1. XServer VPSパネルでパケットフィルター設定

1. XServer VPSパネルにログイン
2. 「VPS管理」→「パケットフィルター設定」を選択
3. 以下のポートを許可：
   - **SSH**: ポート22
   - **HTTP**: ポート80（オプション）
   - **HTTPS**: ポート443（オプション）
   - **フロントエンド**: ポート3000
   - **バックエンドAPI**: ポート3001

### 2. サーバー側のファイアウォール設定

シリアルコンソールまたはSSHでサーバーに接続し、以下を実行：

```bash
# UFWの状態確認
ufw status

# UFWが無効な場合、有効化
ufw enable

# ポートを許可
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # フロントエンド
ufw allow 3001/tcp  # バックエンドAPI

# 状態確認
ufw status
```

### 3. アプリケーションのバインド設定確認

アプリケーションが `0.0.0.0` にバインドしていることを確認：

#### バックエンド（Express）

```typescript
// backend/src/index.ts
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
```

#### フロントエンド（Next.js）

Next.jsはデフォルトで `0.0.0.0` にバインドしますが、明示的に設定：

```bash
# frontend/.env.local または package.json
NEXT_PUBLIC_API_URL=http://162.43.8.168:3001
```

起動時：
```bash
npm start -- -H 0.0.0.0
```

### 4. 接続テスト

設定後、以下で接続を確認：

```bash
# ローカルマシンから
curl http://162.43.8.168:3000
curl http://162.43.8.168:3001/health
```

## 🔍 トラブルシューティング

### ポートが開いているか確認

```bash
# サーバー側で実行
netstat -tlnp | grep -E '3000|3001'
ss -tlnp | grep -E '3000|3001'
```

### ファイアウォールルールの確認

```bash
# UFW
ufw status verbose

# iptables（直接設定している場合）
iptables -L -n
```

### アプリケーションのログ確認

```bash
# PM2ログ
pm2 logs

# 個別ログ
pm2 logs healthconnect-backend
pm2 logs healthconnect-frontend
```

## 📝 注意事項

- XServer VPSでは、パケットフィルター設定が最優先です
- パケットフィルターで許可されていないポートは、サーバー側のファイアウォール設定に関係なくブロックされます
- 本番環境では、Nginxリバースプロキシを使用してポート80/443でアクセスすることを推奨します



