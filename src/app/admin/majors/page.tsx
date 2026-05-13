import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminMajorsPage() {
  const majors = await prisma.major.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createMajor(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    
    if (name) {
      await prisma.major.create({
        data: { name, description },
      });
      revalidatePath("/admin/majors");
    }
  }

  async function deleteMajor(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.major.delete({ where: { id } });
      revalidatePath("/admin/majors");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Quản lý chuyên ngành đào tạo</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Thêm ngành học mới</h2>
        <form action={createMajor} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên ngành</label>
            <input 
              name="name" 
              required 
              placeholder="VD: Công nghệ thông tin"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả tóm tắt</label>
            <input 
              name="description" 
              placeholder="Mô tả ngành nghiệp..."
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
              <th className="p-4">Tên ngành</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {majors.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{m.name}</td>
                <td className="p-4 text-slate-600">{m.description}</td>
                <td className="p-4 text-center">
                  <form action={deleteMajor}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
            {majors.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">Chưa có danh mục ngành nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}