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
    const adminEmail = "admin@nsg.edu.vn"; // Default email for admin replies if not found in token

    // Get the parent comment to know the post ID
    const parentComment = await prisma.comment.findUnique({
      where: { id },
      include: { post: true }
    });

    if (!parentComment) {
      return { success: false, error: "Bình luận không tồn tại" };
    }

    // Approve the parent comment if it isn't already
    if (!parentComment.isApproved) {
      await prisma.comment.update({
        where: { id },
        data: { isApproved: true }
      });
    }

    // Create a new child comment for the reply
    const newReply = await prisma.comment.create({
      data: {
        postId: parentComment.postId,
        name: adminName,
        email: adminEmail,
        content: reply,
        parentId: id,
        isApproved: true, // Admin replies are automatically approved
        repliedBy: adminName,
      }
    });

    if (parentComment.email && parentComment.post.slug) {
      await notifyCommentReplied(parentComment.email, {
        postTitle: parentComment.post.title,
        postSlug: parentComment.post.slug,
        name: parentComment.name,
        comment: parentComment.content,
        reply: reply
      });
    }

    revalidatePath("/admin/comments");
    revalidatePath("/posts/[slug]", "page");
    return { success: true, newReply };
  } catch (error) {
    console.error("Error replying to comment:", error);
    return { success: false, error: "Lỗi hệ thống" };
  }
}
