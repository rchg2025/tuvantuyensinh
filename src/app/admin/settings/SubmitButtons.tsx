"use client";

import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";

export default function SubmitButtons() {
  const { pending } = useFormStatus();

  const handleTest = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Đang kết nối thử bằng Service Account...',
        success: <b>Kết nối bị từ chối! Vui lòng lưu cấu hình trước khi Test.</b>,
        error: <b>Lỗi kết nối.</b>,
      }
    );
  };

  return (
    <div className="flex justify-end gap-3 mt-6">
      <button 
        type="button" 
        onClick={handleTest} 
        disabled={pending}
        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
      >
        <span>⚡</span> Test kết nối
      </button>

      <button 
        type="submit"
        disabled={pending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
      >
        <span>✓</span> {pending ? "Đang lưu..." : "Lưu cấu hình"}
      </button>
    </div>
  );
}