import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-2">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-800">Tư Vấn Tuyển Sinh</h1>
          <p className="text-gray-500 text-sm">Đăng nhập vào hệ thống quản trị</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center">Đăng nhập</h2>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
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
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">Ghi nhớ đăng nhập</label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
            >
              Đăng nhập
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
              hoặc
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{" "}
            <a href="#" className="text-blue-600 font-semibold hover:underline">Liên hệ admin</a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline text-blue-500">← Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
