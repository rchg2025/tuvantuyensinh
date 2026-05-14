"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

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

  // Minimal hook for debounce without lodash/use-debounce
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = useCallback(
    debounce((nextValue: string) => {
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
    }, 400),
    [pathname, router, searchParams, additionalParams]
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
      />
    </>
  );
}