"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadFileAction } from "@/app/admin/uploadAction";

interface DragDropUploadProps {
  name: string;
  defaultValue?: string;
  accept?: string;
  label?: string;
}

export default function DragDropUpload({ name, defaultValue = "", accept = "image/*", label = "Kéo thả file vào đây hoặc click để chọn" }: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(defaultValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    
    setIsUploading(true);
    const toastId = toast.loading("Đang tải file lên Google Drive...");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setFileUrl(res.url);
        toast.success("Tải lên thành công!", { id: toastId });
      } else {
        toast.error("Lỗi: " + (res.error || "Không thể tải lên"), { id: toastId });
      }
    } catch (e: any) {
      toast.error("Đã xảy ra lỗi khi tải file", { id: toastId });
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

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={fileUrl} />
      
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

      {fileUrl && (
        <div className="mt-3 relative inline-block">
          <div className="text-xs text-green-600 font-semibold mb-1">✓ File đã được đính kèm:</div>
          {accept.includes("image") ? (
            <img src={fileUrl.includes('drive.google.com/uc') ? fileUrl.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w256') : fileUrl} alt="Preview" className="h-20 object-contain rounded border border-gray-200 bg-gray-50" />
          ) : (
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline break-all">
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
    </div>
  );
}