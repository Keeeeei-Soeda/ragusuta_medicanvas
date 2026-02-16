import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding mock experiences...');

  // ユーザーを取得
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found. Please run seed.ts first.');
    return;
  }

  // サンプル体験談データ
  const experiences = [
    {
      category: 'PHYSICAL',
      subcategory: '腰痛',
      targetPerson: 'SELF',
      title: 'デスクワークによる慢性腰痛を改善した方法',
      content: `
長年のデスクワークで慢性的な腰痛に悩まされていました。
整形外科で診てもらったところ、姿勢の悪さと運動不足が原因とのこと。

【実践したこと】
1. 椅子の高さを調整し、足裏が床につくようにした
2. 1時間に1回、5分間のストレッチを実施
3. 週3回のウォーキング（30分程度）
4. 腹筋・背筋を鍛える簡単な運動

3ヶ月継続したところ、痛みがかなり軽減されました。
特に朝起きたときの腰の重さがなくなったのが嬉しいです。
      `,
      tags: ['腰痛', 'デスクワーク', 'ストレッチ'],
      isAnonymous: false,
      viewCount: 1247,
      helpfulCount: 823,
    },
    {
      category: 'MENTAL',
      subcategory: 'ストレス',
      targetPerson: 'SELF',
      title: '仕事のストレスでパニック障害を発症。回復までの記録',
      content: `
繁忙期が続き、突然動悸と息苦しさに襲われるようになりました。
心療内科でパニック障害と診断されました。

【治療と対処法】
- 抗不安薬と認知行動療法
- 深呼吸法の練習
- 仕事量の調整（上司に相談）
- 睡眠時間の確保（最低7時間）
- カフェインを控える

半年かけて徐々に回復。今では発作はほとんど起きません。
早めに専門家に相談することが大切だと実感しました。
      `,
      tags: ['メンタルヘルス', 'パニック障害', 'ストレス'],
      isAnonymous: true,
      viewCount: 892,
      helpfulCount: 654,
    },
    {
      category: 'PHYSICAL',
      subcategory: '肩こり',
      targetPerson: 'SELF',
      title: '肩こりからくる頭痛が改善した話',
      content: `
ひどい肩こりから頭痛が頻繁に起こるようになりました。
市販の頭痛薬に頼っていましたが、根本的な解決が必要と感じました。

【実践したこと】
1. 整骨院で月2回マッサージ
2. ホットアイマスクで目の疲れケア
3. スマホを見る時間を減らす
4. 肩甲骨ストレッチ

2ヶ月で頭痛の頻度が激減。肩こりも楽になりました。
      `,
      tags: ['肩こり', '頭痛', 'ストレッチ'],
      isAnonymous: false,
      viewCount: 567,
      helpfulCount: 432,
    },
    {
      category: 'FAMILY',
      subcategory: 'アレルギー',
      targetPerson: 'CHILD',
      title: '子供のアレルギー性鼻炎の対処法',
      content: `
小学2年生の息子がアレルギー性鼻炎に。
くしゃみ、鼻水が止まらず、夜も眠れない状態でした。

【対策】
- 耳鼻科で抗アレルギー薬を処方
- 寝室の掃除を徹底（週2回）
- 空気清浄機を導入
- 布団を防ダニカバーに変更
- ぬいぐるみを減らす

症状が大幅に改善。薬も減らせています。
環境整備が重要だと実感しました。
      `,
      tags: ['アレルギー', '子供', '鼻炎'],
      isAnonymous: false,
      viewCount: 534,
      helpfulCount: 312,
    },
    {
      category: 'LIFESTYLE',
      subcategory: '睡眠',
      targetPerson: 'SELF',
      title: '不眠症を克服した方法',
      content: `
仕事のストレスで眠れない日々が続いていました。
睡眠外来を受診し、睡眠衛生の改善に取り組みました。

【実践したこと】
- 就寝3時間前は食事をしない
- 寝る1時間前からスマホを見ない
- 毎日同じ時間に就寝・起床
- 寝室を暗く、静かに保つ
- 日中に運動する

2週間で効果を実感。今では自然に眠れるようになりました。
      `,
      tags: ['不眠', '睡眠', '生活習慣'],
      isAnonymous: false,
      viewCount: 723,
      helpfulCount: 589,
    },
  ];

  // 体験談を作成
  for (const exp of experiences) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    await prisma.experience.create({
      data: {
        userId: randomUser.id,
        category: exp.category,
        subcategory: exp.subcategory,
        targetPerson: exp.targetPerson,
        title: exp.title,
        content: exp.content.trim(),
        tags: exp.tags,
        isAnonymous: exp.isAnonymous,
        viewCount: exp.viewCount,
        helpfulCount: exp.helpfulCount,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  console.log('✅ Mock experiences created');
  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






