"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Post {
  id: string;
  slug?: string | null;
  title: string;
  content?: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  category?: {
    id: string;
    slug?: string | null;
    name: string;
  } | null;
}

export default function PostSlider({ posts }: { posts: Post[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(4);
      else if (window.innerWidth >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(posts.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(nextSlide, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalPages]);

  if (posts.length === 0) return null;

  return (
    <div className="relative group overflow-hidden -mx-2">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {posts.map((post, index) => (
          <div key={post.id} className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2">
            <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-sm border border-blue-50 bg-white">
              {post.thumbnailUrl ? (
                <Image 
                  src={post.thumbnailUrl} 
                  alt={post.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index < 4}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-300 font-bold text-6xl">
                  📝
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-4 md:p-6">
                <Link href={`/posts/${post.slug || post.id}`}>
                  <h3 className="text-lg md:text-xl font-bold text-white hover:text-blue-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <div className="text-gray-300 text-xs md:text-sm mt-2 flex justify-between items-center gap-2">
                  <span>{new Date(post.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                  {post.category && (
                    <span className="bg-blue-500/80 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold backdrop-blur-sm truncate max-w-[50%]">
                      {post.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <>
          <button 
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              prevSlide();
            }} 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur shadow-sm hover:bg-white flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all font-bold z-10"
          >
            &#10094;
          </button>
          <button 
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              nextSlide();
            }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur shadow-sm hover:bg-white flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all font-bold z-10"
          >
            &#10095;
          </button>
        </>
      )}
    </div>
  );
}
