"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

export default function LiveSearch({
  placeholder = "Tìm kiếm thông minh...",
  className = "w-full md:w-64 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm",
  additionalParams = {},
}: {
  placeholder?: string;
  className?: string;
  additionalParams?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("q") || "");

  const { isListening, hasRecognitionSupport, startListening, stopListening } = useVoiceRecognition((text) => {
    setTerm(text);
    handleSearch(text);
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (nextValue: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (nextValue) {
          params.set("q", nextValue);
        } else {
          params.delete("q");
        }
        
        // Auto reset page map for UX
        if (params.has("page")) params.delete("page");

        // Inject any additional params (like tab=all)
        Object.entries(additionalParams).forEach(([k, v]) => {
          if (!params.has(k)) {
            params.set(k, v);
          }
        });

        router.push(`${pathname}?${params.toString()}`);
      }, 400);
    },
    // We omit additionalParams from deps or stringify it to prevent infinite re-renders/re-creations
    [pathname, router, searchParams] 
  );

  return (
    <>
      <span className="absolute left-3 text-gray-400 text-sm">🔍</span>
      {Object.entries(additionalParams).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input
        type="text"
        name="q"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder={placeholder}
        className={className}
        style={hasRecognitionSupport ? { paddingRight: '2.5rem' } : undefined}
      />
      {hasRecognitionSupport && (
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
          title={isListening ? "Đang nghe..." : "Tìm kiếm bằng giọng nói"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
    </>
  );
}