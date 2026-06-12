"use client";

export default function CategoryFilter({ categories, defaultCategoryId }: { categories: any[]; defaultCategoryId: string }) {
  return (
    <select 
      name="categoryId" 
      title="Lọc theo danh mục"
      className="w-full text-slate-800 bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
      onChange={(e) => e.target.form?.submit()}
      defaultValue={defaultCategoryId || ""}
    >
      <option value="">Tất cả danh mục</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
