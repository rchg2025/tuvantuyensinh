"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveMenusAction(menus: any[]) {
  try {
    const updatedMenus = await Promise.all(menus.map(async (menu: any) => {
      if (menu.url && menu.url.startsWith("/posts?categoryId=")) {
        const id = menu.url.split("categoryId=")[1];
        const category = await prisma.category.findUnique({ where: { id } });
        if (category && category.slug) {
          menu.url = `/posts?categorySlug=${category.slug}`;
        }
      }
      return menu;
    }));

    await prisma.systemConfig.upsert({
      where: { key: "header_menus" },
      update: { value: JSON.stringify(updatedMenus) },
      create: { key: "header_menus", value: JSON.stringify(updatedMenus) }
    });
    revalidatePath("/");
    revalidatePath("/admin/menus");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}