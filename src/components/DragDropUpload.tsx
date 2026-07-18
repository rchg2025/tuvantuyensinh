"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadFileAction, getResumableUrlAction, finalizeUploadAction, uploadToCloudinaryAction } from "@/app/admin/uploadAction";
import MediaLibraryModal from "./MediaLibraryModal";

interface DragDropUploadProps {
  name: string;
  defaultValue?: string;
  accept?: string;
  label?: string;
  uploadTarget?: 'gdrive' | 'cloudinary';
}

export default function DragDropUpload({ name, defaultValue = "", accept = "image/*", label = "Kéo thả file vào đây hoặc click để chọn", uploadTarget = "gdrive" }: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(defaultValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    
    setIsUploading(true);
    const toastId = toast.loading("Đang khởi tạo tải lên...");
    
    try {
      if (uploadTarget === "cloudinary") {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await (uploadToCloudinaryAction(formData) as any);
        if (res.success && res.url) {
          setFileUrl(res.url);
          toast.success("Tải lên Cloudinary thành công!", { id: toastId });
          setIsModalOpen(false); // Close modal if open
        } else {
          toast.error("Lỗi: " + (res.error || "Không thể tải lên Cloudinary"), { id: toastId });
        }
      } else if (file.size > 4.5 * 1024 * 1024) {
        toast.loading("File lớn đang được tải lên trực tiếp...", { id: toastId });
        
        // 1. Get Resumable URL
        const initRes = await getResumableUrlAction(file.name, file.type || "application/octet-stream");
        if (!initRes.success || !initRes.uploadUrl) {
          throw new Error(initRes.error || "Không thể khởi tạo upload");
        }

        // 2. Upload directly to Google Drive
        const uploadRes = await fetch(initRes.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Google Drive Error (${uploadRes.status}): ${errText}`);
        }

        const fileData = await uploadRes.json();
        if (!fileData.id) {
          throw new Error("Không nhận được ID file từ Google");
        }

        toast.loading("Đang thiết lập quyền truy cập...", { id: toastId });

        // 3. Make public
        const finalRes = await finalizeUploadAction(fileData.id, file.type || "application/octet-stream");
        if (finalRes.success && finalRes.url) {
          setFileUrl(finalRes.url);
          toast.success("Tải lên thành công!", { id: toastId });
          setIsModalOpen(false); // Close modal if open
        } else {
          throw new Error(finalRes.error || "Không thể hoàn tất file");
        }
      } else {
        // Fallback for smaller files (optional, but faster since fewer roundtrips)
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await uploadFileAction(formData);
        if (res.success && res.url) {
          setFileUrl(res.url);
          toast.success("Tải lên thành công!", { id: toastId });
          setIsModalOpen(false); // Close modal if open
        } else {
          toast.error("Lỗi: " + (res.error || "Không thể tải lên"), { id: toastId });
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Đã xảy ra lỗi khi tải file: " + (e?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = () => setIsDragging(false);
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const renderUploadUI = () => (
    <div 
      onClick={() => !isUploading && fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:bg-slate-50"
      } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={accept}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
      
      {isUploading ? (
        <div className="text-blue-600 font-semibold">Đang tải lên...</div>
      ) : (
        <div className="text-slate-500">
          <svg className="mx-auto h-8 w-8 mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="font-medium text-slate-700">{label}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={fileUrl} />
      
      <div 
        onClick={() => !isUploading && setIsModalOpen(true)}
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
      >
         {isUploading ? (
          <div className="text-blue-600 font-semibold">Đang tải lên...</div>
        ) : (
          <div className="text-slate-500 flex flex-col items-center justify-center">
            <svg className="mx-auto h-8 w-8 mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="font-medium text-slate-700">{label} (Click để chọn từ thư viện)</span>
          </div>
        )}
      </div>

      {fileUrl && (
        <div className="mt-3 relative inline-block">
          <div className="text-xs text-green-600 font-semibold mb-1">✓ File đã được đính kèm:</div>
          {accept.includes("image") ? (
            <img src={fileUrl.includes('drive.google.com/') ? fileUrl.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w256') : fileUrl} alt="Preview" className="h-20 object-contain rounded border border-gray-200 bg-gray-50" />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline break-words">
              {fileUrl}
            </a>
          )}
          <button 
            type="button" 
            onClick={() => setFileUrl("")} 
            className="mt-1 text-xs text-red-500 hover:text-red-700 block"
          >
            Xóa (Bỏ đính kèm)
          </button>
        </div>
      )}

      {isModalOpen && (
         <MediaLibraryModal
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
           onSelect={(files) => {
             if (files.length > 0) {
               setFileUrl(files[0].url);
               toast.success("Đã chọn file từ thư viện!");
             }
           }}
           multiSelect={false}
           accept={accept}
         >
           <div className="p-4">
             <h4 className="text-sm font-semibold text-slate-700 mb-2">Tải file mới lên:</h4>
             {renderUploadUI()}
           </div>
         </MediaLibraryModal>
      )}
    </div>
  );
}
