import prisma from "@/lib/prisma";
import Link from "next/link";
import { getDirectImageUrl } from "@/lib/gdrive";
import Image from "next/image";

export const revalidate = 60;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  let posts: any[] = [];
  let questions: any[] = [];

  if (q.trim()) {
    const postPromise = prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { category: true }
    });

    const qaPromise = prisma.question.findMany({
      where: {
        OR: [
          { question: { contains: q, mode: "insensitive" } },
          { answer: { contains: q, mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    [posts, questions] = await Promise.all([postPromise, qaPromise]);
  }

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl px-8 py-10 shadow-md">
        <h1 className="text-3xl font-extrabold mb-2">🔍 Kết quả tìm kiếm</h1>
        <p className="text-blue-100">
          Hiển thị kết quả tìm kiếm cho từ khóa: <span className="font-bold text-yellow-300">"{q}"</span>
        </p>
        
        <form action="/search" method="GET" className="mt-6 flex items-center relative w-full">
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm câu hỏi, bài viết..." 
            className="w-full text-gray-900 bg-white shadow-sm rounded-full py-3 pl-5 pr-32 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-sm font-medium"
          />
          <button type="submit" className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-semibold transition-colors">
            Tìm
          </button>
        </form>
      </div>

      {!q.trim() ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          Vui lòng nhập từ khóa để tìm kiếm.
        </div>
      ) : posts.length === 0 && questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="text-5xl">🥺</div>
          <p className="text-gray-500 text-lg">Không tìm thấy kết quả nào phù hợp với "{q}".</p>
          <Link href="/" className="inline-block text-blue-600 font-semibold hover:underline mt-4">← Trở về trang chủ</Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Posts Results */}
          {posts.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900">📰 Bài viết ({posts.length})</h2>
                {posts.length >= 20 && (
                  <Link href={`/posts?q=${encodeURIComponent(q)}`} className="text-sm text-blue-600 hover:underline font-semibold">
                    Xem tất cả bài viết →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full overflow-hidden">
                    {post.thumbnailUrl && (
                      <Link href={`/posts/${post.slug || post.id}`} className="block w-full h-40 flex-shrink-0 relative">
                        <Image 
                          src={getDirectImageUrl(post.thumbnailUrl)} 
                          alt={post.title} 
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform hover:scale-105" 
                        />
                      </Link>
                    )}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-medium">
                        <span>📅 {post.createdAt.toLocaleDateString("vi-VN")}</span>
                        {post.category && (
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{post.category.name}</span>
                        )}
                      </div>
                      <Link href={`/posts/${post.slug || post.id}`} className="block mb-2 group">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                      </Link>
                      <div className="text-gray-600 text-sm line-clamp-3 mb-4 overflow-hidden break-words flex-grow" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, '') }}></div>
                      <div className="mt-auto">
                        <Link href={`/posts/${post.slug || post.id}`} className="text-blue-600 font-semibold text-sm hover:underline">
                          Đọc tiếp →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* QA Results */}
          {questions.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900">💬 Hỏi đáp tư vấn ({questions.length})</h2>
                {questions.length >= 20 && (
                  <Link href={`/qa?q=${encodeURIComponent(q)}`} className="text-sm text-blue-600 hover:underline font-semibold">
                    Xem tất cả câu hỏi →
                  </Link>
                )}
              </div>
              <div className="grid gap-4">
                {questions.map((q) => (
                  <Link key={q.id} href={`/qa?q=${encodeURIComponent(q.question)}`} className="group block bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden hover:shadow-md transition-all hover:border-blue-300">
                    {/* Question */}
                    <div className="p-5 flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                        {q.askerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{q.askerName}</span>
                          {q.isFromSchool ? (
                            <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                              Quản trị viên / Chuyên viên tư vấn
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                              Học viên
                            </span>
                          )}
                          <span className="text-gray-400 text-xs">·</span>
                          <span className="text-gray-400 text-xs">
                            {q.createdAt.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap break-words">{q.question}</p>
                      </div>
                    </div>

                    {/* Answer */}
                    {q.answer ? (
                      <div className="bg-blue-50 border-t border-blue-100 px-5 py-4 flex items-start gap-4 group-hover:bg-blue-100/50 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          TV
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-700 mb-1">Chuyên viên tư vấn</p>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">{q.answer}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border-t border-orange-100 px-5 py-3 group-hover:bg-orange-100/50 transition-colors">
                        <span className="text-orange-600 text-xs font-medium">⏳ Đang chờ chuyên viên tư vấn trả lời...</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
