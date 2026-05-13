import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  const [postCount, questionCount, latestQuestions] = await Promise.all([
    prisma.post.count(),
    prisma.question.count(),
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-3xl overflow-hidden shadow-2xl px-8 py-20 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-2">
            🎓 Hệ thống tư vấn tuyển sinh trực tuyến
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Định hướng tương lai — <br />
            <span className="text-yellow-300">Chọn đúng ngành, đúng trường</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Cung cấp thông tin tuyển sinh chính xác, kịp thời. Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn trong hành trình chọn ngành học phù hợp.
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
          { label: "Chương trình", value: "4+", icon: "🎯" },
          { label: "Hỗ trợ", value: "24/7", icon: "🕐" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-extrabold text-blue-700">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Latest Q&A */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Câu hỏi tư vấn mới nhất</h2>
            <p className="text-gray-500 mt-1">Những thắc mắc thường gặp được giải đáp bởi chuyên gia</p>
          </div>
          <Link href="/qa" className="text-blue-600 font-semibold hover:underline hidden sm:block">
            Xem tất cả →
          </Link>
        </div>

        <div className="space-y-4">
          {latestQuestions.map((q) => (
            <div key={q.id} className="p-5 bg-blue-50/50 rounded-2xl hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-serif shrink-0">
                  {q.askerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-relaxed">
                    {q.question}
                  </h3>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>👤 {q.askerName}</span>
                    <span>🕒 {q.createdAt.toLocaleDateString("vi-VN")}</span>
                    {q.answer ? (
                      <span className="text-green-600 font-medium whitespace-nowrap">✓ Đã trả lời</span>
                    ) : (
                      <span className="text-orange-500 font-medium whitespace-nowrap">⏳ Chờ duyệt</span>
                    )}
                  </div>
                  {q.answer && (
                    <div className="mt-4 p-4 bg-white rounded-xl text-sm text-gray-700 border border-gray-100 relative">
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45"></div>
                      <span className="font-semibold text-blue-600 mb-1 block">Chuyên gia trả lời:</span>
                      {q.answer}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Tin Tức & Bài Viết",
            desc: "Cập nhật những thông tin mới nhất về kỳ thi, hướng dẫn chọn ngành, chọn trường hiệu quả.",
            link: "/posts",
            color: "blue",
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
            <div className={+ "h-full bg-white rounded-2xl p-8 border border-blue-50 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 relative overflow-hidden group-hover:border--200" + }>
              <div className={+ "bsolute top-0 right-0 w-32 h-32 bg--50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" + } />
              <div className={+ "w-14 h-14 bg--100 text--600 rounded-xl flex items-center justify-center text-3xl mb-6 relative" + }>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{card.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm mb-6">{card.desc}</p>
              <div className={+ "	ext--600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-1" + }>
                Xem chi tiết <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-blue-900 rounded-3xl p-10 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Bạn vẫn còn băn khoăn?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">
            Đừng ngần ngại để lại thông tin. Đội ngũ chuyên gia của chúng tôi sẽ liên hệ lại trong vòng 24 giờ để hỗ trợ bạn hoàn toàn miễn phí.
          </p>
          <Link href="/consultation" className="inline-block bg-white text-blue-900 hover:bg-blue-50 font-bold py-3 px-10 rounded-xl shadow-lg transition-transform hover:-translate-y-1">
            Nhận Tư Vấn Ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
