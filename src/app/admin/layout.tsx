import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import prisma from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  const authName = cookieStore.get("auth_name")?.value || "Admin Panel";

  if (!auth) {
    redirect("/login");
  }

  let role = "ADMIN";
  if (auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user) {
      redirect("/login");
    }
    role = user.role;
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

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100 text-center relative group">
          <Link href="/admin/profile" className="block cursor-pointer">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 text-blue-600 mb-3 shadow-inner group-hover:scale-105 transition-transform">
              <span className="text-2xl">🛡️</span>
            </div>
            <h2 className="font-bold text-slate-800 break-words hover:text-blue-600 transition-colors" title="Bấm để cập nhật thông tin">{authName}</h2>
          </Link>
          <p className="text-xs text-slate-500">{role === "ADMIN" ? "Quản lý hệ thống" : "Chuyên viên tư vấn"}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
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
              <Link href="/admin/settings" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                ⚙️ Cấu hình hệ thống
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-100">
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
      </div>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Toaster position="bottom-right" reverseOrder={false} />
        {children}
      </main>
    </div>
  );
}
