# 🎯 要件定義書 v2.0
## 法人向け健康プラットフォーム「HealthConnect」
### メディキャンバス × ラグスタ 共同開発

---

## 📋 更新履歴

| バージョン | 日付 | 更新内容 |
|---|---|---|
| v1.0 | 2025-01-05 | 初版作成 |
| v2.0 | 2025-01-05 | ポイント機能削除、統計機能追加、予約Mock化、健康コンテンツ機能追加、マッチングアルゴリズム具体化 |

---

## 📚 目次

1. [システム概要](#1-システム概要)
2. [ユーザー種別と権限](#2-ユーザー種別と権限)
3. [主要機能一覧](#3-主要機能一覧)
4. [画面遷移図](#4-画面遷移図)
5. [機能詳細仕様](#5-機能詳細仕様)
6. [マッチングアルゴリズム](#6-マッチングアルゴリズム)
7. [データ構造](#7-データ構造)
8. [外部連携](#8-外部連携)
9. [統計機能の詳細](#9-統計機能の詳細)
10. [API設計](#10-api設計)
11. [非機能要件](#11-非機能要件)
12. [開発環境](#12-開発環境)
13. [セキュリティ要件](#13-セキュリティ要件)
14. [開発フェーズ](#14-開発フェーズ)

---

## 1. システム概要

### 1.1 プロジェクト名
**「HealthConnect」(仮称)**
法人向け健康体験共有 × 運動教室 × 健康コンテンツ 統合プラットフォーム

### 1.2 目的
- 従業員が患者体験談を閲覧・投稿できるプラットフォームの提供
- ラグスタの運動教室情報の配信(予約機能はMock)
- ラグスタの健康コンテンツ(動画・記事・PDF)の提供
- 個人・部署・会社全体の健康データの可視化
- 他社比較による健康経営の促進

### 1.3 システム構成

```
┌─────────────────────────────────┐
│ フロントエンド(Next.js)            │
│ - 従業員向けWebアプリ              │
│ - 管理者向け管理画面               │
│ - ラグスタ向け管理画面             │
└─────────────────────────────────┘
           ↓ API通信
┌─────────────────────────────────┐
│ バックエンド(Express.js + Prisma) │
│ - REST API                        │
│ - 認証・認可                       │
│ - データ処理                       │
│ - 統計集計                         │
│ - マッチングアルゴリズム           │
└─────────────────────────────────┘
           ↓ CRUD
┌─────────────────────────────────┐
│ データベース(PostgreSQL)          │
│ - ユーザー情報                     │
│ - 体験談データ                     │
│ - 統計データ                       │
│ - 健康コンテンツ                   │
└─────────────────────────────────┘
           ↓ 連携
┌─────────────────────────────────┐
│ 外部データ                         │
│ - うちあけDB(スプレッドシート)     │
│ - ラグスタ教室情報(Mock)           │
└─────────────────────────────────┘
```

### 1.4 提供者の役割分担

```
【メディキャンバス】
✓ システム開発・保守
✓ うちあけDBの提供
✓ サーバー運用
✓ データ管理
✓ マッチングアルゴリズム開発

【ラグスタ】
✓ 運動教室の企画・開催
✓ トレーナー派遣
✓ 健康コンテンツ提供(動画・記事・PDF)
✓ 健康トレンド分析
✓ 法人営業・展開
```

---

## 2. ユーザー種別と権限

### 2.1 ユーザー種別

| 種別 | 説明 | 権限レベル |
|---|---|---|
| **従業員** | 法人契約企業の社員 | Level 1 |
| **人事管理者** | 企業の人事担当者 | Level 2 |
| **ラグスタスタッフ** | 教室運営・データ分析・コンテンツ管理 | Level 3 |
| **システム管理者** | メディキャンバス社員 | Level 4 |

### 2.2 権限マトリクス

| 機能 | 従業員 | 人事管理者 | ラグスタ | システム管理者 |
|---|---|---|---|---|
| 体験談閲覧 | ✅ | ✅ | ✅ | ✅ |
| 体験談投稿 | ✅ | ✅ | ❌ | ✅ |
| 個人統計閲覧 | ✅ | ❌ | ❌ | ✅ |
| 健康コンテンツ閲覧 | ✅ | ✅ | ✅ | ✅ |
| 健康コンテンツ管理 | ❌ | ❌ | ✅ | ✅ |
| 教室情報閲覧 | ✅ | ✅ | ✅ | ✅ |
| ダッシュボード閲覧 | ❌ | ✅ | ✅ | ✅ |
| 教室管理(Mock) | ❌ | ❌ | ✅ | ✅ |
| ユーザー管理 | ❌ | ✅(自社のみ) | ❌ | ✅ |
| 法人管理 | ❌ | ❌ | ❌ | ✅ |

---

## 3. 主要機能一覧

### 3.1 従業員向け機能

```
【F-001】 ユーザー登録・ログイン
【F-002】 プロフィール設定(家族情報含む)
【F-003】 体験談閲覧(マッチング機能)
【F-004】 体験談投稿
【F-005】 体験談への反応(参考になった)
【F-006】 教室一覧表示(Mock)
【F-007】 マイページ
【F-008】 個人統計表示
【F-009】 部署比較表示
【F-010】 会社間比較表示
【F-011】 お知らせ表示
【F-012】 健康コンテンツ閲覧
【F-013】 同年代の病気傾向表示
```

### 3.2 人事管理者向け機能

```
【F-101】 管理者ダッシュボード
【F-102】 従業員登録一括インポート
【F-103】 閲覧データ分析
【F-104】 部署別レポート
【F-105】 全社統計表示
【F-106】 他社比較レポート
【F-107】 月次レポート出力
【F-108】 お知らせ配信
```

### 3.3 ラグスタ向け機能

```
【F-201】 教室情報管理(Mock)
【F-202】 閲覧トレンド分析
【F-203】 教室レコメンド提案
【F-204】 複数社統計閲覧
【F-205】 健康コンテンツ管理
```

### 3.4 システム管理機能

```
【F-301】 法人アカウント管理
【F-302】 全体統計表示
【F-303】 システム設定
【F-304】 ログ管理
【F-305】 バックアップ管理
```

---

## 4. 画面遷移図

```
┌─────────────────┐
│ ログイン画面      │
└─────────────────┘
         ↓
┌─────────────────┐
│ 初回登録          │
│ - プロフィール設定│
│ - 家族情報登録    │
│   - 子供の有無    │
│   - 子供の年齢    │
│   - 結婚有無      │
│ - 部署選択        │
└─────────────────┘
         ↓
┌─────────────────────────────────┐
│ ホーム画面                            │
├─────────────────────────────────┤
│ ├─ おすすめ体験談(マッチング)        │
│ ├─ 同年代の病気傾向                  │
│ ├─ 今週の教室(Mock)                 │
│ ├─ おすすめ健康コンテンツ            │
│ ├─ あなたの統計                      │
│ └─ 最近の投稿                        │
└─────────────────────────────────┘
    │
    ├───→ 体験談検索
    │      ├─ カテゴリ検索
    │      ├─ キーワード検索
    │      └─ 体験談詳細
    │           ├─ 全文表示
    │           ├─ 参考になったボタン
    │           └─ コメント
    │
    ├───→ 体験談投稿
    │      ├─ 投稿フォーム
    │      └─ 投稿完了
    │
    ├───→ 健康コンテンツ
    │      ├─ カテゴリ別表示
    │      ├─ 動画視聴
    │      ├─ 記事閲覧
    │      └─ PDF ダウンロード
    │
    ├───→ 教室一覧(Mock)
    │      └─ 教室詳細
    │
    ├───→ マイページ
    │      ├─ プロフィール編集
    │      ├─ 投稿履歴
    │      ├─ 個人統計
    │      │   ├─ 閲覧数
    │      │   ├─ 投稿数
    │      │   └─ アクティビティ
    │      ├─ 部署比較
    │      └─ 会社間比較
    │
    └───→ お知らせ
```

---

## 5. 機能詳細仕様

### 【F-001】 ユーザー登録・ログイン

#### 5.1.1 概要
従業員が初回登録およびログインする機能

#### 5.1.2 画面要素

**ログイン画面**
```
┌─────────────────────────────┐
│ HealthConnect               │
│                             │
│ 法人コード: [__________]    │
│ 社員番号:   [__________]    │
│ パスワード: [__________]    │
│                             │
│ [ ログイン ]                │
│                             │
│ 初回の方はこちら            │
└─────────────────────────────┘
```

**初回登録画面**
```
┌─────────────────────────────┐
│ プロフィール登録            │
│                             │
│ 法人コード: [__________]    │
│ 社員番号:   [__________]    │
│ 氏名:       [__________]    │
│ 生年月日:   [____/__/__]    │
│ 性別:       ( ) 男性        │
│             ( ) 女性        │
│             ( ) その他      │
│ 部署:       [__________] ▼  │
│ 職種:       [__________] ▼  │
│                             │
│ パスワード: [__________]    │
│ 確認:       [__________]    │
│                             │
│ [ 次へ ]                    │
└─────────────────────────────┘
```

**家族情報登録画面**
```
┌─────────────────────────────┐
│ 家族情報の登録              │
│ (マッチング精度向上のため)  │
│                             │
│ お子さんはいますか？        │
│ ( ) はい                    │
│ ( ) いいえ                  │
│                             │
│ お子さんの年齢              │
│ 1人目: [__] 歳              │
│ 2人目: [__] 歳              │
│ [ + 追加 ]                  │
│                             │
│ 結婚していますか？          │
│ ( ) はい                    │
│ ( ) いいえ                  │
│                             │
│ 関心のある健康トピック      │
│ ☑ 腰痛・肩こり              │
│ ☑ メンタルヘルス            │
│ ☐ 生活習慣病                │
│ ☐ 睡眠                      │
│                             │
│ [ 完了 ] [ スキップ ]       │
└─────────────────────────────┘
```

#### 5.1.3 処理フロー

```
1. 従業員が法人コード、社員番号、パスワードを入力
2. システムが認証情報を検証
3. 初回ログインの場合
   → プロフィール登録画面へ遷移
   → 家族情報登録画面へ遷移
4. 2回目以降
   → ホーム画面へ遷移
```

#### 5.1.4 バリデーション

| 項目 | 検証内容 |
|---|---|
| 法人コード | 8桁の英数字、登録済み法人のみ |
| 社員番号 | 最大20文字、半角英数字 |
| パスワード | 8文字以上、英数字記号混在 |
| 氏名 | 必須、最大50文字 |
| 生年月日 | 必須、18歳以上 |
| 子供の年齢 | 0-30歳の範囲 |

---

### 【F-003】 体験談閲覧(マッチング機能)

#### 5.3.1 概要
15,000人の患者体験談から、ユーザーに最適な体験談を表示
ユーザーの年齢、性別、家族構成に基づいて4つのカテゴリに分類してマッチング

#### 5.3.2 画面レイアウト

```
┌─────────────────────────────────┐
│ あなたへのおすすめ              │
├─────────────────────────────────┤
│                                 │
│ 📊 35歳前後の健康傾向           │
│ ┌─────────────────────────┐   │
│ │ 1位 腰痛・肩こり (32%)     │   │
│ │ 2位 メンタルヘルス (18%)   │   │
│ │ 3位 生活習慣病 (15%)       │   │
│ │ 4位 不眠 (12%)             │   │
│ │ 5位 頭痛 (8%)              │   │
│ └─────────────────────────┘   │
│                                 │
│ 👤 あなた向け(35歳男性)        │
│ ┌─────────────────────────┐   │
│ │ マッチ度: 95% ⭐⭐⭐⭐⭐  │   │
│ │                           │   │
│ │ 34歳男性・営業職          │   │
│ │ 「デスクワークの腰痛改善」│   │
│ │                           │   │
│ │ 閲覧: 1,247 参考: 823     │   │
│ │ [ 詳細を見る ]            │   │
│ └─────────────────────────┘   │
│                                 │
│ 👶 お子さん向け(8歳、5歳)      │
│ ┌─────────────────────────┐   │
│ │ マッチ度: 88%             │   │
│ │                           │   │
│ │ 7歳女性・学生             │   │
│ │ 「子供のアレルギー対処法」│   │
│ │                           │   │
│ │ 閲覧: 534 参考: 312       │   │
│ │ [ 詳細を見る ]            │   │
│ └─────────────────────────┘   │
│                                 │
│ 💑 配偶者向け(35歳前後)        │
│ ┌─────────────────────────┐   │
│ │ マッチ度: 85%             │   │
│ │                           │   │
│ │ 36歳女性・事務職          │   │
│ │ 「更年期障害の初期症状」  │   │
│ │                           │   │
│ │ 閲覧: 876 参考: 543       │   │
│ │ [ 詳細を見る ]            │   │
│ └─────────────────────────┘   │
│                                 │
│ 👴 ご両親向け(65歳前後)        │
│ ┌─────────────────────────┐   │
│ │ マッチ度: 92%             │   │
│ │                           │   │
│ │ 68歳女性・無職            │   │
│ │ 「転倒予防で骨折回避」    │   │
│ │                           │   │
│ │ 閲覧: 2,156 参考: 1,234   │   │
│ │ [ 詳細を見る ]            │   │
│ └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### 【F-004】 体験談投稿

#### 5.4.1 投稿フォーム

```
┌─────────────────────────────────┐
│ 体験談を投稿する                │
├─────────────────────────────────┤
│                                 │
│ 誰の体験談ですか?               │
│ ( ) 自分                        │
│ ( ) 子供                        │
│ ( ) 配偶者                      │
│ ( ) 親                          │
│                                 │
│ カテゴリを選択                  │
│ [ 心・精神        ▼]           │
│                                 │
│ タイトル(必須)                  │
│ [_______________________]       │
│                                 │
│ 本文(300文字以上推奨)           │
│ ┌─────────────────────────┐   │
│ │                           │   │
│ │                           │   │
│ │                           │   │
│ │                           │   │
│ └─────────────────────────┘   │
│ 残り: 0/3000文字                │
│                                 │
│ タグ(任意)                      │
│ [#腰痛] [#ストレッチ]          │
│                                 │
│ 公開設定                        │
│ ( ) 社内のみ公開                │
│ ( ) 匿名で公開                  │
│                                 │
│ [ 投稿する ] [ 下書き保存 ]     │
└─────────────────────────────────┘
```

---

### 【F-008】 個人統計表示

#### 5.8.1 概要
従業員が自分の活動状況を確認できる機能

#### 5.8.2 画面レイアウト

```
┌─────────────────────────────────┐
│ あなたの活動統計                │
├─────────────────────────────────┤
│                                 │
│ 📊 今月の活動                   │
│ ┌─────────────────────────┐   │
│ │ 体験談閲覧数                │   │
│ │ 42件                        │   │
│ │ 先月比: +12件 (↑40%)       │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ 体験談投稿数                │   │
│ │ 3件                         │   │
│ │ 先月比: +1件                │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ 「参考になった」をもらった  │   │
│ │ 28件                        │   │
│ │ あなたの投稿が28人の役に!  │   │
│ └─────────────────────────┘   │
│                                 │
│ 📈 累計                         │
│ - 総閲覧数: 234件               │
│ - 総投稿数: 8件                 │
│ - 総反応数: 156件               │
│                                 │
│ 🏆 社内ランキング               │
│ - 閲覧数: 全社12位 / 500人     │
│ - 投稿数: 全社8位 / 500人      │
└─────────────────────────────────┘
```

---

### 【F-009】 部署比較表示

#### 5.9.1 概要
自分の部署と他部署の活動状況を比較

#### 5.9.2 画面レイアウト

```
┌─────────────────────────────────┐
│ 部署別ランキング                │
├─────────────────────────────────┤
│                                 │
│ 📊 体験談閲覧数(今月)           │
│ ┌─────────────────────────┐   │
│ │ 1位 営業部  1,247件 🥇     │   │
│ │ 2位 製造部    892件        │   │
│ │ 3位 総務部    678件 ← あなた│   │
│ │ 4位 開発部    543件        │   │
│ │ 5位 経理部    412件        │   │
│ └─────────────────────────┘   │
│                                 │
│ 📝 体験談投稿数(今月)           │
│ ┌─────────────────────────┐   │
│ │ 1位 総務部     42件 🥇← あなた│   │
│ │ 2位 営業部     38件        │   │
│ │ 3位 開発部     28件        │   │
│ │ 4位 製造部     21件        │   │
│ │ 5位 経理部     15件        │   │
│ └─────────────────────────┘   │
│                                 │
│ 💡 総務部の傾向                 │
│ - 最も関心の高いトピック:       │
│   「メンタルヘルス」(48%)      │
│ - 投稿が活発な時間帯:           │
│   「12:00-13:00」(昼休み)      │
└─────────────────────────────────┘
```

---

### 【F-010】 会社間比較表示

#### 5.10.1 概要
自社と全国平均(他社集計)を比較

#### 5.10.2 画面レイアウト

```
┌─────────────────────────────────┐
│ 全国平均との比較                │
├─────────────────────────────────┤
│                                 │
│ 📊 健康課題の分布               │
│ ┌─────────────────────────┐   │
│ │ 腰痛・肩こり                │   │
│ │ 貴社: ████████████ 45%     │   │
│ │ 全国: ██████░░░░ 33%      │   │
│ │ → +12pt 高い ⚠️            │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ メンタルヘルス              │   │
│ │ 貴社: ████░░░░░░ 12%      │   │
│ │ 全国: ████████░░ 20%      │   │
│ │ → -8pt 低い ✅             │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ 運動習慣なし                │   │
│ │ 貴社: ████████░░ 42%      │   │
│ │ 全国: █████████████ 68%   │   │
│ │ → -26pt 良好 ⭐️           │   │
│ └─────────────────────────┘   │
│                                 │
│ 📈 活動状況                     │
│ ┌─────────────────────────┐   │
│ │ 1人あたり月間閲覧数         │   │
│ │ 貴社: 8.4件                │   │
│ │ 全国: 5.2件                │   │
│ │ → 1.6倍 活発 ⭐️           │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ 登録率                      │   │
│ │ 貴社: 65.2%                │   │
│ │ 全国: 48.7%                │   │
│ │ → +16.5pt 高い ⭐️         │   │
│ └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### 【F-012】 健康コンテンツ閲覧

#### 5.12.1 概要
ラグスタが提供する健康コンテンツ(動画、記事、PDF)を閲覧

#### 5.12.2 コンテンツ種類

```
【動画コンテンツ】
- 自宅でできるストレッチ(5分)
- 腰痛予防エクササイズ(10分)
- 肩こり解消体操(8分)
- リラックスヨガ(15分)
- シニア向け転倒予防(12分)

【記事コンテンツ】
- 正しい姿勢の作り方
- デスクワークの腰痛対策
- メンタルヘルスケアの基礎
- 睡眠の質を上げる方法
- 生活習慣病予防のコツ

【PDFコンテンツ】
- ストレッチシート(印刷用)
- 健康チェックリスト
- 食事記録テンプレート
```

#### 5.12.3 画面レイアウト

```
┌─────────────────────────────────┐
│ 健康コンテンツ                  │
├─────────────────────────────────┤
│                                 │
│ カテゴリ:                       │
│ [ 全て ▼] [ 動画 ] [ 記事 ]   │
│                                 │
│ 🎥 動画コンテンツ               │
│ ┌─────────────────────────┐   │
│ │ [サムネイル画像]          │   │
│ │                           │   │
│ │ デスクワーク腰痛対策      │   │
│ │ 5分で簡単ストレッチ       │   │
│ │                           │   │
│ │ 👁 1,247回視聴            │   │
│ │ ⏱ 5:32                   │   │
│ │ [ 視聴する ]              │   │
│ └─────────────────────────┘   │
│                                 │
│ 📄 記事コンテンツ               │
│ ┌─────────────────────────┐   │
│ │ 正しい姿勢の作り方        │   │
│ │                           │   │
│ │ デスクワークで崩れがちな  │   │
│ │ 姿勢を正しく保つための... │   │
│ │                           │   │
│ │ 👁 892回閲覧              │   │
│ │ [ 読む ]                  │   │
│ └─────────────────────────┘   │
│                                 │
│ 📥 ダウンロード資料             │
│ ┌─────────────────────────┐   │
│ │ ストレッチシート(PDF)     │   │
│ │                           │   │
│ │ 印刷して職場やご自宅で    │   │
│ │ ご活用いただけます        │   │
│ │                           │   │
│ │ 📥 243ダウンロード        │   │
│ │ [ ダウンロード ]          │   │
│ └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

### 【F-013】 同年代の病気傾向表示

#### 5.13.1 概要
ユーザーと同年代(±5歳)の人がどんな健康課題を抱えているかを表示

#### 5.13.2 画面レイアウト

```
┌─────────────────────────────────┐
│ 35歳前後の健康傾向              │
├─────────────────────────────────┤
│                                 │
│ 📊 最も多い健康課題 TOP 5       │
│ ┌─────────────────────────┐   │
│ │ 1位 腰痛・肩こり (32%)     │   │
│ │ ・デスクワーク               │   │
│ │ ・姿勢の悪さ                 │   │
│ │ ・運動不足                   │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ 2位 メンタルヘルス (18%)   │   │
│ │ ・仕事のストレス             │   │
│ │ ・不眠                       │   │
│ │ ・不安感                     │   │
│ └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────┐   │
│ │ 3位 生活習慣病 (15%)       │   │
│ │ ・高血圧                     │   │
│ │ ・脂質異常                   │   │
│ │ ・血糖値上昇                 │   │
│ └─────────────────────────┘   │
│                                 │
│ 💡 予防のヒント                 │
│ - 定期的な運動習慣の確立        │
│ - ストレス管理の工夫            │
│ - 定期健診の受診                │
│                                 │
│ 📚 関連コンテンツ               │
│ [ 腰痛予防ストレッチ動画 ]      │
│ [ メンタルケア記事 ]            │
└─────────────────────────────────┘
```

---

## 6. マッチングアルゴリズム

### 6.1 概要

ユーザープロフィール(年齢、性別、家族構成)に基づいて、最適な体験談をマッチングするアルゴリズム。

**4つのカテゴリでマッチング:**
1. 自分向け: 年齢±5歳、同性別
2. 子供向け: 子供の年齢±3歳
3. 配偶者向け: 配偶者の想定年齢±5歳、異性
4. 親世代向け: 年齢+30歳前後、60歳以上

### 6.2 ユーザープロフィール項目

```javascript
const userProfile = {
  // 基本情報
  age: 35,
  gender: 'MALE', // MALE, FEMALE, OTHER
  
  // 家族情報
  hasChildren: true,
  childrenAges: [8, 5], // 子供の年齢配列
  isMarried: true,
  
  // 関心カテゴリ(任意)
  interestedCategories: ['BACK_PAIN', 'MENTAL_HEALTH'],
  
  // 職種
  jobType: 'SALES'
};
```

### 6.3 マッチングロジック

```javascript
/**
 * メインのマッチング関数
 */
async function getMatchedExperiences(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true
    }
  });
  
  // 全体験談を取得(自社 + うちあけDB)
  const allExperiences = await getAllExperiences();
  
  // 4つのカテゴリでマッチング
  return {
    forYou: matchForSelf(allExperiences, user),
    forChildren: matchForChildren(allExperiences, user),
    forSpouse: matchForSpouse(allExperiences, user),
    forParents: matchForParents(allExperiences, user),
    ageTrends: getAgeTrends(allExperiences, user.age)
  };
}

/**
 * 自分向けマッチング
 */
function matchForSelf(experiences, user) {
  return experiences
    .filter(exp => {
      // 年齢が±5歳以内
      const ageDiff = Math.abs(exp.age - user.age);
      if (ageDiff > 5) return false;
      
      // 性別が同じ
      if (exp.gender !== user.gender) return false;
      
      return true;
    })
    .map(exp => ({
      ...exp,
      matchScore: calculateSelfMatchScore(exp, user),
      reason: generateMatchReason(exp, user)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

/**
 * 自分向けのスコア計算
 */
function calculateSelfMatchScore(experience, user) {
  let score = 0;
  
  // 1. 年齢差が少ないほど高得点(最大100点)
  const ageDiff = Math.abs(experience.age - user.age);
  score += (5 - ageDiff) * 20;
  
  // 2. 性別が同じ(+50点)
  if (experience.gender === user.gender) {
    score += 50;
  }
  
  // 3. 職種が同じ(+30点)
  if (experience.jobType === user.jobType) {
    score += 30;
  }
  
  // 4. 関心カテゴリに該当(+40点)
  if (user.profile?.interestedCategories?.includes(experience.category)) {
    score += 40;
  }
  
  // 5. 人気度(閲覧数)(最大30点)
  score += Math.min(Math.log(experience.viewCount + 1) * 5, 30);
  
  // 6. 信頼度(参考になった数)(最大40点)
  score += Math.min(Math.log(experience.helpfulCount + 1) * 8, 40);
  
  // 7. 新しさ(最大20点)
  const daysSincePost = Math.floor(
    (Date.now() - new Date(experience.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(20 - daysSincePost / 10, 0);
  
  return Math.round(score);
}

/**
 * マッチング理由の生成
 */
function generateMatchReason(experience, user) {
  const reasons = [];
  
  const ageDiff = Math.abs(experience.age - user.age);
  if (ageDiff <= 1) {
    reasons.push('同年齢');
  } else if (ageDiff <= 3) {
    reasons.push(`年齢差${ageDiff}歳`);
  }
  
  if (experience.gender === user.gender) {
    reasons.push('同性');
  }
  
  if (experience.jobType === user.jobType) {
    reasons.push('同職種');
  }
  
  return reasons.join('、');
}

/**
 * 子供向けマッチング
 */
function matchForChildren(experiences, user) {
  if (!user.profile?.hasChildren) return [];
  
  const childrenAges = user.profile.childrenAges || [];
  
  return experiences
    .filter(exp => {
      // 子供の年齢±3歳の体験談
      return childrenAges.some(childAge => 
        Math.abs(exp.age - childAge) <= 3
      );
    })
    .map(exp => {
      const closestChildAge = childrenAges.reduce((closest, age) => {
        return Math.abs(exp.age - age) < Math.abs(exp.age - closest) ? age : closest;
      });
      
      return {
        ...exp,
        matchScore: calculateChildMatchScore(exp, closestChildAge),
        targetChild: closestChildAge
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

/**
 * 子供向けのスコア計算
 */
function calculateChildMatchScore(experience, childAge) {
  let score = 0;
  
  // 年齢差が少ないほど高得点
  const ageDiff = Math.abs(experience.age - childAge);
  score += (3 - ageDiff) * 30;
  
  // 人気度
  score += Math.min(Math.log(experience.viewCount + 1) * 5, 30);
  
  // 信頼度
  score += Math.min(Math.log(experience.helpfulCount + 1) * 8, 40);
  
  return Math.round(score);
}

/**
 * 配偶者向けマッチング
 */
function matchForSpouse(experiences, user) {
  if (!user.profile?.isMarried) return [];
  
  const spouseAge = user.age;
  const oppositeGender = user.gender === 'MALE' ? 'FEMALE' : 'MALE';
  
  return experiences
    .filter(exp => {
      const ageDiff = Math.abs(exp.age - spouseAge);
      return ageDiff <= 5 && exp.gender === oppositeGender;
    })
    .map(exp => ({
      ...exp,
      matchScore: calculateSpouseMatchScore(exp, user)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

/**
 * 配偶者向けのスコア計算
 */
function calculateSpouseMatchScore(experience, user) {
  let score = 0;
  
  // 年齢差
  const ageDiff = Math.abs(experience.age - user.age);
  score += (5 - ageDiff) * 20;
  
  // 人気度・信頼度
  score += Math.min(Math.log(experience.viewCount + 1) * 5, 30);
  score += Math.min(Math.log(experience.helpfulCount + 1) * 8, 40);
  
  return Math.round(score);
}

/**
 * 親世代向けマッチング
 */
function matchForParents(experiences, user) {
  // 親の想定年齢は自分+30歳前後
  const parentAge = user.age + 30;
  
  return experiences
    .filter(exp => {
      const ageDiff = Math.abs(exp.age - parentAge);
      return ageDiff <= 10 && exp.age >= 60; // 60歳以上に限定
    })
    .map(exp => ({
      ...exp,
      matchScore: calculateParentMatchScore(exp, parentAge)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

/**
 * 親世代向けのスコア計算
 */
function calculateParentMatchScore(experience, parentAge) {
  let score = 0;
  
  // 年齢差
  const ageDiff = Math.abs(experience.age - parentAge);
  score += (10 - ageDiff) * 10;
  
  // 人気度・信頼度
  score += Math.min(Math.log(experience.viewCount + 1) * 5, 30);
  score += Math.min(Math.log(experience.helpfulCount + 1) * 8, 40);
  
  return Math.round(score);
}

/**
 * 同年代の病気傾向分析
 */
function getAgeTrends(experiences, userAge) {
  const ageRange = {
    min: userAge - 5,
    max: userAge + 5
  };
  
  // 同年代の体験談を抽出
  const ageGroupExperiences = experiences.filter(exp => 
    exp.age >= ageRange.min && exp.age <= ageRange.max
  );
  
  // カテゴリ別に集計
  const categoryCount = {};
  ageGroupExperiences.forEach(exp => {
    categoryCount[exp.category] = (categoryCount[exp.category] || 0) + 1;
  });
  
  // 上位5位を返す
  return Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / ageGroupExperiences.length * 100).toFixed(1),
      examples: ageGroupExperiences
        .filter(exp => exp.category === category)
        .slice(0, 3)
        .map(exp => exp.subcategory || exp.title)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
```

### 6.4 マッチング精度の指標

```javascript
// マッチ度の表示
function getMatchLabel(score) {
  if (score >= 200) return { label: '非常に高い', stars: 5 };
  if (score >= 150) return { label: '高い', stars: 4 };
  if (score >= 100) return { label: '中程度', stars: 3 };
  if (score >= 50) return { label: '低い', stars: 2 };
  return { label: '参考程度', stars: 1 };
}
```

---

## 7. データ構造

### 7.1 ER図(概要)

```
┌──────────────┐
│ companies    │ 法人情報
├──────────────┤
│ id (PK)      │
│ name         │
│ code         │
└──────────────┘
       │ 1
       │
       │ N
┌──────────────┐
│ departments  │ 部署
├──────────────┤
│ id (PK)      │
│ company_id(FK)│
│ name         │
└──────────────┘
       │ 1
       │
       │ N
┌──────────────┐
│ users        │ ユーザー
├──────────────┤
│ id (PK)      │
│ company_id(FK)│
│ department_id│
│ name         │
└──────────────┘
       │ 1
       │
       │ 1
┌──────────────┐
│ user_profiles│ 拡張プロフィール
├──────────────┤
│ id (PK)      │
│ user_id (FK) │
│ has_children │
│ children_ages│
│ is_married   │
└──────────────┘

┌──────────────┐      ┌──────────────┐
│ experiences  │      │ health_      │
├──────────────┤      │ contents     │
│ id (PK)      │      ├──────────────┤
│ user_id (FK) │      │ id (PK)      │
│ category     │      │ title        │
│ content      │      │ type         │
└──────────────┘      │ content_url  │
       │ 1            └──────────────┘
       │                     │ 1
       │ N                   │ N
┌──────────────┐      ┌──────────────┐
│ reactions    │      │ content_view │
├──────────────┤      │ _logs        │
│ id (PK)      │      ├──────────────┤
│ experience_id│      │ id (PK)      │
│ user_id (FK) │      │ content_id   │
│ type         │      │ user_id      │
└──────────────┘      └──────────────┘

┌──────────────┐
│ activity_logs│ 活動ログ
├──────────────┤
│ id (PK)      │
│ user_id (FK) │
│ action       │
│ target_id    │
└──────────────┘

┌──────────────┐
│ classes      │ 教室(Mock)
├──────────────┤
│ id (PK)      │
│ title        │
│ date         │
└──────────────┘
```

### 7.2 テーブル定義(Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// 法人・部署
// ========================================

model Company {
  id            String       @id @default(uuid())
  name          String
  code          String       @unique // 8桁の法人コード
  contractPlan  String       // STANDARD, PREMIUM
  maxUsers      Int          // 契約人数上限
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  users         User[]
  departments   Department[]
  classes       Class[]
}

model Department {
  id           String   @id @default(uuid())
  companyId    String
  name         String   // 営業部、総務部、開発部など
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  company      Company  @relation(fields: [companyId], references: [id])
  users        User[]
  
  @@unique([companyId, name])
}

// ========================================
// ユーザー
// ========================================

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
  role            String       @default("EMPLOYEE") // EMPLOYEE, ADMIN, RAGUSTA, SYSTEM
  isActive        Boolean      @default(true)
  lastLoginAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  company         Company      @relation(fields: [companyId], references: [id])
  department      Department   @relation(fields: [departmentId], references: [id])
  profile         UserProfile?
  experiences     Experience[]
  reactions       Reaction[]
  activityLogs    ActivityLog[]
  contentViewLogs ContentViewLog[]
  
  @@unique([companyId, employeeNumber])
}

model UserProfile {
  id                    String   @id @default(uuid())
  userId                String   @unique
  hasChildren           Boolean  @default(false)
  childrenAges          Int[]    // 配列で複数の子供の年齢
  isMarried             Boolean  @default(false)
  interestedCategories  String[] // 関心カテゴリ
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  user                  User     @relation(fields: [userId], references: [id])
}

// ========================================
// 体験談
// ========================================

model Experience {
  id           String     @id @default(uuid())
  userId       String
  category     String     // MENTAL, PHYSICAL, FAMILY, etc
  subcategory  String?    // 詳細カテゴリ
  targetPerson String     // SELF, CHILD, SPOUSE, PARENT
  title        String
  content      String     @db.Text
  tags         String[]   // タグの配列
  isPublic     Boolean    @default(true)
  isAnonymous  Boolean    @default(false)
  viewCount    Int        @default(0)
  helpfulCount Int        @default(0)
  status       String     @default("PUBLISHED") // DRAFT, PUBLISHED, ARCHIVED
  publishedAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  user         User       @relation(fields: [userId], references: [id])
  reactions    Reaction[]
}

model Reaction {
  id           String     @id @default(uuid())
  experienceId String
  userId       String
  type         String     // HELPFUL, BOOKMARK
  createdAt    DateTime   @default(now())
  
  experience   Experience @relation(fields: [experienceId], references: [id])
  user         User       @relation(fields: [userId], references: [id])
  
  @@unique([experienceId, userId, type])
}

// ========================================
// 活動ログ
// ========================================

model ActivityLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // VIEW_EXPERIENCE, POST_EXPERIENCE, HELPFUL, VIEW_CONTENT, etc
  targetId  String?  // 閲覧した体験談IDやコンテンツIDなど
  metadata  Json?    // 追加情報
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId, action, createdAt])
  @@index([createdAt])
}

// ========================================
// 健康コンテンツ
// ========================================

model HealthContent {
  id            String           @id @default(uuid())
  title         String
  description   String           @db.Text
  category      String           // BACK_PAIN, MENTAL, SENIOR, etc
  type          String           // VIDEO, ARTICLE, PDF
  contentUrl    String           // 動画URL or 記事URL or PDF URL
  thumbnailUrl  String?          // サムネイルURL
  duration      Int?             // 動画の場合の長さ(秒)
  tags          String[]         // タグ
  viewCount     Int              @default(0)
  downloadCount Int?             @default(0) // PDFの場合
  isPublic      Boolean          @default(true)
  publishedAt   DateTime?
  createdBy     String           // RAGUSTA
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  
  viewLogs      ContentViewLog[]
}

model ContentViewLog {
  id        String        @id @default(uuid())
  contentId String
  userId    String
  viewedAt  DateTime      @default(now())
  
  content   HealthContent @relation(fields: [contentId], references: [id])
  user      User          @relation(fields: [userId], references: [id])
  
  @@index([userId, viewedAt])
  @@index([contentId, viewedAt])
}

// ========================================
// 教室(Mock)
// ========================================

model Class {
  id          String   @id @default(uuid())
  companyId   String
  title       String
  description String   @db.Text
  category    String   // BACK_PAIN, MENTAL, SENIOR, etc
  type        String   // ONSITE, ONLINE
  date        DateTime
  startTime   String   // "18:00"
  endTime     String   // "18:45"
  location    String?  // 対面の場合
  onlineUrl   String?  // オンラインの場合
  capacity    Int
  status      String   @default("SCHEDULED") // SCHEDULED, COMPLETED, CANCELLED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id])
}
```

---

## 8. 外部連携

### 8.1 うちあけDB(スプレッドシート連携)

#### 8.1.1 スプレッドシート項目

```
【必須項目】
A列: id (一意のID)
B列: age (年齢)
C列: gender (性別: MALE/FEMALE/OTHER)
D列: job_type (職種: SALES/ENGINEER/OFFICE/etc)
E列: category (カテゴリ: MENTAL/PHYSICAL/etc)
F列: subcategory (詳細カテゴリ)
G列: title (タイトル)
H列: content (本文)
I列: tags (タグ、カンマ区切り)
J列: created_at (投稿日時: YYYY-MM-DD HH:MM:SS)
K列: view_count (閲覧数)
L列: helpful_count (参考になった数)

【オプション項目】
M列: target_person (SELF/CHILD/SPOUSE/PARENT)
N列: duration (罹患期間)
O列: treatment (治療法)
```

#### 8.1.2 連携方法

```javascript
import { google } from 'googleapis';

// Google Sheets APIで取得
async function fetchUchiakeExperiences() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.UCHIAKE_SHEET_ID,
    range: 'データ!A2:O' // 2行目以降(ヘッダーを除く)
  });
  
  const rows = response.data.values;
  
  return rows.map(row => ({
    id: row[0],
    age: parseInt(row[1]),
    gender: row[2],
    jobType: row[3],
    category: row[4],
    subcategory: row[5],
    title: row[6],
    content: row[7],
    tags: row[8]?.split(',').map(t => t.trim()) || [],
    createdAt: new Date(row[9]),
    viewCount: parseInt(row[10]) || 0,
    helpfulCount: parseInt(row[11]) || 0,
    targetPerson: row[12] || 'SELF',
    duration: row[13],
    treatment: row[14],
    source: 'UCHIAKE' // データソースを明示
  }));
}

// キャッシュ機能を追加(1時間)
let cachedExperiences = null;
let lastFetchTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

async function getUchiakeExperiences() {
  const now = Date.now();
  
  if (cachedExperiences && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedExperiences;
  }
  
  cachedExperiences = await fetchUchiakeExperiences();
  lastFetchTime = now;
  
  return cachedExperiences;
}

// 自社 + うちあけDBをマージ
async function getAllExperiences() {
  // 自社の体験談
  const internalExperiences = await prisma.experience.findMany({
    where: {
      isPublic: true,
      status: 'PUBLISHED'
    },
    include: {
      user: {
        select: {
          age: true,
          gender: true,
          jobType: true
        }
      }
    }
  });
  
  // うちあけDBの体験談
  const uchiakeExperiences = await getUchiakeExperiences();
  
  // マージして返す
  return [
    ...internalExperiences.map(exp => ({
      ...exp,
      age: calculateAge(exp.user.birthDate),
      gender: exp.user.gender,
      jobType: exp.user.jobType,
      source: 'INTERNAL'
    })),
    ...uchiakeExperiences
  ];
}
```

---

## 9. 統計機能の詳細

### 9.1 個人統計の計算

```javascript
/**
 * 個人統計を計算
 */
async function calculatePersonalStats(userId, period = 'month') {
  const startDate = getStartDate(period); // month, quarter, year
  
  // 閲覧数
  const viewCount = await prisma.activityLog.count({
    where: {
      userId,
      action: 'VIEW_EXPERIENCE',
      createdAt: { gte: startDate }
    }
  });
  
  // 前期間の閲覧数
  const prevStartDate = getPrevStartDate(period);
  const prevViewCount = await prisma.activityLog.count({
    where: {
      userId,
      action: 'VIEW_EXPERIENCE',
      createdAt: {
        gte: prevStartDate,
        lt: startDate
      }
    }
  });
  
  // 投稿数
  const postCount = await prisma.experience.count({
    where: {
      userId,
      createdAt: { gte: startDate }
    }
  });
  
  // もらった「参考になった」数
  const helpfulReceived = await prisma.reaction.count({
    where: {
      experience: { userId },
      type: 'HELPFUL',
      createdAt: { gte: startDate }
    }
  });
  
  // 押した「参考になった」数
  const helpfulGiven = await prisma.reaction.count({
    where: {
      userId,
      type: 'HELPFUL',
      createdAt: { gte: startDate }
    }
  });
  
  // 累計
  const totalViews = await prisma.activityLog.count({
    where: {
      userId,
      action: 'VIEW_EXPERIENCE'
    }
  });
  
  const totalPosts = await prisma.experience.count({
    where: { userId }
  });
  
  const totalHelpfulReceived = await prisma.reaction.count({
    where: {
      experience: { userId },
      type: 'HELPFUL'
    }
  });
  
  // 社内ランキング
  const companyId = await getUserCompanyId(userId);
  const ranking = await calculateRanking(userId, companyId, startDate);
  
  return {
    period,
    current: {
      viewCount,
      postCount,
      helpfulReceived,
      helpfulGiven
    },
    comparison: {
      viewCountDiff: viewCount - prevViewCount,
      viewCountPercent: calculatePercent(viewCount, prevViewCount)
    },
    total: {
      viewCount: totalViews,
      postCount: totalPosts,
      helpfulReceived: totalHelpfulReceived
    },
    ranking
  };
}

// ランキング計算
async function calculateRanking(userId, companyId, startDate) {
  // 閲覧数ランキング
  const viewRanking = await prisma.$queryRaw`
    SELECT 
      user_id,
      COUNT(*) as view_count,
      RANK() OVER (ORDER BY COUNT(*) DESC) as rank
    FROM activity_logs
    WHERE 
      user_id IN (SELECT id FROM users WHERE company_id = ${companyId})
      AND action = 'VIEW_EXPERIENCE'
      AND created_at >= ${startDate}
    GROUP BY user_id
  `;
  
  const userViewRank = viewRanking.find(r => r.user_id === userId)?.rank || null;
  
  // 投稿数ランキング
  const postRanking = await prisma.$queryRaw`
    SELECT 
      user_id,
      COUNT(*) as post_count,
      RANK() OVER (ORDER BY COUNT(*) DESC) as rank
    FROM experiences
    WHERE 
      user_id IN (SELECT id FROM users WHERE company_id = ${companyId})
      AND created_at >= ${startDate}
    GROUP BY user_id
  `;
  
  const userPostRank = postRanking.find(r => r.user_id === userId)?.rank || null;
  
  // 総ユーザー数
  const totalUsers = await prisma.user.count({
    where: { companyId, isActive: true }
  });
  
  return {
    viewRank: userViewRank,
    postRank: userPostRank,
    totalUsers
  };
}
```

### 9.2 部署別統計の計算

```javascript
/**
 * 部署別統計を計算
 */
async function calculateDepartmentStats(companyId, period = 'month') {
  const startDate = getStartDate(period);
  
  const departments = await prisma.department.findMany({
    where: { companyId, isActive: true }
  });
  
  const stats = await Promise.all(
    departments.map(async (dept) => {
      // 部署のユーザー数
      const userCount = await prisma.user.count({
        where: { departmentId: dept.id, isActive: true }
      });
      
      // 部署の閲覧数
      const viewCount = await prisma.activityLog.count({
        where: {
          user: { departmentId: dept.id },
          action: 'VIEW_EXPERIENCE',
          createdAt: { gte: startDate }
        }
      });
      
      // 部署の投稿数
      const postCount = await prisma.experience.count({
        where: {
          user: { departmentId: dept.id },
          createdAt: { gte: startDate }
        }
      });
      
      // 最も関心の高いカテゴリ
      const topCategory = await getTopCategoryByDepartment(dept.id, startDate);
      
      // 投稿が活発な時間帯
      const activeHours = await getActiveHours(dept.id, startDate);
      
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        userCount,
        viewCount,
        postCount,
        avgViewsPerUser: userCount > 0 ? (viewCount / userCount).toFixed(1) : 0,
        topCategory,
        activeHours
      };
    })
  );
  
  return {
    byViewCount: [...stats].sort((a, b) => b.viewCount - a.viewCount),
    byPostCount: [...stats].sort((a, b) => b.postCount - a.postCount)
  };
}

// 部署の最も関心の高いカテゴリ
async function getTopCategoryByDepartment(departmentId, startDate) {
  const categoryStats = await prisma.activityLog.groupBy({
    by: ['metadata'],
    where: {
      user: { departmentId },
      action: 'VIEW_EXPERIENCE',
      createdAt: { gte: startDate }
    },
    _count: true
  });
  
  // metadata.categoryで集計(簡略版)
  // 実際の実装では適切に処理
  
  return {
    category: 'MENTAL_HEALTH',
    percentage: 48
  };
}
```

### 9.3 会社間比較の計算

```javascript
/**
 * 会社間比較を計算
 */
async function calculateCompanyComparison(companyId) {
  // 自社統計
  const companyStats = await getCompanyAggregatedStats(companyId);
  
  // 全国統計(キャッシュ推奨)
  const nationalStats = await getNationalAverageStats();
  
  // カテゴリ別の比較
  const categoryComparison = await compareCategoryDistribution(
    companyId,
    nationalStats
  );
  
  return {
    company: companyStats,
    national: nationalStats,
    categories: categoryComparison,
    insights: generateInsights(companyStats, nationalStats)
  };
}

// 自社の集計統計
async function getCompanyAggregatedStats(companyId) {
  const startDate = startOfMonth(new Date());
  
  // 登録ユーザー数
  const totalUsers = await prisma.user.count({
    where: { companyId, isActive: true }
  });
  
  const registeredUsers = await prisma.user.count({
    where: {
      companyId,
      isActive: true,
      lastLoginAt: { not: null }
    }
  });
  
  // 閲覧数
  const totalViews = await prisma.activityLog.count({
    where: {
      user: { companyId },
      action: 'VIEW_EXPERIENCE',
      createdAt: { gte: startDate }
    }
  });
  
  // 投稿数
  const totalPosts = await prisma.experience.count({
    where: {
      user: { companyId },
      createdAt: { gte: startDate }
    }
  });
  
  // カテゴリ別の分布
  const categoryDist = await getCategoryDistribution(companyId);
  
  return {
    registrationRate: (registeredUsers / totalUsers * 100).toFixed(1),
    avgViewsPerUser: (totalViews / registeredUsers).toFixed(1),
    avgPostsPerUser: (totalPosts / registeredUsers).toFixed(2),
    ...categoryDist
  };
}

// 全国平均統計(日次でキャッシュ)
async function getNationalAverageStats() {
  // Redis等でキャッシュすることを推奨
  const cacheKey = `national_stats:${format(new Date(), 'yyyy-MM-dd')}`;
  
  // キャッシュがあれば返す
  // const cached = await redis.get(cacheKey);
  // if (cached) return JSON.parse(cached);
  
  const allCompanies = await prisma.company.findMany({
    where: { isActive: true }
  });
  
  const allStats = await Promise.all(
    allCompanies.map(company => getCompanyAggregatedStats(company.id))
  );
  
  const nationalAvg = {
    avgViewsPerUser: average(allStats.map(s => parseFloat(s.avgViewsPerUser))),
    avgPostsPerUser: average(allStats.map(s => parseFloat(s.avgPostsPerUser))),
    registrationRate: average(allStats.map(s => parseFloat(s.registrationRate))),
    backPainRate: average(allStats.map(s => s.backPainRate)),
    mentalRate: average(allStats.map(s => s.mentalRate)),
    exerciseRate: average(allStats.map(s => s.exerciseRate))
  };
  
  // キャッシュに保存
  // await redis.set(cacheKey, JSON.stringify(nationalAvg), 'EX', 86400);
  
  return nationalAvg;
}

// カテゴリ分布の取得
async function getCategoryDistribution(companyId) {
  const users = await prisma.user.findMany({
    where: { companyId, isActive: true },
    include: {
      profile: true,
      activityLogs: {
        where: {
          action: 'VIEW_EXPERIENCE',
          createdAt: {
            gte: subMonths(new Date(), 1)
          }
        }
      }
    }
  });
  
  // 簡略版: 実際はより詳細な集計が必要
  let backPainCount = 0;
  let mentalCount = 0;
  let noExerciseCount = 0;
  
  users.forEach(user => {
    const interests = user.profile?.interestedCategories || [];
    if (interests.includes('BACK_PAIN')) backPainCount++;
    if (interests.includes('MENTAL_HEALTH')) mentalCount++;
    // 運動習慣なしの判定ロジック
  });
  
  return {
    backPainRate: (backPainCount / users.length).toFixed(2),
    mentalRate: (mentalCount / users.length).toFixed(2),
    exerciseRate: (noExerciseCount / users.length).toFixed(2)
  };
}

// 平均値計算
function average(numbers) {
  if (numbers.length === 0) return 0;
  return (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(1);
}
```

---

## 10. API設計

### 10.1 認証API

```
POST /api/auth/login
Body: {
  companyCode: string,
  employeeNumber: string,
  password: string
}
Response: {
  token: string,
  user: { id, name, role },
  isFirstLogin: boolean
}

POST /api/auth/register
Body: {
  companyCode: string,
  employeeNumber: string,
  name: string,
  birthDate: string,
  gender: string,
  departmentId: string,
  jobType: string,
  password: string
}
Response: {
  token: string,
  user: { id, name }
}

POST /api/auth/register-profile
Headers: { Authorization: Bearer <token> }
Body: {
  hasChildren: boolean,
  childrenAges: number[],
  isMarried: boolean,
  interestedCategories: string[]
}
Response: {
  success: boolean
}
```

### 10.2 体験談API

```
GET /api/experiences/matched
Headers: { Authorization: Bearer <token> }
Response: {
  forYou: Experience[],
  forChildren: Experience[],
  forSpouse: Experience[],
  forParents: Experience[],
  ageTrends: CategoryTrend[]
}

GET /api/experiences/:id
Response: Experience

POST /api/experiences
Body: {
  category: string,
  subcategory: string,
  targetPerson: string,
  title: string,
  content: string,
  tags: string[],
  isAnonymous: boolean
}
Response: Experience

POST /api/experiences/:id/helpful
Response: { success: boolean }
```

### 10.3 統計API

```
GET /api/stats/personal
Query: period=month|quarter|year
Response: {
  current: { viewCount, postCount, helpfulReceived },
  comparison: { viewCountDiff, viewCountPercent },
  total: { viewCount, postCount, helpfulReceived },
  ranking: { viewRank, postRank, totalUsers }
}

GET /api/stats/departments
Query: period=month
Response: {
  byViewCount: Department[],
  byPostCount: Department[]
}

GET /api/stats/comparison
Query: period=month
Response: {
  company: CompanyStats,
  national: NationalStats,
  categories: CategoryComparison[],
  insights: Insight[]
}
```

### 10.4 健康コンテンツAPI

```
GET /api/health-contents
Query: 
  - category?: string
  - type?: VIDEO|ARTICLE|PDF
  - limit?: number
  - offset?: number
Response: {
  contents: HealthContent[],
  total: number
}

GET /api/health-contents/:id
Response: HealthContent

POST /api/health-contents/:id/view
Response: { success: boolean }

// ラグスタ向け管理API
POST /api/admin/health-contents
Headers: { Authorization: Bearer <token> }
Body: {
  title: string,
  description: string,
  category: string,
  type: string,
  contentUrl: string,
  thumbnailUrl?: string,
  duration?: number,
  tags: string[]
}
Response: HealthContent

PUT /api/admin/health-contents/:id
DELETE /api/admin/health-contents/:id
```

### 10.5 教室API(Mock)

```
GET /api/classes
Query: 
  - companyId: string
  - startDate?: string
  - endDate?: string
Response: Class[]

GET /api/classes/:id
Response: Class

// ラグスタ向け管理API
POST /api/admin/classes
PUT /api/admin/classes/:id
DELETE /api/admin/classes/:id
```

---

## 11. 非機能要件

### 11.1 パフォーマンス

| 項目 | 要件 | 対策 |
|---|---|---|
| ページ読み込み時間 | 3秒以内 | Next.js SSR, 画像最適化, CDN |
| API応答時間 | 500ms以内 | データベースインデックス、キャッシュ |
| 統計計算 | 2秒以内 | 集計テーブル、バッチ処理、Redis |
| スプレッドシート取得 | 10秒以内 | 1時間キャッシュ |
| マッチング処理 | 1秒以内 | スコア計算の最適化、並列処理 |

### 11.2 可用性

- 稼働率: 99.5%以上
- メンテナンス: 月1回、深夜時間帯(2:00-4:00)
- 障害検知: 5分以内
- 復旧時間: 30分以内

### 11.3 スケーラビリティ

```
【初期】
- 法人数: 10社
- ユーザー数: 5,000人
- 同時接続: 500人

【1年後】
- 法人数: 50社
- ユーザー数: 25,000人
- 同時接続: 2,500人

【3年後】
- 法人数: 200社
- ユーザー数: 100,000人
- 同時接続: 10,000人
```

### 11.4 バックアップ

- データベース: 日次フルバックアップ
- 保管期間: 30日間
- リストア可能時間: 24時間以内
- バックアップ先: AWS S3 / Google Cloud Storage

### 11.5 統計データの更新頻度

```
【リアルタイム】
- 個人の閲覧数、投稿数
- 「参考になった」カウント

【1時間ごと】
- 部署別統計
- うちあけDBデータ同期
- コンテンツ視聴数

【日次バッチ(深夜2:00)】
- 全国平均統計
- 会社間比較データ
- ランキング計算
- 同年代トレンド集計
```

---

## 12. 開発環境

### 12.1 技術スタック

```
【フロントエンド】
- Next.js 14 (App Router)
- TypeScript 5
- Tailwind CSS 3
- Shadcn/ui
- React Query (データフェッチ)

【バックエンド】
- Node.js 20
- Express.js 4
- Prisma ORM 5
- PostgreSQL 15

【インフラ】
- Vercel (フロントエンド)
- Railway / Render (バックエンド)
- Supabase (PostgreSQL)

【外部サービス】
- Google Sheets API (うちあけDB)
- Redis (キャッシュ)

【その他】
- GitHub (バージョン管理)
- GitHub Actions (CI/CD)
- Jest (テスト)
```

### 12.2 ディレクトリ構造

```
health-connect/
├── frontend/                # Next.js
│   ├── app/
│   │   ├── (auth)/         # 認証系ページ
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/          # メインアプリ
│   │   │   ├── home/
│   │   │   ├── experiences/
│   │   │   ├── contents/
│   │   │   ├── stats/
│   │   │   └── my-page/
│   │   └── api/            # API Routes
│   ├── components/
│   │   ├── ui/            # Shadcn UI
│   │   ├── experiences/
│   │   ├── stats/
│   │   └── layouts/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── types/
│   └── hooks/
│
├── backend/                # Express.js
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── experiences.ts
│   │   │   ├── stats.ts
│   │   │   ├── contents.ts
│   │   │   └── admin.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── matching.service.ts
│   │   │   ├── stats.service.ts
│   │   │   └── uchiake.service.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   └── validation.ts
│   │   ├── utils/
│   │   └── config/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/
│   └── scripts/
│
└── docs/                   # ドキュメント
    ├── requirements.md     # このファイル
    ├── api.md
    └── matching-algorithm.md
```

### 12.3 環境変数

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="..."

# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_KEY="..."
UCHIAKE_SHEET_ID="..."

# Redis
REDIS_URL="..."

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 13. セキュリティ要件

### 13.1 認証・認可

```javascript
// JWT認証
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      companyId: user.companyId,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ミドルウェア
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
}

// 権限チェック
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// 使用例
app.get('/api/admin/dashboard', 
  authenticateToken,
  requireRole(['ADMIN', 'SYSTEM']),
  getDashboard
);
```

### 13.2 データ保護

```javascript
// パスワードハッシュ化
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 個人情報のマスキング
function maskPersonalInfo(data) {
  return {
    ...data,
    name: data.isAnonymous ? '匿名ユーザー' : data.name,
    employeeNumber: data.isAnonymous ? '***' : data.employeeNumber
  };
}
```

### 13.3 セキュリティ対策

```
【通信】
- HTTPS必須
- CORS: ホワイトリスト方式

【データベース】
- SQLインジェクション対策(Prisma ORM)
- パスワードのハッシュ化(bcrypt)

【認証】
- JWT Token (7日間有効)
- リフレッシュトークン

【アクセス制御】
- ロールベースアクセス制御(RBAC)
- 会社IDによるデータ分離

【監査ログ】
- 全アクセスログの記録
- 個人情報アクセスの監視
```

---

## 14. 開発フェーズ

### Phase 1: MVP(2ヶ月)

```
【Week 1-2: 基盤構築】
- データベース設計
- Prismaスキーマ作成
- 認証機能実装
- ユーザー登録(基本情報)

【Week 3-4: 体験談機能】
- 体験談閲覧(Mock データ)
- 体験談投稿
- 反応機能(参考になった)
- ActivityLog記録

【Week 5-6: 統計機能】
- 個人統計表示
- 部署比較表示
- ActivityLog集計

【Week 7-8: 管理機能とテスト】
- 管理者ダッシュボード
- 部署管理
- テスト・デバッグ
- デプロイ準備
```

### Phase 2: 本格展開(1ヶ月)

```
【Week 9-10: 外部連携】
- Google Sheets API連携
- うちあけDB取得
- マッチングアルゴリズム実装
- キャッシュ機能実装

【Week 11-12: 高度な統計機能】
- 会社間比較機能
- 全国平均統計
- 同年代トレンド表示
- 最終調整・リリース
```

### Phase 3: 健康コンテンツ(2週間)

```
【Week 13-14: コンテンツ機能】
- 健康コンテンツ閲覧
- 動画再生機能
- PDFダウンロード
- ラグスタ向け管理画面
```

---

## 📝 開発の優先順位

### 最優先(Phase 1)
1. 認証・ユーザー登録
2. 体験談投稿・閲覧(基本)
3. 個人統計表示

### 高優先(Phase 2)
4. マッチングアルゴリズム
5. うちあけDB連携
6. 部署比較・会社間比較

### 中優先(Phase 3)
7. 健康コンテンツ機能
8. 同年代トレンド表示
9. 教室情報(Mock)

---

## ✅ 完成チェックリスト

### 機能面
- [ ] ユーザー登録・ログイン
- [ ] 家族情報登録(子供、配偶者)
- [ ] 体験談閲覧(4つのカテゴリ)
- [ ] マッチングアルゴリズム
- [ ] 体験談投稿
- [ ] 個人統計表示
- [ ] 部署比較表示
- [ ] 会社間比較表示
- [ ] 同年代トレンド表示
- [ ] 健康コンテンツ閲覧
- [ ] 教室情報表示(Mock)
- [ ] 管理者ダッシュボード

### 技術面
- [ ] Prismaスキーマ作成
- [ ] JWT認証実装
- [ ] Google Sheets API連携
- [ ] キャッシュ機能(Redis)
- [ ] 統計集計バッチ
- [ ] フロントエンド実装
- [ ] レスポンシブデザイン

### 運用面
- [ ] デプロイ環境構築
- [ ] バックアップ設定
- [ ] 監視・アラート設定
- [ ] ドキュメント整備

---

## 📞 サポート

**開発者:** メディキャンバス開発チーム
**連絡先:** dev@medicanvas.jp
**ドキュメント:** https://docs.healthconnect.jp

---

**最終更新日:** 2025年1月5日
**バージョン:** v2.0
