"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { saveSlidesAction } from "./actions";
import MediaLibraryModal from "@/components/MediaLibraryModal";
import { getDirectImageUrlClient as getDirectImageUrl } from "@/lib/clientUtils";

export interface Slide {
  id: string;
  url: string;
  link?: string;
  alt?: string;
}

export default function SlideManagerClient({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSlide = (files: any[]) => {
    const newSlides = files.map((f: any) => ({
      id: Math.random().toString(36).substring(7),
      url: f.url,
      link: "",
      alt: f.name
    }));
    setSlides([...slides, ...newSlides]);
  };

  const handleRemoveSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const handleChange = (id: string, field: keyof Slide, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSlide = (index: number, dir: -1 | 1) => {
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + dir];
    newSlides[index + dir] = temp;
    setSlides(newSlides);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Đang lưu thay đổi...");
    try {
      const res = await saveSlidesAction(slides);
      if (res.success) {
        toast.success("Đã lưu slide thành công!", { id: toastId });
      } else {
        toast.error("Lỗi: " + res.message, { id: toastId });
      }
    } catch (e: any) {
      toast.error("Lỗi kết nối!", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Danh sách Slide ({slides.length})</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-50 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          + Thêm ảnh
        </button>
      </div>

      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
            Chưa có slide nào. Hãy bấm "Thêm ảnh" để tải lên.
          </div>
        ) : (
          slides.map((slide, i) => (
            <div key={slide.id} className="flex flex-col md:flex-row gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 items-start">
              <div className="w-full md:w-1/3 aspect-video relative rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                <img 
                  src={getDirectImageUrl(slide.url, 600)} 
                  alt={slide.alt || "Slide"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Đường dẫn liên kết (khi click vào ảnh)</label>
                  <input 
                    type="text" 
                    value={slide.link || ""} 
                    onChange={e => handleChange(slide.id, "link", e.target.value)}
                    placeholder="https://... (tùy chọn)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Mô tả thay thế (Alt text)</label>
                  <input 
                    type="text" 
                    value={slide.alt || ""} 
                    onChange={e => handleChange(slide.id, "alt", e.target.value)}
                    placeholder="Mô tả ảnh"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => moveSlide(i, -1)} 
                      disabled={i === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 border rounded bg-white"
                      title="Lên trên"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button 
                      onClick={() => moveSlide(i, 1)} 
                      disabled={i === slides.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 border rounded bg-white"
                      title="Xuống dưới"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </div>

      <MediaLibraryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddSlide}
        multiSelect={true}
        accept="image/*"
      />
    </div>
  );
}
