"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  createdAt: Date;
}

export default function PostSlider({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  useEffect(() => {
    if (posts.length <= 1) return;
    timerRef.current = setInterval(nextSlide, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [posts.length]);

  if (posts.length === 0) return null;

  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-sm border border-blue-50 bg-white">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-64 md:h-80"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {posts.map((post) => (
          <div key={post.id} className="w-full flex-shrink-0 relative">
            {post.thumbnailUrl ? (
              <img 
                src={post.thumbnailUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-300 font-bold text-6xl">
                📝
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-6">
              <Link href={`/posts/${post.id}`}>
                <h3 className="text-xl md:text-2xl font-bold text-white hover:text-blue-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>
              <div className="text-gray-300 text-sm mt-2">
                {new Date(post.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length > 1 && (
        <>
          <button 
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              prevSlide();
            }} 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur hover:bg-white/80 flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-all font-bold"
          >
            &#10094;
          </button>
          <button 
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              nextSlide();
            }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur hover:bg-white/80 flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-all font-bold"
          >
            &#10095;
          </button>
        </>
      )}
    </div>
  );
}
