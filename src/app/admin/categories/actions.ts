"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const type = formData.get("type")?.toString() as 'MAJOR' | 'POSITION' | 'POST';
  
  if (!name || !type) return { success: false, message: "Vui lòng nhập tên và chọn loại danh mục" };

  try {
    await prisma.category.create({
      data: { name, description, type },
    });
    revalidatePath("/admin/categories");
    return { success: true, message: "Thêm thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const type = formData.get("type")?.toString() as 'MAJOR' | 'POSITION' | 'POST';
  
  if (!id || !name || !type) return { success: false, message: "Dữ liệu không hợp lệ" };

  try {
    await prisma.category.update({
      where: { id },
      data: { name, description, type },
    });
    revalidatePath("/admin/categories");
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCategory(id: string) {
  if (!id) return { success: false, message: "ID không hợp lệ" };
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true, message: "Xóa thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
