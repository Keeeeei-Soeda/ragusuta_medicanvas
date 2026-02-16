# 🔓 ログインをスキップする設定

## 📋 方法1: バックエンドの認証ミドルウェアを修正（推奨）

シリアルコンソールでサーバーに接続し、以下を実行：

```bash
cd /var/www/healthconnect/backend/src/middlewares
nano auth.ts
```

20-28行目を以下に変更（本番環境でも認証をスキップできるように）：

```typescript
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // 開発モードまたはSKIP_AUTH環境変数が設定されている場合: 認証をスキップ
  if ((process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') && req.headers['x-dev-user-id']) {
    req.user = {
      userId: req.headers['x-dev-user-id'] as string,
      companyId: req.headers['x-dev-company-id'] as string || 'default-company-id',
      role: req.headers['x-dev-role'] as string || 'EMPLOYEE',
    };
    return next();
  }
  
  // 認証を完全にスキップ（一時的）
  if (process.env.SKIP_AUTH === 'true') {
    // データベースから最初のユーザーを取得
    prisma.user.findFirst().then(user => {
      if (user) {
        req.user = {
          userId: user.id,
          companyId: user.companyId,
          role: user.role,
        };
      } else {
        req.user = {
          userId: 'dev-user-id',
          companyId: 'dev-company-id',
          role: 'EMPLOYEE',
        };
      }
      next();
    }).catch(() => {
      req.user = {
        userId: 'dev-user-id',
        companyId: 'dev-company-id',
        role: 'EMPLOYEE',
      };
      next();
    });
    return;
  }

  // 以下、既存の認証ロジック...
```

または、より簡単な方法として、環境変数を設定：

```bash
cd /var/www/healthconnect/backend
echo 'SKIP_AUTH=true' >> .env
pm2 restart healthconnect-backend
```

## 📋 方法2: フロントエンドで直接ホームにリダイレクト

フロントエンドのログインページを修正：

```bash
cd /var/www/healthconnect/frontend/app/(auth)/login
nano page.tsx
```

`useEffect`を追加して、ページ読み込み時に自動的にホームにリダイレクト：

```typescript
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  
  // ログインをスキップしてホームにリダイレクト
  useEffect(() => {
    router.push('/home')
  }, [router])
  
  // 以下、既存のコード...
```

## 📋 方法3: フロントエンドのAPIクライアントを修正

フロントエンドのAPIクライアントで常に開発ヘッダーを送信：

```bash
cd /var/www/healthconnect/frontend/lib
nano api.ts
```

14-21行目を以下に変更：

```typescript
// リクエストインターセプター: トークンを自動付与
api.interceptors.request.use((config) => {
  // 常に認証をスキップ（一時的）
  config.headers['x-dev-user-id'] = 'dev-user-id';
  config.headers['x-dev-company-id'] = 'dev-company-id';
  config.headers['x-dev-role'] = 'EMPLOYEE';
  return config;
  
  // 以下、既存のコード（コメントアウト）
  // if (process.env.NODE_ENV === 'development') {
  //   ...
  // }
});
```

保存後、フロントエンドを再ビルド：

```bash
cd /var/www/healthconnect/frontend
npm run build
pm2 restart healthconnect-frontend
```

## 🚀 推奨手順

最も簡単な方法は**方法1**です：

1. バックエンドの`.env`に`SKIP_AUTH=true`を追加
2. 認証ミドルウェアを修正して`SKIP_AUTH`環境変数をチェック
3. PM2で再起動

これで、フロントエンドから開発ヘッダーを送信すれば認証がスキップされます。



