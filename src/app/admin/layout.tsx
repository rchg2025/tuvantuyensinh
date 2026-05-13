import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;

  if (auth !== "admin_logged_in") {
    redirect("/login");
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 text-blue-600 mb-3 shadow-inner">
            <span className="text-2xl">🛡️</span>
          </div>
          <h2 className="font-bold text-slate-800">Admin Panel</h2>
          <p className="text-xs text-slate-500">Quản lý hệ thống</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            🏠 Bảng điều khiển
          </Link>
          <Link href="/admin/consultations" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            📞 Đăng ký tư vấn
          </Link>
          <Link href="/admin/posts" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            📰 Bài viết
          </Link>
          <Link href="/admin/qa" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            💬 Hỏi đáp & Tư vấn
          </Link>
          <Link href="/admin/categories" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            🗂️ Danh mục hệ thống
          </Link>
          <Link href="/admin/users" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            👥 Quản lý thành viên
          </Link>
          <Link href="/admin/settings" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            ⚙️ Cấu hình hệ thống
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <form action={async () => {
            "use server";
            const cookieStore = await cookies();
            cookieStore.delete("auth_token");
            redirect("/login");
          }}>
            <button className="w-full px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
              <span>Đăng xuất</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Toaster position="bottom-right" reverseOrder={false} />
        {children}
      </main>
    </div>
  );
}
