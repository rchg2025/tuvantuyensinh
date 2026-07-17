"use server";

import prisma from "@/lib/prisma";
import { notifyNewComment } from "@/lib/mail";

export async function submitComment(data: {
  postId: string;
  name: string;
  email: string;
  phone?: string;
  content: string;
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

    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        content: data.content,
        isApproved: false // Admin duyệt
      }
    });

    // Gửi email cho admin
    await notifyNewComment({
      postTitle: post.title,
      name: comment.name,
      email: comment.email,
      content: comment.content
    });

    return { success: true, message: "Gửi bình luận thành công! Bình luận của bạn đang chờ quản trị viên duyệt." };
  } catch (error) {
    console.error("Lỗi khi gửi bình luận:", error);
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại sau" };
  }
}
