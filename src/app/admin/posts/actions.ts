"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { generateUniqueSlug } from "@/lib/unique-slug";

export async function createPostAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString() || "";
  const content = formData.get("content")?.toString() || "";
  const thumbnailUrl = formData.get("thumbnailUrl")?.toString() || null;
  const attachments = formData.get("attachments")?.toString() || null;
  const gallery = formData.get("gallery")?.toString() || null;
  const galleryConfig = formData.get("galleryConfig")?.toString() || null;
  const categoryIdStr = formData.get("categoryId")?.toString() || "";
  const categoryId = categoryIdStr === "" ? null : categoryIdStr;
  
  if (!title || !content) {
    return { success: false, message: "Tiêu đề và Nội dung là bắt buộc!" };
  }

  const cookieStore = await cookies();
  const authNameEncoded = cookieStore.get("auth_name")?.value;
  const authorName = authNameEncoded ? decodeURIComponent(authNameEncoded) : "Admin";

  if (id) {
    const slug = await generateUniqueSlug(title, "Post", id);
    await prisma.post.update({
      where: { id },
      data: { title, content, thumbnailUrl, attachments, gallery, galleryConfig, categoryId, slug },
    });
    revalidatePath("/admin/posts");
    return { success: true, message: "Cập nhật thành công!" };
  } else {
    const slug = await generateUniqueSlug(title, "Post");
    await prisma.post.create({
      data: { title, content, thumbnailUrl, attachments, gallery, galleryConfig, categoryId, authorName, slug },
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
