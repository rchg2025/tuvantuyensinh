"use client";

import { useState, useEffect } from "react";
import { getDirectImageUrlClient as getDirectImageUrl } from "@/lib/clientUtils";
import Link from "next/link";

interface Slide {
  id: string;
  url: string;
  link?: string;
  alt?: string;
}

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-xl aspect-[21/9] md:aspect-[21/7] bg-slate-100 group">
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const imgUrl = getDirectImageUrl(slide.url, 1200) || slide.url;
        
        const content = (
          <img 
            src={imgUrl} 
            alt={slide.alt || "Slide"} 
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        );

        return (
          <div 
            key={slide.id} 
            className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {slide.link ? (
              <Link href={slide.link} className="block w-full h-full">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button 
            onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-20"
            aria-label="Previous slide"
          >
            &#10094;
          </button>
          <button 
            onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 z-20"
            aria-label="Next slide"
          >
            &#10095;
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
