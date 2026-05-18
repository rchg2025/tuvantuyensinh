"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number,
  onPageChange?: (page: number) => void
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  if (currentPage <= 3) {
    endPage = Math.min(totalPages, 5);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const renderLink = (page: number, content: React.ReactNode, disabled: boolean = false, isCurrent: boolean = false) => {
    if (disabled) {
      return (
        <span className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-100 shadow-sm opacity-60">
          {content}
        </span>
      );
    }

    const baseClass = "w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm";
    const stateClass = isCurrent 
      ? "bg-blue-600 text-white shadow-blue-500/40 border border-blue-600 ring-2 ring-blue-600 ring-offset-2 scale-105" 
      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 active:scale-95";

    if (onPageChange) {
      return (
        <button 
          onClick={(e) => handlePageClick(e, page)}
          className={`${baseClass} ${stateClass}`}
          aria-current={isCurrent ? "page" : undefined}
        >
          {content}
        </button>
      );
    }

    return (
      <Link 
        href={getPageUrl(page)} 
        className={`${baseClass} ${stateClass}`}
        aria-current={isCurrent ? "page" : undefined}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
      {/* Previous Button */}
      {renderLink(currentPage - 1, <ChevronLeftIcon />, currentPage === 1)}

      {/* First Page */}
      {startPage > 1 && (
        <>
          {renderLink(1, 1)}
          {startPage > 2 && (
            <span className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold tracking-[0.2em] px-1">
              ...
            </span>
          )}
        </>
      )}

      {/* Pages */}
      {pages.map(p => (
        <div key={p}>
          {renderLink(p, p, false, currentPage === p)}
        </div>
      ))}

      {/* Last Page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold tracking-[0.2em] px-1">
              ...
            </span>
          )}
          {renderLink(totalPages, totalPages)}
        </>
      )}

      {/* Next Button */}
      {renderLink(currentPage + 1, <ChevronRightIcon />, currentPage === totalPages)}
    </div>
  );
}
