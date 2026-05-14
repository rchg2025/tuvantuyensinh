"use client";

import { useState } from "react";

export default function AdminLayoutClient({ 
  sidebar, 
  children 
}: { 
  sidebar: React.ReactNode, 
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen relative w-full overflow-hidden">
      {/* Mobile Header & Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center px-4 justify-between shadow-sm">
        <span className="font-bold text-slate-800">Quản trị viên</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-600 transition-colors">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Sidebar background overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-white
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        w-64 border-r border-slate-200 shadow-xl md:shadow-sm flex flex-col md:flex-shrink-0 h-screen
      `} onClick={() => { if (window.innerWidth < 768) setIsOpen(false) }}>
        {sidebar}
      </div>

      {/* Main content */}
      <main className="flex-1 w-full md:w-auto h-screen overflow-y-auto pt-20 md:pt-8 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}