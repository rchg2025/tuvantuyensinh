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
      }
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý bình luận</h1>
        <p className="text-slate-500 mt-1">Quản lý và phản hồi các bình luận từ học viên</p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <CommentManagerClient initialComments={comments} />
      </div>
    </div>
  );
}
