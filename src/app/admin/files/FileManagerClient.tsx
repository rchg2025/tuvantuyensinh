"use client";

import { useState } from "react";
import { trashDriveFile } from "./actions";
import toast from "react-hot-toast";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  size?: string;
}

export default function FileManagerClient({ initialFiles }: { initialFiles: DriveFile[] }) {
  const [files, setFiles] = useState<DriveFile[]>(initialFiles);
  const [filter, setFilter] = useState<"ALL" | "MEDIA" | "DOCUMENT">("ALL");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const isMedia = (mimeType: string) => {
    return mimeType.startsWith("image/") || mimeType.startsWith("video/");
  };

  // Filter and search
  const filteredFiles = files.filter(f => {
    if (filter === "MEDIA" && !isMedia(f.mimeType)) return false;
    if (filter === "DOCUMENT" && (isMedia(f.mimeType) || f.mimeType === "application/vnd.google-apps.folder")) return false;
    
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn chuyển tệp "${name}" vào thùng rác không?`)) return;

    setIsDeleting(id);
    const res = await trashDriveFile(id);
    setIsDeleting(null);

    if (res.success) {
      toast.success("Đã chuyển tệp vào thùng rác");
      setFiles(files.filter(f => f.id !== id));
      // Adjust page if current page becomes empty
      if (paginatedFiles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      toast.error(res.message || "Lỗi khi xóa tệp");
    }
  };

  const copyLink = (link?: string) => {
    if (!link) {
      toast.error("Không có đường dẫn");
      return;
    }
    navigator.clipboard.writeText(link);
    toast.success("Đã sao chép đường dẫn!");
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return "Không xác định";
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return "Không xác định";
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + " MB";
    return (b / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => { setFilter("ALL"); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === "ALL" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            Tất cả ({files.length})
          </button>
          <button
            onClick={() => { setFilter("MEDIA"); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === "MEDIA" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            🖼️ Ảnh / Video ({files.filter(f => isMedia(f.mimeType)).length})
          </button>
          <button
            onClick={() => { setFilter("DOCUMENT"); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === "DOCUMENT" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            📄 Tệp ({files.filter(f => !isMedia(f.mimeType) && f.mimeType !== "application/vnd.google-apps.folder").length})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm tệp tin..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {paginatedFiles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Không tìm thấy tệp nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedFiles.map((file) => (
              <div key={file.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group bg-white flex flex-col">
                <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                  {isMedia(file.mimeType) && file.thumbnailLink ? (
                    <img src={file.thumbnailLink.replace('=s220', '=s400')} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl">
                      {file.mimeType.includes("pdf") ? "📕" :
                       file.mimeType.includes("word") ? "📘" :
                       file.mimeType.includes("excel") || file.mimeType.includes("spreadsheet") ? "📗" :
                       file.mimeType.includes("zip") || file.mimeType.includes("rar") ? "📦" : "📄"}
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <a 
                      href={file.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                      title="Mở tab mới"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>
                    </a>
                    <button 
                      onClick={() => copyLink(file.webViewLink)}
                      className="w-10 h-10 rounded-full bg-white text-green-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                      title="Sao chép Link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id, file.name)}
                      disabled={isDeleting === file.id}
                      className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm disabled:opacity-50"
                      title="Xóa vào thùng rác"
                    >
                      {isDeleting === file.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 truncate mb-1" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-2 text-xs text-slate-500">
                    <span>{formatSize(file.size)}</span>
                    <span>
                      {file.createdTime ? new Date(file.createdTime).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Trang trước
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                // Simple pagination display logic to limit buttons
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page 
                          ? "bg-blue-600 text-white" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1 py-1 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
