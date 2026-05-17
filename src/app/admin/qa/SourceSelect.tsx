"use client";

export default function SourceSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select 
      name="source" 
      defaultValue={defaultValue}
      onChange={(e) => e.target.form?.submit()}
      className="w-full sm:w-auto text-gray-900 bg-white border border-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-sm"
    >
      <option value="all">Tất cả nguồn</option>
      <option value="student">Học viên hỏi</option>
      <option value="admin">Quản trị nhập</option>
    </select>
  );
}
