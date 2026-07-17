"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { approveComment, deleteComment, replyComment } from "./actions";
import Link from "next/link";

type CommentWithPost = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  adminReply: string | null;
  repliedAt: Date | null;
  repliedBy: string | null;
  post: {
    title: string;
    slug: string | null;
  };
};

export default function CommentManagerClient({ initialComments }: { initialComments: CommentWithPost[] }) {
  const [comments, setComments] = useState<CommentWithPost[]>(initialComments);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const filteredComments = comments.filter(c => {
    if (filter === "PENDING") return !c.isApproved;
    if (filter === "APPROVED") return c.isApproved;
    return true;
  });

  const handleApprove = async (id: string) => {
    toast.loading("Đang xử lý...", { id: "approve" });
    const res = await approveComment(id);
    if (res.success) {
      toast.success("Đã duyệt bình luận", { id: "approve" });
      setComments(prev => prev.map(c => c.id === id ? { ...c, isApproved: true } : c));
    } else {
      toast.error(res.error || "Lỗi", { id: "approve" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    toast.loading("Đang xóa...", { id: "delete" });
    const res = await deleteComment(id);
    if (res.success) {
      toast.success("Đã xóa bình luận", { id: "delete" });
      setComments(prev => prev.filter(c => c.id !== id));
    } else {
      toast.error(res.error || "Lỗi", { id: "delete" });
    }
  };

  const handleReply = async (id: string) => {
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    toast.loading("Đang gửi phản hồi...", { id: "reply" });
    const res = await replyComment(id, replyContent);
    if (res.success) {
      toast.success("Đã gửi phản hồi và duyệt bình luận", { id: "reply" });
      setComments(prev => prev.map(c => c.id === id ? { 
        ...c, 
        adminReply: replyContent, 
        isApproved: true, 
        repliedAt: new Date() 
      } : c));
      setReplyingId(null);
      setReplyContent("");
    } else {
      toast.error(res.error || "Lỗi", { id: "reply" });
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "PENDING" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Chờ duyệt ({comments.filter(c => !c.isApproved).length})
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "APPROVED" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Đã duyệt ({comments.filter(c => c.isApproved).length})
        </button>
      </div>

      <div className="space-y-6">
        {filteredComments.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Không có bình luận nào.</p>
        ) : (
          filteredComments.map(comment => (
            <div key={comment.id} className={`border rounded-xl p-5 transition-colors ${!comment.isApproved ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{comment.name}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString("vi-VN")}</span>
                    {!comment.isApproved && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Chờ duyệt</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <a href={`mailto:${comment.email}`} className="text-blue-600 hover:underline">{comment.email}</a>
                    {comment.phone && <span className="ml-2">| {comment.phone}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Bài viết:{" "}
                    {comment.post.slug ? (
                      <Link href={`/posts/${comment.post.slug}`} target="_blank" className="font-medium text-slate-700 hover:text-blue-600 transition-colors">
                        {comment.post.title} ↗
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-700">{comment.post.title}</span>
                    )}
                  </p>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {!comment.isApproved && (
                    <button onClick={() => handleApprove(comment.id)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors">
                      Duyệt
                    </button>
                  )}
                  <button onClick={() => setReplyingId(comment.id)} className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors">
                    Phản hồi
                  </button>
                  <button onClick={() => handleDelete(comment.id)} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors">
                    Xóa
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              </div>

              {comment.adminReply && (
                <div className="mt-4 bg-blue-50/50 border border-blue-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-blue-700 text-sm">Phản hồi từ Admin ({comment.repliedBy})</span>
                    <span className="text-xs text-gray-500">{comment.repliedAt ? new Date(comment.repliedAt).toLocaleString("vi-VN") : ""}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.adminReply}</p>
                </div>
              )}

              {replyingId === comment.id && (
                <div className="mt-4 border border-blue-200 bg-white p-4 rounded-lg">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Nhập nội dung phản hồi (sẽ gửi email cho người bình luận)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setReplyingId(null); setReplyContent(""); }} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium">Hủy</button>
                    <button onClick={() => handleReply(comment.id)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">Gửi phản hồi</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
