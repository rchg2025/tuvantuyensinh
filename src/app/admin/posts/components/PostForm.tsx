"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import { createPostAction } from "../actions";
import DragDropUpload from "@/components/DragDropUpload";

export default function PostForm({ defaultValues, categories = [] }: { defaultValues?: any, categories?: any[] }) {
  const [content, setContent] = useState(defaultValues?.content || "");
  const formRef = useRef<HTMLFormElement>(null);

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
  };

  const imagesUploadHandler = async (blobInfo: any): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          resolve(data.url);
        } else {
          reject(data.error || "Lỗi tải ảnh lên Drive");
        }
      } catch (err: any) {
        reject("Lỗi hệ thống khi tải ảnh: " + err.message);
      }
    });
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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung</label>
          <div className="border border-slate-200 rounded-lg overflow-hidden prose-sm max-w-none">
             <Editor
                apiKey="no-api-key"
                value={content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: false,
                  language: "vi",
                  plugins: [
                    "advlist", "autolink", "lists", "link", "image", "media", "charmap",
                    "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                    "insertdatetime", "media", "table", "help", "wordcount"
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "image media link | removeformat | help",
                  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; word-break: normal; overflow-wrap: anywhere; }",
                  images_upload_handler: imagesUploadHandler,
                  file_picker_types: "file image media",
                  file_picker_callback: function(callback: any, value: any, meta: any) {
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", meta.filetype === "image" ? "image/*" : meta.filetype === "media" ? "video/*,audio/*" : "*/*");
                    input.onchange = async function(e: any) {
                       const file = e.target.files[0];
                       const formData = new FormData();
                       formData.append("file", file);
                       toast.loading("Đang đồng bộ File lên Drive...", { id: "uploadDrive" });
                       try {
                         const res = await fetch("/api/upload", { method: "POST", body: formData });
                         const data = await res.json();
                         if (data.success) {
                           toast.success("Đã đồng bộ Drive thành công!", { id: "uploadDrive" });
                           callback(data.url, { text: file.name });
                         } else {
                           toast.error(data.error || "Lỗi tải file", { id: "uploadDrive" });
                         }
                       } catch (err: any) {
                         toast.error("Lỗi: " + err.message, { id: "uploadDrive" });
                       }
                    };
                    input.click();
                  }
                }}
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
