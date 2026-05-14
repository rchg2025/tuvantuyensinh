import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Link from "next/link";
import prisma from "@/lib/prisma";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
});

export async function generateMetadata(): Promise<Metadata> {
  const titleConf = await prisma.systemConfig.findUnique({ where: { key: "seo_title" } });
  const descConf = await prisma.systemConfig.findUnique({ where: { key: "seo_description" } });
  return {
    title: titleConf?.value || "Tư Vấn Tuyển Sinh",
    description: descConf?.value || "Trang thông tin tư vấn tuyển sinh",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const isLoggedIn = !!token;

  const configs = await prisma.systemConfig.findMany({
    where: {
      key: {
        in: ["logo_url", "footer_phone", "footer_email", "footer_description", "seo_title"]
      }
    }
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const logoUrl = configMap["logo_url"] || "https://drive.google.com/uc?export=view&id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH";
  const siteTitle = configMap["seo_title"] || "Tư Vấn Tuyển Sinh";
  const footerPhone = configMap["footer_phone"] || "0123.456.789";
  const footerEmail = configMap["footer_email"] || "nguyenluyen@nsg.edu.vn";
  const footerDesc = configMap["footer_description"] || "Hệ thống hỗ trợ giải đáp thắc mắc và tuyển sinh trực tuyến nhanh chóng, chính xác.";

  return (
    <html
      lang="vi"
      className={`${roboto.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f0f6ff] text-gray-900">
        <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
          <div className="w-full px-4 md:px-8 flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight hover:opacity-90 transition">
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm p-0.5" />
              <span>{siteTitle}</span>
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
              <Link href={isLoggedIn ? "/admin/posts" : "/login"} className="text-sm font-medium hover:underline text-blue-200">
                {isLoggedIn ? "Trang TT cá nhân" : "Đăng nhập"}
              </Link>
            </div>
            <div className="hidden md:block">
              <Link href={isLoggedIn ? "/admin/posts" : "/login"} className="text-sm border border-white/30 rounded-lg px-4 py-2 hover:bg-white/10 font-medium transition ml-4">
                {isLoggedIn ? "Trang TT cá nhân" : "Đăng nhập"}
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-1 w-full px-4 md:px-8 py-10">
          {children}
        </main>

        <footer className="bg-blue-900 text-blue-300 text-sm py-12 mt-auto">
          <div className="w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                <img src={logoUrl} alt="Logo" className="w-6 h-6 rounded-md object-cover bg-white p-0.5" />
                <span className="font-bold text-lg">{siteTitle}</span>
              </div>
              <p>{footerDesc}</p>
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
                <li>Email: {footerEmail}</li>
                <li>Điện thoại: {footerPhone}</li>
              </ul>
            </div>
          </div>
          <div className="w-full px-4 md:px-8 mt-8 pt-8 border-t border-blue-800 text-center">
            &copy; {new Date().getFullYear()} {siteTitle}.
          </div>
        </footer>
      </body>
    </html>
  );
}
