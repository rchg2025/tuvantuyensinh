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

  const isMedia = (mimeType: string) => {
    return mimeType.startsWith("image/") || mimeType.startsWith("video/");
  };

  const filteredFiles = files.filter(f => {
    if (filter === "ALL") return true;
    if (filter === "MEDIA") return isMedia(f.mimeType);
    if (filter === "DOCUMENT") return !isMedia(f.mimeType) && f.mimeType !== "application/vnd.google-apps.folder";
    return true;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn chuyển tệp "${name}" vào thùng rác không?`)) return;

    setIsDeleting(id);
    const res = await trashDriveFile(id);
    setIsDeleting(null);

    if (res.success) {
      toast.success("Đã chuyển tệp vào thùng rác");
      setFiles(files.filter(f => f.id !== id));
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
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
            filter === "ALL" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
          }`}
        >
          Tất cả ({files.length})
        </button>
        <button
          onClick={() => setFilter("MEDIA")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
            filter === "MEDIA" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
          }`}
        >
          🖼️ Ảnh / Video ({files.filter(f => isMedia(f.mimeType)).length})
        </button>
        <button
          onClick={() => setFilter("DOCUMENT")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
            filter === "DOCUMENT" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
          }`}
        >
          📄 Tệp tài liệu ({files.filter(f => !isMedia(f.mimeType) && f.mimeType !== "application/vnd.google-apps.folder").length})
        </button>
      </div>

      <div className="p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Không tìm thấy tệp nào trong danh mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
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
                  
                  {/* Overlay Actions */}
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
      </div>
    </div>
  );
}
