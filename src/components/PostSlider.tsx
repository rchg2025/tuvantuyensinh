"use client";

import { useRef, useEffect, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || posts.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { clientWidth, scrollLeft, scrollWidth } = scrollRef.current;
        // Nếu đã cuộn đến cuối, quay lại từ đầu
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 4000); // Tự động trượt mỗi 4 giây

    return () => clearInterval(interval);
  }, [isHovered, posts.length]);

  if (posts.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="relative group -mx-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {posts.map((post, index) => (
          <div key={post.id} className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] flex-shrink-0 snap-start">
            <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-sm border border-blue-50 bg-white">
              {post.thumbnailUrl ? (
                <Image 
                  src={post.thumbnailUrl} 
                  alt={post.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index === 0}
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

      <button 
        onClick={() => scroll("left")} 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur shadow-sm hover:bg-white flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all font-bold z-10"
        aria-label="Previous slide"
      >
        &#10094;
      </button>
      <button 
        onClick={() => scroll("right")} 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur shadow-sm hover:bg-white flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all font-bold z-10"
        aria-label="Next slide"
      >
        &#10095;
      </button>
    </div>
  );
}
