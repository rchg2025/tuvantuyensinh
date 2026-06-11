"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { createPostAction } from "../actions";
import DragDropUpload from "@/components/DragDropUpload";
import { uploadFileAction } from "@/app/admin/uploadAction";
import GalleryUploader from "./GalleryUploader";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function PostForm({ defaultValues, categories = [] }: { defaultValues?: any, categories?: any[] }) {
  const [content, setContent] = useState(defaultValues?.content || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const toastId = toast.loading("Đang tải tệp lên Google Drive...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        // Insert to content
        let fileTag = "";
        if (file.type.startsWith("image/")) {
          fileTag = `<img src="${res.url}" alt="${file.name}" />`;
        } else {
          fileTag = `<a href="${res.url}" target="_blank" rel="noopener noreferrer">${file.name}</a>`;
        }
        setContent((prev: string) => prev + fileTag);
        toast.success("Đã chèn tệp vào bài viết!", { id: toastId });
      } else {
        toast.error("Lỗi: " + (res.error || "Không thể tải lên"), { id: toastId });
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải tệp!", { id: toastId });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("content", content);
    if (defaultValues?.id) formData.set("id", defaultValues.id);
    
    const loadingToast = toast.loading("Đang lÆ°u bài viết...");
    try {
      const res = await createPostAction(formData);
      if (res.success) {
        toast.success(res.message, { id: loadingToast });
        if (!defaultValues) {
          setTimeout(() => {
            window.location.href = "/admin/posts?tab=create";
          }, 1000);
        }
      } else {
        toast.error("Lỗi: " + res.message, { id: loadingToast });
      }
    } catch (e: any) {
      toast.error("Đã xảy ra lỗi!", { id: loadingToast });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4">{defaultValues ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h2>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề bài viết</label>
            <input 
              name="title" 
              required 
              defaultValue={defaultValues?.title || ""}
              placeholder="VD: Hướng dẫn nộp hồ sơ..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục</label>
            <select
              name="categoryId"
              title="Danh mục"
              defaultValue={defaultValues?.categoryId || ""}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Không chọn --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh đại diện (Thumbnail)</label>
            <DragDropUpload name="thumbnailUrl" defaultValue={defaultValues?.thumbnailUrl || ""} accept="image/*" label="Kéo thả ảnh Thumbnail vào đây" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">File đính kèm (Tùy chọn)</label>
            <DragDropUpload name="attachments" defaultValue={defaultValues?.attachments || ""} accept="*/*" label="Kéo thả file đính kèm vào đây (PDF, DOCX...)" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <GalleryUploader 
            defaultGallery={defaultValues?.gallery} 
            defaultConfig={defaultValues?.galleryConfig} 
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-700">Nội dung</label>
            <div>
              <input 
                type="file" 
                title="Tải tệp lên"
                ref={fileInputRef}
                className="hidden" 
                accept="*/*"
                onChange={handleImageUpload}
              />
              <button 
                type="button"
                disabled={isUploadingImage}
                onClick={() => {
                  if (!isUploadingImage) fileInputRef.current?.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded bg-white transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {isUploadingImage ? "Đang tải..." : "Thêm tệp"}
              </button>
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden prose-sm max-w-none">
             <JoditEditor
                value={content}
                config={{
                  readonly: false,
                  height: 500,
                  uploader: {
                    insertImageAsBase64URI: true, // we will just use base64 for simplicity if needed, or implement file upload
                  },
                  language: 'vi'
                }}
                onBlur={newContent => setContent(newContent)}
             />
          </div>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
          {defaultValues ? "Cập nhật bài viết" : "Đăng bài viết"}
        </button>
      </form>
    </div>
  );
}
