"use client";

import { useState, useRef, useEffect } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

export default function PostsSearchForm({
  initialQ,
  initialCategorySlug,
  categories
}: {
  initialQ: string;
  initialCategorySlug: string;
  categories: { id: string; name: string; slug: string | null }[];
}) {
  const [q, setQ] = useState(initialQ);
  const formRef = useRef<HTMLFormElement>(null);

  // Cập nhật state nếu initialQ thay đổi từ server
  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  const { isListening, hasRecognitionSupport, startListening, stopListening } = useVoiceRecognition((text) => {
    setQ(text);
    setTimeout(() => {
      formRef.current?.submit();
    }, 100);
  });

  return (
    <form ref={formRef} action="/posts" method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/20 p-2 rounded-xl backdrop-blur-md w-full lg:w-auto mt-4 lg:mt-0">
      <div className="relative w-full sm:w-64">
        <input
          type="text"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="w-full bg-white text-gray-900 placeholder:text-gray-500 px-4 py-2 pr-10 rounded-lg border-transparent focus:ring-2 focus:ring-blue-300 outline-none"
        />
        {hasRecognitionSupport && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'} transition-colors`}
            title={isListening ? "Đang nghe..." : "Tìm kiếm bằng giọng nói"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <select
          name="categorySlug"
          defaultValue={initialCategorySlug}
          title="Danh mục"
          className="flex-1 sm:flex-none bg-white text-gray-900 border-transparent px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none sm:max-w-40"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug || c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
          Tìm
        </button>
      </div>
    </form>
  );
}
