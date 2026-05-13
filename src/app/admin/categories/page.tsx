import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createCategory(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const type = formData.get("type")?.toString() as 'MAJOR' | 'POSITION' | 'POST';
    
    if (name && type) {
      await prisma.category.create({
        data: { name, description, type },
      });
      revalidatePath("/admin/categories");
    }
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.category.delete({ where: { id } });
      revalidatePath("/admin/categories");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">🗂️ Quản lý danh mục</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Thêm danh mục mới</h2>
        <form action={createCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên danh mục</label>
              <input 
                name="name" 
                required 
                placeholder="VD: CNTT, Trưởng phòng, Tin tuyển sinh..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Loại danh mục</label>
              <select name="type" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="MAJOR">Ngành nghề</option>
                <option value="POSITION">Chức vụ</option>
                <option value="POST">Bài viết</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả tóm tắt</label>
            <input 
              name="description" 
              placeholder="Mô tả..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Thêm mới
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4">Tên danh mục</th>
              <th className="p-4">Loại</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{c.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    c.type === 'MAJOR' ? 'bg-blue-100 text-blue-700' :
                    c.type === 'POSITION' ? 'bg-purple-100 text-purple-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {c.type === 'MAJOR' ? 'Ngành nghề' : c.type === 'POSITION' ? 'Chức vụ' : 'Bài viết'}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{c.description}</td>
                <td className="p-4 text-center">
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">Chưa có danh mục nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}