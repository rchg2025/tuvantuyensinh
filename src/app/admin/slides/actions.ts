"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getSlidesAction() {
  const config = await prisma.systemConfig.findUnique({
    where: { key: "HOMEPAGE_SLIDER" }
  });
  if (config) {
    try {
      return JSON.parse(config.value);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveSlidesAction(slides: any[]) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  if (!auth) return { success: false, message: "Unauthorized" };

  if (auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user || user.role !== "ADMIN") return { success: false, message: "Unauthorized" };
  }

  await prisma.systemConfig.upsert({
    where: { key: "HOMEPAGE_SLIDER" },
    update: { value: JSON.stringify(slides) },
    create: { key: "HOMEPAGE_SLIDER", value: JSON.stringify(slides) }
  });

  revalidatePath("/");
  return { success: true };
}
