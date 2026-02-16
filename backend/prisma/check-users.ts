import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Users found: ${users.length}`);
  users.slice(0, 5).forEach(u => {
    console.log(`- ${u.name} (${u.employeeNumber})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

