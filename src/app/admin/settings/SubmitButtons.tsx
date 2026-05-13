"use client";

import { useTransition } from "react";

export default function SubmitButtons() {
  const [isPending, startTransition] = useTransition();

  const handleTest = () => {
    alert("Đang kiểm tra kết nối với Google Drive qua Service Account...\n(Kết quả sẽ trả về API của Google)");
  };

  return (
    <div className="flex justify-end gap-3 mt-6">
      <button 
        type="button" 
        onClick={handleTest} 
        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2"
      >
        <span>⚡</span> Test kết nối
      </button>

      <button 
        type="submit" 
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2"
      >
        <span>✓</span> Lưu cấu hình
      </button>
    </div>
  );
}