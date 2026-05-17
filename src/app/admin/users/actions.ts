"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUser(id: string, data: any) {
  if (!id) return;

  const updateData: any = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    positionId: data.positionId || null
  };

  if (data.password) {
    updateData.password = data.password;
  }

  await prisma.systemUser.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/users");
}
