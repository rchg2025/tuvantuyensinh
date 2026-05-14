import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  
  if (!auth) redirect("/login");
  
  let user: any = null;
  if (auth === "admin_logged_in") {
    user = { id: "admin_logged_in", name: "Nguyễn Văn Luyến", email: "nguyenluyen@nsg.edu.vn" };
  } else {
    user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user) redirect("/login");
  }

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString() || "";
    const password = formData.get("password")?.toString();

    if (auth === "admin_logged_in") {
      // For hardcoded root admin we do not allow password change via DB here (or we can just skip or add a special message)
      // but we update the auth_name cookie
      const cookieStore = await cookies();
      cookieStore.set("auth_name", encodeURIComponent(name), { httpOnly: true, path: "/" });
      return;
    }

    const dataToUpdate: any = { name };
    if (password && password.trim() !== "") {
      dataToUpdate.password = password.trim();
    }

    await prisma.systemUser.update({
      where: { id: auth },
      data: dataToUpdate
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_name", encodeURIComponent(name), { httpOnly: true, path: "/" });

    revalidatePath("/admin/profile");
    revalidatePath("/admin");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Thông tin cá nhân</h1>
        <p className="text-slate-500 text-sm mb-6">Cập nhật tên hiển thị và mật khẩu của bạn.</p>

        <form action={updateProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email đăng nhập</label>
            <input 
              readOnly
              disabled
              value={user.email}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên hiển thị</label>
            <input 
              name="name" 
              required 
              defaultValue={user.name || ""}
              placeholder="Nhập tên hiển thị..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu mới (Để trống nếu không đổi)</label>
            <input 
              type="password"
              name="password" 
              placeholder="••••••••"
              disabled={auth === "admin_logged_in"}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            {auth === "admin_logged_in" && (
              <p className="text-xs text-red-500 mt-1">Tài khoản Root Admin không thể đổi mật khẩu tại đây.</p>
            )}
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Cập nhật thông tin
          </button>
        </form>
      </div>
    </div>
  );
}