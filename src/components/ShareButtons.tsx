"use client";

import { useState, useEffect } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("Xem bài viết này: " + url)}`
  };

  const handleZaloShare = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use window.open for Zalo to prevent main window from redirecting to Zalo install page
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
    window.open(zaloUrl, 'zalo-share', 'width=600,height=500,toolbar=0,menubar=0,location=0');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>🔗</span> Chia sẻ bài viết
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        <a 
          href={shareLinks.facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#1877F2] hover:bg-[#1864cc] text-white rounded-md font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </a>

        <button 
          onClick={handleZaloShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0068FF] hover:bg-[#0055d4] text-white rounded-md font-medium transition-colors shadow-sm"
        >
          <span className="font-extrabold font-sans text-[13px]">Zalo</span>
        </button>

        <a 
          href={shareLinks.email} 
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          Email
        </a>

        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors shadow-sm ml-auto"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span className="text-green-600">Đã copy!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
