import prisma from "@/lib/prisma";
import Link from "next/link";
import LiveSearch from "@/components/LiveSearch";
import { getDirectImageUrl } from "@/lib/gdrive";

export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; categorySlug?: string }> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const q = resolvedParams.q || "";
  const categorySlug = resolvedParams.categorySlug || "";
  const limit = 12;

  const whereCondition: any = {};
  if (q) {
    whereCondition.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } }
    ];
  }
  if (categorySlug) {
    const category = await prisma.category.findFirst({
      where: { 
        OR: [
          { slug: categorySlug },
          { id: categorySlug }
        ]
      }
    });
    if (category) {
      whereCondition.categoryId = category.id;
    } else {
      whereCondition.categoryId = "not-found";
    }
  }

  const [posts, totalPosts, categories] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true }
    }),
    prisma.post.count({ where: whereCondition }),
    prisma.category.findMany({ where: { type: "POST" } })
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl px-8 py-10 shadow-md flex justify-between flex-wrap gap-4 items-center">
        <div>
          <h2 className="text-3xl font-extrabold mb-2">📰 Tin tức & Bài viết</h2>
          <p className="text-blue-100">Cập nhật thông tin tuyển sinh, thông báo mới của Khoa Cơ khí - Trường Cao đẳng Bách khoa Nam Sài Gòn.</p>
        </div>
        <form action="/posts" method="GET" className="flex items-center gap-2 bg-white/20 p-2 rounded-xl backdrop-blur-md">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm bài viết..."
            className="w-full sm:w-64 bg-white text-gray-900 placeholder:text-gray-500 px-4 py-2 rounded-lg border-transparent focus:ring-2 focus:ring-blue-300 outline-none"
          />
          <select
            name="categorySlug"
            defaultValue={categorySlug}
            title="Danh mục"
            className="bg-white text-gray-900 border-transparent px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none max-w-40"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.slug || c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg transition-colors">
            Tìm
          </button>
        </form>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-16 text-center space-y-3">
          <div className="text-5xl">📭</div>
          <p className="text-gray-500 text-lg">Chưa có bài viết nào. Vui lòng quay lại sau!</p>
          <Link href="/" className="inline-block text-blue-600 font-semibold hover:underline">← Về trang chủ</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full overflow-hidden">
                {post.thumbnailUrl && (
                  <Link href={`/posts/${post.slug || post.id}`} className="block w-full h-48 flex-shrink-0">
                    <img src={getDirectImageUrl(post.thumbnailUrl)} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
                  </Link>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-blue-500 font-medium mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">📅</span>
                      <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-gray-400">✍️</span>
                      <span>{(post as any).authorName || "Admin"}</span>
                    </div>
                    {post.category && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">🏷️</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{post.category.name}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/posts/${post.slug || post.id}`} className="block mb-2 group">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2" title={post.title}>{post.title}</h3>
                  </Link>
                  <div className="text-gray-600 text-sm line-clamp-3 mb-4 overflow-hidden break-words flex-grow" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }}></div>
                  <div className="mt-auto flex items-center justify-between">
                    <Link href={`/posts/${post.slug || post.id}`} className="inline-block text-blue-600 font-semibold text-sm hover:underline">
                      Đọc tiếp →
                    </Link>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-full">
                      <span>👁️</span>
                      <span>{post.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pb-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const searchStr = new URLSearchParams({ page: p.toString(), ...(q ? { q } : {}), ...(categorySlug ? { categorySlug } : {}) }).toString();
                return (
                  <Link
                    key={p}
                    href={`/posts?${searchStr}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                      page === p ? "bg-blue-600 text-white shadow-md cursor-default pointer-events-none" : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
