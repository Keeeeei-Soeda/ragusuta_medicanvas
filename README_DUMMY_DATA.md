# 📊 体験談ダミーデータ完全版

## 概要

HealthConnect（法人向け健康プラットフォーム）用の体験談ダミーデータ **70件** です。

## データ内訳

### 全70件の体験談

| カテゴリ | 件数 | ID範囲 |
|---------|------|--------|
| 頭痛 | 10件 | exp-001 ~ exp-010 |
| 腰痛 | 10件 | exp-011 ~ exp-020 |
| 脂質異常症 | 10件 | exp-021 ~ exp-030 |
| 糖尿病 | 10件 | exp-031 ~ exp-040 |
| めまい | 10件 | exp-041 ~ exp-050 |
| **子供の病気** | 10件 | exp-051 ~ exp-060 |
| **親の病気** | 10件 | exp-061 ~ exp-070 |

### 子供の病気（10件）

- インフルエンザ（2件）
  - exp-051: 5歳児、高熱5日間
  - exp-052: 3歳児、インフルエンザ脳症
- RSウイルス（3件）
  - exp-053: 1歳児、呼吸困難で入院
  - exp-054: 生後6ヶ月、細気管支炎
  - exp-056: 生後10ヶ月、ICU入院（重症例）
- アデノウイルス（2件）
  - exp-055: 4歳児、プール熱
  - exp-056: 6歳児、結膜炎
- 肺炎（2件）
  - exp-057: 7歳児、マイコプラズマ肺炎
  - exp-058: 2歳児、肺炎球菌性肺炎
- 骨折（2件）
  - exp-059: 8歳児、腕の骨折
  - exp-060: 10歳児、足首骨折（手術）

### 親の病気（10件）

- 認知症・アルツハイマー（4件）
  - exp-061: 72歳母、物忘れから認知症へ
  - exp-062: 78歳父、徘徊
  - exp-063: 75歳母、介護と仕事の両立
  - exp-064: 76歳父、レビー小体型認知症
- 転倒・骨折（3件）
  - exp-065: 80歳母、大腿骨骨折
  - exp-066: 77歳母、圧迫骨折
  - exp-067: 82歳父、転倒予防
- その他（3件）
  - exp-068: 74歳母、脳梗塞
  - exp-069: 83歳父、誤嚥性肺炎
  - exp-070: 79歳母、心不全

## ファイル一覧

```
📁 ダミーデータ一式
├── experiences_complete_70.json    # メインデータ（70件）
├── seed_updated.ts                 # Prisma Seedスクリプト
└── README.md                       # このファイル
```

## セットアップ手順

### 1. ファイルの配置

```bash
health-connect/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts              # seed_updated.ts をリネーム
│   │   └── data/
│   │       └── experiences_complete_70.json  # ここに配置
```

### 2. package.json設定

```json
{
  "name": "health-connect-backend",
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset"
  },
  "devDependencies": {
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 3. データベース初期化

```bash
# マイグレーション実行
npx prisma migrate dev --name init

# シード実行
npx prisma db seed
```

### 4. 確認

```bash
# Prisma Studioで確認
npx prisma studio
```

## データの特徴

### targetPersonの分類

| targetPerson | 説明 | 件数 | 例 |
|--------------|------|------|-----|
| SELF | 本人の体験談 | 50件 | 頭痛、腰痛、糖尿病など |
| CHILD | 子供の体験談 | 10件 | インフルエンザ、RSウイルスなど |
| PARENT | 親の体験談 | 10件 | 認知症、転倒・骨折など |
| SPOUSE | 配偶者の体験談 | 0件 | （今後追加可能） |

### カテゴリコード

```typescript
// メインカテゴリ
HEADACHE = '頭痛'
BACK_PAIN = '腰痛'
DYSLIPIDEMIA = '脂質異常症'
DIABETES = '糖尿病'
DIZZINESS = 'めまい'
CHILD_ILLNESS = '子供の病気'
PARENT_ILLNESS = '親の病気'
SENIOR_ILLNESS = '高齢者の病気'
```

### 年齢分布

- **本人（SELF）**: 27歳〜64歳（働き盛り世代）
- **投稿者（子供の親）**: 32歳〜40歳
- **投稿者（親の介護者）**: 42歳〜52歳
- **子供**: 0歳（6ヶ月）〜10歳
- **親**: 72歳〜85歳

## マッチングアルゴリズムのテストケース

### ケース1: 35歳男性、営業職、子供あり

```typescript
const user = {
  age: 35,
  gender: 'MALE',
  jobType: 'SALES',
  hasChildren: true,
  childrenAges: [5, 3],
  isMarried: true
};

