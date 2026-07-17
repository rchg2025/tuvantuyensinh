"use server";

import prisma from "@/lib/prisma";
import { notifyNewComment } from "@/lib/mail";
import { cookies } from "next/headers";

export async function submitComment(data: {
  postId: string;
  name: string;
  email: string;
  phone?: string;
  content: string;
  parentId?: string;
}) {
  try {
    if (!data.name || !data.email || !data.content) {
      return { success: false, error: "Vui lòng điền đầy đủ các thông tin bắt buộc" };
    }

    const post = await prisma.post.findUnique({
      where: { id: data.postId }
    });

    if (!post) {
      return { success: false, error: "Bài viết không tồn tại" };
    }

    const cookieStore = await cookies();
    const isAdmin = !!cookieStore.get("auth_token")?.value;

    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        content: data.content,
        parentId: data.parentId || null,
        isApproved: isAdmin // Admin bình luận thì tự động duyệt luôn
      }
    });

    if (!isAdmin) {
      await notifyNewComment({
        postTitle: post.title,
        name: data.name,
        email: data.email,
        content: data.content
      });
    }

    return { success: true, message: "Gửi bình luận thành công! Bình luận của bạn đang chờ quản trị viên duyệt." };
  } catch (error) {
    console.error("Lỗi khi gửi bình luận:", error);
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
}
