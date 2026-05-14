"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveMenusAction(menus: any[]) {
  try {
    await prisma.systemConfig.upsert({
      where: { key: "header_menus" },
      update: { value: JSON.stringify(menus) },
      create: { key: "header_menus", value: JSON.stringify(menus) }
    });
    revalidatePath("/");
    revalidatePath("/admin/menus");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}