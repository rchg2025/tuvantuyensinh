import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import PostForm from "./components/PostForm";
import { deletePostAction } from "./actions";
import { getDirectImageUrl } from "@/lib/gdrive";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  const categories = await prisma.category.findMany({
    where: {
      type: "POST"
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Bài Viết</h1>
          <p className="text-slate-500 text-sm mt-1">Đăng tải và xoá bài viết tin tức</p>
        </div>
      </div>

      <PostForm categories={categories} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4 w-1/3">Tiêu đề</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Ngày đăng</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 align-top font-bold text-slate-800">
                  <Link href={`/posts/${post.id}`} target="_blank" className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                    {post.thumbnailUrl && (
                      <img src={getDirectImageUrl(post.thumbnailUrl)} alt={post.title} className="w-12 h-12 rounded object-cover" />
                    )}
                    <span>{post.title}</span>
                  </Link>
                </td>
                <td className="p-4 align-middle text-slate-500">{post.category?.name || "Không có"}</td>
                <td className="p-4 align-middle text-slate-500">{new Date(post.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                <td className="p-4 align-middle text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/posts/${post.id}`} target="_blank" className="text-green-600 hover:text-green-800 font-bold px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition text-xs">Xem</Link>                                        <a href={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition text-xs">
                      Sửa
                    </a>
                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs">
                        Xóa
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">Chưa có bài viết nào.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
