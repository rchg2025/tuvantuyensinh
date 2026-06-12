const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const q = "ký túc xá";
    const words = q.split(/\s+/).filter(Boolean);
    const conditions = [];
    
    for (const word of words) {
      const wordParam = `%${word}%`;
      conditions.push(`(unaccent(COALESCE("title", '')) ILIKE unaccent('${wordParam}') OR unaccent(COALESCE("content", '')) ILIKE unaccent('${wordParam}'))`);
    }
    
    const finalWhere = conditions.join(' AND ');
    
    console.log("WHERE CLAUSE:", finalWhere);

    const query = `SELECT id, title FROM "Post" WHERE ${finalWhere} LIMIT 10`;
    console.log("QUERY:", query);

    const result = await prisma.$queryRawUnsafe(query);
    console.log('RESULTS:', result);
  } catch(e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
