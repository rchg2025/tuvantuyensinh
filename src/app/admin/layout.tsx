import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import prisma from "@/lib/prisma";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  const authNameEncoded = cookieStore.get("auth_name")?.value;
  const authName = authNameEncoded ? decodeURIComponent(authNameEncoded) : "Admin Panel";

  if (!auth) {
    redirect("/login");
  }

  let role = "ADMIN";
  let avatarUrl = "";
  if (auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user) {
      redirect("/login");
    }
    role = user.role;
    avatarUrl = user.avatar || "";
  }

  // Fetch pending counts
  const pendingConsultations = await prisma.consultationRequest.count({
    where: { isProcessed: false }
  });

  const pendingQuestions = await prisma.question.count({
    where: { 
      OR: [
        { answer: null },
        { answer: "" }
      ]
    }
  });

  const sidebar = (
    <>
        <div className="p-6 border-b border-slate-100 text-center relative group">
          <Link href="/admin/profile" className="block cursor-pointer">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 text-blue-600 mb-3 shadow-inner group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🛡️</span>
              )}
            </div>
            <h2 className="font-bold text-slate-800 break-words hover:text-blue-600 transition-colors" title="Bấm để cập nhật thông tin">
              {authName}
            </h2>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs text-slate-500">{role === "ADMIN" ? "Quản lý hệ thống" : "Chuyên viên tư vấn"}</p>
            <form action={async () => {
              "use server";
              const cookieStore = await cookies();
              cookieStore.delete("auth_token");
              cookieStore.delete("auth_name");
              redirect("/login");
            }}>
              <button 
                type="submit" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors inline-block md:-mt-1" 
                title="Đăng xuất"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
              </button>
            </form>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            🏠 Bảng điều khiển
          </Link>
          <Link href="/admin/consultations" className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>📞 Đăng ký tư vấn</span>
            {pendingConsultations > 0 && (
              <span className="bg-red-100 text-red-600 text-xs py-0.5 px-2 rounded-full">{pendingConsultations}</span>
            )}
          </Link>
          
          <Link href="/admin/qa" className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>💬 Hỏi đáp & Tư vấn</span>
            {pendingQuestions > 0 && (
              <span className="bg-red-100 text-red-600 text-xs py-0.5 px-2 rounded-full">{pendingQuestions}</span>
            )}
          </Link>
          
          <Link href="/admin/posts" className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>📰 Bài viết</span>
          </Link>

          {role === "ADMIN" && (
            <>
              <Link href="/admin/categories" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                🗂️ Danh mục hệ thống
              </Link>
              <Link href="/admin/users" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                👥 Quản lý thành viên
              </Link>
              <Link href="/admin/menus" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                📝 Quản lý Menu
              </Link>
              <Link href="/admin/settings" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                ⚙️ Cấu hình hệ thống
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <form action={async () => {
            "use server";
            const cookieStore = await cookies();
            cookieStore.delete("auth_token");
            cookieStore.delete("auth_name");
            redirect("/login");
          }}>
            <button className="w-full px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
              <span>Đăng xuất</span>
            </button>
          </form>
        </div>
    </>
  );

  return (
    <AdminLayoutClient sidebar={sidebar}>
      <Toaster position="bottom-right" reverseOrder={false} />
      {children}
    </AdminLayoutClient>
  );
}
