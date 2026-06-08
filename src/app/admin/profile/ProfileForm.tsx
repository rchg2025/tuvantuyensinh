"use client";

import { useTransition, useState, useRef } from "react";
import toast from "react-hot-toast";

export default function ProfileForm({ user, isAdmin, positions, auth, updateAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAvatarUrl(data.url);
        toast.success("Tải ảnh lên thành công!");
      } else {
        toast.error("Lỗi khi tải ảnh lên!");
      }
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="avatar" value={avatarUrl} />
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 mb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full border border-slate-200" />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <span className="text-slate-400 text-3xl">{(user?.name || "U")[0].toUpperCase()}</span>
            </div>
          )}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition shadow"
            disabled={isUploading}
            title="Tải ảnh lên"
          >
            {isUploading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
          </button>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <p className="text-xs text-slate-500">Nhấn vào icon để đổi ảnh đại diện</p>
      </div>
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
