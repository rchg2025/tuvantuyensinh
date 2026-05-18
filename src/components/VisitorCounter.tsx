"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [stats, setStats] = useState({ today: 0, total: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Function to track visit and fetch latest stats
    const trackAndFetch = async () => {
      try {
        // Track visit (if not tracked in this session)
        const hasVisited = sessionStorage.getItem("hasVisited");
        if (!hasVisited) {
          await fetch("/api/visit", { method: "POST" });
          sessionStorage.setItem("hasVisited", "true");
        }

        // Fetch stats
        const res = await fetch("/api/visit");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats({ today: data.today, total: data.total });
          }
        }
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackAndFetch();
  }, []);

  if (!mounted) return null;

  return (
    <div className="mt-6 inline-flex flex-col sm:flex-row gap-4 sm:gap-8 items-center bg-blue-800/30 px-6 py-3 rounded-xl border border-blue-700/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <div className="text-xs text-blue-300/80 font-medium uppercase tracking-wider">Truy cập hôm nay</div>
          <div className="font-bold text-lg text-white">{stats.today.toLocaleString('vi-VN')}</div>
        </div>
      </div>
      
      <div className="hidden sm:block w-px h-10 bg-blue-700/50"></div>
      
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <div>
          <div className="text-xs text-blue-300/80 font-medium uppercase tracking-wider">Tổng truy cập</div>
          <div className="font-bold text-lg text-white">{stats.total.toLocaleString('vi-VN')}</div>
        </div>
      </div>
    </div>
  );
}
