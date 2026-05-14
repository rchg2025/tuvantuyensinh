const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.question.updateMany({
    where: { askerName: 'Admin/Chuyên gia' },
    data: { isFromSchool: true },
  });
  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
