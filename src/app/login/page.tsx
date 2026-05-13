import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-lg mb-2 p-1 relative overflow-hidden">
            <img src="https://drive.google.com/uc?export=view&id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-800">Tư Vấn Tuyển Sinh</h1>
          <p className="text-gray-500 text-sm">Đăng nhập vào hệ thống quản trị</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center">Đăng nhập</h2>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
              {error === "credentials" ? "Tài khoản hoặc mật khẩu không chính xác." : "Vui lòng đăng nhập lại."}
            </div>
          )}

          <form action={async (formData) => {
            "use server";
            const email = formData.get("email")?.toString().trim();
            const password = formData.get("password")?.toString().trim();
            
            if (email === "nguyenluyen@nsg.edu.vn" && password === "Nsg@2026") {
              const cookieStore = await cookies();
              cookieStore.set("auth_token", "admin_logged_in", { path: "/" });
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
                defaultValue="nguyenluyen@nsg.edu.vn"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <a href="#" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</a>
              </div>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                defaultValue="Nsg@2026"
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
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline text-blue-500">← Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
