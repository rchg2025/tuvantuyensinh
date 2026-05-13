import prisma from "@/lib/prisma";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Tin tức & Bài viết</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 && <p className="text-gray-500">Đang cập nhật bài viết...</p>}
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{post.createdAt.toLocaleDateString("vi-VN")}</p>
            <p className="text-gray-700 line-clamp-3 mb-4 flex-grow">{post.content}</p>
            <button className="text-blue-600 font-medium hover:underline self-start">Đọc tiếp &rarr;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
