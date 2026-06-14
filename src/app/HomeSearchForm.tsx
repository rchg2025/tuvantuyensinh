"use client";

import { useState, useRef } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

export default function HomeSearchForm() {
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const { isListening, hasRecognitionSupport, startListening, stopListening } = useVoiceRecognition((text) => {
    setQuery(text);
    setTimeout(() => {
      formRef.current?.submit();
    }, 100);
  });

  return (
    <form ref={formRef} action="/search" method="GET" className="relative flex items-center">
      <span className="absolute left-4 text-gray-400 text-xl">🔍</span>
      <input 
        type="text" 
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm câu hỏi, bài viết..." 
        className="w-full text-gray-900 bg-white shadow-xl rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all text-sm font-medium"
      />
      {hasRecognitionSupport && (
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`absolute right-32 top-1/2 -translate-y-1/2 p-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
          title={isListening ? "Đang nghe..." : "Tìm kiếm bằng giọng nói"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
      <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors">
        Tìm kiếm
      </button>
    </form>
  );
}
