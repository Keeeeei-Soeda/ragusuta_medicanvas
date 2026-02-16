# 🔧 CORS設定の修正手順

## 📋 問題

バックエンドのCORS設定が厳しすぎて、フロントエンドからのリクエストがブロックされています。

## 🚀 解決方法

### シリアルコンソールで修正

シリアルコンソールでサーバーに接続し、以下を実行：

```bash
cd /var/www/healthconnect/backend/src
nano index.ts
```

24-44行目のCORS設定を以下に変更：

```typescript
// ミドルウェア
app.use(cors({
  origin: (origin, callback) => {
    // 開発環境ではlocalhost全体を許可
    if (process.env.NODE_ENV === 'development') {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // 本番環境では設定されたURLとIPアドレスを許可
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://162.43.8.168:3000',
        'http://162.43.8.168',
        'http://x162-43-8-168.static.xvps.ne.jp:3000',
        'http://x162-43-8-168.static.xvps.ne.jp'
      ];
      
      // originがない場合（同一オリジンリクエストなど）は許可
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // 許可されたoriginかチェック
      if (allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
```

### PM2で再起動

```bash
cd /var/www/healthconnect
pm2 restart healthconnect-backend
pm2 logs healthconnect-backend
```

### 接続確認

ブラウザで以下にアクセス：
- http://162.43.8.168:3000

### XServer VPSパケットフィルター設定

**重要**: XServer VPSパネルで以下を設定：

1. XServer VPSパネルにログイン
2. 「VPS管理」→「パケットフィルター設定」を選択
3. 以下のポートを許可：
   - ポート22（SSH）
   - ポート3000（フロントエンド）
   - ポート3001（バックエンドAPI）



