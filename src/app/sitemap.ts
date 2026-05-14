import { MetadataRoute } from 'next'
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ts26.nsg.edu.vn";

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" }
  });

  const postUrls = posts.map((post) => ({
    url: `\${baseUrl}/posts/\${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `\${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `\${baseUrl}/qa`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `\${baseUrl}/consultation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...postUrls,
  ]
}
