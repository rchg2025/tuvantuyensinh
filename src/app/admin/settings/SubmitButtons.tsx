"use client";

import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { testDriveAction } from "./actions";

export default function SubmitButtons({ showTestDriveBtn }: { showTestDriveBtn?: boolean }) {
  const { pending } = useFormStatus();

  const handleTest = async () => {
    const testPromise = testDriveAction().then(res => {
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.message;
    });

    toast.promise(
      testPromise,
      {
        loading: 'Đang gửi yêu cầu Test kết nối...',
        success: (msg) => <b>{msg as string}</b>,
        error: (err) => <b>{err.message}</b>,
      }
    );
  };

  return (
    <div className="flex justify-end gap-3 mt-6">
      {showTestDriveBtn && (
        <button 
          type="button" 
          onClick={handleTest} 
          disabled={pending}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <span>⚡</span> Test kết nối
        </button>
      )}

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