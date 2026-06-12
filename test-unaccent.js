const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS unaccent;`;
    const result = await prisma.$queryRaw`SELECT unaccent('Ký túc xá') as test;`;
    console.log('SUCCESS', result);
  } catch(e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
