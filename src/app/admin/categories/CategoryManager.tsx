"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import Pagination from "@/components/Pagination";

type CategoryType = 'MAJOR' | 'POSITION' | 'POST';

interface Category {
  id: string;
  name: string;
  description: string | null;
  type: CategoryType;
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter
  const filtered = initialCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;
    const res = await deleteCategory(id);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createCategory(formData);
    if (res.success) {
      toast.success(res.message);
      (e.target as HTMLFormElement).reset();
    } else toast.error(res.message);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await updateCategory(formData);
    if (res.success) {
      toast.success(res.message);
      setEditingId(null);
    } else toast.error(res.message);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Thêm danh mục mới</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên danh mục</label>
              <input 
                name="name" 
                required 
                placeholder="VD: CNTT, Trưởng phòng, Tin tuyển sinh..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Loại danh mục</label>
              <select name="type" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="MAJOR">Ngành nghề</option>
                <option value="POSITION">Chức vụ</option>
                <option value="POST">Bài viết</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả tóm tắt</label>
            <input 
              name="description" 
              placeholder="Mô tả..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Thêm mới
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 mb-4">
            <input 
              type="text" 
              placeholder="🔍 Tìm kiếm danh mục..." 
              className="px-4 py-2 bg-white border border-slate-200 rounded-md w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <tr>
                <th className="p-4">Tên danh mục</th>
                <th className="p-4">Loại</th>
                <th className="p-4">Mô tả</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginated.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  {editingId === c.id ? (
                    <td colSpan={4} className="p-0">
                      <form onSubmit={handleUpdate} className="flex p-4 gap-2 items-center bg-blue-50/50">
                        <input type="hidden" name="id" value={c.id} />
                        <input name="name" defaultValue={c.name} required className="w-1/4 px-2 py-1 border rounded" />
                        <select name="type" defaultValue={c.type} className="w-1/4 px-2 py-1 border rounded bg-white">
                          <option value="MAJOR">Ngành nghề</option>
                          <option value="POSITION">Chức vụ</option>
                          <option value="POST">Bài viết</option>
                        </select>
                        <input name="description" defaultValue={c.description || ""} className="w-1/3 px-2 py-1 border rounded" />
                        <div className="flex gap-1 justify-center w-full">
                          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700">Lưu</button>
                          <button type="button" onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-bold hover:bg-slate-300">Hủy</button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="p-4 font-bold text-slate-800">{c.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          c.type === 'MAJOR' ? 'bg-blue-100 text-blue-700' :
                          c.type === 'POSITION' ? 'bg-purple-100 text-purple-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.type === 'MAJOR' ? 'Ngành nghề' : c.type === 'POSITION' ? 'Chức vụ' : 'Bài viết'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{c.description}</td>
                      <td className="p-4 flex gap-2 justify-center">
                        <button onClick={() => setEditingId(c.id)} className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition text-xs">Sửa</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs">Xóa</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Không tìm thấy danh mục nào.</td></tr>
              )}
            </tbody>
          </table></div>
        </div>

        {/* Pagination logic */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}