import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  
  if (!auth) redirect("/login");
  
  let user: any = null;
  let isAdmin = false;

  if (auth === "admin_logged_in") {
    user = { 
      id: "admin_logged_in", 
      name: "Nguyễn Văn Luyến", 
      email: "nguyenluyen@nsg.edu.vn",
      role: "ADMIN",
      phone: "",
      positionId: null
    };
    isAdmin = true;
  } else {
    user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user) redirect("/login");
    isAdmin = user.role === "ADMIN";
  }

  const positions = await prisma.category.findMany({
    where: { type: "POSITION" },
    orderBy: { createdAt: "desc" }
  });

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const password = formData.get("password")?.toString();

    const role = formData.get("role")?.toString();
    const positionId = formData.get("positionId")?.toString();

    if (auth === "admin_logged_in") {
      // For hardcoded root admin we do not allow password change via DB here
      const cookieStore = await cookies();
      cookieStore.set("auth_name", encodeURIComponent(name), { httpOnly: true, path: "/" });
      return;
    }

    const userDb = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!userDb) return;
    const isUserAdmin = userDb.role === "ADMIN";

    const dataToUpdate: any = { name, phone };
    if (password && password.trim() !== "") {
      dataToUpdate.password = password.trim();
    }

    if (isUserAdmin) {
      if (role) dataToUpdate.role = role;
      if (positionId && positionId !== "") dataToUpdate.positionId = positionId;
      else if (positionId === "") dataToUpdate.positionId = null;
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
        <p className="text-slate-500 text-sm mb-6">Cập nhật thông tin tài khoản của bạn.</p>

        <ProfileForm 
          user={user} 
          isAdmin={isAdmin} 
          positions={positions} 
          auth={auth} 
          updateAction={updateProfile} 
        />
      </div>
    </div>
  );
}