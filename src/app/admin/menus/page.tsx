import MenuManager from "./MenuManager";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function MenusPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;

  let role = "ADMIN";
  if (auth !== "admin_logged_in") {
    if (!auth) {
      redirect("/login");
    }
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user) {
      redirect("/login");
    }
    role = user.role;
  }

  if (role !== "ADMIN") {
    redirect("/admin");
  }

  const [categories, posts, menusConfig] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.post.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 100 }), // take reasonable amount
    prisma.systemConfig.findUnique({ where: { key: "header_menus" } })
  ]);

  let initialMenus = [];
  try {
    if (menusConfig?.value) {
      initialMenus = JSON.parse(menusConfig.value);
    }
  } catch(e) {}

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-blue-900 mb-8 border-b pb-4">
        Quản lý Menu
      </h1>
      <MenuManager 
        initialMenus={initialMenus} 
        categories={categories} 
        posts={posts} 
      />
    </div>
  );
}