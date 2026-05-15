"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function ConsultationsFilter({
  q,
  status,
  program,
  availablePrograms
}: {
  q: string;
  status: string;
  program: string;
  availablePrograms: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset page on filter change
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("q", searchQuery);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <input 
          type="text" 
          placeholder="Tìm kiếm thông minh: Tên, SĐT, Email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
        />
      </div>
      <div className="w-full md:w-56">
        <select 
          value={status} 
          onChange={(e) => updateParams("status", e.target.value)}
          title="Trạng thái"
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-white"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="Cần tư vấn">Cần tư vấn</option>
          <option value="Đang tư vấn">Đang tư vấn</option>
          <option value="Tư vấn chuyên sâu">Tư vấn chuyên sâu</option>
          <option value="Đã tư vấn">Đã tư vấn</option>
        </select>
      </div>
      <div className="w-full md:w-56">
        <select 
          value={program} 
          onChange={(e) => updateParams("program", e.target.value)}
          title="Ngành quan tâm"
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-white"
        >
          <option value="">-- Tất cả ngành quan tâm --</option>
          {availablePrograms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="w-full md:w-auto bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-700 transition">
        Lọc
      </button>
    </form>
  );
}