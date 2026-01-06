import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // サンプル法人を作成
  const company = await prisma.company.upsert({
    where: { code: 'TEST0001' },
    update: {},
    create: {
      name: 'テスト株式会社',
      code: 'TEST0001',
      contractPlan: 'STANDARD',
      maxUsers: 1000,
    },
  });

  console.log('✅ Company created:', company.name);

  // サンプル部署を作成
  const departments = [
    { name: '営業部', displayOrder: 1 },
    { name: '総務部', displayOrder: 2 },
    { name: '開発部', displayOrder: 3 },
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: dept.name,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        name: dept.name,
        displayOrder: dept.displayOrder,
      },
    });
    createdDepartments.push(department);
  }

  console.log('✅ Departments created');

  // サンプル管理者ユーザーを作成
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: {
      companyId_employeeNumber: {
        companyId: company.id,
        employeeNumber: 'ADMIN001',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      departmentId: createdDepartments.find(d => d.name === '総務部')!.id,
      employeeNumber: 'ADMIN001',
      name: '管理者 太郎',
      birthDate: new Date('1980-01-01'),
      gender: 'MALE',
      jobType: 'OFFICE',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.name);
  console.log('   Employee Number: ADMIN001');
  console.log('   Password: Admin123!');

  // サンプル従業員ユーザーを作成
  const employeePassword = await hashPassword('User123!');
  const employee = await prisma.user.upsert({
    where: {
      companyId_employeeNumber: {
        companyId: company.id,
        employeeNumber: 'EMP001',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      departmentId: createdDepartments.find(d => d.name === '営業部')!.id,
      employeeNumber: 'EMP001',
      name: '従業員 花子',
      birthDate: new Date('1990-05-15'),
      gender: 'FEMALE',
      jobType: 'SALES',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Employee user created:', employee.name);
  console.log('   Employee Number: EMP001');
  console.log('   Password: User123!');

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
