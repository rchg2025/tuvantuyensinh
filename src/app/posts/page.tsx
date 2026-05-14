import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = 12;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count()
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl px-8 py-10 shadow-md">
        <h2 className="text-3xl font-extrabold mb-2">📰 Tin tức & Bài viết</h2>
        <p className="text-blue-100">Cập nhật thông tin tuyển sinh, thông báo mới nhất từ các trường đại học.</p>
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
                  <Link href={`/posts/${post.id}`} className="block w-full h-48 flex-shrink-0">
                    <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
                  </Link>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-blue-500 font-medium mb-2">
                    <span>📅</span>
                    <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  </div>
                  <Link href={`/posts/${post.id}`} className="block mb-2 group">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2" title={post.title}>{post.title}</h3>
                  </Link>
                  <div className="text-gray-600 text-sm line-clamp-3 mb-4 overflow-hidden break-words flex-grow" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }}></div>
                  <div className="mt-auto">
                    <Link href={`/posts/${post.id}`} className="inline-block text-blue-600 font-semibold text-sm hover:underline">
                      Đọc tiếp →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pb-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/posts?page=${p}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                    page === p ? "bg-blue-600 text-white shadow-md cursor-default pointer-events-none" : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
