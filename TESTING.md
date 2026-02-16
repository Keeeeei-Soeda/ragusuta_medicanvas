# 🧪 HealthConnect - テスト・セットアップガイド

## 📋 前提条件

以下がインストールされていることを確認してください：

- **Node.js** v18以上
- **PostgreSQL** v14以上
- **npm** または **yarn**

## 🚀 初回セットアップ手順

### 1. PostgreSQLデータベースを作成

```bash
# PostgreSQLが起動しているか確認
pg_isready

# データベースを作成
createdb healthconnect

# 確認
psql -l | grep healthconnect
```

### 2. バックエンドのセットアップ

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係をインストール
npm install

# 環境変数を確認・編集
# .envファイルのDATABASE_URLを必要に応じて変更
# 例: postgresql://ユーザー名:パスワード@localhost:5432/healthconnect

# Prismaクライアントを生成
npx prisma generate

# マイグレーションを実行（データベーステーブル作成）
npx prisma migrate dev --name init

# シードデータを投入
npm run db:seed:all
```

**シードデータの内容**:
- テスト法人: TEST0001
- 部署: 営業部、総務部、開発部
- 管理者ユーザー: admin001 / password123
- 一般ユーザー: emp001 / password123
- 体験談: 5件
- ActivityLog: 各ユーザーに10-40件

### 3. フロントエンドのセットアップ

```bash
# フロントエンドディレクトリに移動
cd ../frontend

# 依存関係をインストール
npm install
```

### 4. サーバー起動

**ターミナル1: バックエンド**

```bash
cd backend
npm run dev
```

起動メッセージ:
```
🚀 Server running on http://localhost:3001
```

**ターミナル2: フロントエンド**

```bash
cd frontend
npm run dev
```

起動メッセージ:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

## ✅ 動作確認チェックリスト

### 1. バックエンドのヘルスチェック

ブラウザで http://localhost:3001/health にアクセス

**期待される応答**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-05T..."
}
```

### 2. フロントエンドのアクセス確認

ブラウザで http://localhost:3000 にアクセス

**期待される動作**: ホーム画面にリダイレクトされる（開発モード）

### 3. 体験談一覧の表示

http://localhost:3000/home にアクセス

**確認項目**:
- [ ] 5件の体験談カードが表示される
- [ ] 各カードにタイトル、カテゴリ、ユーザー情報が表示される
- [ ] 「体験談を投稿」ボタンが表示される
- [ ] 「統計を見る」ボタンが表示される
- [ ] 「管理画面」ボタンが表示される

### 4. 体験談詳細の表示

体験談カードの「詳細を見る」をクリック

**確認項目**:
- [ ] 体験談の全文が表示される
- [ ] 「参考になった」ボタンが動作する
- [ ] クリックすると色が変わり、カウントが増える
- [ ] もう一度クリックすると取り消される

### 5. 体験談投稿

http://localhost:3000/experiences/new にアクセス

**確認項目**:
- [ ] フォームが表示される
- [ ] 全ての入力欄が機能する
- [ ] 文字数カウンターが動作する
- [ ] 投稿後、詳細画面にリダイレクトされる
- [ ] ホーム画面に新しい投稿が表示される

### 6. 統計画面

http://localhost:3000/stats にアクセス

**確認項目**:
- [ ] 期間選択ボタン（今週/今月/今四半期/今年）が表示される
- [ ] 個人統計カードが3つ表示される
  - 体験談閲覧数
  - 体験談投稿数
  - 「参考になった」をもらった数
- [ ] 累計統計が表示される
- [ ] 社内ランキングが表示される
- [ ] 部署別ランキングが表示される

### 7. 管理者ダッシュボード

http://localhost:3000/admin にアクセス

**確認項目**:
- [ ] クイックアクセスカードが3つ表示される
- [ ] 全社統計が表示される
  - 総ユーザー数
  - アクティブユーザー数
  - 総体験談数
  - 総閲覧数
- [ ] カテゴリ別体験談が表示される
- [ ] 部署別統計テーブルが表示される

### 8. 部署管理

http://localhost:3000/admin/departments にアクセス

**確認項目**:
- [ ] 「+ 新しい部署を追加」ボタンが表示される
- [ ] 部署一覧テーブルが表示される
- [ ] 各部署に「編集」「削除」ボタンが表示される

**機能テスト**:
1. 「+ 新しい部署を追加」をクリック
2. 「企画部」と入力して保存
3. 一覧に追加されることを確認
4. 「編集」をクリックして名前を変更
5. 「削除」をクリックして削除（確認ダイアログが表示される）

## 🔍 データベースの直接確認（Prisma Studio）

```bash
cd backend
npx prisma studio
```

ブラウザで http://localhost:5555 が開きます

**確認できるテーブル**:
- User（ユーザー）
- Experience（体験談）
- Reaction（反応）
- ActivityLog（活動ログ）
- Department（部署）
- Company（法人）
- Notification（お知らせ）

## 🐛 トラブルシューティング

### バックエンドが起動しない

#### エラー: `Error: P1001: Can't reach database server`

**原因**: PostgreSQLが起動していない、または接続情報が間違っている

**解決策**:
```bash
# PostgreSQLの起動を確認
pg_isready

# データベースが存在するか確認
psql -l | grep healthconnect

# 接続情報を確認
# backend/.env の DATABASE_URL を確認
```

#### エラー: `JWT_SECRET is not set`

**原因**: 環境変数が読み込まれていない

**解決策**:
```bash
# .envファイルが存在するか確認
ls -la backend/.env

# 内容を確認
cat backend/.env
```

### フロントエンドが起動しない

#### エラー: `MODULE_NOT_FOUND`

**原因**: 依存関係がインストールされていない

**解決策**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### データが表示されない

#### 体験談が0件

**原因**: シードデータが投入されていない

**解決策**:
```bash
cd backend
npm run db:seed:all
```

#### データベースをリセットしたい

```bash
cd backend
npx prisma migrate reset
npm run db:seed:all
```

**注意**: 全てのデータが削除されます

### ポート競合

#### エラー: `Port 3001 is already in use`

**解決策**:
```bash
# 別のポートを使用
PORT=3002 npm run dev

# または、使用中のプロセスを停止
lsof -ti:3001 | xargs kill
```

## 📸 テスト時のスクリーンショット推奨箇所

1. ✅ ホーム画面（体験談一覧）
2. ✅ 体験談詳細画面
3. ✅ 体験談投稿画面
4. ✅ 統計画面（個人統計）
5. ✅ 統計画面（部署ランキング）
6. ✅ 管理者ダッシュボード
7. ✅ 部署管理画面

## 🔄 データのリセット

テストデータをリセットして初期状態に戻す:

```bash
cd backend

# データベースを完全にリセット
npx prisma migrate reset

# シードデータを再投入
npm run db:seed:all
```

## 📊 開発モード認証バイパス

開発中は認証をバイパスできます。フロントエンドが自動的に以下のヘッダーを送信します：

- `x-dev-user-id`: テストユーザーID
- `x-dev-company-id`: テスト法人ID
- `x-dev-role`: ユーザーロール（EMPLOYEE, ADMIN, etc.）

これにより、ログイン画面を経由せずに機能をテストできます。

## 📞 サポート

問題が解決しない場合は、以下の情報と共にお知らせください：

1. エラーメッセージの全文
2. 実行したコマンド
3. 環境（OS、Node.jsバージョン、PostgreSQLバージョン）
4. ターミナルの出力

---

**Happy Testing! 🎉**






