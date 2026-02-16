# 開発ガイド

## 📋 進捗管理

### Phase 1: MVP (2ヶ月)

#### ✅ Week 1-2: 基盤構築 (完了)
- [x] プロジェクト構造の作成
- [x] Prismaスキーマ作成
- [x] 認証機能実装
- [x] ユーザー登録(基本情報)
- [x] ログイン機能
- [x] プロフィール登録機能
- [x] JWT認証ミドルウェア
- [x] バリデーション機能
- [x] フロントエンド基本構造
- [x] ログイン画面

#### 🔄 Week 3-4: 体験談機能 (次フェーズ)
- [ ] 体験談閲覧(Mockデータ)
- [ ] 体験談投稿
- [ ] 反応機能(参考になった)
- [ ] ActivityLog記録

#### ⏳ Week 5-6: 統計機能
- [ ] 個人統計表示
- [ ] 部署比較表示
- [ ] ActivityLog集計

#### ⏳ Week 7-8: 管理機能とテスト
- [ ] 管理者ダッシュボード
- [ ] 部署管理
- [ ] テスト・デバッグ
- [ ] デプロイ準備

### Phase 2: 本格展開 (1ヶ月)

#### ⏳ Week 9-10: 外部連携
- [ ] Google Sheets API連携
- [ ] うちあけDB取得
- [ ] マッチングアルゴリズム実装
- [ ] キャッシュ機能実装

#### ⏳ Week 11-12: 高度な統計機能
- [ ] 会社間比較機能
- [ ] 全国平均統計
- [ ] 同年代トレンド表示
- [ ] 最終調整・リリース

### Phase 3: 健康コンテンツ (2週間)

#### ⏳ Week 13-14: コンテンツ機能
- [ ] 健康コンテンツ閲覧
- [ ] 動画再生機能
- [ ] PDFダウンロード
- [ ] ラグスタ向け管理画面

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
# ルートディレクトリ
npm install

# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

### 2. データベースのセットアップ

```bash
cd backend

# .envファイルを作成
cp .env.example .env
# DATABASE_URLを設定

# Prismaクライアントの生成
npm run db:generate

# マイグレーションの実行
npm run db:migrate

# シードデータの投入
npm run db:seed
```

### 3. 開発サーバーの起動

```bash
# ルートディレクトリから
npm run dev

# または個別に起動
npm run dev:backend  # http://localhost:3001
npm run dev:frontend # http://localhost:3000
```

## 📝 開発ルール

### コーディング規約

- TypeScriptのstrictモードを使用
- ESLint/Prettierの設定に従う
- コンポーネントは関数コンポーネント + Hooks
- APIルートはRESTful設計に従う

### コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加
chore: その他
```

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正

## 🔍 テスト

```bash
# バックエンドテスト
cd backend
npm test

# フロントエンドテスト
cd frontend
npm test
```

## 📦 デプロイ

### ステージング環境

```bash
# バックエンド
cd backend
npm run build
# Railway/Renderにデプロイ

# フロントエンド
cd frontend
npm run build
# Vercelにデプロイ
```

### 本番環境

- 環境変数の設定
- データベースのマイグレーション
- バックアップ設定の確認

## 🐛 トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
# DATABASE_URLが正しいか確認
```

### Prismaエラー

```bash
# Prismaクライアントを再生成
npm run db:generate

# マイグレーションをリセット（開発環境のみ）
npm run db:migrate:reset
```

### ポート競合

```bash
# 別のポートを使用
PORT=3002 npm run dev:backend
```






