import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
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
      className={`${roboto.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f0f6ff] text-gray-900">
        <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight hover:opacity-90 transition">
              <img src="https://drive.google.com/uc?export=view&id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH" alt="Logo" className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm p-0.5" />
              <span>Tư Vấn Tuyển Sinh</span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/posts" className="px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition">Bài viết</Link>
              <Link href="/qa" className="px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition">Hỏi đáp</Link>
              <Link href="/consultation" className="ml-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-sm px-4 py-2 rounded-lg shadow transition">
                Đăng ký tư vấn
              </Link>
            </nav>

            <div className="flex md:hidden items-center gap-2">
              <Link href="/login" className="text-sm font-medium hover:underline text-blue-200">Đăng nhập</Link>
            </div>
            <div className="hidden md:block">
              <Link href="/login" className="text-sm border border-white/30 rounded-lg px-4 py-2 hover:bg-white/10 font-medium transition ml-4">
                Đăng nhập
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-10">
          {children}
        </main>

        <footer className="bg-blue-900 text-blue-300 text-sm py-12 mt-auto">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                <img src="https://drive.google.com/uc?export=view&id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH" alt="Logo" className="w-6 h-6 rounded-md object-cover bg-white p-0.5" />
                <span className="font-bold text-lg">Tư Vấn Tuyển Sinh</span>
              </div>
              <p>Hệ thống hỗ trợ giải đáp thắc mắc và tuyển sinh trực tuyến nhanh chóng, chính xác.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Các liên kết</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition">Trang chủ</Link></li>
                <li><Link href="/posts" className="hover:text-white transition">Bài viết</Link></li>
                <li><Link href="/qa" className="hover:text-white transition">Hỏi đáp</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2">
                <li>Email: nguyenluyen@nsg.edu.vn</li>
                <li>Điện thoại: 0123.456.789</li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-8 pt-8 border-t border-blue-800 text-center">
            &copy; {new Date().getFullYear()} Hệ thống Tư vấn tuyển sinh.
          </div>
        </footer>
      </body>
    </html>
  );
}
