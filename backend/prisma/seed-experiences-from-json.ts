import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * JSONのカテゴリをDBのカテゴリ形式にマッピング
 */
function mapCategory(jsonCategory: string): string {
  const categoryMap: Record<string, string> = {
    HEADACHE: 'PHYSICAL',
    BACK_PAIN: 'PHYSICAL',
    DYSLIPIDEMIA: 'LIFESTYLE',
    DIABETES: 'LIFESTYLE',
    DIZZINESS: 'PHYSICAL',
    CHILD_ILLNESS: 'FAMILY',
    PARENT_ILLNESS: 'FAMILY',
  };
  return categoryMap[jsonCategory] || 'PHYSICAL';
}

/**
 * 年齢から生年月日を計算
 */
function calculateBirthDate(age: number): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  // ランダムな月日を設定（1月1日）
  return new Date(birthYear, 0, 1);
}

/**
 * JSONデータから体験談をインポート
 */
async function main() {
  console.log('🌱 Importing experiences from JSON...');

  // JSONファイルを読み込み
  const jsonPath = path.join(__dirname, '../../experiences_complete_70.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const experiences = jsonData.experiences;
  console.log(`📊 Found ${experiences.length} experiences to import`);

  // 既存のユーザーを取得
  const existingUsers = await prisma.user.findMany();
  console.log(`👥 Found ${existingUsers.length} existing users`);

  // ユーザー情報からユーザーを作成または取得
  const userMap = new Map<string, string>(); // (age-gender-jobType) -> userId

  for (const exp of experiences) {
    const userKey = `${exp.age}-${exp.gender}-${exp.jobType}`;
    
    if (!userMap.has(userKey)) {
      // 既存ユーザーから探す
      let user = existingUsers.find(
        (u) =>
          calculateAge(u.birthDate) === exp.age &&
          u.gender === exp.gender &&
          u.jobType === exp.jobType
      );

      // 見つからない場合はダミーユーザーを作成
      if (!user) {
        const company = await prisma.company.findFirst();
        if (!company) {
          console.error('❌ No company found. Please run seed.ts first.');
          return;
        }

        const department = await prisma.department.findFirst({
          where: { companyId: company.id },
        });
        if (!department) {
          console.error('❌ No department found. Please run seed.ts first.');
          return;
        }

        // ダミーユーザーを作成
        const birthDate = calculateBirthDate(exp.age);
        user = await prisma.user.create({
          data: {
            companyId: company.id,
            departmentId: department.id,
            employeeNumber: `EXP${exp.age}${exp.gender.substring(0, 1)}${exp.jobType.substring(0, 2)}${Math.floor(Math.random() * 1000)}`,
            name: `体験談ユーザー${exp.age}歳`,
            birthDate,
            gender: exp.gender,
            jobType: exp.jobType,
            passwordHash: '$2b$10$dummy.hash.for.experience.users', // ダミーパスワード
            role: 'EMPLOYEE',
            isActive: true,
          },
        });
        console.log(`✅ Created dummy user: ${user.name} (${exp.age}歳, ${exp.gender}, ${exp.jobType})`);
      }

      userMap.set(userKey, user.id);
    }
  }

  console.log(`👥 Total users (existing + created): ${userMap.size}`);

  // 体験談をインポート
  let importedCount = 0;
  let skippedCount = 0;

  for (const exp of experiences) {
    try {
      const userKey = `${exp.age}-${exp.gender}-${exp.jobType}`;
      const userId = userMap.get(userKey);

      if (!userId) {
        console.error(`❌ User not found for experience: ${exp.id}`);
        skippedCount++;
        continue;
      }

      // 既に同じIDの体験談が存在するかチェック（JSONのidフィールドを使用）
      const existing = await prisma.experience.findFirst({
        where: {
          title: exp.title,
          userId: userId,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipping duplicate: ${exp.title}`);
        skippedCount++;
        continue;
      }

      // 体験談を作成
      await prisma.experience.create({
        data: {
          userId: userId,
          category: mapCategory(exp.category),
          subcategory: exp.subcategory || null,
          targetPerson: exp.targetPerson || 'SELF',
          title: exp.title,
          content: exp.content,
          tags: exp.tags || [],
          isPublic: true,
          isAnonymous: false,
          viewCount: exp.viewCount || 0,
          helpfulCount: exp.helpfulCount || 0,
          status: 'PUBLISHED',
          publishedAt: exp.createdAt ? new Date(exp.createdAt) : new Date(),
          createdAt: exp.createdAt ? new Date(exp.createdAt) : new Date(),
        },
      });

      importedCount++;
      if (importedCount % 10 === 0) {
        console.log(`📝 Imported ${importedCount}/${experiences.length} experiences...`);
      }
    } catch (error) {
      console.error(`❌ Error importing experience ${exp.id}:`, error);
      skippedCount++;
    }
  }

  console.log('✅ Import completed!');
  console.log(`📊 Statistics:`);
  console.log(`   - Imported: ${importedCount}`);
  console.log(`   - Skipped: ${skippedCount}`);
  console.log(`   - Total: ${experiences.length}`);
}

/**
 * 年齢計算ヘルパー
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

main()
  .catch((e) => {
    console.error('❌ Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

