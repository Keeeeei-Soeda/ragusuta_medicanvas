# 🚀 GitHubリポジトリのセットアップ手順

## 📋 手順

### 1. GitHubでリポジトリを作成

1. GitHubにログイン: https://github.com
2. 右上の「+」→「New repository」をクリック
3. リポジトリ情報を入力：
   - **Repository name**: `healthconnect` または `lagsta-medicanvas`
   - **Description**: `法人向け健康プラットフォーム「HealthConnect」`
   - **Visibility**: Private（推奨）または Public
   - **Initialize this repository with**: チェックを外す（既にローカルにコードがあるため）
4. 「Create repository」をクリック

### 2. リモートリポジトリを追加

GitHubでリポジトリを作成したら、表示されるURLをコピーして以下のコマンドを実行：

```bash
cd /Users/soedakei/lagsta_medicanvas

# HTTPSの場合
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# またはSSHの場合
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 3. ブランチ名を設定（オプション）

```bash
git branch -M main
```

### 4. コードをプッシュ

```bash
git push -u origin main
```

## 🔐 認証について

### HTTPSを使用する場合

初回プッシュ時にGitHubの認証情報を求められます：
- **Personal Access Token** を使用することを推奨
- パスワードは使用できません

### Personal Access Tokenの作成方法

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. スコープを選択：
   - ✅ `repo` (Full control of private repositories)
4. 「Generate token」をクリック
5. 表示されたトークンをコピー（後で見れないので注意）
6. プッシュ時にパスワードの代わりにこのトークンを使用

### SSHを使用する場合

SSH鍵を設定している場合は、SSH URLを使用できます。

## 📝 コミットメッセージの例

既に初回コミットは作成済みですが、今後は以下のようなコミットメッセージを使用してください：

```bash
# 機能追加
git commit -m "feat: マイページ機能を追加"

# バグ修正
git commit -m "fix: 認証エラーを修正"

# ドキュメント更新
git commit -m "docs: READMEを更新"

# リファクタリング
git commit -m "refactor: APIルートを整理"
```

## 🔄 今後の作業フロー

```bash
# 1. 変更を確認
git status

# 2. 変更をステージング
git add .

# 3. コミット
git commit -m "変更内容の説明"

# 4. プッシュ
git push
```

## 📋 共有前に確認すること

- [ ] `.env` ファイルがコミットされていないか確認
- [ ] パスワードやAPIキーがコードに含まれていないか確認
- [ ] `node_modules` がコミットされていないか確認
- [ ] README.mdが最新の状態か確認

## 🔒 セキュリティチェック

以下のコマンドで機密情報が含まれていないか確認：

```bash
# .envファイルを確認
git ls-files | grep -E "\.env$|\.env\."

# パスワードやAPIキーを検索（実際の値に置き換えて）
grep -r "password.*=" --include="*.ts" --include="*.tsx" --include="*.js"
```

## 📦 .gitignoreの確認

以下のファイルは自動的に除外されます：

- `.env` / `.env.local` - 環境変数
- `node_modules/` - 依存関係
- `.next/` - Next.jsビルド成果物
- `dist/` - バックエンドビルド成果物
- `backend/prisma/migrations/` - マイグレーションファイル

## 🎯 クライアントへの共有

リポジトリを作成したら、以下の情報をクライアントに共有：

1. **リポジトリURL**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
2. **README.md**: プロジェクトの概要とセットアップ手順
3. **QUICKSTART.md**: クイックスタートガイド
4. **要件定義書**: `要件定義書_HealthConnect_v2.0.md`

## 💡 推奨事項

- **Privateリポジトリ**: クライアントとの共同開発の場合はPrivateリポジトリを推奨
- **ブランチ戦略**: `main`（本番）、`develop`（開発）、`feature/*`（機能開発）
- **Pull Request**: コードレビューを実施
- **Issues**: タスク管理やバグ報告に使用

---

**GitHubリポジトリの作成が完了したら、上記の手順に従ってコードをプッシュしてください！**









