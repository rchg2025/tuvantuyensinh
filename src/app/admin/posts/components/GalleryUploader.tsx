"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadFileAction } from "@/app/admin/uploadAction";

interface GalleryConfig {
  style: string;
  columns?: number;
  delay?: number;
  autoPlay?: boolean;
}

export default function GalleryUploader({
  defaultGallery = "[]",
  defaultConfig = "{\"style\":\"Slider\",\"columns\":3,\"delay\":3000,\"autoPlay\":true}",
}: {
  defaultGallery?: string;
  defaultConfig?: string;
}) {
  const [images, setImages] = useState<string[]>(() => {
    try {
      return JSON.parse(defaultGallery || "[]");
    } catch {
      return [];
    }
  });

  const [config, setConfig] = useState<GalleryConfig>(() => {
    try {
      return JSON.parse(defaultConfig || "{\"style\":\"Slider\",\"columns\":3,\"delay\":3000,\"autoPlay\":true}");
    } catch {
      return { style: "Slider", columns: 3, delay: 3000, autoPlay: true };
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);
    
    let uploadedUrls: string[] = [];
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await uploadFileAction(formData);
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        } else {
          errorCount++;
        }
      } catch (e) {
        errorCount++;
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      if (errorCount === 0) {
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh!`, { id: toastId });
      } else {
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh, ${errorCount} lỗi!`, { id: toastId });
      }
    } else {
      toast.error("Không thể tải lên ảnh nào!", { id: toastId });
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-full space-y-4">
      <input type="hidden" name="gallery" value={JSON.stringify(images)} />
      <input type="hidden" name="galleryConfig" value={JSON.stringify(config)} />

      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">Thư viện ảnh (Gallery)</label>
        <div className="flex gap-2">
           <button
             type="button"
             onClick={() => setShowSettings(!showSettings)}
             className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded transition-colors"
           >
             Cài đặt Album
           </button>
           <button
             type="button"
             disabled={isUploading}
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded bg-white transition-colors disabled:opacity-50"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
             </svg>
             {isUploading ? "Đang tải..." : "Thêm ảnh"}
           </button>
        </div>
        <input 
          type="file" 
          multiple
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>

      {showSettings && (
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kiểu hiển thị:</label>
            <select 
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Slider">Slider</option>
              <option value="Lưới (Grid)">Lưới (Grid)</option>
              <option value="Masonry">Masonry</option>
              <option value="Ảnh lớn + Thumbnail">Ảnh lớn + Thumbnail</option>
            </select>
          </div>

          {(config.style === "Lưới (Grid)" || config.style === "Masonry") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số cột (Grid/Masonry):</label>
              <select 
                value={config.columns}
                onChange={(e) => setConfig({ ...config, columns: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 cột</option>
                <option value={2}>2 cột</option>
                <option value={3}>3 cột</option>
                <option value={4}>4 cột</option>
                <option value={5}>5 cột</option>
              </select>
            </div>
          )}

          {config.style === "Slider" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian chuyển ảnh (ms):</label>
                <input 
                  type="number"
                  value={config.delay}
                  onChange={(e) => setConfig({ ...config, delay: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">1000ms = 1 giây</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="autoPlay"
                  checked={config.autoPlay}
                  onChange={(e) => setConfig({ ...config, autoPlay: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="autoPlay" className="text-sm font-medium text-slate-700">Tự động chuyển ảnh</label>
              </div>
            </>
          )}
          
          <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm flex gap-2">
            <svg className="w-5 h-5 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Lưu ý: Bạn có thể chọn cách hiển thị album ảnh tuỳ theo nhu cầu để bài viết trở nên sinh động hơn.</span>
          </div>
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200">
              <img 
                src={url.includes('drive.google.com/') ? url.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w256') : url} 
                alt={`Gallery img ${idx}`} 
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500 bg-slate-50">
          Chưa có ảnh nào trong thư viện. Vui lòng bấm "Thêm ảnh" để tải lên.
        </div>
      )}
    </div>
  );
}
