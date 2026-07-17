"use client";

import { useState, useRef } from "react";
import { submitComment } from "../actions/comment";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type CommentType = {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  adminReply: string | null;
  repliedAt: Date | null;
  repliedBy: string | null;
  replies?: CommentType[];
};

export default function CommentSection({
  postId,
  initialComments,
  currentUser
}: {
  postId: string;
  initialComments: CommentType[];
  currentUser?: { name: string; email: string } | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [successMsg, setSuccessMsg] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    content: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReplyClick = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, name: authorName });
    setSuccessMsg("");
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      toast.error("Vui lòng nhập đầy đủ Tên, Email và Nội dung bình luận.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg("");
    
    const result = await submitComment({
      postId,
      ...formData,
      parentId: replyingTo?.id
    });
    
    setIsSubmitting(false);

    if (result.success) {
      if (currentUser) {
        setSuccessMsg("Bình luận của bạn đã được đăng thành công!");
        router.refresh();
      } else {
        setSuccessMsg("Gửi bình luận thành công! Bình luận của bạn đang được duyệt và sẽ sớm hiển thị.");
      }
      setFormData(prev => ({ ...prev, phone: "", content: "" }));
      setReplyingTo(null);
    } else {
      toast.error(result.error || "Có lỗi xảy ra");
    }
  };

  const visibleComments = comments.slice(0, visibleCount);

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
          visibleComments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                  <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              
              <div className="mt-2">
                <button 
                  onClick={() => handleReplyClick(comment.id, comment.name)}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Trả lời
                </button>
              </div>
              
              {/* Cũ: adminReply */}
              {comment.adminReply && (
                <div className="mt-4 ml-6 md:ml-10 bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-700 text-sm">👨‍🏫 Quản trị viên ({comment.repliedBy || 'Admin'})</span>
                    {comment.repliedAt && (
                      <span className="text-xs text-gray-500">{new Date(comment.repliedAt).toLocaleString("vi-VN")}</span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap italic">{comment.adminReply}</p>
                  <div className="mt-2">
                    <button 
                      onClick={() => handleReplyClick(comment.id, comment.repliedBy || 'Admin')}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      Trả lời
                    </button>
                  </div>
                </div>
              )}

              {/* Mới: Các phản hồi đa cấp */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 md:ml-10 space-y-4">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                       <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{reply.name}</span>
                        <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString("vi-VN")}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                      
                      {/* Có thể mở rộng trả lời cho reply ở đây nếu cần, nhưng tạm thời trỏ về comment gốc để tránh lồng nhau quá sâu */}
                      <div className="mt-2">
                        <button 
                          onClick={() => handleReplyClick(comment.id, reply.name)}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >
                          Trả lời
                        </button>
                      </div>

                      {/* Hiển thị adminReply của reply nếu có */}
                      {reply.adminReply && (
                        <div className="mt-3 ml-4 bg-white border-l-2 border-blue-400 p-3 rounded-r">
                           <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-blue-700 text-xs">👨‍🏫 {reply.repliedBy || 'Quản trị viên'}</span>
                          </div>
                          <p className="text-gray-700 text-xs whitespace-pre-wrap italic">{reply.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Nút phân trang */}
      {comments.length > visibleCount && (
        <div className="text-center mb-10 border-b border-gray-100 pb-10">
          <button 
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
          >
            Xem thêm bình luận
          </button>
        </div>
      )}

      {/* Form bình luận */}
      <div ref={formRef} className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-gray-800 mb-4">
          {replyingTo ? (
            <div className="flex items-center justify-between bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm">
              <span>Đang trả lời: <strong>{replyingTo.name}</strong></span>
              <button onClick={() => setReplyingTo(null)} className="text-blue-600 hover:text-blue-900 font-bold px-2">✕ Hủy</button>
            </div>
          ) : "Gửi bình luận của bạn"}
        </h4>

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <span className="text-emerald-500 mt-0.5">✅</span>
            <div>
              <p className="font-medium text-sm">{successMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!currentUser ? (
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
          ) : (
            <div className="bg-blue-100/50 p-3 rounded-lg border border-blue-200 text-sm text-blue-800">
              Bạn đang bình luận dưới tư cách: <strong>{currentUser.name}</strong> ({currentUser.email})
            </div>
          )}
          
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
            {isSubmitting ? "Đang gửi..." : (replyingTo ? "Gửi phản hồi" : "Gửi bình luận")}
          </button>
        </form>
      </div>
    </div>
  );
}
