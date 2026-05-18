"use client";

import { useEffect, useState } from "react";

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function VisitorCounter() {
  const [stats, setStats] = useState({ today: 0, total: 0, online: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get or create session ID
    let sessionId = sessionStorage.getItem("visitorSessionId");
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem("visitorSessionId", sessionId);
    }
    
    // Function to track visit and fetch latest stats
    const trackAndFetch = async () => {
      try {
        // Track visit
        const hasVisited = sessionStorage.getItem("hasVisited");
        const newVisit = !hasVisited;
        
        await fetch("/api/visit", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, newVisit })
        });
        
        if (newVisit) {
          sessionStorage.setItem("hasVisited", "true");
        }

        // Fetch stats
        const res = await fetch("/api/visit");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats({ today: data.today, total: data.total, online: data.online });
          }
        }
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackAndFetch();

    // Ping every 2 minutes to keep session active
    const pingInterval = setInterval(async () => {
      try {
        await fetch("/api/visit", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, newVisit: false })
        });
        const res = await fetch("/api/visit");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStats(prev => ({ ...prev, online: data.online }));
          }
        }
      } catch (e) {}
    }, 2 * 60 * 1000);

    return () => clearInterval(pingInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mt-6 inline-flex flex-col sm:flex-row gap-4 sm:gap-8 items-center bg-blue-800/30 px-6 py-3 rounded-xl border border-blue-700/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg relative">
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-blue-900 rounded-full animate-pulse"></span>
          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
        <div>
          <div className="text-xs text-blue-300/80 font-medium uppercase tracking-wider">Đang Online</div>
          <div className="font-bold text-lg text-white">{stats.online.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      <div className="hidden sm:block w-px h-10 bg-blue-700/50"></div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <div className="text-xs text-blue-300/80 font-medium uppercase tracking-wider">Hôm nay</div>
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
