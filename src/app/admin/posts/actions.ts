"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPostAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString() || "";
  const content = formData.get("content")?.toString() || "";
  const thumbnailUrl = formData.get("thumbnailUrl")?.toString() || null;
  const attachments = formData.get("attachments")?.toString() || null;
  
  if (!title || !content) {
    return { success: false, message: "Tiêu đề và Nội dung là bắt buộc!" };
  }

  if (id) {
    await prisma.post.update({
      where: { id },
      data: { title, content, thumbnailUrl, attachments },
    });
    revalidatePath("/admin/posts");
    return { success: true, message: "Cập nhật thành công!" };
  } else {
    await prisma.post.create({
      data: { title, content, thumbnailUrl, attachments },
    });
    revalidatePath("/admin/posts");
    return { success: true, message: "Đăng bài viết thành công!" };
  }
}

export async function deletePostAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (id) {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/posts");
  }
}
