import prisma from "./prisma";

export async function generateUniqueSlug(title: string, model: 'Post' | 'Category', currentId?: string): Promise<string> {
  const { generateSlug } = await import('./slugify');
  const baseSlug = generateSlug(title);
  if (!baseSlug) return Date.now().toString();

  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    let existing;
    if (model === 'Post') {
      existing = await prisma.post.findFirst({
        where: currentId ? { slug, id: { not: currentId } } : { slug },
      });
    } else {
      existing = await prisma.category.findFirst({
        where: currentId ? { slug, id: { not: currentId } } : { slug },
      });
    }

    if (!existing) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}
