"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadToDrive } from "@/lib/gdrive";

export async function createPostAction(formData: FormData) {
  const title = formData.get("title")?.toString() || "";
  const content = formData.get("content")?.toString() || "";
  const thumbnailFile = formData.get("thumbnail") as File | null;
  
  if (!title || !content) {
    return { success: false, message: "Tiêu đề và Nội dung là bắt buộc!" };
  }

  let thumbnailUrl = null;

  if (thumbnailFile && thumbnailFile.size > 0) {
    try {
      const result = await uploadToDrive(thumbnailFile, thumbnailFile.name, thumbnailFile.type);
      thumbnailUrl = result.url;
    } catch (err: any) {
      console.error(err);
      return { success: false, message: "Lỗi tải ảnh: " + err.message };
    }
  }

  await prisma.post.create({
    data: { 
      title, 
      content,
      ...(thumbnailUrl ? { thumbnailUrl } : {})
    },
  });
  
  revalidatePath("/admin/posts");
  return { success: true, message: "Đăng bài viết thành công!" };
}

export async function deletePostAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (id) {
    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/posts");
  }
}