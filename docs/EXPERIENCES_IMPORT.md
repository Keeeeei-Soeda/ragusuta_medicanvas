# 体験談データのインポート方法

## 📋 概要

体験談データは以下の2つの方法で管理できます：

1. **JSONファイルからインポート**（現在実装済み）
2. **Google Sheets API連携**（Phase 2で実装予定）

## 🚀 JSONファイルからのインポート

### 1. JSONファイルの配置

`experiences_complete_70.json` をプロジェクトルートに配置してください。

```bash
lagsta_medicanvas/
├── experiences_complete_70.json  # ここに配置
├── backend/
└── frontend/
```

### 2. データ形式

JSONファイルは以下の形式である必要があります：

```json
{
  "experiences": [
    {
      "id": "exp-001",
      "age": 34,
      "gender": "MALE",
      "jobType": "OFFICE",
      "category": "HEADACHE",
      "subcategory": "緊張型頭痛",
      "targetPerson": "SELF",
      "title": "タイトル",
      "content": "本文",
      "tags": ["タグ1", "タグ2"],
      "viewCount": 1247,
      "helpfulCount": 823,
      "createdAt": "2024-11-15T10:30:00Z"
    }
  ]
}
```

### 3. インポート実行

```bash
cd backend
npm run db:seed:experiences:json
```

### 4. 全データのシード（JSON版）

既存のシードデータと一緒にインポートする場合：

```bash
cd backend
npm run db:seed:all:json
```

## 📊 Google Sheets API連携（Phase 2）

### 設定方法

1. **Google Cloud Consoleでサービスアカウントを作成**
   - プロジェクトを作成
   - サービスアカウントを作成
   - JSONキーをダウンロード

2. **スプレッドシートの共有設定**
   - スプレッドシートを開く
   - 「共有」→ サービスアカウントのメールアドレスに「編集者」権限を付与

3. **環境変数の設定**

```env
# .env
GOOGLE_SERVICE_ACCOUNT_KEY=./path/to/service-account-key.json
UCHIAKE_SHEET_ID=your-spreadsheet-id
```

### スプレッドシートの形式

スプレッドシートは以下の列形式である必要があります：

| A列 | B列 | C列 | D列 | E列 | F列 | G列 | H列 | I列 | J列 | K列 | L列 |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| id | age | gender | jobType | category | subcategory | targetPerson | title | content | tags | createdAt | viewCount | helpfulCount |

**例：**
```
A1: id
B1: age
C1: gender
D1: jobType
E1: category
F1: subcategory
G1: targetPerson
H1: title
I1: content
J1: tags
K1: createdAt
L1: viewCount
M1: helpfulCount
```

## 🔄 データ管理方法の比較

### JSONファイル管理
**メリット：**
- ✅ シンプルで設定不要
- ✅ バージョン管理が容易（Git管理可能）
- ✅ 開発環境で簡単にテスト可能

**デメリット：**
- ❌ 手動でファイルを更新する必要がある
- ❌ リアルタイム更新ができない

### Google Sheets管理
**メリット：**
- ✅ 非技術者でも編集可能
- ✅ リアルタイムでデータを更新できる
- ✅ 複数人で同時編集可能
- ✅ スプレッドシートの機能（フィルター、ソート等）が使える

**デメリット：**
- ❌ Google Cloud設定が必要
- ❌ API制限がある（1日あたりのリクエスト数）
- ❌ インターネット接続が必要

## 💡 推奨事項

### 開発環境
- **JSONファイル管理**を推奨
- シンプルで設定不要、Gitで管理できる

### 本番環境
- **Google Sheets管理**を推奨
- 非技術者でもデータを更新できる
- リアルタイムで反映される

### ハイブリッド方式
- 基本データはJSONで管理（バージョン管理）
- 追加データはGoogle Sheetsで管理
- 両方をマージして使用

## 🔧 カテゴリマッピング

JSONのカテゴリは以下のようにDBのカテゴリにマッピングされます：

| JSONカテゴリ | DBカテゴリ |
|-------------|-----------|
| HEADACHE | PHYSICAL |
| BACK_PAIN | PHYSICAL |
| DYSLIPIDEMIA | LIFESTYLE |
| DIABETES | LIFESTYLE |
| DIZZINESS | PHYSICAL |
| CHILD_ILLNESS | FAMILY |
| PARENT_ILLNESS | FAMILY |

## 📝 注意事項

1. **ユーザー情報の自動生成**
   - JSONデータに含まれる`age`, `gender`, `jobType`から自動的にダミーユーザーが作成されます
   - 既存ユーザーと一致する場合は既存ユーザーが使用されます

2. **重複チェック**
   - 同じタイトルとユーザーの組み合わせはスキップされます

3. **日付の扱い**
   - `createdAt`が指定されていない場合は現在の日時が使用されます

## 🐛 トラブルシューティング

### エラー: "No company found"
```bash
# 先に基本のシードを実行
npm run db:seed
```

### エラー: "User not found"
- JSONデータの`age`, `gender`, `jobType`が正しい形式か確認してください

### インポートが遅い
- 大量のデータ（100件以上）の場合は、バッチ処理を検討してください

