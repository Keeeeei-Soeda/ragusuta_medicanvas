# プロフィール情報について

## 現在表示されている情報

マイページ（`/my`）のプロフィールタブでは、以下の情報が表示されます：

### 基本情報
- **氏名**: ユーザーの名前
- **社員番号**: 会社内での社員番号
- **生年月日**: 生年月日と現在の年齢
- **性別**: 男性、女性、その他
- **部署**: 所属部署名
- **職種**: 営業、エンジニア、事務など

### 家族情報（UserProfile）
- **お子さん**: 子供がいるかどうか、いる場合は年齢
- **結婚状況**: 既婚または未婚
- **関心のあるカテゴリ**: 健康に関心のあるカテゴリ（身体、心・精神、家族、生活習慣、高齢者など）

## データベーススキーマ

### User モデル
```prisma
model User {
  id              String       @id @default(uuid())
  companyId       String
  departmentId    String
  employeeNumber  String       // 社員番号
  name            String
  birthDate       DateTime
  gender          String       // MALE, FEMALE, OTHER
  jobType         String?      // SALES, ENGINEER, OFFICE, etc
  passwordHash    String
  role            String       @default("EMPLOYEE")
  isActive        Boolean      @default(true)
  lastLoginAt     DateTime?
  // ...
}
```

### UserProfile モデル
```prisma
model UserProfile {
  id                    String   @id @default(uuid())
  userId                String   @unique
  hasChildren           Boolean  @default(false)
  childrenAges          Int[]    // 配列で複数の子供の年齢
  isMarried             Boolean  @default(false)
  interestedCategories  String[] // 関心カテゴリ
  // ...
}
```

## 追加できる情報（将来の拡張案）

現在のスキーマを拡張すれば、以下の情報も追加できます：

### 連絡先情報
- **メールアドレス**: 連絡用メールアドレス
- **電話番号**: 緊急連絡先

### プロフィール詳細
- **自己紹介**: ユーザーの自己紹介文
- **プロフィール画像**: アバター画像のURL
- **健康目標**: ユーザーが設定した健康目標
- **興味のある健康トピック**: より詳細な興味分野

### 健康情報
- **アレルギー情報**: アレルギーがある場合の情報
- **持病**: 持病がある場合の情報（任意）
- **服薬情報**: 現在服用している薬（任意）

## API エンドポイント

### 現在のユーザー情報を取得
```
GET /api/auth/me
```

レスポンス例：
```json
{
  "id": "user-id",
  "name": "従業員 花子",
  "employeeNumber": "EMP001",
  "birthDate": "1990-05-15T00:00:00.000Z",
  "gender": "FEMALE",
  "jobType": "SALES",
  "department": {
    "id": "dept-id",
    "name": "営業部"
  },
  "profile": {
    "hasChildren": true,
    "childrenAges": [5, 8],
    "isMarried": true,
    "interestedCategories": ["PHYSICAL", "FAMILY"]
  }
}
```

### プロフィール登録・更新
```
POST /api/auth/register-profile
```

リクエスト例：
```json
{
  "hasChildren": true,
  "childrenAges": [5, 8],
  "isMarried": true,
  "interestedCategories": ["PHYSICAL", "FAMILY"]
}
```

## 体験談のダミーデータ

追加の体験談ダミーデータを投入するには：

```bash
# 追加の体験談データを投入
npm run db:seed:experiences:extra
```

このスクリプトは、以下のカテゴリの体験談を追加します：
- 身体（PHYSICAL）: 運動不足、目の疲れ、冷え性、膝痛、ダイエットなど
- 心・精神（MENTAL）: うつ、不安、ストレス、パニック障害など
- 家族（FAMILY）: 育児、アレルギー、高齢者ケアなど
- 生活習慣（LIFESTYLE）: 食事、睡眠、禁煙など

合計15件の追加体験談が投入されます。

