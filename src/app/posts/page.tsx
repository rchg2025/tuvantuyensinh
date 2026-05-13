import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                <span>📅</span>
                <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-snug">{post.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3 flex-grow">{post.content}</p>
              <button className="self-start bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                Đọc tiếp →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
