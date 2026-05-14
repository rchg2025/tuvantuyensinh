import Link from "next/link";
import { forgotPasswordAction, resetPasswordAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const step = resolvedParams?.step || "1";
  const error = resolvedParams?.error;
  const email = resolvedParams?.email as string || "";

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-blue-800">Quên mật khẩu</h1>
          <p className="text-gray-500 text-sm">
            {step === "1" ? "Nhập email của bạn để nhận mã OTP." : "Nhập mã OTP được gửi đến email và mật khẩu mới."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center">
              {error === "not_found" && "Email không tồn tại trong hệ thống."}
              {error === "invalid_otp" && "Mã OTP không hợp lệ hoặc đã hết hạn."}
              {error === "send_failed" && "Lỗi khi gửi email. Vui lòng thử lại sau."}
              {error === "db_error" && "Lỗi hệ thống, vui lòng thử lại."}
            </div>
          )}

          {step === "1" ? (
            <form action={forgotPasswordAction} className="space-y-4">
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

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
              >
                Gửi mã OTP
              </button>
            </form>
          ) : (
            <form action={resetPasswordAction} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mã OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  required
                  placeholder="Nhập mã 6 số"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
              >
                Đặt lại mật khẩu
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/login" className="hover:underline text-blue-500">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}