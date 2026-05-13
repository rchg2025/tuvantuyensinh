import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createPost(formData: FormData) {
    "use server";
    const title = formData.get("title")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    
    if (title && content) {
      await prisma.post.create({
        data: { title, content },
      });
      revalidatePath("/admin/posts");
    }
  }

  async function deletePost(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.post.delete({ where: { id } });
      revalidatePath("/admin/posts");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Bài Viết</h1>
          <p className="text-slate-500 text-sm mt-1">Đăng tải và xoá bài viết tin tức</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Tạo bài viết mới</h2>
        <form action={createPost} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề bài viết</label>
            <input 
              name="title" 
              required 
              placeholder="VD: Hướng dẫn nộp hồ sơ..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung</label>
            <textarea 
              name="content" 
              required 
              rows={4}
              placeholder="Viết nội dung bài đăng ở đây..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Đăng bài viết
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4 w-1/3">Tiêu đề</th>
              <th className="p-4">Nội dung</th>
              <th className="p-4">Ngày đăng</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 align-top font-bold text-slate-800">{post.title}</td>
                <td className="p-4 align-top text-slate-600 line-clamp-3">{post.content}</td>
                <td className="p-4 align-top text-slate-500">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="p-4 align-top text-center">
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs">
                      Xóa
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có bài viết nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}