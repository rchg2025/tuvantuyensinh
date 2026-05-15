import { PrismaClient } from '@prisma/client';
import { generateUniqueSlug } from '../src/lib/unique-slug';

const prisma = new PrismaClient();

async function main() {
  console.log('Generating slugs for existing posts...');
  const posts = await prisma.post.findMany();
  for (const post of posts) {
    if (!post.slug) {
      const slug = await generateUniqueSlug(post.title, 'Post', post.id);
      await prisma.post.update({
        where: { id: post.id },
        data: { slug },
      });
      console.log(`Updated post: ${post.title} -> ${slug}`);
    }
  }

  console.log('Generating slugs for existing categories...');
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (!cat.slug) {
      const slug = await generateUniqueSlug(cat.name, 'Category', cat.id);
      await prisma.category.update({
        where: { id: cat.id },
        data: { slug },
      });
      console.log(`Updated category: ${cat.name} -> ${slug}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
