# 🚀 HealthConnect - デプロイ手順書

## 📋 概要

このドキュメントでは、HealthConnectを本番環境にデプロイして、GitHubからUIを確認できるようにする手順を説明します。

## 🎯 推奨方法: Vercel（フロントエンド）+ Railway（バックエンド）

### メリット
- ✅ GitHubと自動連携（プッシュするたびに自動デプロイ）
- ✅ 無料プランで開始可能
- ✅ Next.jsに最適化されている
- ✅ 簡単なセットアップ

---

## 📝 デプロイ手順

### Step 1: Vercelでフロントエンドをデプロイ

1. **Vercelにアクセス**: https://vercel.com
2. **GitHubでログイン**
3. **「Add New Project」をクリック**
4. **リポジトリを選択**: `Keeeeei-Soeda/ragusuta_medicanvas`
5. **プロジェクト設定**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`（自動検出される）
   - **Output Directory**: `.next`（自動検出される）
6. **Environment Variables**を追加:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
7. **「Deploy」をクリック**

**デプロイ後、以下のようなURLが生成されます**:
```
https://ragusuta-medicanvas.vercel.app
```

### Step 2: Railwayでバックエンドをデプロイ

1. **Railwayにアクセス**: https://railway.app
2. **GitHubでログイン**
3. **「New Project」→「Deploy from GitHub repo」**
4. **リポジトリを選択**: `Keeeeei-Soeda/ragusuta_medicanvas`
5. **設定**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
6. **Environment Variables**を追加:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   FRONTEND_URL=https://ragusuta-medicanvas.vercel.app
   PORT=3001
   ```
7. **PostgreSQLを追加**:
   - 「New」→「Database」→「Add PostgreSQL」
   - 自動的に`DATABASE_URL`が設定されます

**デプロイ後、以下のようなURLが生成されます**:
```
https://ragusuta-medicanvas-production.up.railway.app
```

### Step 3: データベースのセットアップ

RailwayのPostgreSQLに接続して、マイグレーションとシードを実行：

```bash
# RailwayのPostgreSQL URLを取得
# Railway Dashboard → PostgreSQL → Variables → DATABASE_URL

# ローカルからマイグレーション実行
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed:all
```

### Step 4: 環境変数の更新

Vercelの環境変数を更新：
```
NEXT_PUBLIC_API_URL=https://ragusuta-medicanvas-production.up.railway.app
```

Vercelを再デプロイ（自動的に再デプロイされます）

---

## 🔄 GitHub連携による自動デプロイ

一度設定すれば、GitHubにプッシュするたびに自動的にデプロイされます：

```bash
# コードを変更
git add .
git commit -m "UI改善"
git push

# → 自動的にVercelとRailwayでデプロイが開始されます
```

---

## 🌐 アクセスURL

デプロイ後、以下のURLでアクセスできます：

- **フロントエンド**: `https://ragusuta-medicanvas.vercel.app`
- **バックエンドAPI**: `https://ragusuta-medicanvas-production.up.railway.app`
- **ヘルスチェック**: `https://ragusuta-medicanvas-production.up.railway.app/health`

---

## 📸 スクリーンショットの共有

GitHubリポジトリにスクリーンショットを追加することもできます：

1. `docs/screenshots/` ディレクトリを作成
2. 各画面のスクリーンショットを保存
3. `docs/SCREENSHOTS.md` を作成して説明を追加

---

## 🔒 セキュリティ注意事項

- ✅ 環境変数はVercel/Railwayのダッシュボードで管理
- ✅ `.env`ファイルはGitにコミットしない
- ✅ JWT_SECRETは強力なランダム文字列を使用
- ✅ 本番環境では開発モードの認証バイパスを無効化

---

## 🆘 トラブルシューティング

### デプロイエラー

1. **ビルドエラー**: Vercelのログを確認
2. **API接続エラー**: CORS設定を確認
3. **データベース接続エラー**: RailwayのPostgreSQL URLを確認

### 環境変数の確認

```bash
# Vercel
vercel env ls

# Railway
railway variables
```

---

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**デプロイが完了したら、クライアントにVercelのURLを共有してください！**









