import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import PostForm from "./components/PostForm";
import { deletePostAction } from "./actions";
import { getDirectImageUrl } from "@/lib/gdrive";
import Pagination from "@/components/Pagination";
import LiveSearch from "@/components/LiveSearch";
import CategoryFilter from "./components/CategoryFilter";
import DateFilter from "./components/DateFilter";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab : "manage"; // 'manage' or 'create'
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined;
  const categoryId = typeof resolvedSearchParams.categoryId === "string" ? resolvedSearchParams.categoryId : undefined;
  const startDate = typeof resolvedSearchParams.startDate === "string" ? resolvedSearchParams.startDate : undefined;
  const endDate = typeof resolvedSearchParams.endDate === "string" ? resolvedSearchParams.endDate : undefined;
  const pageSize = 10;

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
      { authorName: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (startDate || endDate) {
    if (startDate) {
      const start = new Date(startDate + "T00:00:00+07:00");
      if (!isNaN(start.getTime())) {
         where.createdAt = where.createdAt || {};
         where.createdAt.gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate + "T23:59:59+07:00");
      if (!isNaN(end.getTime())) {
         where.createdAt = where.createdAt || {};
         where.createdAt.lte = end;
      }
    }
  }

  const [totalPosts, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true }
    })
  ]);

  const totalPages = Math.ceil(totalPosts / pageSize);

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

      <div className="flex border-b border-slate-200">
        <Link
          href={`/admin/posts?tab=manage`}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "manage"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Quản lý bài viết
        </Link>
        <Link
          href={`/admin/posts?tab=create`}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "create"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Đăng bài viết mới
        </Link>
      </div>

      {tab === "create" ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PostForm categories={categories} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-3">
             <form action="/admin/posts" method="GET" className="relative flex items-center w-full md:flex-1">
                <input type="hidden" name="tab" value="manage" />
                <LiveSearch 
                  placeholder="Tìm kiếm tiêu đề, nội dung..." 
                  className="w-full text-slate-800 bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  additionalParams={{ 
                    tab: "manage", 
                    ...(categoryId ? { categoryId } : {}),
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {})
                  }}
                />
             </form>
             <form action="/admin/posts" method="GET" className="w-full md:w-48">
                <input type="hidden" name="tab" value="manage" />
                {q && <input type="hidden" name="q" value={q} />}
                {startDate && <input type="hidden" name="startDate" value={startDate} />}
                {endDate && <input type="hidden" name="endDate" value={endDate} />}
                <CategoryFilter categories={categories} defaultCategoryId={categoryId || ""} />
             </form>
             <form action="/admin/posts" method="GET" className="w-full md:w-auto">
                <input type="hidden" name="tab" value="manage" />
                {q && <input type="hidden" name="q" value={q} />}
                {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
                <DateFilter defaultStartDate={startDate || ""} defaultEndDate={endDate || ""} />
             </form>
          </div>
          <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <tr>
                <th className="p-4 w-1/4">Tiêu đề</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Người đăng</th>
                <th className="p-4">Ngày đăng</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-top font-bold text-slate-800">
                    <Link href={`/posts/${post.slug || post.id}`} target="_blank" className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                      {post.thumbnailUrl && (
                        <img src={getDirectImageUrl(post.thumbnailUrl)} alt={post.title} className="w-12 h-12 rounded object-cover" />
                      )}
                      <span>{post.title}</span>
                    </Link>
                  </td>
                  <td className="p-4 align-middle text-slate-500">{post.category?.name || "Không có"}</td>
                  <td className="p-4 align-middle text-slate-500">{(post as any).authorName || "Không có"}</td>
                  <td className="p-4 align-middle text-slate-500">{new Date(post.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/posts/${post.slug || post.id}`} target="_blank" className="text-green-600 hover:text-green-800 font-bold px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition text-xs">Xem</Link>                                        <a href={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition text-xs">
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
                  <td colSpan={5} className="p-8 text-center text-slate-500">Chưa có bài viết nào.</td>
                </tr>
              )}
            </tbody>
          </table></div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50">
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