// 期待される結果:
// - 自分向け: exp-011（35歳男性営業、腰痛）
// - 子供向け: exp-051（5歳、インフルエンザ）、exp-052（3歳、インフルエンザ脳症）
```

### ケース2: 45歳女性、事務職、親の介護中

```typescript
const user = {
  age: 45,
  gender: 'FEMALE',
  jobType: 'OFFICE',
  hasChildren: false,
  isMarried: true
};

// 期待される結果:
// - 自分向け: exp-004（52歳女性、頭痛）、exp-049（45歳女性、糖尿病）
// - 親向け: exp-061（72歳母、認知症）、exp-063（75歳母、介護と仕事の両立）
```

## Seedスクリプトの実行結果

```
🌱 Starting seed...
📊 Found 70 experiences to seed
✅ Demo company created: デモ株式会社
✅ Created 5 departments
✅ Created 70 dummy users
📝 Seeded 10/70 experiences
📝 Seeded 20/70 experiences
📝 Seeded 30/70 experiences
📝 Seeded 40/70 experiences
📝 Seeded 50/70 experiences
📝 Seeded 60/70 experiences
📝 Seeded 70/70 experiences
✅ All 70 experiences seeded successfully
📊 Creating activity logs...
✅ Created 300 activity logs
👍 Creating helpful reactions...
✅ Created 400 helpful reactions
🏃 Creating mock classes...
✅ Created 10 mock classes
📺 Creating health contents...
✅ Created health contents

🎉 Seed completed successfully!

📊 Summary:
   - Company: 1
   - Departments: 5
   - Users: 70
   - Experiences: 70
     - 頭痛: 10件
     - 腰痛: 10件
     - 脂質異常症: 10件
     - 糖尿病: 10件
     - めまい: 10件
     - 子供の病気: 10件
     - 親の病気: 10件
   - Activity Logs: 300
   - Reactions: 400
   - Classes: 10
   - Health Contents: 7
```

## カスタマイズ方法

### 体験談を追加したい場合

```json
{
  "id": "exp-071",
  "age": 40,
  "gender": "MALE",
  "jobType": "ENGINEER",
  "category": "新カテゴリ",
  "subcategory": "詳細カテゴリ",
  "targetPerson": "SELF",
  "title": "タイトル",
  "content": "本文...",
  "tags": ["タグ1", "タグ2"],
  "viewCount": 1000,
  "helpfulCount": 500,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 新しいカテゴリを追加したい場合

1. `experiences_complete_70.json` にデータ追加
2. `schema.prisma` のカテゴリコード追加（必要に応じて）
3. `seed.ts` 実行

## トラブルシューティング

### Seedが失敗する場合

```bash
# データベースをリセット
npx prisma migrate reset

# Prisma Clientを再生成
npx prisma generate

# 再度シード実行
npx prisma db seed
```

### データが表示されない場合

```bash
# Prisma Studioで確認
npx prisma studio

# データベース接続を確認
npx prisma db pull
```

## 注意事項

1. **本番環境では使用しない**
   - このデータは開発・テスト用です
   - 本番環境では必ず実データに置き換えてください

2. **個人情報**
   - 全て架空のデータです
   - 実在の人物・団体とは一切関係ありません

3. **パスワード**
   - ダミーハッシュ `$2b$10$dummyhash` を使用
   - 本番では適切にハッシュ化してください

## ライセンス

このダミーデータは開発用途に自由に使用できます。

---

**作成日**: 2025年1月5日  
**バージョン**: v2.0  
**総データ数**: 70件
