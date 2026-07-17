"use client";

import { useState } from "react";
import { submitComment } from "../actions/comment";
import toast from "react-hot-toast";

type CommentType = {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  adminReply: string | null;
  repliedAt: Date | null;
  repliedBy: string | null;
};

export default function CommentSection({
  postId,
  initialComments
}: {
  postId: string;
  initialComments: CommentType[];
}) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    content: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      toast.error("Vui lòng nhập đầy đủ Tên, Email và Nội dung bình luận.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitComment({
      postId,
      ...formData
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Đã gửi bình luận thành công");
      setFormData({ name: "", email: "", phone: "", content: "" });
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl border border-blue-100 shadow-sm p-6 md:p-10 w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>💬</span> Bình luận & Thảo luận ({comments.length})
      </h3>

      {/* Danh sách bình luận */}
      <div className="space-y-6 mb-10">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                  <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              
              {comment.adminReply && (
                <div className="mt-4 bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-700 text-sm">👨‍🏫 Quản trị viên</span>
                    {comment.repliedAt && (
                      <span className="text-xs text-gray-500">{new Date(comment.repliedAt).toLocaleString("vi-VN")}</span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap italic">{comment.adminReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form bình luận */}
      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-gray-800 mb-4">Gửi bình luận của bạn</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập họ tên"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nhập email để nhận phản hồi"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (Không bắt buộc)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bình luận <span className="text-red-500">*</span></label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
              placeholder="Nhập nội dung..."
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg text-white font-medium transition-all ${
              isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
            }`}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </form>
      </div>
    </div>
  );
}
