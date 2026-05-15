"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileHeaderClient({
  isLoggedIn,
  authName,
  menuTree,
  postCategories,
  handleLogout
}: {
  isLoggedIn: boolean;
  authName: string;
  menuTree: any[];
  postCategories: any[];
  handleLogout: () => void;
}) {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsHeaderMenuOpen(false);
    // Notify the admin layout to toggle the sidebar
    window.dispatchEvent(new CustomEvent("toggleAdminSidebar"));
  };

  return (
    <>
      <div className="md:hidden flex justify-between items-center px-4 py-2 bg-blue-800 border-t border-blue-600 relative z-50">
        {/* Sidebar menu toggler icon */}
        <button 
          onClick={toggleSidebar}
          className="text-white p-1 hover:bg-blue-700 rounded transition" 
          title="Menu Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </button>

        {/* Center User Info */}
        <div className="flex-1 text-center text-sm font-medium px-2">
          {isLoggedIn ? (
            <div className="flex items-center justify-center gap-2">
              <Link href="/admin" className="truncate text-white hover:text-blue-200 transition">
                {authName ? decodeURIComponent(authName) : "Trang cá nhân"}
              </Link>
              <form action={handleLogout}>
                <button 
                  type="submit"
                  className="text-red-300 hover:text-red-100 p-1 bg-red-900/30 rounded-full transition" 
                  title="Thoát đăng nhập"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" x2="9" y1="12" y2="12"></line>
                  </svg>
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-blue-200 hover:text-white transition">Đăng nhập</Link>
          )}
        </div>

        {/* Header menu toggler icon */}
        <button 
          onClick={() => {
          setIsHeaderMenuOpen(!isHeaderMenuOpen);
          if (!isHeaderMenuOpen) window.dispatchEvent(new CustomEvent("closeAdminSidebar"));
        }}
          className={`text-white p-1 hover:bg-blue-700 rounded transition ${isHeaderMenuOpen ? "bg-blue-700" : ""}`} 
          title="Menu Header"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {isHeaderMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-600/50 py-2 w-full animate-in slide-in-from-top-2 absolute left-0 right-0 z-40 shadow-xl" style={{ top: "100%" }}>
          {menuTree.length > 0 ? (
            menuTree.map((menu: any) => (
              <div key={menu.id} className="block w-full">
                <Link 
                  href={menu.url} 
                  className="block px-6 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                  onClick={() => setIsHeaderMenuOpen(false)}
                >
                  {menu.title}
                </Link>
                {menu.children?.length > 0 && (
                  <div className="bg-blue-800/30">
                    {menu.children.map((child: any) => (
                      <Link 
                        key={child.id} 
                        href={child.url} 
                        className="block px-10 py-3 text-blue-100 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0 text-sm"
                        onClick={() => setIsHeaderMenuOpen(false)}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <Link href="/posts" className="block px-6 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/5" onClick={() => setIsHeaderMenuOpen(false)}>
                Bài viết
              </Link>
              {postCategories.length > 0 && (
                <div className="bg-blue-800/30">
                  {postCategories.map(cat => (
                    <Link 
                      key={cat.id} 
                      href={`/posts?categorySlug=${cat.slug || cat.id}`} 
                      className="block px-10 py-3 text-blue-100 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 text-sm"
                      onClick={() => setIsHeaderMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/qa" className="block px-6 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/5" onClick={() => setIsHeaderMenuOpen(false)}>
                Hỏi đáp
              </Link>
            </>
          )}
          <div className="p-4 pt-2">
            <Link 
              href="/consultation" 
              className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-sm px-4 py-3 rounded-lg shadow transition"
              onClick={() => setIsHeaderMenuOpen(false)}
            >
              Đăng ký tư vấn
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
