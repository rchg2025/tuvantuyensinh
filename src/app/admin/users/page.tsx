import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.systemUser.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createUser(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const role = formData.get("role")?.toString() || "ADMIN";
    
    if (email && password) {
      await prisma.systemUser.create({
        data: { name, email, password, role },
      });
      revalidatePath("/admin/users");
    }
  }

  async function deleteUser(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.systemUser.delete({ where: { id } });
      revalidatePath("/admin/users");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">👥 Quản lý thành viên</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Thêm thành viên mới</h2>
        <form action={createUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input name="name" placeholder="VD: Nguyễn Văn A" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
              <input name="email" type="email" required placeholder="VD: a@nsg.edu.vn" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu *</label>
              <input name="password" type="password" required placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò</label>
              <select name="role" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ADMIN">Quản trị viên (Admin)</option>
                <option value="CVD">Chuyên viên tư vấn (CVD)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Tạo tài khoản
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4">Họ Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{u.name || "Chưa cập nhật"}</td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4 font-semibold text-indigo-600">{u.role}</td>
                <td className="p-4 text-center">
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}