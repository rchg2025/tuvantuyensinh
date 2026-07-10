import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  const dbConfigs = await prisma.systemConfig.findMany({
    where: { key: { in: ["google_login_enabled"] } }
  });
  const googleEnabled = dbConfigs.find(c => c.key === "google_login_enabled")?.value === "true";

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-lg mb-2 p-1 relative overflow-hidden">
            <img src="https://drive.google.com/thumbnail?id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH&sz=w256" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-800">Tư Vấn Tuyển Sinh</h1>
          <p className="text-gray-500 text-sm">Đăng nhập vào hệ thống quản trị</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center">Đăng nhập</h2>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
              {error === "credentials" 
                ? "Tài khoản hoặc mật khẩu không chính xác." 
                : error === "google_unlinked" 
                ? "Tài khoản Google của bạn chưa được liên kết với tài khoản trên hệ thống, vui lòng liên hệ quản trị viên để để được hướng dẫn." 
                : "Vui lòng đăng nhập lại."}
            </div>
          )}

          <form action={async (formData) => {
            "use server";
            const email = formData.get("email")?.toString().trim();
            const password = formData.get("password")?.toString().trim();
            
            if (!email || !password) redirect("/login?error=credentials");

            const dbUser = await prisma.systemUser.findUnique({ where: { email } });
            
            let matched = false;
            let currentName = "Admin";
            let currentId = "admin_logged_in";
            let currentAvatar = "";

            if (email === "nguyenluyen@nsg.edu.vn" && password === "Nsg@2026") {
               matched = true;
               currentName = "Nguyễn Văn Luyến";
            } else if (dbUser && dbUser.password === password) {
               matched = true;
               currentName = dbUser.name || dbUser.email;
               currentId = dbUser.id;
               currentAvatar = dbUser.avatar || "";
            }

            if (matched) {
              const cookieStore = await cookies();
              cookieStore.set("auth_token", currentId, {
                httpOnly: true,
                path: "/",
              });
              cookieStore.set("auth_name", encodeURIComponent(currentName), {
                httpOnly: true,
                path: "/",
              });
              if (currentAvatar) {
                cookieStore.set("auth_avatar", encodeURIComponent(currentAvatar), {
                  httpOnly: true,
                  path: "/",
                });
              } else {
                cookieStore.delete("auth_avatar");
              }
              redirect("/admin");
            } else {
              redirect("/login?error=credentials");
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="email@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</Link>
              </div>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
            >
              Đăng nhập
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">hoặc</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <a href="/api/auth/google" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl shadow-sm transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Đăng nhập bằng Google
              </a>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline text-blue-500">← trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
