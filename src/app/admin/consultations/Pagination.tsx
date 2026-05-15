"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export default function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  if (currentPage <= 2) {
    endPage = Math.min(totalPages, 5);
  }
  if (currentPage >= totalPages - 1) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link href={getPageUrl(currentPage - 1)} className="px-3 py-1.5 text-sm bg-white border border-slate-200 hover:bg-slate-50 transition rounded-lg text-slate-700 font-medium shadow-sm">
          &laquo; Trang trước
        </Link>
      )}

      {startPage > 1 && (
        <>
          <Link href={getPageUrl(1)} className="px-3 py-1.5 text-sm border-transparent hover:bg-slate-50 transition rounded-lg text-slate-700 font-medium">1</Link>
          {startPage > 2 && <span className="text-slate-400">...</span>}
        </>
      )}

      {pages.map(p => (
        <Link 
          key={p} 
          href={getPageUrl(p)}
          className={`px-3 py-1.5 text-sm rounded-lg font-bold transition shadow-sm ${
            currentPage === p 
              ? 'bg-blue-600 text-white border-transparent' 
              : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          {p}
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
          <Link href={getPageUrl(totalPages)} className="px-3 py-1.5 text-sm border-transparent hover:bg-slate-50 transition rounded-lg text-slate-700 font-medium">{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={getPageUrl(currentPage + 1)} className="px-3 py-1.5 text-sm bg-white border border-slate-200 hover:bg-slate-50 transition rounded-lg text-slate-700 font-medium shadow-sm">
          Trang sau &raquo;
        </Link>
      )}
    </div>
  );
}