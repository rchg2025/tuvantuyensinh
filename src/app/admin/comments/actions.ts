"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notifyCommentReplied } from "@/lib/mail";
import { cookies } from "next/headers";

export async function approveComment(id: string) {
  try {
    await prisma.comment.update({
      where: { id },
      data: { isApproved: true }
    });
    revalidatePath("/admin/comments");
    revalidatePath("/posts/[slug]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error approving comment:", error);
    return { success: false, error: "Lỗi hệ thống" };
  }
}

export async function deleteComment(id: string) {
  try {
    await prisma.comment.delete({
      where: { id }
    });
    revalidatePath("/admin/comments");
    revalidatePath("/posts/[slug]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Lỗi hệ thống" };
  }
}

export async function replyComment(id: string, reply: string) {
  try {
    const cookieStore = await cookies();
    const adminName = decodeURIComponent(cookieStore.get("auth_name")?.value || "Admin");

    const comment = await prisma.comment.update({
      where: { id },
      data: { 
        adminReply: reply,
        repliedBy: adminName,
        repliedAt: new Date(),
        isApproved: true // Duyệt luôn nếu phản hồi
      },
      include: {
        post: true
      }
    });

    if (comment.email && comment.post.slug) {
      await notifyCommentReplied(comment.email, {
        postTitle: comment.post.title,
        postSlug: comment.post.slug,
        name: comment.name,
        comment: comment.content,
        reply: reply
      });
    }

    revalidatePath("/admin/comments");
    revalidatePath("/posts/[slug]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error replying to comment:", error);
    return { success: false, error: "Lỗi hệ thống" };
  }
}
