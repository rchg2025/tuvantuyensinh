"use client";

import { useState } from "react";
import { updateUser } from "./actions";

type User = {
  id: string;
  name: string | null;
  avatar: string | null;
  email: string;
  phone: string | null;
  role: string;
  positionId: string | null;
  position: { name: string } | null;
};

type Position = {
  id: string;
  name: string;
};

export default function UserRow({ user, positions, deleteAction }: { user: User, positions: Position[], deleteAction: (formData: FormData) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "ADMIN",
    positionId: user.positionId || "",
    password: ""
  });

  async function handleSave() {
    await updateUser(user.id, formData);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <tr className="bg-blue-50 transition-colors">
        <td colSpan={5} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ</label>
              <select value={formData.positionId} onChange={e => setFormData({...formData, positionId: e.target.value})} className="w-full px-3 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                <option value="">-- Chọn chức vụ --</option>
                {positions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Để trống nếu không đổi..." className="w-full px-3 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quyền / Vai trò</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                <option value="ADMIN">Quản trị viên (Admin)</option>
                <option value="CVD">Chuyên viên tư vấn (CVD)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => setIsEditing(false)} className="text-slate-600 bg-slate-200 hover:bg-slate-300 font-semibold px-4 py-1.5 rounded text-sm transition">Hủy</button>
            <button onClick={handleSave} className="text-white bg-blue-600 hover:bg-blue-700 font-semibold px-4 py-1.5 rounded text-sm transition">Lưu thay đổi</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="p-4 font-bold text-slate-800">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name || "Avatar"} className="w-8 h-8 rounded-full object-cover shrink-0 bg-slate-100 border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <span>{user.name || "Chưa cập nhật"}</span>
        </div>
      </td>
      <td className="p-4 text-slate-600">
        <p>{user.email}</p>
        <p className="text-xs">{user.phone}</p>
      </td>
      <td className="p-4 text-slate-600">{user.position?.name || "Chưa có"}</td>
      <td className="p-4 font-semibold text-indigo-600">{user.role}</td>
      <td className="p-4 flex flex-col gap-2 justify-center items-center h-full">
        <button onClick={() => setIsEditing(true)} className="text-blue-500 w-full hover:text-blue-700 font-bold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition text-xs">Sửa</button>
        <form action={deleteAction} className="w-full">
          <input type="hidden" name="id" value={user.id} />
          <button type="submit" className="text-red-500 w-full hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs border-0 cursor-pointer">Xóa</button>
        </form>
      </td>
    </tr>
  );
}
