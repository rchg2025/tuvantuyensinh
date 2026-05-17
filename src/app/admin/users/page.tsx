import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import UserRow from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  if (auth && auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (user && user.role !== "ADMIN") redirect("/admin");
  }

  const users = await prisma.systemUser.findMany({
    where: {
      email: {
        not: "nguyenluyen@nsg.edu.vn"
      }
    },
    include: { position: true },
    orderBy: { createdAt: "desc" },
  });

  const positions = await prisma.category.findMany({
    where: { type: "POSITION" },
  });

  async function createUser(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const phone = formData.get("phone")?.toString();
    const positionId = formData.get("positionId")?.toString();
    const password = formData.get("password")?.toString();
    const role = formData.get("role")?.toString() || "ADMIN";
    
    if (email && password) {
      await prisma.systemUser.create({
        data: { 
          name, 
          email, 
          phone, 
          positionId: positionId || null, 
          password, 
          role 
        },
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input name="phone" placeholder="VD: 0987654321" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chức vụ</label>
              <select name="positionId" title="Chức danh" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">-- Chọn chức vụ --</option>
                {positions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu *</label>
              <input name="password" type="password" required placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Quyền / Vai trò</label>
              <select name="role" title="Phân quyền" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
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
        <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4">Họ Tên</th>
              <th className="p-4">Liên hệ</th>
              <th className="p-4">Chức vụ</th>
              <th className="p-4">Quyền</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((u) => (
              <UserRow key={u.id} user={u} positions={positions} deleteAction={deleteUser} />
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}