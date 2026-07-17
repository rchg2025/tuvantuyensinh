import prisma from "@/lib/prisma";
import CommentManagerClient from "./CommentManagerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý bình luận",
};

export default async function CommentsAdminPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          title: true,
          slug: true
        }
      },
      parent: {
        select: {
          name: true,
          content: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý bình luận</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý và phản hồi các bình luận từ học viên</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <CommentManagerClient initialComments={comments} />
      </div>
    </div>
  );
}
