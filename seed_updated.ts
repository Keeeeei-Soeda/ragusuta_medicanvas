import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // JSONファイルを読み込み
  const dataPath = path.join(__dirname, 'data', 'experiences_complete_70.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const { experiences } = JSON.parse(rawData);

  console.log(`📊 Found ${experiences.length} experiences to seed`);

  // デモ用の法人を作成
  const demoCompany = await prisma.company.upsert({
    where: { code: 'DEMO0001' },
    update: {},
    create: {
      code: 'DEMO0001',
      name: 'デモ株式会社',
      contractPlan: 'STANDARD',
      maxUsers: 500,
      isActive: true,
    },
  });

  console.log(`✅ Demo company created: ${demoCompany.name}`);

  // デモ用の部署を作成
  const departments = [
    '営業部',
    '総務部',
    '開発部',
    '製造部',
    '経理部',
  ];

  const createdDepartments = await Promise.all(
    departments.map(async (deptName, index) => {
      return await prisma.department.upsert({
        where: {
          companyId_name: {
            companyId: demoCompany.id,
            name: deptName,
          },
        },
        update: {},
        create: {
          companyId: demoCompany.id,
          name: deptName,
          displayOrder: index + 1,
          isActive: true,
        },
      });
    })
  );

  console.log(`✅ Created ${createdDepartments.length} departments`);

  // ダミーユーザーを作成（体験談の投稿者として）
  const dummyUsers = [];
  
  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i];
    const departmentIndex = i % createdDepartments.length;
    
    // 年齢から生年月日を計算
    const birthYear = new Date().getFullYear() - exp.age;
    
    const user = await prisma.user.upsert({
      where: {
        companyId_employeeNumber: {
          companyId: demoCompany.id,
          employeeNumber: `EMP${String(i + 1).padStart(4, '0')}`,
        },
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        departmentId: createdDepartments[departmentIndex].id,
        employeeNumber: `EMP${String(i + 1).padStart(4, '0')}`,
        name: `ユーザー${i + 1}`,
        birthDate: new Date(birthYear, 0, 1),
        gender: exp.gender,
        jobType: exp.jobType,
        passwordHash: '$2b$10$dummyhash', // ダミーのハッシュ
        role: 'EMPLOYEE',
        isActive: true,
      },
    });

    dummyUsers.push(user);

    // ユーザープロフィールを作成
    // 子供向けの投稿者は子供を持つプロフィールに
    // 親向けの投稿者は既婚者に
    if (exp.targetPerson === 'CHILD' || exp.targetPerson === 'PARENT' || i % 3 === 0) {
      const hasChildren = exp.targetPerson === 'CHILD' || Math.random() > 0.5;
      const childrenAges = exp.targetPerson === 'CHILD' && exp.childAge 
        ? [exp.childAge] 
        : hasChildren ? [8, 5] : [];
      
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          hasChildren: hasChildren,
          childrenAges: childrenAges,
          isMarried: exp.targetPerson === 'PARENT' || Math.random() > 0.4,
          interestedCategories: [exp.category],
        },
      });
    }
  }

  console.log(`✅ Created ${dummyUsers.length} dummy users`);

  // 体験談を投入
  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i];
    const user = dummyUsers[i];

    await prisma.experience.upsert({
      where: { id: exp.id },
      update: {},
      create: {
        id: exp.id,
        userId: user.id,
        category: exp.category,
        subcategory: exp.subcategory,
        targetPerson: exp.targetPerson,
        title: exp.title,
        content: exp.content,
        tags: exp.tags,
        isPublic: true,
        isAnonymous: false,
        viewCount: exp.viewCount,
        helpfulCount: exp.helpfulCount,
        status: 'PUBLISHED',
        publishedAt: new Date(exp.createdAt),
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.createdAt),
      },
    });

    // 進捗表示
    if ((i + 1) % 10 === 0) {
      console.log(`📝 Seeded ${i + 1}/${experiences.length} experiences`);
    }
  }

  console.log(`✅ All ${experiences.length} experiences seeded successfully`);

  // ダミーの活動ログを作成
  console.log('📊 Creating activity logs...');
  
  let activityCount = 0;
  for (const user of dummyUsers.slice(0, 30)) {
    // 各ユーザーに10-20個の閲覧ログを作成
    const logCount = Math.floor(Math.random() * 11) + 10;
    
    for (let i = 0; i < logCount; i++) {
      const randomExp = experiences[Math.floor(Math.random() * experiences.length)];
      
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'VIEW_EXPERIENCE',
          targetId: randomExp.id,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // 過去30日間のランダムな日時
        },
      });
      
      activityCount++;
    }
  }

  console.log(`✅ Created ${activityCount} activity logs`);

  // ダミーの「参考になった」リアクションを作成
  console.log('👍 Creating helpful reactions...');
  
  let reactionCount = 0;
  for (const exp of experiences.slice(0, 40)) {
    // 各体験談に5-15個のリアクションを作成
    const reactionUserCount = Math.floor(Math.random() * 11) + 5;
    
    for (let i = 0; i < reactionUserCount; i++) {
      const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
      
      try {
        await prisma.reaction.create({
          data: {
            experienceId: exp.id,
            userId: randomUser.id,
            type: 'HELPFUL',
            createdAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ),
          },
        });
        reactionCount++;
      } catch (error) {
        // 重複は無視
      }
    }
  }

  console.log(`✅ Created ${reactionCount} helpful reactions`);

  // ダミーの教室データを作成（Mock）
  console.log('🏃 Creating mock classes...');
  
  const classCategories = [
    { category: 'BACK_PAIN', title: '腰痛予防ストレッチ' },
    { category: 'MENTAL', title: 'リラックスヨガ' },
    { category: 'SENIOR', title: 'シニア向け転倒予防' },
    { category: 'GENERAL', title: 'デスクワーク対策体操' },
    { category: 'CHILD_ILLNESS', title: '親子で楽しむ体操教室' },
  ];

  for (let i = 0; i < 10; i++) {
    const cat = classCategories[i % classCategories.length];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i * 3); // 3日おき

    await prisma.class.create({
      data: {
        companyId: demoCompany.id,
        title: cat.title,
        description: `${cat.title}の教室です。専門トレーナーが指導します。`,
        category: cat.category,
        type: i % 2 === 0 ? 'ONSITE' : 'ONLINE',
        date: futureDate,
        startTime: '18:00',
        endTime: '18:45',
        location: i % 2 === 0 ? '社内会議室A' : null,
        onlineUrl: i % 2 === 1 ? 'https://zoom.us/j/example' : null,
        capacity: 20,
        status: 'SCHEDULED',
      },
    });
  }

  console.log('✅ Created 10 mock classes');

  // ダミーの健康コンテンツを作成
  console.log('📺 Creating health contents...');
  
  const contents = [
    {
      title: 'デスクワーク腰痛対策ストレッチ',
      category: 'BACK_PAIN',
      type: 'VIDEO',
      duration: 332,
    },
    {
      title: '正しい姿勢の作り方',
      category: 'BACK_PAIN',
      type: 'ARTICLE',
      duration: null,
    },
    {
      title: 'ストレッチシート（印刷用）',
      category: 'BACK_PAIN',
      type: 'PDF',
      duration: null,
    },
    {
      title: 'メンタルヘルスケアの基礎',
      category: 'MENTAL',
      type: 'ARTICLE',
      duration: null,
    },
    {
      title: 'リラックスヨガ15分',
      category: 'MENTAL',
      type: 'VIDEO',
      duration: 900,
    },
    {
      title: '子供の病気対処法ガイド',
      category: 'CHILD_ILLNESS',
      type: 'ARTICLE',
      duration: null,
    },
    {
      title: '認知症介護の基礎知識',
      category: 'SENIOR_ILLNESS',
      type: 'ARTICLE',
      duration: null,
    },
  ];

  for (const content of contents) {
    await prisma.healthContent.create({
      data: {
        title: content.title,
        description: `${content.title}に関するコンテンツです。`,
        category: content.category,
        type: content.type,
        contentUrl: 'https://example.com/content',
        thumbnailUrl: content.type === 'VIDEO' ? 'https://example.com/thumbnail.jpg' : null,
        duration: content.duration,
        tags: [content.category.toLowerCase()],
        viewCount: Math.floor(Math.random() * 2000) + 500,
        downloadCount: content.type === 'PDF' ? Math.floor(Math.random() * 500) + 100 : null,
        isPublic: true,
        createdBy: 'RAGUSTA',
        publishedAt: new Date(),
      },
    });
  }

  console.log('✅ Created health contents');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Company: 1`);
  console.log(`   - Departments: ${createdDepartments.length}`);
  console.log(`   - Users: ${dummyUsers.length}`);
  console.log(`   - Experiences: ${experiences.length}`);
  console.log(`     - 頭痛: 10件`);
  console.log(`     - 腰痛: 10件`);
  console.log(`     - 脂質異常症: 10件`);
  console.log(`     - 糖尿病: 10件`);
  console.log(`     - めまい: 10件`);
  console.log(`     - 子供の病気: 10件`);
  console.log(`     - 親の病気: 10件`);
  console.log(`   - Activity Logs: ${activityCount}`);
  console.log(`   - Reactions: ${reactionCount}`);
  console.log(`   - Classes: 10`);
  console.log(`   - Health Contents: ${contents.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
