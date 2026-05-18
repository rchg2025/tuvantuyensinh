"use client";

import { useState, useEffect } from "react";

interface GalleryConfig {
  style: string;
  columns?: number;
  delay?: number;
  autoPlay?: boolean;
}

export default function GalleryDisplay({ images, configStr }: { images?: string, configStr?: string }) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [config, setConfig] = useState<GalleryConfig | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    try {
      if (images) setGalleryImages(JSON.parse(images));
      if (configStr) setConfig(JSON.parse(configStr));
    } catch (e) {
      console.error("Failed to parse gallery data", e);
    }
  }, [images, configStr]);

  useEffect(() => {
    if (config?.style === "Slider" && config.autoPlay && galleryImages.length > 1) {
      const delay = config.delay || 3000;
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % galleryImages.length);
      }, delay);
      return () => clearInterval(interval);
    }
  }, [config, galleryImages.length]);

  if (!galleryImages || galleryImages.length === 0 || !config) return null;

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="mt-8 mb-8">
      {config.style === "Slider" && (
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 group">
          <div 
            className="flex transition-transform duration-500 ease-in-out h-[400px] md:h-[600px]" 
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {galleryImages.map((src, idx) => (
              <img 
                key={idx} 
                src={src} 
                className="w-full h-full object-contain flex-shrink-0" 
                alt={`Gallery ${idx}`} 
              />
            ))}
          </div>
          
          <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === activeIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}

      {config.style === "Lưới (Grid)" && (
        <div 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${config.columns || 3}, minmax(0, 1fr))` }}
        >
          {galleryImages.map((src, idx) => (
            <img key={idx} src={src} className="w-full h-48 md:h-64 object-cover rounded-xl shadow-sm" alt={`Gallery ${idx}`} />
          ))}
        </div>
      )}

      {config.style === "Masonry" && (
        <div 
          className="gap-4" 
          style={{ columnCount: config.columns || 3, columnGap: "1rem" }}
        >
          {galleryImages.map((src, idx) => (
            <div key={idx} className="mb-4 break-inside-avoid">
              <img src={src} className="w-full rounded-xl shadow-sm" alt={`Gallery ${idx}`} />
            </div>
          ))}
        </div>
      )}

      {config.style === "Ảnh lớn + Thumbnail" && (
        <div className="flex flex-col gap-4">
          <div className="w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden bg-slate-900">
            <img src={galleryImages[activeIndex]} className="w-full h-full object-contain" alt={`Active gallery`} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {galleryImages.map((src, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 transition-colors ${idx === activeIndex ? "border-blue-500" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={src} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
