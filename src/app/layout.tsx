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
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-blue-600 text-white shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">
              <Link href="/">Tư Vấn Tuyển Sinh</Link>
            </h1>
            <nav className="space-x-4">
              <Link href="/posts" className="hover:underline">Bài viết</Link>
              <Link href="/qa" className="hover:underline">Hỏi đáp</Link>
              <Link href="/consultation" className="hover:underline">Đăng ký tư vấn</Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-4 text-center mt-auto">
          <p>© 2026 Hệ thống Tư vấn tuyển sinh. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
