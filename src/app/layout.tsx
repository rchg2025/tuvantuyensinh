import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import MobileHeaderClient from "./MobileHeaderClient";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { getDirectImageUrl } from "@/lib/gdrive";

const Chatbot = dynamic(() => import("@/components/Chatbot"));
const ZaloWidget = dynamic(() => import("@/components/ZaloWidget"));
import VisitorCounter from "@/components/VisitorCounter";
import BackToTop from "@/components/BackToTop";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
});

  export async function generateMetadata(): Promise<Metadata> {
    const titleConf = await prisma.systemConfig.findUnique({ where: { key: "seo_title" } });
    const descConf = await prisma.systemConfig.findUnique({ where: { key: "seo_description" } });
    const logoConf = await prisma.systemConfig.findUnique({ where: { key: "logo_url" } });
    const defaultOgImageConf = await prisma.systemConfig.findUnique({ where: { key: "default_og_image" } });
    const googleVerification = await prisma.systemConfig.findUnique({ where: { key: "google_site_verification" } });
    const fbAppIdConf = await prisma.systemConfig.findUnique({ where: { key: "fb_app_id" } });
    
    const siteTitle = titleConf?.value || "Tư Vấn Tuyển Sinh";
    let faviconUrl = logoConf?.value || "https://drive.google.com/uc?export=view&id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH";
    faviconUrl = getDirectImageUrl(faviconUrl);

    let defaultOgImage = defaultOgImageConf?.value || logoConf?.value || "https://cover-talk.zadn.vn/f/d/8/d/2/a423757e2c651160a43bdd630334ecc7.jpg";
    defaultOgImage = getDirectImageUrl(defaultOgImage, true);
  
    return {
      metadataBase: new URL('https://ts26.nsg.edu.vn'),
      title: {
        template: `%s | ${siteTitle}`,
        default: siteTitle,
      },
      description: descConf?.value || "Trang thông tin tư vấn tuyển sinh",
      openGraph: {
        title: {
          template: `%s | ${siteTitle}`,
          default: siteTitle,
        },
        description: descConf?.value || "Trang thông tin tư vấn tuyển sinh",
        images: [defaultOgImage],
        type: "website",
        url: "https://ts26.nsg.edu.vn/",
      },
      twitter: {
        card: "summary_large_image",
        title: titleConf?.value || "Tư Vấn Tuyển Sinh",
        description: descConf?.value || "Trang thông tin tư vấn tuyển sinh",
        images: [defaultOgImage],
      },
      other: {
        ...(fbAppIdConf?.value ? { "fb:app_id": fbAppIdConf.value } : { "fb:app_id": "1000000000000000" }), // Giá trị mặc định hoặc từ cấu hình
      },
    
    ...(googleVerification?.value ? {
      verification: {
        google: googleVerification.value.replace(/.*content=["']([^"']+)["'].*/, '$1').replace('google-site-verification=', '').trim(),
      }
    } : {}),
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const authName = cookieStore.get("auth_name")?.value;
  const isLoggedIn = !!token;

  const configs = await prisma.systemConfig.findMany({
    where: {
      key: {
        in: ["logo_url", "footer_phone", "footer_email", "footer_description", "seo_title", "zalo_oa_widget", "zalo_enabled", "zalo_position", "chatbot_enabled", "chatbot_color", "chatbot_position", "chatbot_width", "chatbot_height", "fb_app_id"]
      }
    }
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const headerMenusConfig = await prisma.systemConfig.findUnique({ where: { key: "header_menus" } });
  let headerMenus: any[] = [];
  try {
    if (headerMenusConfig?.value) {
      headerMenus = JSON.parse(headerMenusConfig.value);
    }
  } catch (e) {}

  // Convert flat menu to tree
  const menuTree: any[] = [];
  headerMenus.forEach((menu) => {
    if (menu.isSubmenu && menuTree.length > 0) {
      const parent = menuTree[menuTree.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(menu);
    } else {
      menuTree.push({ ...menu, children: [] });
    }
  });

  const postCategories = await prisma.category.findMany({
    where: { type: "POST" },
    orderBy: { createdAt: "desc" }
  });

  const logoUrl = configMap["logo_url"] || "https://drive.google.com/uc?export=view&id=160oXOcGp9tJa5b2_YKWx96VuoweujlOH";
  const siteTitle = configMap["seo_title"] || "Tư Vấn Tuyển Sinh";
  const footerPhone = configMap["footer_phone"] || "0123.456.789";
  const footerEmail = configMap["footer_email"] || "nguyenluyen@nsg.edu.vn";
  const footerDesc = configMap["footer_description"] || "Hệ thống hỗ trợ giải đáp thắc mắc và tuyển sinh trực tuyến nhanh chóng, chính xác.";
  const zaloOaWidget = configMap["zalo_oa_widget"] || "";
  const zaloEnabled = configMap["zalo_enabled"] !== "false";
  const zaloPosition = configMap["zalo_position"] || "right";
  
  const chatbotEnabled = configMap["chatbot_enabled"] !== "false";
  const chatbotColor = configMap["chatbot_color"] || "#2563eb";
  const chatbotPosition = configMap["chatbot_position"] || "right";
  const chatbotWidth = configMap["chatbot_width"] || "360px";
  const chatbotHeight = configMap["chatbot_height"] || "500px";

  async function handleLogout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("auth_name");
    redirect("/login");
  }


  return (
    <html
      lang="vi"
      className={`${roboto.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f0f6ff] text-gray-900">
        <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
          <div className="w-full px-4 md:px-8 flex justify-between items-center min-h-[4rem] py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-extrabold text-sm md:text-base leading-tight tracking-tight hover:opacity-90 transition mr-4">
              <Image src={logoUrl.includes('drive.google.com/uc') ? logoUrl.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w128') : logoUrl} alt="Logo" width={32} height={32} unoptimized className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm p-0.5 shrink-0" />
              <span className="md:max-w-[150px] lg:max-w-[300px] xl:max-w-[400px] whitespace-normal line-clamp-2 md:line-clamp-none pr-4">{siteTitle}</span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1 relative z-50">
              {menuTree.length > 0 ? (
                menuTree.map((menu: any) => (
                  <div key={menu.id} className="group relative">
                    <Link href={menu.url} className={`px-2 lg:px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition inline-flex items-center gap-1 whitespace-nowrap ${menu.children?.length > 0 ? "pr-1 lg:pr-3" : ""}`}>
                      {menu.title}
                      {menu.children?.length > 0 && (
                        <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                    {menu.children?.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                        <div className="py-2">
                          {menu.children.map((child: any) => (
                            <Link key={child.id} href={child.url} className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <>
              <div className="group relative">
                <Link href="/posts" className="px-2 lg:px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition inline-flex items-center gap-1 whitespace-nowrap">
                  Bài viết
                  <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                {postCategories.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                    <div className="py-2">
                      {postCategories.map(cat => (
                        <Link key={cat.id} href={`/posts?categorySlug=${cat.slug || cat.id}`} className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/qa" className="px-2 lg:px-4 py-2 rounded-lg hover:bg-white/15 text-sm font-medium transition whitespace-nowrap">Hỏi đáp</Link>
                </>
              )}
              <Link href="/consultation" className="ml-1 lg:ml-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-sm px-3 lg:px-4 py-2 rounded-lg shadow transition whitespace-nowrap">
                Đăng ký tư vấn
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-2 ml-4">
              <Link href="/search" className="text-white hover:bg-white/10 p-2 rounded-full transition" title="Tìm kiếm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              <Link href={isLoggedIn ? "/admin" : "/login"} className={isLoggedIn ? "text-white hover:bg-white/10 p-2 rounded-full transition" : "text-sm border border-white/30 rounded-lg px-4 py-2 hover:bg-white/10 font-medium transition whitespace-nowrap"} title={isLoggedIn ? (authName ? decodeURIComponent(authName) : "Trang cá nhân") : "Đăng nhập"}>
                {isLoggedIn ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  "Đăng nhập"
                )}
              </Link>
            </div>
          </div>
          {/* Mobile Secondary Menu Row */}
          <MobileHeaderClient 
            isLoggedIn={isLoggedIn} 
            authName={authName!} 
            menuTree={menuTree} 
            postCategories={postCategories} 
            handleLogout={handleLogout} 
          />
        </header>
        
        <main className="flex-1 w-full px-4 md:px-8 py-10">
          {children}
        </main>

        <footer className="bg-blue-900 text-blue-300 text-sm py-12 mt-auto">
          <div className="w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                <Image src={logoUrl.includes('drive.google.com/uc') ? logoUrl.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w128') : logoUrl} alt="Logo" width={24} height={24} unoptimized className="w-6 h-6 rounded-md object-cover bg-white p-0.5" />
                <span className="font-bold text-lg">{siteTitle}</span>
              </div>
              <div className="whitespace-pre-line">{footerDesc}</div>
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
          <div className="w-full px-4 md:px-8 mt-8 pt-8 border-t border-blue-800 text-center flex flex-col items-center">
            <VisitorCounter />
            <div className="mt-6 text-blue-400">
              &copy; {new Date().getFullYear()} {siteTitle}.
            </div>
          </div>
        </footer>
        {zaloEnabled && zaloOaWidget && (
          <ZaloWidget html={zaloOaWidget} position={zaloPosition} />
        )}
        {chatbotEnabled && (
          <Chatbot color={chatbotColor} position={chatbotPosition} width={chatbotWidth} height={chatbotHeight} logoUrl={logoUrl.includes('drive.google.com/uc') ? logoUrl.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w128') : logoUrl} siteTitle={siteTitle} />
        )}
        <BackToTop />
      </body>
    </html>
  );
}
