"use client";

import { useState, useRef, useEffect } from "react";
import LinkifyText from "./LinkifyText";
import Link from "next/link";

export default function ExpandableContent({ content, maxLines = 5, className = "", href }: { content: string, maxLines?: number, className?: string, href?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Set truncated to true if content is overflowing its constrained box
      setIsTruncated(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [content]);

  const innerContent = <LinkifyText text={content} />;

  return (
    <div className="relative w-full">
      <div 
        ref={contentRef}
        className={`${className} ${!isExpanded ? 'line-clamp-' + maxLines : ''} whitespace-pre-wrap`}
        style={!isExpanded ? { display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
      >
        {href ? (
          <Link href={href} className="hover:text-blue-700 transition-colors">
            {innerContent}
          </Link>
        ) : (
          innerContent
        )}
      </div>
      {isTruncated && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1 inline-block"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}
