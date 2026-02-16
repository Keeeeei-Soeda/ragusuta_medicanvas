import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding additional mock experiences...');

  // ユーザーを取得
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found. Please run seed.ts first.');
    return;
  }

  // 追加のサンプル体験談データ（多様なカテゴリと内容）
  const experiences = [
    {
      category: 'PHYSICAL',
      subcategory: '運動不足',
      targetPerson: 'SELF',
      title: '運動不足解消のため、階段を使う習慣を始めました',
      content: `
デスクワーク中心の生活で、運動不足を感じていました。
ジムに通う時間もないため、日常生活に運動を取り入れることにしました。

【実践したこと】
1. エレベーターを使わず、階段を使う
2. 最寄り駅の1つ前で降りて歩く
3. 昼休みに10分間の散歩
4. 週末は家族で公園を散歩

1ヶ月で体重が2kg減り、体調も良くなりました。
小さな積み重ねが大切だと実感しています。
      `,
      tags: ['運動不足', '階段', 'ウォーキング'],
      isAnonymous: false,
      viewCount: 456,
      helpfulCount: 289,
    },
    {
      category: 'PHYSICAL',
      subcategory: '目の疲れ',
      targetPerson: 'SELF',
      title: 'PC作業による目の疲れを軽減する方法',
      content: `
1日中PC作業をしていると、夕方には目がかすんで頭痛も。
眼科でドライアイと診断されました。

【対策】
- ブルーライトカットメガネを着用
- 20分ごとに20秒、遠くを見る（20-20-20ルール）
- 加湿器をデスクに設置
- 目薬を定期的に使用
- モニターの明るさを調整

症状が大幅に改善しました。
特にブルーライトカットメガネの効果が大きかったです。
      `,
      tags: ['目の疲れ', 'ドライアイ', 'PC作業'],
      isAnonymous: false,
      viewCount: 678,
      helpfulCount: 512,
    },
    {
      category: 'MENTAL',
      subcategory: 'うつ',
      targetPerson: 'SELF',
      title: 'うつ症状から回復した経験',
      content: `
仕事のプレッシャーと人間関係のストレスで、うつ症状が出ました。
朝起きられない、何もする気が起きない日々が続きました。

【治療と対処】
- 心療内科で抗うつ薬を処方
- カウンセリングを月2回受診
- 仕事量を調整（上司と相談）
- 規則正しい生活リズムを心がける
- 軽い運動（散歩）を日課に

半年かけて徐々に回復。今では普通に働けています。
早めの受診が大切だと実感しました。
      `,
      tags: ['うつ', 'メンタルヘルス', 'カウンセリング'],
      isAnonymous: true,
      viewCount: 1234,
      helpfulCount: 987,
    },
    {
      category: 'FAMILY',
      subcategory: '育児',
      targetPerson: 'CHILD',
      title: '子供の夜泣きが改善した方法',
      content: `
生後8ヶ月の娘が夜中に何度も起きて、睡眠不足で体調を崩しました。
小児科の先生に相談し、生活リズムを見直しました。

【実践したこと】
- 朝は決まった時間に起こす
- 昼寝の時間を調整（午後3時以降は寝かせない）
- 寝る前のルーティンを作る（お風呂→授乳→絵本）
- 寝室を暗く静かに保つ
- パパも育児に参加

2週間で夜泣きが減り、今では朝までぐっすり。
家族全員が健康になりました。
      `,
      tags: ['育児', '夜泣き', '睡眠'],
      isAnonymous: false,
      viewCount: 789,
      helpfulCount: 623,
    },
    {
      category: 'FAMILY',
      subcategory: '高齢者',
      targetPerson: 'PARENT',
      title: '母の転倒予防のために実践していること',
      content: `
75歳の母が階段で転倒し、軽い骨折をしました。
これ以上転倒を防ぐため、対策を始めました。

【対策】
- 家の中の段差を解消
- 手すりを設置
- 滑りにくいマットを敷く
- 週2回のリハビリ体操
- 栄養バランスの良い食事（特にカルシウム）

半年間、転倒はありません。
環境整備と運動の両方が大切だと実感しました。
      `,
      tags: ['高齢者', '転倒予防', 'リハビリ'],
      isAnonymous: false,
      viewCount: 567,
      helpfulCount: 445,
    },
    {
      category: 'LIFESTYLE',
      subcategory: '食事',
      targetPerson: 'SELF',
      title: '偏食を改善し、バランスの良い食事を心がけるように',
      content: `
コンビニ弁当や外食が多く、栄養が偏っていました。
健康診断でコレステロール値が高く、食事改善を決意。

【実践したこと】
- 朝食を必ず取る（和食中心）
- 野菜を毎食取り入れる
- 週3回は自炊
- 間食を減らす
- 水分をしっかり取る

3ヶ月で体重が3kg減り、コレステロール値も改善。
体調も良くなり、仕事のパフォーマンスも向上しました。
      `,
      tags: ['食事', '栄養', '健康'],
      isAnonymous: false,
      viewCount: 890,
      helpfulCount: 678,
    },
    {
      category: 'PHYSICAL',
      subcategory: '冷え性',
      targetPerson: 'SELF',
      title: '冷え性を改善した方法',
      content: `
手足が冷たく、特に冬はつらかったです。
体質改善に取り組みました。

【実践したこと】
- 毎日湯船に浸かる（38-40度、15分）
- 生姜湯を飲む
- 適度な運動（ウォーキング）
- 温かい服装を心がける
- 食事で体を温める食材を取る

半年で冷え性が改善。冬でも快適に過ごせています。
継続が大切だと実感しました。
      `,
      tags: ['冷え性', '体質改善', '入浴'],
      isAnonymous: false,
      viewCount: 623,
      helpfulCount: 456,
    },
    {
      category: 'MENTAL',
      subcategory: 'ストレス',
      targetPerson: 'SELF',
      title: '仕事のストレスを軽減するために実践していること',
      content: `
繁忙期が続き、ストレスで体調を崩しました。
ストレスマネジメントを学び、実践しています。

【実践していること】
- 深呼吸法（4-7-8呼吸法）
- マインドフルネス瞑想（1日10分）
- 趣味の時間を確保（読書、音楽）
- 適度な運動
- 十分な睡眠（7時間以上）

ストレスに強くなり、仕事の効率も上がりました。
心の健康も大切だと実感しています。
      `,
      tags: ['ストレス', 'マインドフルネス', '瞑想'],
      isAnonymous: false,
      viewCount: 1123,
      helpfulCount: 890,
    },
    {
      category: 'FAMILY',
      subcategory: 'アレルギー',
      targetPerson: 'CHILD',
      title: '子供の食物アレルギーと向き合って',
      content: `
3歳の息子が卵アレルギーと診断されました。
最初は不安でしたが、正しい知識を得て対処しています。

【対策】
- アレルギー専門医に定期的に通院
- 食品表示を必ず確認
- 保育園と連携（アレルギー対応表を作成）
- エピペンの使い方を習得
- 家族全員でアレルギーについて学ぶ

事故なく過ごせています。
正しい知識と準備が大切だと実感しました。
      `,
      tags: ['アレルギー', '子供', '食物アレルギー'],
      isAnonymous: false,
      viewCount: 445,
      helpfulCount: 334,
    },
    {
      category: 'LIFESTYLE',
      subcategory: '禁煙',
      targetPerson: 'SELF',
      title: '20年の喫煙習慣をやめることができました',
      content: `
20年間タバコを吸っていましたが、健康を考えて禁煙を決意。
何度も失敗しましたが、今回は成功しました。

【成功のポイント】
- 禁煙外来を受診（ニコチンパッチを使用）
- 禁煙アプリで記録
- 家族に宣言してサポートしてもらう
- タバコを吸いたくなったら深呼吸
- 運動を始める（ジョギング）

3ヶ月で完全にやめることができました。
体調が良くなり、お金も節約できて一石二鳥です。
      `,
      tags: ['禁煙', '健康', '生活習慣'],
      isAnonymous: false,
      viewCount: 1567,
      helpfulCount: 1234,
    },
    {
      category: 'PHYSICAL',
      subcategory: 'ダイエット',
      targetPerson: 'SELF',
      title: '健康的に10kg減量した方法',
      content: `
体重が増えすぎて、健康診断で要指導になりました。
無理なダイエットではなく、健康的に減量しました。

【実践したこと】
- 1日3食、バランス良く食べる
- 間食を控える（週2回まで）
- 週3回の有酸素運動（30分）
- 筋トレを週2回
- 睡眠をしっかり取る（7-8時間）

6ヶ月で10kg減量。リバウンドもなく、健康的に維持できています。
継続が大切だと実感しました。
      `,
      tags: ['ダイエット', '減量', '運動'],
      isAnonymous: false,
      viewCount: 2345,
      helpfulCount: 1890,
    },
    {
      category: 'MENTAL',
      subcategory: '不安',
      targetPerson: 'SELF',
      title: '不安障害と向き合い、改善した経験',
      content: `
些細なことでも不安になり、日常生活に支障が出ていました。
心療内科で不安障害と診断され、治療を開始しました。

【治療と対処】
- 抗不安薬を処方
- 認知行動療法を受ける
- 不安を書き出す習慣
- リラクゼーション法を学ぶ
- 規則正しい生活

半年で症状が大幅に改善。今では普通に生活できています。
専門家のサポートが大切だと実感しました。
      `,
      tags: ['不安', 'メンタルヘルス', '認知行動療法'],
      isAnonymous: true,
      viewCount: 987,
      helpfulCount: 756,
    },
    {
      category: 'FAMILY',
      subcategory: '育児',
      targetPerson: 'CHILD',
      title: '子供のアトピー性皮膚炎のケア方法',
      content: `
5歳の娘がアトピー性皮膚炎と診断されました。
かゆみで夜も眠れない日々が続きました。

【対策】
- 小児皮膚科に定期的に通院
- 保湿を1日2回（朝・夜）
- 入浴は38度以下、短時間
- 刺激の少ない衣類を選ぶ
- 部屋の湿度を50-60%に保つ

症状がかなり改善しました。
継続的なケアが大切だと実感しています。
      `,
      tags: ['アトピー', '子供', '皮膚炎'],
      isAnonymous: false,
      viewCount: 678,
      helpfulCount: 512,
    },
    {
      category: 'LIFESTYLE',
      subcategory: '睡眠',
      targetPerson: 'SELF',
      title: '質の良い睡眠を取るために実践していること',
      content: `
睡眠時間は取れているのに、疲れが取れない日々。
睡眠の質を改善することにしました。

【実践していること】
- 就寝3時間前は食事をしない
- 寝る1時間前からスマホを見ない
- 寝室の温度を18-20度に保つ
- 遮光カーテンを使用
- 毎日同じ時間に就寝・起床

睡眠の質が向上し、朝の目覚めが良くなりました。
仕事のパフォーマンスも向上しています。
      `,
      tags: ['睡眠', '睡眠の質', '生活習慣'],
      isAnonymous: false,
      viewCount: 1456,
      helpfulCount: 1123,
    },
    {
      category: 'PHYSICAL',
      subcategory: '膝痛',
      targetPerson: 'SELF',
      title: '階段の上り下りで膝が痛む。改善した方法',
      content: `
階段の上り下りで膝が痛むようになりました。
整形外科で変形性膝関節症の初期と診断されました。

【対策】
- 体重を減らす（5kg減量）
- 膝に負担をかけない運動（水泳、自転車）
- 膝の周りの筋肉を鍛える
- サポーターを使用
- 痛み止めの湿布を使用

痛みが軽減し、階段も楽に上り下りできるようになりました。
体重管理と運動が大切だと実感しました。
      `,
      tags: ['膝痛', '変形性膝関節症', '運動'],
      isAnonymous: false,
      viewCount: 789,
      helpfulCount: 623,
    },
  ];

  // 体験談を作成
  let createdCount = 0;
  for (const exp of experiences) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    // 既に同じタイトルの体験談が存在するかチェック
    const existing = await prisma.experience.findFirst({
      where: {
        title: exp.title,
        userId: randomUser.id,
      },
    });

    if (!existing) {
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
      createdCount++;
    }
  }

  console.log(`✅ ${createdCount} additional mock experiences created`);
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

