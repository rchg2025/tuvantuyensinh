import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tư Vấn Tuyển Sinh",
  description: "Trang thông tin tư vấn tuyển sinh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f0f6ff] text-gray-900">
        <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-0 flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight hover:opacity-90 transition">
              <span className="bg-white text-blue-700 rounded-lg w-8 h-8 flex items-center justify-center text-base shadow">🎓</span>
              <span>Tư Vấn Tuyển Sinh</span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/posts" className="px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition">Bài viết</Link>
              <Link href="/qa" className="px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition">Hỏi đáp</Link>
              <Link href="/consultation" className="ml-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-sm px-4 py-2 rounded-lg shadow transition">
                Đăng ký tư vấn
              </Link>
              <Link href="/login" className="ml-2 border border-white/40 hover:bg-white/10 text-white text-sm px-4 py-2 rounded-lg transition">
                Đăng nhập
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-blue-900 text-white mt-auto">
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-2">
                <span className="text-2xl">🎓</span> Tư Vấn Tuyển Sinh
              </div>
              <p className="text-blue-200 text-sm">Hệ thống tư vấn tuyển sinh trực tuyến uy tín, cập nhật thông tin kịp thời.</p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-blue-100">Liên kết nhanh</h4>
              <ul className="space-y-1 text-sm text-blue-200">
                <li><Link href="/posts" className="hover:text-white">Bài viết</Link></li>
                <li><Link href="/qa" className="hover:text-white">Hỏi đáp Q&A</Link></li>
                <li><Link href="/consultation" className="hover:text-white">Đăng ký tư vấn</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-blue-100">Liên hệ</h4>
              <ul className="space-y-1 text-sm text-blue-200">
                <li>📧 tuvantuyensinh@example.com</li>
                <li>📞 1800 1234 (Miễn phí)</li>
                <li>🕐 Thứ 2 – Thứ 7: 7:30 – 17:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 text-center py-4 text-xs text-blue-300">
            © 2026 Hệ thống Tư vấn tuyển sinh. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
