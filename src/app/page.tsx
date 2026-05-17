import Link from "next/link";
import prisma from "@/lib/prisma";
import LiveSearch from "@/components/LiveSearch";
import PostSlider from "@/components/PostSlider";
import { getDirectImageUrl } from "@/lib/gdrive";

export const revalidate = 60;

export default async function Home() {
  const [postCount, questionCount, majorCount, latestQuestions, rawLatestPosts] = await Promise.all([
    prisma.post.count(),
    prisma.question.count(),
    prisma.category.count({ where: { type: "MAJOR" } }),
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const latestPosts = rawLatestPosts.map(post => ({
    ...post,
    thumbnailUrl: post.thumbnailUrl ? getDirectImageUrl(post.thumbnailUrl) : null
  }));

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-3xl overflow-hidden shadow-2xl px-5 py-12 md:px-8 md:py-20 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-2">
            🎓 Hệ thống tư vấn tuyển sinh trực tuyến
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="inline-block bg-gradient-to-r from-[#ffe259] via-[#ffa751] to-[#ffe259] text-transparent bg-clip-text animate-text-gradient">
              Định hướng tương lai
            </span> <br />
            <span className="text-yellow-300">Chọn đúng ngành, đúng trường</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn trong hành trình chọn ngành học phù hợp.
          </p>
          
          {/* Smart Search Bar */}
          <div className="max-w-xl mx-auto mt-8">
            <form action="/qa" method="GET" className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 text-xl">🔍</span>
              <input 
                type="text" 
                name="q"
                placeholder="Tìm kiếm câu hỏi tư vấn..." 
                className="w-full text-gray-900 bg-white shadow-xl rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all text-sm font-medium"
              />
              <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                Tìm kiếm
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/consultation" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105">
              Đăng ký tư vấn miễn phí →
            </Link>
            <Link href="/qa" className="bg-white/15 hover:bg-white/25 border border-white/40 text-white font-semibold py-3 px-8 rounded-xl transition-all">
              Gửi câu hỏi mới
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Bài viết", value: postCount.toString(), icon: "📰" },
          { label: "Câu hỏi Q&A", value: questionCount.toString(), icon: "💬" },
          { label: "Chương trình", value: majorCount.toString(), icon: "🎯" },
          { label: "Hỗ trợ", value: "24/7", icon: "🕒" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-blue-50 p-6 text-center hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-extrabold text-blue-700">{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Slider Latest Posts */}
      <section className="bg-white rounded-2xl shadow-sm border border-blue-50 p-5 md:p-8">
        <div className="md:flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-900">Bài viết mới nhất</h2>
            <p className="text-gray-500 mt-1">Cập nhật thông tin tuyển sinh mới nhất</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/posts" className="inline-flex text-blue-600 font-semibold hover:underline bg-blue-50 rounded-lg px-4 py-2 whitespace-nowrap pt">
              Xem tất cả bài viết →
            </Link>
          </div>
        </div>
        <PostSlider posts={latestPosts} />
      </section>

      {/* 5 latest Q&A */}
      <section className="bg-white rounded-2xl shadow-sm border border-blue-50 p-5 md:p-8">
        <div className="md:flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-900">Câu hỏi tư vấn mới nhất</h2>
            <p className="text-gray-500 mt-1">Những thắc mắc thường gặp được giải đáp</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0 items-center">
            <form action="/qa" method="GET" className="relative flex items-center">
              <LiveSearch className="w-full md:w-64 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
            </form>
            <Link href="/qa" className="inline-flex text-blue-600 font-semibold hover:underline bg-blue-50 rounded-lg px-4 py-2 whitespace-nowrap">
              Xem tất cả câu hỏi →
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {latestQuestions.length > 0 ? (
            latestQuestions.map((q) => (
              <Link key={q.id} href={`/qa`} className="group block bg-gray-50 hover:bg-blue-50/50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 text-xl font-bold">
                    Q
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors break-words">{q.question}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 break-words">{q.answer || 'Đang chờ chuyên gia trả lời...'}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 text-xs text-gray-500 font-medium">
                      <span>👤 {q.askerName}</span>
                      <span>📅 {new Date(q.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                      {q.answer !== null ? (
                        <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold">ĐÃ TRẢ LỜI</span>
                      ) : (
                        <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-[10px] font-bold">CHỜ DUYỆT</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                Chưa có câu hỏi nào.
             </div>
          )}
        </div>
      </section>

      {/* Main Features */}
      <section>
        <h2 className="text-2xl font-extrabold text-blue-900 mb-8 px-2">Khám phá các chuyên mục</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            {
              title: "Tin Tức & Bài Viết",
              desc: "Cập nhật thông tin về kỳ thi, hướng dẫn chọn ngành, chọn trường Trung cấp - Cao đẳng.",
              link: "/posts",
              color: "sky",
              icon: "📰",
            },
            {
              title: "Hỏi & Đáp (Q&A)",
              desc: "Nơi giải đáp mọi thắc mắc của bạn về quy chế tuyển sinh, điểm chuẩn, hồ sơ nhập học.",
              link: "/qa",
              color: "indigo",
              icon: "💬",
            },
            {
              title: "Đăng Ký Tư Vấn",
              desc: "Để lại thông tin, đội ngũ chuyên gia của chúng tôi sẽ gọi lại hỗ trợ bạn trực tiếp.",
              link: "/consultation",
              color: "blue",
              icon: "📝",
            },
          ].map((card) => (
            <Link href={card.link} key={card.title} className="group block focus:outline-none focus:ring-4 focus:ring-blue-100 rounded-2xl">
              <div className="h-full bg-white rounded-2xl p-8 border border-blue-50 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 relative overflow-hidden group-hover:border-blue-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 relative">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm mb-6">{card.desc}</p>
                <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
                  Xem chi tiết <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-yellow-400 rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl">🔔</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-yellow-950 mb-4">Bạn chưa tìm thấy thông tin cần thiết?</h2>
          <p className="text-yellow-900 font-medium mb-8 max-w-xl mx-auto">
            Đừng ngần ngại để lại thông tin. Đội ngũ chuyên gia sẽ liên hệ tư vấn và giải đáp từng trường hợp cụ thể.
          </p>
          <Link href="/consultation" className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all inline-block hover:scale-105">
            Đăng ký nhận tư vấn ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
