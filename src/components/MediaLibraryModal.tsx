"use client";

import { useState, useEffect, useCallback } from "react";
import { listMediaAction } from "@/app/admin/uploadAction";

interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  thumbnail: string;
  createdTime?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: MediaFile[]) => void;
  multiSelect?: boolean;
  accept?: string;
  children?: React.ReactNode; // Upload content
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  accept = "*/*",
  children
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadMedia = useCallback(async (token?: string) => {
    setLoading(true);
    try {
      const query = accept.includes("image") ? "mimeType contains 'image/'" : "";
      const res = await listMediaAction(token, query);
      if (res.success && res.files) {
        setFiles(prev => token ? [...prev, ...res.files] : res.files);
        setNextPageToken(res.nextPageToken);
      }
    } catch (error) {
      console.error("Failed to load media", error);
    } finally {
      setLoading(false);
    }
  }, [accept]);

  useEffect(() => {
    if (isOpen && activeTab === "library" && files.length === 0) {
      loadMedia();
    }
  }, [isOpen, activeTab, files.length, loadMedia]);

  const toggleSelect = (file: MediaFile) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(file.id)) {
      newSet.delete(file.id);
    } else {
      if (!multiSelect) newSet.clear();
      newSet.add(file.id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    const selectedFiles = files.filter(f => selectedIds.has(f.id));
    onSelect(selectedFiles);
    setSelectedIds(newSet => { newSet.clear(); return newSet; });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Chọn Media</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button 
            className={`py-3 px-4 font-medium border-b-2 text-sm ${activeTab === "upload" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("upload")}
          >
            Tải lên mới
          </button>
          <button 
            className={`py-3 px-4 font-medium border-b-2 text-sm ${activeTab === "library" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("library")}
          >
            Thư viện Media
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === "upload" ? (
            <div>{children}</div>
          ) : (
            <div className="flex flex-col h-full">
              {files.length === 0 && !loading ? (
                <div className="text-center py-12 text-slate-500">Chưa có file nào trong thư viện.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {files.map(f => {
                    const isSelected = selectedIds.has(f.id);
                    return (
                      <div 
                        key={f.id} 
                        onClick={() => toggleSelect(f)}
                        className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer bg-white group ${isSelected ? "border-blue-600" : "border-slate-200 hover:border-blue-400"}`}
                      >
                        {f.mimeType.startsWith("image/") ? (
                           <img src={f.thumbnail} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-600">
                              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs font-medium break-all line-clamp-2">{f.name}</span>
                           </div>
                        )}
                        
                        {/* Checkbox Overlay */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-black/20 border-white/80 opacity-0 group-hover:opacity-100"}`}>
                           {isSelected && (
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {loading && <div className="text-center py-4 text-slate-500">Đang tải...</div>}
              {nextPageToken && !loading && (
                <button 
                  onClick={() => loadMedia(nextPageToken)}
                  className="mt-6 mx-auto block px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Tải thêm
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "library" && (
          <div className="border-t p-4 flex justify-between items-center bg-white">
            <div className="text-sm text-slate-600">
              Đã chọn: <span className="font-bold">{selectedIds.size}</span> file
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
                Hủy
              </button>
              <button 
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}
        
        {/* Footer for Upload Tab if needed, but the child handles its own upload state,
            Maybe we should add a generic close button if they don't want to use the X in corner */}
        {activeTab === "upload" && (
           <div className="border-t p-4 flex justify-end bg-white">
             <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
               Đóng
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
