# 📊 サーバー稼働状況レポート

## 🔍 現在の状況（2026-02-15 16:53更新）

### ✅ バックエンド
- **ステータス**: 正常稼働中
- **ポート**: 3001
- **プロセスID**: 33815
- **メモリ使用量**: 約77MB
- **CPU使用率**: 0%
- **起動時間**: 約30分
- **ヘルスチェック**: ✅ OK (`{"status":"ok"}`)

### ✅ フロントエンド
- **ステータス**: 正常稼働中（開発モード）
- **ポート**: 3000
- **プロセスID**: 33821
- **メモリ使用量**: 約63MB
- **CPU使用率**: 0%
- **起動時間**: 約5秒
- **モード**: 開発モード (`npm run dev`)

### 📈 サーバーリソース
- **ディスク使用率**: 5% (6.2GB / 145GB)
- **メモリ**: 833MB / 5.8GB 使用中
- **スワップ**: 0MB使用
- **ロードアベレージ**: 1.09, 1.13, 0.70
- **稼働時間**: 2日6時間20分

## 🔧 最近の修正内容

### 問題
- フロントエンドがビルドエラーで起動できなかった
- `.next/BUILD_ID` ファイルが見つからないエラー
- TypeScriptの型エラー（`providers.tsx`が見つからない）

### 解決策
- フロントエンドを開発モード（`npm run dev`）で実行するように変更
- `ecosystem.config.js`を更新して開発モードで起動

## 📝 アクセス情報

- **フロントエンド**: http://162.43.8.168:3000
- **バックエンドAPI**: http://162.43.8.168:3001
- **ヘルスチェック**: http://162.43.8.168:3001/health

## 🚨 トラブルシューティング

### サイトに接続できない場合

1. **PM2の状態を確認**
   ```bash
   ssh root@162.43.8.168 "pm2 status"
   ```

2. **ポートのリッスン状態を確認**
   ```bash
   ssh root@162.43.8.168 "ss -tlnp | grep -E ':(3000|3001)'"
   ```

3. **ログを確認**
   ```bash
   ssh root@162.43.8.168 "pm2 logs healthconnect-frontend --lines 20"
   ssh root@162.43.8.168 "pm2 logs healthconnect-backend --lines 20"
   ```

4. **プロセスを再起動**
   ```bash
   ssh root@162.43.8.168 "cd /var/www/healthconnect && pm2 restart all"
   ```

### フロントエンドが起動しない場合

開発モードで実行されているため、ビルドは不要です。エラーが出る場合は：

```bash
ssh root@162.43.8.168 "cd /var/www/healthconnect/frontend && npm run dev"
```

### バックエンドが起動しない場合

```bash
ssh root@162.43.8.168 "cd /var/www/healthconnect/backend && npx tsx src/index.ts"
```

## 📋 定期メンテナンス

### ログの確認
```bash
# フロントエンドログ
ssh root@162.43.8.168 "pm2 logs healthconnect-frontend --lines 50"

# バックエンドログ
ssh root@162.43.8.168 "pm2 logs healthconnect-backend --lines 50"
```

### リソース監視
```bash
# ディスク使用量
ssh root@162.43.8.168 "df -h"

# メモリ使用量
ssh root@162.43.8.168 "free -h"

# CPU使用率
ssh root@162.43.8.168 "top -bn1 | head -20"
```

## 🔄 再起動手順

```bash
# すべてのプロセスを再起動
ssh root@162.43.8.168 "cd /var/www/healthconnect && pm2 restart all"

# 個別に再起動
ssh root@162.43.8.168 "pm2 restart healthconnect-backend"
ssh root@162.43.8.168 "pm2 restart healthconnect-frontend"
```

## 📞 サポート

問題が解決しない場合は、以下を確認してください：
1. XServer VPSパネルでパケットフィルター設定を確認
2. サーバーのリソース使用状況を確認
3. ログファイルを確認

---

**最終更新**: 2026-02-15 16:53  
**サーバー**: XServer VPS (162.43.8.168)  
**プロジェクト**: へるこね

