import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding activity logs...');

  // ユーザーと体験談を取得
  const users = await prisma.user.findMany();
  const experiences = await prisma.experience.findMany();

  if (users.length === 0 || experiences.length === 0) {
    console.log('No users or experiences found. Please run seed.ts and seed-experiences.ts first.');
    return;
  }

  // 各ユーザーにアクティビティログを作成
  for (const user of users) {
    // ランダムに体験談を閲覧
    const viewCount = Math.floor(Math.random() * 30) + 10; // 10-40回
    for (let i = 0; i < viewCount; i++) {
      const randomExperience = experiences[Math.floor(Math.random() * experiences.length)];
      const daysAgo = Math.floor(Math.random() * 30); // 過去30日以内
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'VIEW_EXPERIENCE',
          targetId: randomExperience.id,
          metadata: {
            category: randomExperience.category,
          },
          createdAt,
        },
      });
    }

    // ランダムに「参考になった」を押す
    const helpfulCount = Math.floor(Math.random() * 10) + 5; // 5-15回
    for (let i = 0; i < helpfulCount; i++) {
      const randomExperience = experiences[Math.floor(Math.random() * experiences.length)];
      
      // 重複チェック
      const existing = await prisma.reaction.findUnique({
        where: {
          experienceId_userId_type: {
            experienceId: randomExperience.id,
            userId: user.id,
            type: 'HELPFUL',
          },
        },
      });

      if (!existing) {
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        await prisma.reaction.create({
          data: {
            experienceId: randomExperience.id,
            userId: user.id,
            type: 'HELPFUL',
            createdAt,
          },
        });

        // 体験談のhelpfulCountを更新
        await prisma.experience.update({
          where: { id: randomExperience.id },
          data: { helpfulCount: { increment: 1 } },
        });

        // ActivityLogに記録
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: 'HELPFUL',
            targetId: randomExperience.id,
            createdAt,
          },
        });
      }
    }
  }

  console.log('✅ Activity logs created');
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

