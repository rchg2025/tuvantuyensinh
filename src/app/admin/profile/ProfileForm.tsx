"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

export default function ProfileForm({ user, isAdmin, positions, auth, updateAction }: any) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateAction(formData);
        toast.success("Cập nhật thông tin thành công!");
      } catch (error) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Email đăng nhập</label>
          <input 
            readOnly
            disabled
            title="Email đăng nhập"
            value={user.email}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tên hiển thị</label>
          <input 
            name="name" 
            required 
            defaultValue={user.name || ""}
            placeholder="Nhập tên hiển thị..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
          <input 
            name="phone" 
            defaultValue={user.phone || ""}
            placeholder="Nhập số điện thoại..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Quyền tài khoản</label>
          {isAdmin ? (
            <select
              name="role"
              title="Quyền tài khoản"
              defaultValue={user.role}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ADMIN">Quản lý hệ thống (ADMIN)</option>
              <option value="CVD">Chuyên viên tư vấn (CVD)</option>
            </select>
          ) : (
            <input 
              disabled
              title="Quyền tài khoản"
              value={user.role === "ADMIN" ? "Quản lý hệ thống (ADMIN)" : "Chuyên viên tư vấn (CVD)"}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Chức vụ</label>
          {isAdmin ? (
            <select
              name="positionId"
              title="Chức vụ"
              defaultValue={user.positionId || ""}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Chưa cập nhật chức vụ --</option>
              {positions.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <input 
              disabled
              title="Chức vụ"
              value={user.positionId ? positions.find((p: any) => p.id === user.positionId)?.name || "" : "Chưa cập nhật chức vụ"}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu mới (Để trống nếu không đổi)</label>
        <input 
          type="password"
          name="password" 
          placeholder="••••••••"
          disabled={auth === "admin_logged_in"}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
        {auth === "admin_logged_in" && (
          <p className="text-xs text-red-500 mt-1">Tài khoản Root Admin không thể đổi mật khẩu tại đây.</p>
        )}
      </div>

      <button type="submit" disabled={isPending} className="bg-blue-600 disabled:bg-blue-400 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
        {isPending ? "Đang cập nhật..." : "Cập nhật thông tin"}
      </button>
    </form>
  );
}
