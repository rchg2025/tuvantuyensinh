import prisma from "@/lib/prisma";
import CategoryManager from "./CategoryManager";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  if (auth && auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (user && user.role !== "ADMIN") redirect("/admin");
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">🗂️ Quản lý danh mục</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}