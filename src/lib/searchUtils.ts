import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Perform a smart search (unaccented, fuzzy, case-insensitive) on a table using PostgreSQL unaccent extension.
 * Returns an array of IDs matching the search.
 * This ensures Vercel memory/CPU is optimized because the heavy lifting is done by the database.
 * 
 * @param tableName The exact table name in the database (e.g., 'Post', 'Question', 'ConsultationRequest')
 * @param fields The fields to search within (e.g., ['title', 'content', 'authorName'])
 * @param q The search query string
 * @param limit Optional limit for matched IDs to prevent memory overflow (default 5000)
 * @returns Array of matched string IDs
 */
export async function searchUnaccent(
  tableName: string,
  fields: string[],
  q: string | undefined,
  limit: number = 5000
): Promise<string[]> {
  if (!q || typeof q !== 'string') return [];
  
  const trimmedQ = q.trim();
  if (!trimmedQ) return [];

  // Split query into words to allow unordered matching
  const words = trimmedQ.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const conditions: Prisma.Sql[] = [];

  for (const word of words) {
    const wordParam = `%${word}%`;
    const fieldConditions: Prisma.Sql[] = [];
    
    for (const field of fields) {
      // Coalesce the field to empty string to prevent unaccent(NULL) errors
      // Use double quotes around the field to preserve camelCase in Postgres
      fieldConditions.push(
        Prisma.sql`unaccent(COALESCE("${Prisma.raw(field)}", '')) ILIKE unaccent(${wordParam})`
      );
    }
    
    // Each word must match at least one field
    conditions.push(Prisma.sql`(${Prisma.join(fieldConditions, ' OR ')})`);
  }

  const finalWhere = Prisma.join(conditions, ' AND ');

  const query = Prisma.sql`
    SELECT id FROM "${Prisma.raw(tableName)}" 
    WHERE ${finalWhere} 
    LIMIT ${limit}
  `;
  
  try {
    const results = await prisma.$queryRaw<Array<{ id: string }>>(query);
    return results.map(r => r.id);
  } catch (error) {
    console.error(`Error executing smart search on ${tableName}:`, error);
    // Return empty array on error so it doesn't break the whole page, just returns no results
    return [];
  }
}
