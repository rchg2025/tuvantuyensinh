"use client";

import { useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { createPostAction } from "../actions";
import DragDropUpload from "@/components/DragDropUpload";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function PostForm({ defaultValues }: { defaultValues?: any }) {
  const [content, setContent] = useState(defaultValues?.content || "");
  const formRef = useRef<HTMLFormElement>(null);
  
  const config = useMemo(() => {
    return {
      readonly: false,
      placeholder: "Viết nội dung bài đăng ở đây...",
      language: "vi",
      height: 400,
      uploader: {
        insertImageAsBase64URI: true,
      },
    };
  }, []);

  const handleSubmit = async (formData: FormData) => {
    formData.set("content", content);
    if (defaultValues?.id) formData.set("id", defaultValues.id);
    
    const loadingToast = toast.loading("Đang lÆ°u bài viết...");
    try {
      const res = await createPostAction(formData);
      if (res.success) {
        toast.success(res.message, { id: loadingToast });
        if (!defaultValues) {
          formRef.current?.reset();
          setContent("");
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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung</label>
          <div className="border border-slate-200 rounded-lg overflow-hidden prose-sm max-w-none">
            <JoditEditor
              value={content}
              config={config}
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
